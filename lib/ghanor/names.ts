import type { RaceId } from "./types";

const starts: Record<RaceId, string[]> = {
  humano: ["Ald", "Brun", "Cali", "Dari", "Elan", "Garr", "Mira", "Ruf", "Tali", "Vas"],
  anao: ["Brom", "Durg", "Gim", "Hilda", "Krag", "Rurik", "Thora", "Ulf", "Varr", "Yng"],
  elfo: ["Ael", "Elar", "Faen", "Ily", "Lia", "Naer", "Sael", "Thal", "Vael", "Yll"],
  gigante: ["Borg", "Drak", "Grom", "Hruk", "Karn", "Mog", "Raug", "Skol", "Thog", "Varg"],
  hobgoblin: ["Ak", "Braz", "Drog", "Grak", "Kaz", "Morz", "Ruk", "Targ", "Urz", "Vrak"],
  meio_elfo: ["Ari", "Cael", "Darian", "Elis", "Lorian", "Mirel", "Nerian", "Ravel", "Seren", "Tavian"],
  aberrante: ["Azh", "Bel", "Cthon", "Draz", "Ekh", "Maw", "Nox", "Orr", "Syr", "Vhul"],
};

const ends: Record<RaceId, string[]> = {
  humano: ["ana", "ardo", "ela", "iano", "ina", "or", "us", "van"],
  anao: ["barba", "drun", "ferro", "granito", "martelo", "pedra", "run", "viga"],
  elfo: ["ael", "aris", "driel", "lith", "riel", "thas", "wen", "wyn"],
  gigante: ["dun", "garr", "harr", "mak", "nar", "ruk", "torr", "vok"],
  hobgoblin: ["gar", "gash", "gor", "kaz", "nak", "ruk", "thar", "zod"],
  meio_elfo: ["driel", "lan", "mir", "riel", "sian", "thor", "van", "wyn"],
  aberrante: ["ach", "gath", "ix", "mor", "oth", "rax", "ul", "yn"],
};

const titles = [
  "do Brejo Velho",
  "Mata-Dragões",
  "da Ponte Queimada",
  "de Sangue Frio",
  "Canta-Ferro",
  "dos Sete Presságios",
  "da Última Tocha",
  "Que-Não-Se-Cala",
];

export function randomCharacterName(race: RaceId, random = Math.random) {
  const start = starts[race][Math.floor(random() * starts[race].length)];
  const end = ends[race][Math.floor(random() * ends[race].length)];
  const name = `${start}${end}`;
  const shouldAddTitle = random() > 0.58;
  return shouldAddTitle ? `${name} ${titles[Math.floor(random() * titles.length)]}` : name;
}

export function randomNameOptions(race: RaceId, count = 6) {
  return Array.from({ length: count }, () => randomCharacterName(race));
}
