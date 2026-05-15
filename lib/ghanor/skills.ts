import type { Attribute } from "./types";

export type Skill = {
  id: string;
  name: string;
  attribute: Attribute;
  armorPenalty?: boolean;
  trainedOnly?: boolean;
};

export const skills: Skill[] = [
  { id: "acrobacia", name: "Acrobacia", attribute: "dex", armorPenalty: true },
  { id: "adestramento", name: "Adestramento", attribute: "cha", trainedOnly: true },
  { id: "atletismo", name: "Atletismo", attribute: "str" },
  { id: "atuacao", name: "Atuação", attribute: "cha" },
  { id: "cavalgar", name: "Cavalgar", attribute: "dex" },
  { id: "conhecimento", name: "Conhecimento", attribute: "int", trainedOnly: true },
  { id: "cura", name: "Cura", attribute: "wis" },
  { id: "diplomacia", name: "Diplomacia", attribute: "cha" },
  { id: "enganacao", name: "Enganação", attribute: "cha" },
  { id: "fortitude", name: "Fortitude", attribute: "con" },
  { id: "furtividade", name: "Furtividade", attribute: "dex", armorPenalty: true },
  { id: "guerra", name: "Guerra", attribute: "int", trainedOnly: true },
  { id: "iniciativa", name: "Iniciativa", attribute: "dex" },
  { id: "intimidacao", name: "Intimidação", attribute: "cha" },
  { id: "intuicao", name: "Intuição", attribute: "wis" },
  { id: "investigacao", name: "Investigação", attribute: "int" },
  { id: "ladinagem", name: "Ladinagem", attribute: "dex", trainedOnly: true, armorPenalty: true },
  { id: "luta", name: "Luta", attribute: "str" },
  { id: "misticismo", name: "Misticismo", attribute: "int", trainedOnly: true },
  { id: "nobreza", name: "Nobreza", attribute: "int", trainedOnly: true },
  { id: "oficio", name: "Ofício", attribute: "int", trainedOnly: true },
  { id: "percepcao", name: "Percepção", attribute: "wis" },
  { id: "pontaria", name: "Pontaria", attribute: "dex" },
  { id: "reflexos", name: "Reflexos", attribute: "dex" },
  { id: "religiao", name: "Religião", attribute: "wis", trainedOnly: true },
  { id: "sobrevivencia", name: "Sobrevivência", attribute: "wis" },
  { id: "vontade", name: "Vontade", attribute: "wis" },
];

export const skillById = Object.fromEntries(skills.map((skill) => [skill.id, skill])) as Record<
  string,
  Skill
>;
