import { aberrantMutations, raceById } from "./races";
import { classById } from "./classes";
import { originById } from "./origins";
import { skillById } from "./skills";
import { CASTERS_ADD_KEY_ATTR_TO_MP, KEY_ATTR, trainingBonus } from "./leveling";
import type { ArmorId, Attribute, Attributes, CharacterBuild, ShieldId } from "./types";

export const pointBuyCosts: Record<number, number> = {
  [-1]: -1,
  0: 0,
  1: 1,
  2: 2,
  3: 4,
  4: 7,
};

export const armorDefense: Record<ArmorId, number> = {
  none: 0,
  couro: 2,
  couro_batido: 3,
  gibao_peles: 4,
  brunea: 5,
};

export const shieldDefense: Record<ShieldId, number> = {
  none: 0,
  escudo_leve: 1,
};

export function pointBuySpent(attrs: Attributes) {
  return Object.values(attrs).reduce((sum, value) => sum + (pointBuyCosts[value] ?? 999), 0);
}

export function roll4d6DropLowest(random = Math.random) {
  const dice = Array.from({ length: 4 }, () => Math.floor(random() * 6) + 1).sort((a, b) => a - b);
  return {
    dice,
    total: dice.slice(1).reduce((sum, die) => sum + die, 0),
  };
}

export function rollTotalToAttribute(total: number) {
  if (total <= 7) return -2;
  if (total <= 9) return -1;
  if (total <= 11) return 0;
  if (total <= 13) return 1;
  if (total <= 15) return 2;
  if (total <= 17) return 3;
  return 4;
}

export function generateAttributeRolls(random = Math.random) {
  const rolls = Array.from({ length: 6 }, () => roll4d6DropLowest(random));
  return rolls.map((roll) => ({ ...roll, modifier: rollTotalToAttribute(roll.total) }));
}

export function getFinalAttributes(build: CharacterBuild): Attributes {
  const race = raceById[build.race];
  const result: Attributes = { ...build.baseAttributes };

  for (const [attr, value] of Object.entries(race.modifiers) as Array<[Attribute, number]>) {
    result[attr] += value;
  }

  if (build.race === "humano") {
    for (const attr of build.raceChoices?.attributes ?? []) result[attr] += 1;
  }

  if (build.race === "meio_elfo" && build.raceChoices?.extraAttribute) {
    result[build.raceChoices.extraAttribute] += 1;
  }

  if (build.race === "aberrante") {
    for (const mutationId of build.raceChoices?.mutations ?? []) {
      const mutation = aberrantMutations.find((item) => item.id === mutationId);
      const modifiers = mutation && "modifiers" in mutation ? mutation.modifiers : undefined;
      for (const [attr, value] of Object.entries(modifiers ?? {}) as Array<[Attribute, number]>) {
        result[attr] += value;
      }
    }
  }

  const origin = originById[build.origin];
  const attrChoice = build.classChoices?.originAttribute as Attribute | undefined;
  if (origin?.attributeChoiceBonus && attrChoice) result[attrChoice] += origin.attributeChoiceBonus;

  return result;
}

export function getMovement(build: CharacterBuild) {
  const race = raceById[build.race];
  const origin = originById[build.origin];
  const extraOrigin = build.extraOrigin ? originById[build.extraOrigin] : undefined;
  const mutations = build.raceChoices?.mutations ?? [];
  const mutationBonus = mutations.includes("veloz") ? 3 : 0;
  return (race.movementM ?? 9) + (origin?.movementBonusM ?? 0) + (extraOrigin?.movementBonusM ?? 0) + mutationBonus;
}

export function getSize(build: CharacterBuild) {
  return raceById[build.race].size ?? "medio";
}

export function calculateHp(build: CharacterBuild) {
  const level = build.level ?? 1;
  const attrs = getFinalAttributes(build);
  const klass = classById[build.class];
  const race = raceById[build.race];
  const origin = originById[build.origin];
  const extraOrigin = build.extraOrigin ? originById[build.extraOrigin] : undefined;
  return (
    klass.hpBase +
    attrs.con * level +
    (race.hpPerLevelBonus ?? 0) * level +
    (origin?.hpBonus ?? 0) +
    (origin?.hpPerLevelBonus ?? 0) * level +
    (extraOrigin?.hpBonus ?? 0) +
    (extraOrigin?.hpPerLevelBonus ?? 0) * level +
    (build.race === "gigante" ? attrs.str : 0)
  );
}

export function calculateMp(build: CharacterBuild) {
  const level = build.level ?? 1;
  const race = raceById[build.race];
  const klass = classById[build.class];
  const origin = originById[build.origin];
  const extraOrigin = build.extraOrigin ? originById[build.extraOrigin] : undefined;
  const mutationBonus = build.raceChoices?.mutations?.includes("ascetico") ? 3 : 0;
  const attrs = getFinalAttributes(build);
  const keyAttr = KEY_ATTR[build.class];
  const keyAttrMod = Array.isArray(keyAttr)
    ? Math.max(...keyAttr.map((k) => attrs[k]))
    : attrs[keyAttr];
  const casterBonus = CASTERS_ADD_KEY_ATTR_TO_MP.includes(build.class) ? keyAttrMod * level : 0;
  return (
    klass.mpPerLevel * level +
    (race.mpPerLevelBonus ?? 0) * level +
    (origin?.mpBonus ?? 0) +
    (origin?.mpPerLevelBonus ?? 0) * level +
    (extraOrigin?.mpBonus ?? 0) +
    (extraOrigin?.mpPerLevelBonus ?? 0) * level +
    mutationBonus +
    casterBonus
  );
}

export function calculateDefense(build: CharacterBuild) {
  const attrs = getFinalAttributes(build);
  const origin = originById[build.origin];
  const extraOrigin = build.extraOrigin ? originById[build.extraOrigin] : undefined;
  const mutationBonus = build.raceChoices?.mutations?.includes("couro_rochoso") ? 2 : 0;
  return (
    10 +
    attrs.dex +
    armorDefense[build.armor ?? "none"] +
    shieldDefense[build.shield ?? "none"] +
    (origin?.defenseBonus ?? 0) +
    (extraOrigin?.defenseBonus ?? 0) +
    mutationBonus
  );
}

export function getSkillFlatBonuses(build: CharacterBuild) {
  const bonuses: Record<string, number> = {};
  const add = (skill: string, value: number) => {
    bonuses[skill] = (bonuses[skill] ?? 0) + value;
  };

  for (const source of [raceById[build.race], originById[build.origin], build.extraOrigin ? originById[build.extraOrigin] : undefined]) {
    for (const [skill, value] of Object.entries(source?.skillBonuses ?? {})) add(skill, value);
  }

  if (build.raceChoices?.mutations?.includes("sentidos_agucados")) add("percepcao", 2);

  return bonuses;
}

export function calculateSkillBonus(build: CharacterBuild, skillId: string) {
  const attrs = getFinalAttributes(build);
  const skill = skillById[skillId];
  if (!skill) return 0;
  const level = build.level ?? 1;
  const trained = build.trainedSkills?.includes(skillId) ? trainingBonus(level) : 0;
  return Math.floor(level / 2) + attrs[skill.attribute] + trained + (getSkillFlatBonuses(build)[skillId] ?? 0);
}

const CLASSES_NEEDING_INITIAL_SKILL = new Set(["bucaneiro", "cacador", "soldado"]);
const CLASSES_NEEDING_SOCIAL_SKILL = new Set(["nobre"]);

export function getRequiredClassSkills(build: Pick<CharacterBuild, "class" | "classChoices">) {
  const klass = classById[build.class];
  // Only apply initialSkill for classes that explicitly require Luta-or-Pontaria choice
  const chosenInitial = CLASSES_NEEDING_INITIAL_SKILL.has(build.class)
    ? (build.classChoices?.initialSkill ?? "luta")
    : undefined;
  // Only apply socialSkill for Nobre
  const nobleChoice = CLASSES_NEEDING_SOCIAL_SKILL.has(build.class)
    ? (build.classChoices?.socialSkill ?? "diplomacia")
    : undefined;
  return [
    ...klass.fixedSkills,
    ...(chosenInitial ? [chosenInitial] : []),
    ...(nobleChoice ? [nobleChoice] : []),
  ];
}

export function collectOriginSkills(build: Pick<CharacterBuild, "origin" | "extraOrigin">) {
  return [
    ...(originById[build.origin]?.trainedSkills ?? []),
    ...(build.extraOrigin ? originById[build.extraOrigin]?.trainedSkills ?? [] : []),
  ];
}

export function dedupeSkillsWithDuplicateBonuses(skills: string[]) {
  const seen = new Set<string>();
  const duplicates: Record<string, number> = {};
  const trained: string[] = [];
  for (const skill of skills) {
    if (seen.has(skill)) {
      duplicates[skill] = (duplicates[skill] ?? 0) + 2;
    } else {
      seen.add(skill);
      trained.push(skill);
    }
  }
  return { trained, duplicates };
}

/**
 * Perícias que podem ser treinadas múltiplas vezes (cada instância representa
 * um tipo diferente). Livro pág. 82: "Ofício na verdade são várias perícias
 * diferentes" (Armeiro, Artesão, Alquimista, Alfaiate, etc.).
 */
export const REPEATABLE_SKILLS = new Set(["oficio"]);

/**
 * Mescla listas de perícias permitindo que REPEATABLE_SKILLS apareçam mais
 * de uma vez (para casos como dois Ofícios diferentes), mas deduplicando as
 * demais perícias normalmente.
 */
export function mergeSkillsForSave(...lists: string[][]): string[] {
  const all = lists.flat();
  const seenNonRepeatable = new Set<string>();
  const result: string[] = [];
  for (const id of all) {
    if (REPEATABLE_SKILLS.has(id)) {
      result.push(id); // sempre inclui — podem existir múltiplos
    } else if (!seenNonRepeatable.has(id)) {
      seenNonRepeatable.add(id);
      result.push(id);
    }
  }
  return result;
}
