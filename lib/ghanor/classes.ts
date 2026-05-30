import type { Attribute, ClassId } from "./types";

export type ClassData = {
  id: ClassId;
  name: string;
  keyAttribute: Attribute | Attribute[];
  hpBase: number;
  mpPerLevel: number;
  fixedSkills: string[];
  chooseSkills: number;
  skillOptions: string[];
  proficiency: string;
  firstLevelAbility: string;
  needsChoice?: string;
};

export const classes: ClassData[] = [
  // ─── Bárbaro ───────────────────────────────────────────────────────────────
  // Livro pág. 31: PV 24+Con, PM 3/nível, profic. armas marciais e escudos
  // Nível 1: Fúria +2
  {
    id: "barbaro",
    name: "Bárbaro",
    keyAttribute: "str",
    hpBase: 24,
    mpPerLevel: 3,
    fixedSkills: ["fortitude", "luta"],
    chooseSkills: 4,
    skillOptions: [
      "adestramento", "atletismo", "cavalgar", "iniciativa",
      "intimidacao", "oficio", "percepcao", "pontaria", "sobrevivencia", "vontade",
    ],
    proficiency: "Armas marciais e escudos.",
    firstLevelAbility: "Fúria +2: gasta 2 PM para +2 ataque e dano corpo a corpo. Termina se não atacar nem for atacado ao fim da rodada.",
  },

  // ─── Bardo ────────────────────────────────────────────────────────────────
  // Livro pág. 33: PV 12+Con, PM 4/nível+Car, profic. armas marciais
  // Nível 1: Inspiração +1, magias (1º círculo)
  {
    id: "bardo",
    name: "Bardo",
    keyAttribute: "cha",
    hpBase: 12,
    mpPerLevel: 4,
    fixedSkills: ["atuacao", "reflexos"],
    chooseSkills: 6,
    skillOptions: [
      "acrobacia", "cavalgar", "conhecimento", "diplomacia", "enganacao",
      "furtividade", "iniciativa", "intuicao", "investigacao", "ladinagem",
      "luta", "misticismo", "nobreza", "percepcao", "pontaria", "religiao", "vontade",
    ],
    proficiency: "Armas marciais.",
    firstLevelAbility: "Inspiração +1: gasta 2 PM → aliados em alcance curto +1 em testes de perícia por 1 cena. Magias (1º círculo).",
  },

  // ─── Bucaneiro ────────────────────────────────────────────────────────────
  // Livro pág. 36: PV 16+Con, PM 3/nível, profic. armas marciais
  // Nível 1: Audácia, Insolência
  {
    id: "bucaneiro",
    name: "Bucaneiro",
    keyAttribute: "dex",
    hpBase: 16,
    mpPerLevel: 3,
    fixedSkills: ["reflexos"],
    chooseSkills: 4,
    skillOptions: [
      "acrobacia", "atletismo", "atuacao", "enganacao", "fortitude",
      "furtividade", "iniciativa", "intimidacao", "luta", "oficio", "percepcao", "pontaria",
    ],
    proficiency: "Armas marciais.",
    firstLevelAbility: "Audácia (gasta 2 PM para somar Car em teste de perícia). Insolência (soma Car na Defesa, limitado pelo nível, sem armadura pesada).",
    needsChoice: "Escolha Luta ou Pontaria como perícia inicial.",
  },

  // ─── Caçador ──────────────────────────────────────────────────────────────
  // Livro pág. 39: PV 16+Con, PM 4/nível, profic. armas marciais e escudos
  // Nível 1: Marca da Presa +1d4, Rastreador
  {
    id: "cacador",
    name: "Caçador",
    keyAttribute: ["str", "dex"],
    hpBase: 16,
    mpPerLevel: 4,
    fixedSkills: ["sobrevivencia"],
    chooseSkills: 6,
    skillOptions: [
      "adestramento", "atletismo", "cavalgar", "cura", "fortitude",
      "furtividade", "iniciativa", "investigacao", "luta", "oficio",
      "percepcao", "pontaria", "reflexos",
    ],
    proficiency: "Armas marciais e escudos.",
    firstLevelAbility: "Marca da Presa +1d4 (ação de movimento, 1 PM → +1d4 dano contra 1 criatura por cena). Rastreador (+2 Sobrevivência, move normalmente rastreando).",
    needsChoice: "Escolha o atributo-chave (Força ou Destreza) e Luta ou Pontaria como perícia inicial.",
  },

  // ─── Cavaleiro ────────────────────────────────────────────────────────────
  // Livro pág. 42: PV 20+Con, PM 3/nível, profic. armas marciais, armaduras pesadas, escudos
  // Nível 1: Baluarte +2, Código de Honra
  {
    id: "cavaleiro",
    name: "Cavaleiro",
    keyAttribute: "str",
    hpBase: 20,
    mpPerLevel: 3,
    fixedSkills: ["fortitude", "luta"],
    chooseSkills: 2,
    skillOptions: [
      "adestramento", "atletismo", "cavalgar", "diplomacia", "guerra",
      "iniciativa", "intimidacao", "nobreza", "percepcao", "vontade",
    ],
    proficiency: "Armas marciais, armaduras pesadas e escudos.",
    firstLevelAbility: "Baluarte +2 (reação, 1 PM → +2 Defesa e resistências até próximo turno). Código de Honra (não pode atacar alvos desprotegidos; violação: perde todos PM até o próximo dia).",
  },

  // ─── Clérigo ──────────────────────────────────────────────────────────────
  // Livro pág. 45: PV 16+Con, PM 5/nível+Sab, profic. armaduras pesadas e escudos
  // Nível 1: Devoto de <Santo>, magias (1º círculo) — começa com 3 magias
  {
    id: "clerigo",
    name: "Clérigo",
    keyAttribute: "wis",
    hpBase: 16,
    mpPerLevel: 5,
    fixedSkills: ["religiao", "vontade"],
    chooseSkills: 2,
    skillOptions: [
      "conhecimento", "cura", "diplomacia", "fortitude", "iniciativa",
      "intuicao", "luta", "misticismo", "nobreza", "oficio", "percepcao",
    ],
    proficiency: "Armaduras pesadas e escudos.",
    firstLevelAbility: "Devoto de um Santo: sua lista de magias, poder concedido e norma são definidos pelo santo escolhido. Magias (1º círculo) — começa com 3 magias.",
    needsChoice: "Informe o nome do seu santo padroeiro.",
  },

  // ─── Druida ───────────────────────────────────────────────────────────────
  // Livro pág. 49: PV 16+Con, PM 3/nível+Sab, profic. escudos (apenas armaduras sem metal)
  // Nível 1: Devoto da Natureza, Empatia Selvagem, magias (1º círculo) — começa com 2 magias
  {
    id: "druida",
    name: "Druida",
    keyAttribute: "wis",
    hpBase: 16,
    mpPerLevel: 3,
    fixedSkills: ["sobrevivencia", "vontade"],
    chooseSkills: 4,
    skillOptions: [
      "adestramento", "atletismo", "cavalgar", "conhecimento", "cura",
      "fortitude", "iniciativa", "intuicao", "luta", "misticismo",
      "oficio", "percepcao", "pontaria", "religiao",
    ],
    proficiency: "Escudos (armaduras sem metal apenas: couro, gibão de peles).",
    firstLevelAbility: "Devoto da Natureza (dorme ao relento como descanso confortável; não pode usar armaduras ou escudos de metal). Empatia Selvagem (comunica-se com animais). Magias (1º círculo) — começa com 2 magias.",
  },

  // ─── Ladino ───────────────────────────────────────────────────────────────
  // Livro pág. 53: PV 12+Con, PM 4/nível, profic. nenhuma
  // Nível 1: Ataque Furtivo +1d6, Especialista
  {
    id: "ladino",
    name: "Ladino",
    keyAttribute: "dex",
    hpBase: 12,
    mpPerLevel: 4,
    fixedSkills: ["ladinagem", "reflexos"],
    chooseSkills: 8,
    skillOptions: [
      "acrobacia", "atletismo", "atuacao", "cavalgar", "conhecimento",
      "diplomacia", "enganacao", "furtividade", "iniciativa", "intimidacao",
      "intuicao", "investigacao", "luta", "oficio", "percepcao", "pontaria",
    ],
    proficiency: "Nenhuma.",
    firstLevelAbility: "Ataque Furtivo +1d6 (1× por rodada, contra desprevenido/flanqueado em alcance curto). Especialista (escolha Int perícias — gasta 1 PM para dobrar bônus de treino).",
  },

  // ─── Mago ─────────────────────────────────────────────────────────────────
  // Livro pág. 57: PV 8+Con, PM 5/nível+Int, profic. nenhuma
  // Nível 1: Tradição Arcana, magias (1º círculo) — começa com 3 magias
  {
    id: "mago",
    name: "Mago",
    keyAttribute: "int",
    hpBase: 8,
    mpPerLevel: 5,
    fixedSkills: ["misticismo", "vontade"],
    chooseSkills: 2,
    skillOptions: [
      "conhecimento", "diplomacia", "enganacao", "guerra", "iniciativa",
      "intimidacao", "intuicao", "investigacao", "nobreza", "oficio", "percepcao",
    ],
    proficiency: "Nenhuma. Magos não usam armadura.",
    firstLevelAbility: "Tradição Arcana: define sua lista de magias, preço da magia e segredos arcanos. Magias (1º círculo) — começa com 3 magias.",
    needsChoice: "Escolha sua Tradição Arcana.",
  },

  // ─── Nobre ────────────────────────────────────────────────────────────────
  // Livro pág. 61: PV 16+Con, PM 4/nível, profic. armas marciais, armaduras pesadas, escudos
  // Nível 1: Autoconfiança, Espólio, Orgulho
  {
    id: "nobre",
    name: "Nobre",
    keyAttribute: "cha",
    hpBase: 16,
    mpPerLevel: 4,
    fixedSkills: ["vontade"],
    chooseSkills: 4,
    skillOptions: [
      "adestramento", "atuacao", "cavalgar", "conhecimento", "diplomacia",
      "enganacao", "fortitude", "guerra", "iniciativa", "intimidacao",
      "intuicao", "investigacao", "luta", "nobreza", "oficio", "percepcao", "pontaria",
    ],
    proficiency: "Armas marciais, armaduras pesadas e escudos.",
    firstLevelAbility: "Autoconfiança (usa Car na Defesa em lugar de Des). Espólio (escolha 1 item de até 2.000 PP). Orgulho (gasta PM para +2 por PM em testes de perícia).",
    needsChoice: "Escolha Diplomacia ou Intimidação como perícia fixa.",
  },

  // ─── Soldado ──────────────────────────────────────────────────────────────
  // Livro pág. 65: PV 20+Con, PM 3/nível, profic. armas marciais e escudos
  // Nível 1: Ataque Disciplinado (+1d6)
  {
    id: "soldado",
    name: "Soldado",
    keyAttribute: ["str", "dex"],
    hpBase: 20,
    mpPerLevel: 3,
    fixedSkills: ["fortitude"],
    chooseSkills: 2,
    skillOptions: [
      "adestramento", "atletismo", "cavalgar", "guerra", "iniciativa",
      "intimidacao", "luta", "oficio", "percepcao", "pontaria", "reflexos",
    ],
    proficiency: "Armas marciais e escudos.",
    firstLevelAbility: "Ataque Disciplinado +1d6: gasta 1 PM para rolar 2 dados de ataque (usa o melhor); se acertar, +1d6 dano. A cada 4 níveis pode gastar +1 PM para +1d6 adicional.",
    needsChoice: "Escolha o atributo-chave (Força ou Destreza) e Luta ou Pontaria como perícia fixa.",
  },
];

export const classById = Object.fromEntries(classes.map((klass) => [klass.id, klass])) as Record<
  ClassId,
  ClassData
>;
