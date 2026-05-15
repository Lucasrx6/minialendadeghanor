import type { Attribute, RaceId } from "./types";

export type Race = {
  id: RaceId;
  name: string;
  modifiers: Partial<Record<Attribute, number>>;
  summary: string;
  abilities: string[];
  movementM?: number;
  size?: "medio" | "grande";
  trainedSkills?: string[];
  skillBonuses?: Record<string, number>;
  hpPerLevelBonus?: number;
  mpPerLevelBonus?: number;
};

export const aberrantMutations = [
  { id: "ascetico", name: "Ascético", modifiers: { wis: 1 }, mpBonus: 3 },
  { id: "couro_rochoso", name: "Couro Rochoso", defenseBonus: 2 },
  { id: "magia_bizarra", name: "Magia Bizarra" },
  { id: "metamorfose", name: "Metamorfose" },
  { id: "mordida", name: "Mordida" },
  { id: "musculoso", name: "Musculoso", modifiers: { str: 1 } },
  { id: "resistente", name: "Resistente", modifiers: { con: 1 } },
  { id: "sentidos_agucados", name: "Sentidos Aguçados", skillBonuses: { percepcao: 2 } },
  { id: "veloz", name: "Veloz", modifiers: { dex: 1 }, movementBonusM: 3 },
  { id: "venenoso", name: "Venenoso" },
] as const;

export const races: Race[] = [
  {
    id: "humano",
    name: "Humano",
    modifiers: {},
    summary: "+1 em três atributos diferentes e versatilidade em perícias.",
    abilities: ["Versátil: duas perícias quaisquer ou troca uma por um poder geral."],
  },
  {
    id: "anao",
    name: "Anão",
    modifiers: { con: 2, int: 1, cha: -1 },
    summary: "Resistente, artesão e feito para avançar devagar.",
    abilities: ["Busca pela Perfeição", "Devagar e Sempre", "Moldado nas Rochas"],
    movementM: 6,
    hpPerLevelBonus: 1,
    skillBonuses: { oficio: 2 },
  },
  {
    id: "elfo",
    name: "Elfo",
    modifiers: { wis: 2, dex: 1, con: -1 },
    summary: "Ágil, perceptivo e tocado por magia antiga.",
    abilities: ["Armas da Floresta", "Magia Antiga", "Passo Leve", "Sentidos Élficos"],
    movementM: 12,
    mpPerLevelBonus: 1,
    skillBonuses: { furtividade: 2, percepcao: 2, diplomacia: -5, vontade: -5 },
  },
  {
    id: "gigante",
    name: "Gigante",
    modifiers: { str: 3, con: 2, int: -2, wis: -1, cha: -1 },
    summary: "Grande, bruto e pouco talhado para modos refinados.",
    abilities: ["Grandão", "Primitivo"],
    size: "grande",
    skillBonuses: { diplomacia: -5, intuicao: -5, oficio: -5 },
  },
  {
    id: "hobgoblin",
    name: "Hobgoblin",
    modifiers: { str: 1, dex: 1, con: 1, cha: -1 },
    summary: "Militarista, duro na queda e dependente de comando.",
    abilities: ["Couro Duro", "Dependência de Liderança", "Militarista", "Natureza Bestial"],
  },
  {
    id: "meio_elfo",
    name: "Meio-elfo",
    modifiers: { cha: 2 },
    summary: "Carismático, com sentidos ancestrais e uma infância longa.",
    abilities: ["Longa Infância", "Sentidos Ancestrais"],
    skillBonuses: { intuicao: 2, percepcao: 2 },
  },
  {
    id: "aberrante",
    name: "Aberrante",
    modifiers: { cha: -2 },
    summary: "Mutado pelo óleo negro, escolhe quatro mutações.",
    abilities: ["Mutações: escolha 4 entre 10 opções."],
  },
];

export const raceById = Object.fromEntries(races.map((race) => [race.id, race])) as Record<
  RaceId,
  Race
>;
