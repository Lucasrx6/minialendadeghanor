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
  barbaro: "wielding a massive axe with a fierce battle stance",
  bardo: "holding a lute and wearing bright traveling clothes",
  bucaneiro: "with a rapier, confident grin, and duelist posture",
  cacador: "carrying a bow and weathered survival gear",
  cavaleiro: "wearing knightly armor and carrying a heraldic shield",
  clerigo: "holding a sacred symbol with solemn devotion",
  druida: "with natural charms, leaves, and an animal companion silhouette",
  ladino: "wearing a hooded cloak with daggers at the belt",
  mago: "holding an arcane staff with glowing runes",
  nobre: "wearing refined court clothes with commanding presence",
  soldado: "in practical armor with a disciplined military stance",
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
  return [
    `A detailed fantasy portrait of a ${raceDescriptors[params.race] ?? "fantasy adventurer"} ${classDescriptors[params.classId] ?? "adventurer"}.`,
    params.appearance,
    params.age ? `Aged around ${params.age}.` : undefined,
    params.concept,
    "Medieval high fantasy setting inspired by classic tabletop RPG art. Painterly style, dramatic lighting, three-quarter view, neutral background.",
  ]
    .filter(Boolean)
    .join(" ");
}
