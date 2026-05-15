import type { Attribute, ClassId } from "./types";

// ─── Tabelas base ────────────────────────────────────────────────────────────

export const HP_PER_LEVEL: Record<ClassId, number> = {
  barbaro: 6, bardo: 3, bucaneiro: 4, cacador: 4, cavaleiro: 5,
  clerigo: 4, druida: 4, ladino: 3, mago: 2, nobre: 4, soldado: 5,
};

export const MP_PER_LEVEL: Record<ClassId, number> = {
  barbaro: 3, bardo: 4, bucaneiro: 3, cacador: 4, cavaleiro: 3,
  clerigo: 5, druida: 5, ladino: 3, mago: 6, nobre: 4, soldado: 3,
};

export const KEY_ATTR: Record<ClassId, Attribute | Attribute[]> = {
  barbaro: "str", bardo: "cha", bucaneiro: "dex", cacador: ["str", "dex"],
  cavaleiro: "str", clerigo: "wis", druida: "wis", ladino: "dex",
  mago: "int", nobre: "cha", soldado: ["str", "dex"],
};

// Classes conjuradoras que somam o atributo-chave nos PM por nível (pág. 25)
export const CASTERS_ADD_KEY_ATTR_TO_MP: ClassId[] = ["bardo", "clerigo", "mago"];

// Classes que ganham nova magia por nível (druida: toda nível; bardo: níveis pares; mago: todo nível)
export const SPELLCASTERS: ClassId[] = ["bardo", "druida", "mago"];

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
  druida:  { 1: 1, 5: 2, 9: 3, 13: 4, 17: 5 },
  bardo:   { 1: 1, 5: 2, 9: 3, 13: 4, 17: 5 },
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
