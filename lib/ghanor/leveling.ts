import type { Attribute, ClassId } from "./types";

// ─── Tabelas base ────────────────────────────────────────────────────────────

export const HP_PER_LEVEL: Record<ClassId, number> = {
  barbaro: 6, bardo: 3, bucaneiro: 4, cacador: 4, cavaleiro: 5,
  clerigo: 4, druida: 4, ladino: 3, mago: 2, nobre: 4, soldado: 5,
};

export const MP_PER_LEVEL: Record<ClassId, number> = {
  barbaro: 3, bardo: 4, bucaneiro: 3, cacador: 4, cavaleiro: 3,
  // Clérigo: 5+Sab (livro pág.45); Druida: 3+Sab (livro pág.49); Ladino: 4 (livro pág.53); Mago: 5+Int (livro pág.57)
  clerigo: 5, druida: 3, ladino: 4, mago: 5, nobre: 4, soldado: 3,
};

export const KEY_ATTR: Record<ClassId, Attribute | Attribute[]> = {
  barbaro: "str", bardo: "cha", bucaneiro: "dex", cacador: ["str", "dex"],
  cavaleiro: "str", clerigo: "wis", druida: "wis", ladino: "dex",
  mago: "int", nobre: "cha", soldado: ["str", "dex"],
};

// Classes conjuradoras que somam o atributo-chave nos PM por nível (livro págs. 33, 46, 50, 57)
export const CASTERS_ADD_KEY_ATTR_TO_MP: ClassId[] = ["bardo", "clerigo", "druida", "mago"];

// Classes que ganham nova magia por nível (mago/clerigo: todo nível; bardo/druida: níveis pares)
export const SPELLCASTERS: ClassId[] = ["bardo", "clerigo", "druida", "mago"];

// Tabela 1-4: [treinada, naoTreinada] para níveis 1..20
export const SKILL_BONUS_TABLE: ReadonlyArray<[number, number]> = [
  [2, 0], [3, 1], [3, 1], [4, 2], [4, 2], [5, 3], [7, 3], [8, 4], [8, 4], [9, 5],
  [9, 5], [10, 6], [10, 6], [11, 7], [13, 7], [14, 8], [14, 8], [15, 9], [15, 9], [16, 10],
];

/** Bônus de treino por faixa de nível (já embutido na SKILL_BONUS_TABLE) */
export function trainingBonus(level: number): number {
  if (level <= 6) return 2;
  if (level <= 14) return 4;
  return 6;
}

/** Bônus de perícia treinada para um nível */
export function skillBonusTrained(level: number): number {
  return SKILL_BONUS_TABLE[Math.min(level, 20) - 1][0];
}

/** Bônus de perícia não-treinada para um nível */
export function skillBonusUntrained(level: number): number {
  return SKILL_BONUS_TABLE[Math.min(level, 20) - 1][1];
}

// ─── Patamares ───────────────────────────────────────────────────────────────

export type Tier = "iniciante" | "veterano" | "campeao" | "lenda";

export function tierForLevel(level: number): Tier {
  if (level <= 4) return "iniciante";
  if (level <= 10) return "veterano";
  if (level <= 16) return "campeao";
  return "lenda";
}

export const TIER_LABELS: Record<Tier, string> = {
  iniciante: "Iniciante",
  veterano: "Veterano",
  campeao: "Campeão",
  lenda: "Lenda",
};

export const TIER_FLAVOR: Record<Tier, string> = {
  iniciante: "Os primeiros passos de uma lenda.",
  veterano: "Os reinos começam a notar seu nome.",
  campeao: "Reis e rainhas pedem por seus serviços.",
  lenda: "Bardos cantam suas façanhas em tavernas longe daqui.",
};

/** Níveis em que o patamar muda */
export const TIER_THRESHOLDS = [5, 11, 17] as const;

// ─── Acesso a círculos de magia ───────────────────────────────────────────────
// (pág. 109–115 do livro básico)

export const SPELL_CIRCLES: Record<ClassId, Record<number, number>> = {
  mago:    { 1: 1, 5: 2, 9: 3, 13: 4, 17: 5 },
  clerigo: { 1: 1, 5: 2, 9: 3, 13: 4, 17: 5 },
  // Bardo e Druida: 2º círculo no 6º nível, 3º no 10º, 4º no 14º (sem 5º círculo)
  bardo:   { 1: 1, 6: 2, 10: 3, 14: 4 },
  druida:  { 1: 1, 6: 2, 10: 3, 14: 4 },
  // Demais classes não têm círculos
  barbaro: {}, bucaneiro: {}, cacador: {}, cavaleiro: {},
  ladino: {}, nobre: {}, soldado: {},
};

/** Retorna o círculo máximo que a classe pode lançar no nível informado */
export function maxSpellCircle(classId: ClassId, level: number): number {
  const table = SPELL_CIRCLES[classId];
  let circle = 0;
  for (const [lvl, c] of Object.entries(table)) {
    if (level >= Number(lvl)) circle = c;
  }
  return circle;
}

/** Retorna true se este nível abre um novo círculo de magia */
export function opensNewSpellCircle(classId: ClassId, level: number): boolean {
  return SPELL_CIRCLES[classId]?.[level] !== undefined;
}

// ─── Cálculo de HP ganho ao subir ─────────────────────────────────────────────

export function computeHpGained(options: {
  classId: ClassId;
  conMod: number;
  race: string;
  strMod?: number; // necessário apenas para gigantes
}): number {
  const base = HP_PER_LEVEL[options.classId] + options.conMod;
  // TODO: confirmar regra de HP mínimo em multiclasse — pág. 60
  return Math.max(1, base); // mínimo 1 PV ao subir
}

// ─── Cálculo de MP ganho ao subir ─────────────────────────────────────────────

export function computeMpGained(options: {
  classId: ClassId;
  keyAttrMod: number; // valor do atributo-chave da nova classe
  race: string;
  originId?: string;
  extraOriginId?: string;
}): number {
  let mp = MP_PER_LEVEL[options.classId];

  // Conjuradores (bardo, clérigo, mago) somam atributo-chave ao MP/nível
  if (CASTERS_ADD_KEY_ATTR_TO_MP.includes(options.classId)) {
    mp += options.keyAttrMod;
  }

  // Elfo: +1 PM/nível (pág. 37)
  // TODO: verificar se isso também se aplica em multiclasse — pág. 37

  // Acólito: +1 PM/nível (pág. ref. origem)
  if (options.originId === "acolito" || options.extraOriginId === "acolito") {
    mp += 1;
  }

  return Math.max(0, mp);
}

// ─── Tipos de resultado ───────────────────────────────────────────────────────

export type LevelUpResult = {
  newLevel: number;
  newClassLevels: Record<string, number>;
  hpGained: number;
  mpGained: number;
  newHpMax: number;
  newMpMax: number;
  /** Atributos atualizados (apenas se attrIncreased foi informado) */
  newAttributes?: Record<string, number>;
  /** Recalcula PV se Con foi aumentada (retroativo em todos os níveis) */
  hpDeltaFromCon?: number;
  opensSpellCircle?: number;
  tierChanged?: { from: Tier; to: Tier };
};

// ─── Tipos do personagem (subset necessário para computeLevelUp) ───────────────

export type CharacterForLevelUp = {
  current_level: number;
  class_levels: Record<string, number>;
  class: string; // classe inicial (retrocompatibilidade)
  race: string;
  origin: string;
  extra_origin?: string;
  attr_str: number;
  attr_dex: number;
  attr_con: number;
  attr_int: number;
  attr_wis: number;
  attr_cha: number;
  hp_max: number;
  mp_max: number;
};

// ─── Função principal ─────────────────────────────────────────────────────────

export function computeLevelUp(
  character: CharacterForLevelUp,
  options: {
    newClassId: ClassId;
    isMulticlass: boolean;
    attrIncreased?: Attribute;
  }
): LevelUpResult {
  const fromLevel = character.current_level;
  const toLevel = fromLevel + 1;

  // Atributos base (antes de qualquer aumento neste level up)
  const attrs: Record<string, number> = {
    str: character.attr_str,
    dex: character.attr_dex,
    con: character.attr_con,
    int: character.attr_int,
    wis: character.attr_wis,
    cha: character.attr_cha,
  };

  // Se há aumento de atributo neste nível, aplica primeiro para recalcular HP/MP
  let newAttributes: Record<string, number> | undefined;
  let hpDeltaFromCon: number | undefined;
  if (options.attrIncreased) {
    newAttributes = { ...attrs, [options.attrIncreased]: attrs[options.attrIncreased] + 1 };
    // Se Con aumentou, recalcula PV retroativamente: +1 PV por nível total
    if (options.attrIncreased === "con") {
      hpDeltaFromCon = toLevel; // +1 por cada nível vivido
    }
  }

  const effectiveAttrs = newAttributes ?? attrs;

  // Atributo-chave da nova classe (para MP de conjuradores)
  const keyAttr = KEY_ATTR[options.newClassId];
  const keyAttrMod = Array.isArray(keyAttr)
    ? Math.max(...keyAttr.map((k) => effectiveAttrs[k]))
    : effectiveAttrs[keyAttr];

  // HP ganho
  const hpGained = computeHpGained({
    classId: options.newClassId,
    conMod: effectiveAttrs.con,
    race: character.race,
    strMod: effectiveAttrs.str,
  });

  // MP ganho
  const mpGained = computeMpGained({
    classId: options.newClassId,
    keyAttrMod,
    race: character.race,
    originId: character.origin,
    extraOriginId: character.extra_origin,
  });

  // Elfo: +1 PM/nível
  const elfMpBonus = character.race === "elfo" ? 1 : 0;

  const newHpMax = character.hp_max + hpGained + (hpDeltaFromCon ?? 0);
  const newMpMax = character.mp_max + mpGained + elfMpBonus;

  // Atualiza class_levels
  const newClassLevels = { ...character.class_levels };
  newClassLevels[options.newClassId] = (newClassLevels[options.newClassId] ?? 0) + 1;

  // Verifica mudança de patamar
  const fromTier = tierForLevel(fromLevel);
  const toTier = tierForLevel(toLevel);
  const tierChanged = fromTier !== toTier ? { from: fromTier, to: toTier } : undefined;

  // Verifica novo círculo de magia
  const classLevelInNewClass = newClassLevels[options.newClassId];
  const circle = opensNewSpellCircle(options.newClassId, classLevelInNewClass)
    ? SPELL_CIRCLES[options.newClassId][classLevelInNewClass]
    : undefined;

  return {
    newLevel: toLevel,
    newClassLevels,
    hpGained,
    mpGained,
    newHpMax,
    newMpMax,
    newAttributes: newAttributes ? (newAttributes as Record<string, number>) : undefined,
    hpDeltaFromCon,
    opensSpellCircle: circle,
    tierChanged,
  };
}

// ─── Validações ───────────────────────────────────────────────────────────────

/**
 * Verifica se o jogador pode escolher "Aumento de Atributo" para um atributo
 * no patamar atual. A regra é: só uma vez por patamar para o mesmo atributo.
 * (pág. 66 do livro básico)
 */
export function canIncreaseAttribute(
  attr: Attribute,
  currentLevel: number,
  levelUpHistory: Array<{ to_level: number; attr_increased: string | null }>
): boolean {
  const currentTier = tierForLevel(currentLevel + 1); // nível que vai alcançar
  const tierRange: Record<Tier, [number, number]> = {
    iniciante: [1, 4],
    veterano:  [5, 10],
    campeao:   [11, 16],
    lenda:     [17, 20],
  };
  const [min, max] = tierRange[currentTier];

  // Verifica se esse atributo já foi aumentado neste patamar
  const alreadyUsedInTier = levelUpHistory.some(
    (lu) =>
      lu.attr_increased === attr &&
      lu.to_level >= min &&
      lu.to_level <= max
  );

  return !alreadyUsedInTier;
}

// ─── Habilidades automáticas por nível de classe ─────────────────────────────
// Mapeamento das habilidades de classe concedidas AUTOMATICAMENTE em cada nível
// (não são poderes opcionais — são features da tabela de classe do livro)

export const CLASS_LEVEL_ABILITIES: Partial<Record<ClassId, Record<number, string[]>>> = {
  barbaro: {
    3:  ["Instinto Selvagem +1 (rolagens de dano, Percepção e Reflexos)"],
    5:  ["Redução de Dano 2"],
    6:  ["Fúria +3 (pode gastar +1 PM extra para +1 nos bônus)"],
    8:  ["Redução de Dano 4"],
    9:  ["Instinto Selvagem +2"],
    11: ["Fúria +4", "Redução de Dano 6"],
    14: ["Redução de Dano 8"],
    15: ["Instinto Selvagem +3"],
    16: ["Fúria +5"],
    17: ["Redução de Dano 10"],
    20: ["Fúria Titânica (bônus da Fúria dobrado)"],
  },
  bardo: {
    2:  ["Eclético (gasta 1 PM para contar como treinado em qualquer perícia por 1 teste)"],
    5:  ["Inspiração +2"],
    9:  ["Inspiração +3"],
    13: ["Inspiração +4"],
    17: ["Inspiração +5"],
    20: ["Artista Completo (Inspiração como ação livre; custo de habilidades de bardo reduzido à metade)"],
  },
  bucaneiro: {
    2:  ["Evasão (sem dano ao passar em Reflexos contra efeito de área)"],
    3:  ["Esquiva Sagaz +1 (+1 Defesa e Reflexos com liberdade de movimentos)"],
    5:  ["Panache (recupera 1 PM em acerto crítico ou ao reduzir inimigo a 0 PV)"],
    7:  ["Esquiva Sagaz +2"],
    10: ["Evasão Aprimorada (só metade do dano ao falhar em Reflexos)"],
    11: ["Esquiva Sagaz +3"],
    15: ["Esquiva Sagaz +4"],
    19: ["Esquiva Sagaz +5"],
    20: ["Sorte dos Ousados (gasta 5 PM para repetir teste; resultado 11+ conta como 20 natural)"],
  },
  cacador: {
    3:  ["Explorador (escolha 1 tipo de terreno — soma Sab em Defesa e perícias neste terreno)"],
    5:  ["Caminho do Explorador (terreno difícil sem penalidade nos terrenos de Explorador)", "Marca da Presa +1d8"],
    7:  ["Explorador (novo terreno ou +2 num terreno já escolhido)"],
    9:  ["Marca da Presa +1d12"],
    11: ["Explorador"],
    13: ["Marca da Presa +2d8"],
    15: ["Explorador"],
    16: ["Tradição Mágica (acesso a magias de círculos que o Caçador puder lançar)"],
    17: ["Marca da Presa +2d10"],
    19: ["Explorador"],
    20: ["Mestre Caçador (Marca da Presa como ação livre; +5 PM ao reduzir alvo marcado a 0 PV)"],
  },
  cavaleiro: {
    2:  ["Duelo +2 (gasta 2 PM para +2 ataque/dano contra 1 oponente por cena)"],
    5:  ["Baluarte +4 (custo de Baluarte aumentado)", "Caminho do Cavaleiro (escolha Bastião ou Montaria)"],
    7:  ["Baluarte estendido a aliados adjacentes (+2 PM)", "Duelo +3"],
    9:  ["Baluarte +6"],
    11: ["Resoluto (gasta 1 PM para refazer teste de resistência com +5)"],
    12: ["Duelo +4"],
    13: ["Baluarte +8"],
    15: ["Baluarte estendido a aliados em alcance curto (+5 PM)"],
    17: ["Baluarte +10", "Duelo +5"],
    20: ["Bravura Final (gasta 3 PM para continuar consciente a 0 PV ou menos)"],
  },
  clerigo: {
    20: ["Santidade (gasta 15 PM para lançar 3 magias do santo como ação livre sem custo)"],
  },
  druida: {
    2:  ["Caminho dos Ermos (terreno difícil natural sem penalidade; CD de rastreamento +10)"],
    20: ["Força da Natureza (custo de magias −2 PM, CD +2; dobra em terrenos naturais)"],
  },
  ladino: {
    2:  ["Evasão (sem dano ao passar em Reflexos contra efeito de área)"],
    3:  ["Ataque Furtivo +2d6"],
    4:  ["Esquiva Sobrenatural (nunca fica surpreendido)"],
    5:  ["Ataque Furtivo +3d6"],
    7:  ["Ataque Furtivo +4d6"],
    8:  ["Olhos nas Costas (não pode ser flanqueado)"],
    9:  ["Ataque Furtivo +5d6"],
    10: ["Evasão Aprimorada (só metade do dano ao falhar em Reflexos)"],
    11: ["Ataque Furtivo +6d6"],
    13: ["Ataque Furtivo +7d6"],
    15: ["Ataque Furtivo +8d6"],
    17: ["Ataque Furtivo +9d6"],
    19: ["Ataque Furtivo +10d6"],
    20: ["A Pessoa Certa para o Trabalho (gasta 5 PM para +10 em ataque furtivo ou perícia de ladino)"],
  },
  mago: {
    20: ["Alta Arcana (custo de magias de mago reduzido à metade)"],
  },
  nobre: {
    2:  ["Palavras Afiadas 2d6 (teste Diplomacia/Intimidação vs. Vontade → dano psíquico não letal)"],
    3:  ["Riqueza (uma vez por aventura: teste Car+nível → recebe esse valor em PO)"],
    4:  ["Gritar Ordens (gasta PM para dar bônus em testes de perícia a aliados em alcance curto)"],
    5:  ["Presença Aristocrática (gasta 2 PM para negar ação hostil — Von CD Car)"],
    6:  ["Palavras Afiadas 4d6"],
    10: ["Palavras Afiadas 6d6"],
    14: ["Palavras Afiadas 8d6"],
    18: ["Palavras Afiadas 10d6"],
    20: ["Realeza (Presença Aristocrática +5 CD; criaturas que falhem muito passam a lutar ao seu lado)"],
  },
  soldado: {
    3:  ["Estratégia de Defesa (escolha Infantaria Leve +2 Defesa, ou Tropa de Choque RD 2 + armadura pesada)"],
    5:  ["Ataque Disciplinado +2d6"],
    6:  ["Ataque Extra (gasta 2 PM para ataque adicional na ação agredir)"],
    7:  ["Estratégia de Defesa (Def +4 / RD 4)"],
    9:  ["Ataque Disciplinado +3d6"],
    10: ["Supremacia Marcial (ganha 2 PM temporários ao reduzir inimigo a 0 PV)"],
    11: ["Estratégia de Defesa (Def +6 / RD 6)"],
    13: ["Ataque Disciplinado +4d6"],
    15: ["Estratégia de Defesa (Def +8 / RD 8)"],
    17: ["Ataque Disciplinado +5d6"],
    19: ["Estratégia de Defesa (Def +10 / RD 10)"],
    20: ["Mestre da Batalha (dano de Ataque Disciplinado multiplicado em crítico; recupera PV igual ao dano extra)"],
  },
};

// ─── CD padrão (Tabela 5-1) ──────────────────────────────────────────────────

export const STANDARD_CDS = [
  { label: "Fácil (5)",              value: 5  },
  { label: "Média (10)",             value: 10 },
  { label: "Difícil (15)",           value: 15 },
  { label: "Desafiadora (20)",       value: 20 },
  { label: "Formidável (25)",        value: 25 },
  { label: "Heroica (30)",           value: 30 },
  { label: "Quase Impossível (40)",  value: 40 },
] as const;

// ─── Helpers para exibição na ficha ──────────────────────────────────────────

/** Texto formatado da distribuição de classes */
export function formatClassLevels(classLevels: Record<string, number>): string {
  return Object.entries(classLevels)
    .map(([cls, lvl]) => `${cls.charAt(0).toUpperCase() + cls.slice(1)} ${lvl}`)
    .join(" / ");
}

/** Calcula o bônus de perícia detalhado para exibição no modal de rolagem */
export function computeSkillRollModifier(options: {
  level: number;
  attrMod: number;
  trained: boolean;
}): {
  halfLevel: number;
  attrMod: number;
  trainBonus: number;
  total: number;
} {
  const halfLevel = Math.floor(options.level / 2);
  const trainBonus = options.trained ? trainingBonus(options.level) : 0;
  return {
    halfLevel,
    attrMod: options.attrMod,
    trainBonus,
    total: halfLevel + options.attrMod + trainBonus,
  };
}
