import { QUESTIONS, type AttrKey, type ClassKey, type Tag } from "./quiz";
import type { RaceId, Attribute, ClassId, Attributes, ArmorId, ShieldId } from "./types";
import { classById } from "./classes";
import { raceById } from "./races";
import { pointBuyCosts } from "./rules";

export type Answer = {
  questionId: number;
  optionId: "a" | "b" | "c" | "d";
};

export type RaceChoices = {
  attributes?: Attribute[];
  extraAttribute?: Attribute;
  mutations?: string[];
  extraOrigin?: string; // For meio_elfo
};

export type GeneratedCharacter = {
  concept: string;
  suggestedClasses: ClassId[];
  suggestedOrigins: string[];
  baseAttributes: Attributes;
  trainedSkills: string[];
  armor: ArmorId;
  shield: ShieldId;
  weapons: string[];
};

export function computeCharacter(answers: Answer[], race: RaceId, raceChoices: RaceChoices, gender: "masc" | "fem" | "neutro" = "masc"): GeneratedCharacter {
  // Passo 1 — Somar payloads
  const attrPoints: Record<AttrKey, number> = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  const classScores: Record<ClassKey, number> = { barbaro: 0, bardo: 0, bucaneiro: 0, cacador: 0, cavaleiro: 0, clerigo: 0, druida: 0, ladino: 0, mago: 0, nobre: 0, soldado: 0 };
  const skillPoints: Record<string, number> = {};
  const tagCounts: Record<Tag, number> = { corajoso: 0, astuto: 0, piedoso: 0, cinico: 0, protetor: 0, curioso: 0, leal: 0, individualista: 0, sombrio: 0, jovial: 0, pragmatico: 0, idealista: 0, rude: 0, refinado: 0, selvagem: 0, erudito: 0 };

  for (const ans of answers) {
    const q = QUESTIONS.find(q => q.id === ans.questionId);
    if (!q) continue;
    const opt = q.options.find(o => o.id === ans.optionId);
    if (!opt) continue;

    const payload = opt.payload;
    if (payload.attrs) Object.entries(payload.attrs).forEach(([k, v]) => attrPoints[k as AttrKey] += (v || 0));
    if (payload.classes) Object.entries(payload.classes).forEach(([k, v]) => classScores[k as ClassKey] += (v || 0));
    if (payload.skills) Object.entries(payload.skills).forEach(([k, v]) => skillPoints[k] = (skillPoints[k] || 0) + (v || 0));
    if (payload.tags) payload.tags.forEach(t => tagCounts[t]++);
  }

  // Passo 2 — Distribuir atributos
  const baseAttributes: Attributes = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  let pointsLeft = 10;
  const totalWeight = Object.values(attrPoints).reduce((a, b) => a + b, 0) || 1;
  const sortedAttrs = Object.keys(attrPoints).sort((a, b) => attrPoints[b as AttrKey] - attrPoints[a as AttrKey]) as AttrKey[];

  for (const attr of sortedAttrs) {
    const weight = attrPoints[attr];
    let budget = Math.round((weight / totalWeight) * 10);
    while (baseAttributes[attr] < 4) {
      const nextCost = pointBuyCosts[baseAttributes[attr] + 1];
      const diff = nextCost - pointBuyCosts[baseAttributes[attr]];
      if (diff <= budget && pointsLeft >= diff) {
        pointsLeft -= diff;
        budget -= diff;
        baseAttributes[attr]++;
      } else {
        break;
      }
    }
  }

  for (const attr of sortedAttrs) {
    while (baseAttributes[attr] < 4) {
      const diff = pointBuyCosts[baseAttributes[attr] + 1] - pointBuyCosts[baseAttributes[attr]];
      if (pointsLeft >= diff) {
        pointsLeft -= diff;
        baseAttributes[attr]++;
      } else {
        break;
      }
    }
  }

  // Se precisar tirar pontos por ter gasto a mais (não deveria, mas garante)
  // Ou se quisermos chegar em -1. Vamos manter simples e focado em 0 a 4.

  // Calculando atributos finais (pós-raça) para validação de classe e perícias de int
  const raceData = raceById[race];
  const finalAttrs = { ...baseAttributes };
  Object.entries(raceData.modifiers).forEach(([k, v]) => finalAttrs[k as Attribute] += v);
  if (race === "humano" && raceChoices.attributes) raceChoices.attributes.forEach(a => finalAttrs[a]++);
  if (race === "meio_elfo" && raceChoices.extraAttribute) finalAttrs[raceChoices.extraAttribute]++;
  // Mutações de aberrante não entram na conta inicial de distribuição, mas podem afetar. Ignoramos para simplificar.

  // Aplicar cap -1 e +5
  for (const attr of Object.keys(finalAttrs) as Attribute[]) {
    if (finalAttrs[attr] < -1) finalAttrs[attr] = -1;
    if (finalAttrs[attr] > 5) finalAttrs[attr] = 5;
  }

  // Passo 3 — Escolher a classe
  const classTagAlignment: Record<ClassKey, Tag[]> = {
    barbaro: ['corajoso', 'rude', 'selvagem'],
    bardo: ['jovial', 'curioso', 'refinado'],
    bucaneiro: ['jovial', 'astuto', 'individualista'],
    cacador: ['selvagem', 'individualista', 'pragmatico'],
    cavaleiro: ['leal', 'protetor', 'idealista'],
    clerigo: ['piedoso', 'idealista', 'leal'],
    druida: ['selvagem', 'piedoso', 'pragmatico'],
    ladino: ['astuto', 'cinico', 'individualista'],
    mago: ['erudito', 'curioso', 'individualista'],
    nobre: ['refinado', 'leal', 'idealista'],
    soldado: ['leal', 'pragmatico', 'corajoso']
  };

  const getDominantTag = (tags: Tag[]) => {
    let best = tags[0];
    for (const t of tags) if (tagCounts[t] > tagCounts[best]) best = t;
    return tagCounts[best] || 0;
  };

  const sortedClasses = (Object.keys(classScores) as ClassKey[]).sort((a, b) => {
    if (classScores[b] !== classScores[a]) return classScores[b] - classScores[a];
    const tagA = getDominantTag(classTagAlignment[a]);
    const tagB = getDominantTag(classTagAlignment[b]);
    if (tagB !== tagA) return tagB - tagA;
    return a.localeCompare(b);
  });

  const validClasses = sortedClasses.filter(c => {
    const data = classById[c];
    if (!data.keyAttribute) return true;
    const keys = Array.isArray(data.keyAttribute) ? data.keyAttribute : [data.keyAttribute];
    return keys.some(k => finalAttrs[k] >= 0);
  });
  const suggestedClasses = validClasses.slice(0, 3);
  const bestClassId = suggestedClasses[0] || "soldado";
  const bestClassData = classById[bestClassId];

  // Passo 4 — Preencher perícias treinadas
  const trainedSkills = new Set<string>();
  bestClassData.fixedSkills.forEach(s => trainedSkills.add(s));
  
  if (bestClassData.chooseSkills > 0 && bestClassData.skillOptions) {
    const available = bestClassData.skillOptions.filter(s => !trainedSkills.has(s)).sort((a, b) => (skillPoints[b as any] || 0) - (skillPoints[a as any] || 0));
    available.slice(0, bestClassData.chooseSkills).forEach(s => trainedSkills.add(s));
  }

  // Intellgence bonus skills
  const intBonus = finalAttrs.int;
  if (intBonus > 0) {
    const allSkillsDesc = Object.keys(skillPoints).sort((a, b) => skillPoints[b] - skillPoints[a]);
    let added = 0;
    for (const s of allSkillsDesc) {
      if (added >= intBonus) break;
      if (!trainedSkills.has(s)) {
        trainedSkills.add(s);
        added++;
      }
    }
  }

  // Passo 5 — Sugerir origem
  const originsMap: Record<string, { tags: Partial<Record<Tag, number>>, skills: Partial<Record<string, number>> }> = {
    acolito: { tags: { piedoso: 3 }, skills: { religiao: 2 } },
    ajudante_curandeiro: { skills: { cura: 3 }, tags: { piedoso: 1, protetor: 1 } },
    ajudante_mercador: { skills: { diplomacia: 2 }, tags: { pragmatico: 1, astuto: 1 } },
    amigo_dos_animais: { skills: { adestramento: 3 }, tags: { selvagem: 1 } },
    amnesico: { tags: {}, skills: {} },
    aprendiz_alquimista: { skills: { oficio: 2 }, tags: { erudito: 1 } },
    aprendiz_artesao: { skills: { oficio: 2 }, tags: { pragmatico: 1 } },
    aristocrata: { skills: { nobreza: 3 }, tags: { refinado: 2 } },
    artista: { skills: { atuacao: 2 }, tags: { jovial: 1, curioso: 1 } },
    auxiliar_cozinha: { skills: { oficio: 1 }, tags: { jovial: 1 } },
    campones: { tags: { pragmatico: 1, rude: 1 }, skills: { atletismo: 1 } },
    crianca_da_guerra: { skills: { iniciativa: 2, luta: 2 }, tags: { corajoso: 1 } },
    discipulo_arcano: { skills: { misticismo: 3 }, tags: { erudito: 2 } },
    escravo: { tags: { sombrio: 2 }, skills: { fortitude: 2 } },
    escudeiro: { skills: { percepcao: 1 }, tags: { leal: 2, protetor: 1 } },
    estudioso: { skills: { conhecimento: 3 }, tags: { erudito: 2 } },
    grumete: { skills: { atletismo: 2 }, tags: { jovial: 1, individualista: 1 } },
    herdeiro: { skills: { nobreza: 1 }, tags: { refinado: 1, idealista: 1 } },
    isolado: { tags: { individualista: 3, selvagem: 1 }, skills: {} },
    mascote_guarda: { skills: { atletismo: 1 }, tags: { leal: 2 } },
    membro_de_gangue: { skills: { intimidacao: 2 }, tags: { cinico: 2, rude: 1 } },
    nomade: { skills: { sobrevivencia: 2 }, tags: { selvagem: 2 } },
    orfao: { skills: { atletismo: 1 }, tags: { sombrio: 2 } },
    predestinado: { tags: { idealista: 3 }, skills: {} },
    rato: { skills: { furtividade: 2, ladinagem: 2 }, tags: { astuto: 1 } },
    receptaculo: { tags: { piedoso: 2 }, skills: { misticismo: 1 } },
    refugiado: { tags: { sombrio: 2 }, skills: { vontade: 1 } },
    selvagem: { tags: { selvagem: 3 }, skills: { sobrevivencia: 1 } },
    servical: { skills: { diplomacia: 1, intuicao: 1 }, tags: { leal: 2 } },
    trapaceiro: { skills: { enganacao: 3 }, tags: { cinico: 2, astuto: 1 } }
  };

  const originScores = Object.entries(originsMap).map(([id, reqs]) => {
    let score = 0;
    Object.entries(reqs.tags).forEach(([t, weight]) => { if (tagCounts[t as Tag] > 0) score += (weight || 0); });
    Object.entries(reqs.skills).forEach(([s, weight]) => { if (skillPoints[s] > 0) score += (weight || 0); });
    return { id, score };
  }).sort((a, b) => b.score - a.score);

  const suggestedOrigins = originScores.slice(0, 5).map(o => o.id);

  // Passo 6 — Equipamento padrão por classe
  let armor: ArmorId = "none";
  let shield: ShieldId = "none";
  let weapons: string[] = [];

  switch (bestClassId) {
    case 'barbaro': weapons = ['machado grande']; armor = 'gibao_peles'; shield = 'escudo_leve'; break;
    case 'bardo': weapons = ['espada curta', 'alaude']; armor = 'couro'; break;
    case 'bucaneiro': weapons = ['florete', 'adaga']; armor = 'couro_batido'; break;
    case 'cacador': weapons = ['arco longo', 'adaga']; armor = 'couro'; break;
    case 'cavaleiro': weapons = ['espada longa']; armor = 'brunea'; shield = 'escudo_leve'; break; // spec says escudo pesado but shield type is escudo_leve or none. I'll use escudo_leve.
    case 'clerigo': weapons = ['maça', 'simbolo sagrado']; armor = 'brunea'; shield = 'escudo_leve'; break;
    case 'druida': weapons = ['bordão', 'adaga']; armor = 'gibao_peles'; break;
    case 'ladino': weapons = ['adaga', 'arco curto', 'ferramentas de ladrão']; armor = 'couro'; break;
    case 'mago': weapons = ['bordão', 'adaga', 'grimório']; armor = 'none'; break;
    case 'nobre': weapons = ['espada longa']; armor = 'brunea'; shield = 'escudo_leve'; break;
    case 'soldado': weapons = ['espada longa']; armor = 'brunea'; shield = 'escudo_leve'; break;
  }

  // Passo 7 e 8 — Conceito em uma frase
  const sortedTags = (Object.keys(tagCounts) as Tag[]).sort((a, b) => tagCounts[b] - tagCounts[a]);
  const mainTag = sortedTags[0] || 'corajoso';
  const secTag = sortedTags[1] || 'astuto';

  const adjectivesMasc: Record<Tag, string> = { corajoso: 'destemido', astuto: 'astuto', piedoso: 'devoto', cinico: 'cético', protetor: 'guardião', curioso: 'inquieto', leal: 'leal', individualista: 'solitário', sombrio: 'atormentado', jovial: 'alegre', pragmatico: 'pragmático', idealista: 'idealista', rude: 'tosco', refinado: 'elegante', selvagem: 'selvagem', erudito: 'estudioso' };
  const adjectivesFem: Record<Tag, string> = { corajoso: 'destemida', astuto: 'astuta', piedoso: 'devota', cinico: 'cética', protetor: 'guardiã', curioso: 'inquieta', leal: 'leal', individualista: 'solitária', sombrio: 'atormentada', jovial: 'alegre', pragmatico: 'pragmática', idealista: 'idealista', rude: 'tosca', refinado: 'elegante', selvagem: 'selvagem', erudito: 'estudiosa' };
  const adjectivesNeu: Record<Tag, string> = { corajoso: 'destemide', astuto: 'astute', piedoso: 'devote', cinico: 'cétice', protetor: 'guardião', curioso: 'inquiete', leal: 'leal', individualista: 'solitárie', sombrio: 'atormentade', jovial: 'alegre', pragmatico: 'pragmátice', idealista: 'idealista', rude: 'tosque', refinado: 'elegante', selvagem: 'selvagem', erudito: 'estudiose' };

  const complements: Record<Tag, string> = {
    corajoso: 'que nunca recua diante do perigo',
    astuto: 'que sempre tem um truque na manga',
    piedoso: 'guiado(a) por uma fé inabalável',
    cinico: 'que não confia em ninguém além de si',
    protetor: 'que carrega o peso dos outros nas costas',
    curioso: 'movido(a) pela vontade de conhecer o mundo',
    leal: 'que nunca quebra um juramento',
    individualista: 'que prefere as sombras à companhia',
    sombrio: 'marcado(a) por um passado que não conta',
    jovial: 'que encontra motivo para rir até no escuro',
    pragmatico: 'que faz o que precisa ser feito',
    idealista: 'que ainda acredita em algo',
    rude: 'moldado(a) pelas dificuldades da vida',
    refinado: 'que exige mais do que o mundo costuma dar',
    selvagem: 'com o coração ligado aos ermos',
    erudito: 'com a mente cheia de segredos antigos'
  };

  const adjs = gender === 'fem' ? adjectivesFem : gender === 'neutro' ? adjectivesNeu : adjectivesMasc;
  const adj = adjs[mainTag];
  const comp = complements[secTag].replace(/\(a\)/g, gender === 'fem' ? 'a' : gender === 'neutro' ? 'e' : 'o');
  
  const raceNames: Record<RaceId, string> = { humano: 'humano', anao: 'anão', elfo: 'elfo', gigante: 'gigante', hobgoblin: 'hobgoblin', meio_elfo: 'meio-elfo', aberrante: 'aberrante' };
  if (gender === 'fem') {
    raceNames.humano = 'humana'; raceNames.anao = 'anã'; raceNames.elfo = 'elfa'; raceNames.gigante = 'gigante'; raceNames.hobgoblin = 'hobgoblin'; raceNames.meio_elfo = 'meio-elfa';
  } else if (gender === 'neutro') {
    raceNames.humano = 'humane'; raceNames.anao = 'anãe'; raceNames.elfo = 'elfe'; raceNames.meio_elfo = 'meio-elfe';
  }

  const classNames: Record<ClassKey, string> = { barbaro: 'bárbaro', bardo: 'bardo', bucaneiro: 'bucaneiro', cacador: 'caçador', cavaleiro: 'cavaleiro', clerigo: 'clérigo', druida: 'druida', ladino: 'ladino', mago: 'mago', nobre: 'nobre', soldado: 'soldado' };
  if (gender === 'fem') {
    classNames.barbaro = 'bárbara'; classNames.bardo = 'barda'; classNames.bucaneiro = 'bucaneira'; classNames.cacador = 'caçadora'; classNames.cavaleiro = 'cavaleira'; classNames.clerigo = 'clériga'; classNames.ladino = 'ladina'; classNames.mago = 'maga'; classNames.soldado = 'soldada';
  } else if (gender === 'neutro') {
    classNames.barbaro = 'bárbare'; classNames.bardo = 'barde'; classNames.bucaneiro = 'bucaneire'; classNames.cacador = 'caçadore'; classNames.cavaleiro = 'cavaleire'; classNames.clerigo = 'clérigue'; classNames.ladino = 'ladine'; classNames.mago = 'mague'; classNames.soldado = 'soldade';
  }

  const isAberrante = race === 'aberrante' ? "Tocado(a) pelo óleo negro do Devorador, ".replace(/\(a\)/g, gender === 'fem' ? 'a' : gender === 'neutro' ? 'e' : 'o') : "";
  const conceptStr = `${isAberrante}Um(a) ${raceNames[race]} ${classNames[bestClassId]} ${adj}, ${comp}.`.replace(/Um\(a\)/g, gender === 'fem' ? 'Uma' : gender === 'neutro' ? 'Ume' : 'Um');
  
  return {
    concept: conceptStr,
    suggestedClasses,
    suggestedOrigins,
    baseAttributes,
    trainedSkills: Array.from(trainedSkills),
    armor,
    shield,
    weapons
  };
}
