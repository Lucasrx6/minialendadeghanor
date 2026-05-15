// ─── Conversão de moeda ────────────────────────────────────────────────────────

/** Converte PO/PP/PC para o valor canônico em PC (peças de cobre) */
export function toPc(po: number = 0, pp: number = 0, pc: number = 0): number {
  return po * 1000 + pp * 10 + pc;
}

/** Converte PC de volta para PO/PP/PC */
export function fromPc(total: number): { po: number; pp: number; pc: number } {
  const po = Math.floor(total / 1000);
  const pp = Math.floor((total % 1000) / 10);
  const pc = total % 10;
  return { po, pp, pc };
}

/** Formata PC para exibição amigável. Ex: 1235 PC → "1 PO 2 PP 3 PC" */
export function formatMoney(pc: number): string {
  if (pc === 0) return "0 PC";
  const { po, pp, pc: c } = fromPc(pc);
  const parts: string[] = [];
  if (po > 0) parts.push(`${po} PO`);
  if (pp > 0) parts.push(`${pp} PP`);
  if (c > 0)  parts.push(`${c} PC`);
  return parts.join(" ");
}

/** Formata apenas em PP (arredondado) para exibição na loja */
export function formatMoneyPP(pc: number): string {
  const pp = pc / 10;
  return pp % 1 === 0 ? `${pp} PP` : `${pp.toFixed(1)} PP`;
}


// ─── Cálculo de carga ──────────────────────────────────────────────────────────

/**
 * Capacidade de carga em espaços.
 * Força positiva: 10 + 2 × For
 * Força negativa: 10 + 1 × For (pág. 96)
 */
export function carryCapacity(strMod: number): number {
  if (strMod >= 0) return 10 + 2 * strMod;
  return Math.max(1, 10 + strMod); // Força negativa usa multiplicador 1
}

/** Capacidade máxima de carga antes de atingir o limite físico extremo. */
export function maxCarryCapacity(strMod: number): number {
  return carryCapacity(strMod) * 2;
}

/** Soma total de espaços usados por uma lista de itens do inventário */
export function totalSpaces(items: Array<{ spaces: number; quantity: number }>): number {
  return items.reduce((sum, item) => sum + item.spaces * item.quantity, 0);
}

/** Retorna true se o personagem está sobrecarregado */
export function isOverloaded(usedSpaces: number, strMod: number): boolean {
  return usedSpaces > carryCapacity(strMod);
}


// ─── Limite de itens vestidos ──────────────────────────────────────────────────

/** Máximo de itens vestidos. Agora fixo em 4 itens independentemente do nível. */
export function maxWornItems(_level: number): number {
  return 4;
}


// ─── Preço com melhorias ────────────────────────────────────────────────────────

/**
 * Preço final de um item com melhorias de item superior.
 * Cada melhoria adiciona +50% do preço base cumulativamente.
 * (pág. 122 do livro básico)
 */
export function priceWithImprovements(basePc: number, improvements: number): number {
  let price = basePc;
  for (let i = 0; i < improvements; i++) {
    price = Math.round(price * 1.5);
  }
  return price;
}

/** Custo adicional de Arcanium por círculo (pág. 125) em PC */
export const ARCANIUM_COST_PC: Record<number, number> = {
  1: toPc(0, 30000, 0),
  2: toPc(0, 30000, 0),
  3: toPc(0, 60000, 0),
  4: toPc(0, 60000, 0),
  5: toPc(0, 90000, 0),
};

export function priceWithArcanium(basePc: number, improvements: number, arcaniumCircle?: number): number {
  let price = priceWithImprovements(basePc, improvements);
  if (arcaniumCircle) price += ARCANIUM_COST_PC[arcaniumCircle] ?? 0;
  return price;
}


// ─── Proficiências por classe ──────────────────────────────────────────────────

type ClassId = string;

const MARTIAL_WEAPON_CLASSES: ClassId[] = [
  "barbaro", "bardo", "bucaneiro", "cacador", "cavaleiro", "nobre", "soldado",
];

const HEAVY_ARMOR_CLASSES: ClassId[] = [
  "cavaleiro", "clerigo", "nobre", "soldado",
];

const LIGHT_ARMOR_CLASSES: ClassId[] = [
  "barbaro", "bardo", "bucaneiro", "cacador", "cavaleiro",
  "clerigo", "druida", "ladino", "nobre", "soldado",
];

const SHIELD_CLASSES: ClassId[] = [
  "barbaro", "cacador", "cavaleiro", "clerigo", "druida", "nobre", "soldado",
];

export function hasMartialProficiency(classId: ClassId): boolean {
  return MARTIAL_WEAPON_CLASSES.includes(classId);
}

export function hasHeavyArmorProficiency(classId: ClassId): boolean {
  return HEAVY_ARMOR_CLASSES.includes(classId);
}

export function hasLightArmorProficiency(classId: ClassId): boolean {
  return LIGHT_ARMOR_CLASSES.includes(classId);
}

export function hasShieldProficiency(classId: ClassId): boolean {
  return SHIELD_CLASSES.includes(classId);
}

/**
 * Retorna true se o personagem tem proficiência na arma.
 * Proficiência exótica requer poder específico — não verificado aqui.
 */
export function hasWeaponProficiency(
  classId: ClassId,
  weaponProficiency: "simples" | "marcial" | "exotica"
): boolean {
  if (weaponProficiency === "simples") return true;
  if (weaponProficiency === "marcial") return hasMartialProficiency(classId);
  return false; // exótica requer poder próprio
}


// ─── Cálculo de Defesa com inventário ─────────────────────────────────────────

type EquippedArmor  = { armor_defense_bonus: number; armor_penalty: number; armor_category?: string | null };
type EquippedShield = { armor_defense_bonus: number; armor_penalty: number };

export function computeDefenseWithEquipment(
  dexMod: number,
  equippedArmor?: EquippedArmor,
  equippedShield?: EquippedShield,
  otherBonus: number = 0,
  overloaded: boolean = false
): {
  total: number;
  armorPenalty: number;
  breakdown: string;
} {
  const armorDef   = equippedArmor?.armor_defense_bonus  ?? 0;
  const shieldDef  = equippedShield?.armor_defense_bonus ?? 0;
  const armorPen   = (equippedArmor?.armor_penalty  ?? 0)
                   + (equippedShield?.armor_penalty  ?? 0)
                   + (overloaded ? -5 : 0);
  const effectiveDex = equippedArmor?.armor_category === "pesada" ? 0 : dexMod;

  const total = 10 + effectiveDex + armorDef + shieldDef + otherBonus;

  const parts: string[] = [`10 base`];
  if (equippedArmor?.armor_category === "pesada") {
    parts.push(`Des 0 (armadura pesada)`);
  } else if (dexMod !== 0) {
    parts.push(`Des ${dexMod >= 0 ? "+" : ""}${dexMod}`);
  }
  if (armorDef)     parts.push(`armadura +${armorDef}`);
  if (shieldDef)    parts.push(`escudo +${shieldDef}`);
  if (otherBonus)   parts.push(`outros +${otherBonus}`);

  return {
    total,
    armorPenalty: armorPen,
    breakdown: parts.join(" + ") + ` = ${total}`,
  };
}

export function computeMovementWithEquipment(baseMovementM: number, equippedArmorCategory?: string | null): number {
  return equippedArmorCategory === "pesada" ? Math.max(0, baseMovementM - 3) : baseMovementM;
}


// ─── Penalidade de armadura em perícias ────────────────────────────────────────

/** Perícias afetadas por penalidade de armadura (pág. 97) */
export const ARMOR_PENALTY_SKILLS = ["acrobacia", "furtividade", "ladinagem"] as const;

export function getArmorPenaltyForSkill(
  skillId: string,
  armorPenalty: number
): number {
  return ARMOR_PENALTY_SKILLS.includes(skillId as typeof ARMOR_PENALTY_SKILLS[number])
    ? armorPenalty
    : 0;
}


// ─── Equipamento inicial por classe ────────────────────────────────────────────

type StarterKit = {
  weapons: string[];           // slugs de arma simples garantida
  martialWeapons: string[];    // slugs de arma marcial (se proficiente)
  armor: string;               // slug da armadura padrão
  heavyArmor?: string;         // slug da armadura pesada (se proficiente)
  shield?: string;             // slug do escudo (se proficiente)
  extras: string[];            // outros itens
};

export const STARTER_KITS: Record<ClassId, StarterKit> = {
  barbaro:   { weapons: ["adaga"],        martialWeapons: ["machado_guerra"],  armor: "gibao_peles",     shield: "escudo_leve",  extras: [] },
  bardo:     { weapons: ["espada_curta"], martialWeapons: ["espada_longa"],    armor: "armadura_couro",  extras: ["instrumento_musical"] },
  bucaneiro: { weapons: ["adaga"],        martialWeapons: ["espada_longa"],    armor: "couro_batido",    extras: [] },
  cacador:   { weapons: ["adaga"],        martialWeapons: ["arco_longo"],      armor: "couro_batido",    shield: "escudo_leve",  extras: ["flechas_20"] },
  cavaleiro: { weapons: ["lanca"],        martialWeapons: ["espada_longa"],    armor: "brunea",          heavyArmor: "brunea",   shield: "escudo_leve",  extras: [] },
  clerigo:   { weapons: ["maca"],         martialWeapons: ["maca"],            armor: "brunea",          heavyArmor: "brunea",   shield: "escudo_leve",  extras: ["simbolo_sagrado"] },
  druida:    { weapons: ["lanca"],        martialWeapons: ["lanca"],           armor: "armadura_couro",  shield: "escudo_leve",  extras: ["simbolo_sagrado"] },
  ladino:    { weapons: ["adaga"],        martialWeapons: ["espada_curta"],    armor: "couro_batido",    extras: ["ferramentas_ladrao"] },
  mago:      { weapons: ["bordao"],       martialWeapons: [],                  armor: "",                extras: ["cajado_arcano"] },
  nobre:     { weapons: ["espada_curta"], martialWeapons: ["espada_longa"],    armor: "armadura_couro",  shield: "escudo_leve",  extras: [] },
  soldado:   { weapons: ["lanca"],        martialWeapons: ["espada_longa"],    armor: "brunea",          heavyArmor: "brunea",   shield: "escudo_leve",  extras: [] },
};

/** Retorna a lista de slugs de itens iniciais do personagem */
export function getStarterItems(
  classId: ClassId,
  hasMartial: boolean,
  hasHeavy: boolean,
  hasShield: boolean
): string[] {
  const kit = STARTER_KITS[classId];
  if (!kit) return [];

  const items: string[] = [
    "bolsa_lona",
    "saco_dormir",
    "traje_viajante",
    "racao_viagem",
    ...kit.weapons,
    ...kit.extras,
  ];

  if (hasMartial && kit.martialWeapons.length > 0) {
    items.push(...kit.martialWeapons);
  }

  const armor = hasHeavy && kit.heavyArmor ? kit.heavyArmor : kit.armor;
  if (armor) items.push(armor);

  if (hasShield && kit.shield) items.push(kit.shield);

  return items;
}
