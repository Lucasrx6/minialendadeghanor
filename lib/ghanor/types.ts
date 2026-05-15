export const attributes = ["str", "dex", "con", "int", "wis", "cha"] as const;

export type Attribute = (typeof attributes)[number];

export type Attributes = Record<Attribute, number>;

export type RaceId =
  | "humano"
  | "anao"
  | "elfo"
  | "gigante"
  | "hobgoblin"
  | "meio_elfo"
  | "aberrante";

export type ClassId =
  | "barbaro"
  | "bardo"
  | "bucaneiro"
  | "cacador"
  | "cavaleiro"
  | "clerigo"
  | "druida"
  | "ladino"
  | "mago"
  | "nobre"
  | "soldado";

export type Size = "miudo" | "pequeno" | "medio" | "grande" | "enorme" | "colossal";

export type ArmorId = "none" | "couro" | "couro_batido" | "gibao_peles" | "brunea";

export type ShieldId = "none" | "escudo_leve";

export type CharacterBuild = {
  level?: number;
  race: RaceId;
  class: ClassId;
  origin: string;
  extraOrigin?: string;
  baseAttributes: Attributes;
  raceChoices?: {
    attributes?: Attribute[];
    extraAttribute?: Attribute;
    mutations?: string[];
  };
  classChoices?: Record<string, string | undefined>;
  armor?: ArmorId;
  shield?: ShieldId;
  trainedSkills?: string[];
};

export const attributeLabels: Record<Attribute, string> = {
  str: "For",
  dex: "Des",
  con: "Con",
  int: "Int",
  wis: "Sab",
  cha: "Car",
};
