export const raceDescriptors: Record<string, string> = {
  humano: "human",
  anao: "stocky, bearded dwarf with intricate braids",
  elfo: "slender elf with long pointed ears and nature-toned coloring",
  gigante: "massive 3-meter-tall giant with broad shoulders and small eyes, wearing rough furs",
  hobgoblin: "tall hobgoblin with yellowish fur, animalistic snout, and tusks",
  meio_elfo: "half-elf with elegant elven features and human stature",
  aberrante: "uncanny aberrant being mutated by the Devourer's black oil",
};

export const classDescriptors: Record<string, string> = {
  barbaro: "a barbarian wielding a massive axe, clad in furs and war paint",
  bardo: "a bard in bright traveling clothes, lute slung over one shoulder",
  bucaneiro: "a swashbuckler in a fine coat, rapier at the hip and a confident smirk",
  cacador: "a hunter in weathered leather armor, bow in hand and quiver on the back",
  cavaleiro: "a knight in full plate armor bearing a heraldic shield",
  clerigo: "a cleric in holy vestments, sacred symbol raised in one hand",
  druida: "a druid adorned with leaves and natural charms, staff carved from living wood",
  ladino: "a rogue in a dark hooded cloak, twin daggers sheathed at the belt",
  mago: "a wizard in flowing robes, holding an arcane staff etched with glowing runes",
  nobre: "a noble in refined court attire, standing with an air of commanding authority",
  soldado: "a soldier in practical battle armor, hand resting on the pommel of a sword",
};

export const raceLabels: Record<string, string> = {
  humano: "Humano",
  anao: "Anão",
  elfo: "Elfo",
  gigante: "Gigante",
  hobgoblin: "Hobgoblin",
  meio_elfo: "Meio-elfo",
  aberrante: "Aberrante",
};

export const classLabels: Record<string, string> = {
  barbaro: "Bárbaro",
  bardo: "Bardo",
  bucaneiro: "Bucaneiro",
  cacador: "Caçador",
  cavaleiro: "Cavaleiro",
  clerigo: "Clérigo",
  druida: "Druida",
  ladino: "Ladino",
  mago: "Mago",
  nobre: "Nobre",
  soldado: "Soldado",
};

export function buildPortraitPrompt(params: {
  race: string;
  classId: string;
  appearance?: string | null;
  age?: number | null;
  concept?: string | null;
}): string {
  const race = raceDescriptors[params.race] ?? "human";
  const cls = classDescriptors[params.classId] ?? "an adventurer";

  return [
    `Full body fantasy illustration of ${cls}, ${race} race.`,
    `Standing in a confident heroic pose, gazing toward the horizon.`,
    params.appearance,
    params.age ? `Aged around ${params.age}.` : undefined,
    params.concept,
    "Full body visible from head to toe. Medieval high fantasy style, painterly digital art, dramatic cinematic lighting, neutral open-sky background.",
  ]
    .filter(Boolean)
    .join(" ");
}
