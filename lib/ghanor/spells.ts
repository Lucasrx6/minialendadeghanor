import type { ClassId } from "./types";

export type Spell = {
  id: string;
  name: string;
  traditions: Array<"arcana" | "divina">;
  classes: ClassId[];
  circle: 1;
  tags: string[];
};

const id = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const bardo = [
  "Alarme",
  "Armadura Mágica",
  "Comando",
  "Compreensão",
  "Concentração de Combate",
  "Criar Ilusão",
  "Despedaçar",
  "Detectar Ameaças",
  "Disfarce Ilusório",
  "Enfeitiçar",
  "Imagem Espelhada",
  "Leque Cromático",
  "Luz",
  "Mensagem Secreta",
  "Primor Atlético",
  "Proteção Mística",
  "Sono",
  "Tranca Arcana",
  "Tranquilidade",
  "Visão Mística",
];

const clerigo = [
  "Abençoar Alimentos",
  "Acalmar Animal",
  "Alarme",
  "Arma Espiritual",
  "Arma Mágica",
  "Armadura Mágica",
  "Aviso",
  "Bênção",
  "Caminhos da Natureza",
  "Comando",
  "Compreensão",
  "Concentração de Combate",
  "Consagrar",
  "Curar Ferimentos",
  "Despedaçar",
  "Detectar Ameaças",
  "Disfarce Ilusório",
  "Escudo da Fé",
  "Escuridão",
  "Imagem Espelhada",
  "Infligir Ferimentos",
  "Luz",
  "Névoa",
  "Orientação",
  "Perdição",
  "Primor Atlético",
  "Proteção Mística",
  "Queda Suave",
  "Resistência a Energia",
  "Santuário",
  "Suporte Ambiental",
  "Tranca Arcana",
  "Tranquilidade",
  "Transmutar Objetos",
  "Visão Mística",
];

const druida = [
  "Abençoar Alimentos",
  "Acalmar Animal",
  "Armamento da Natureza",
  "Caminhos da Natureza",
  "Consagrar",
  "Controlar Plantas",
  "Criar Elementos",
  "Curar Ferimentos",
  "Dardo Gélido",
  "Escuridão",
  "Explosão de Chamas",
  "Luz",
  "Névoa",
  "Primor Atlético",
  "Proteção Mística",
  "Queda Suave",
  "Resistência a Energia",
  "Suporte Ambiental",
  "Toque Chocante",
  "Visão Mística",
];

const mago = [
  "Acalmar Animal",
  "Adaga Mental",
  "Alarme",
  "Amedrontar",
  "Área Escorregadia",
  "Arma Mágica",
  "Armadura Mágica",
  "Armamento da Natureza",
  "Aviso",
  "Bênção",
  "Caminhos da Natureza",
  "Comando",
  "Compreensão",
  "Conjurar Monstro",
  "Controlar Plantas",
  "Criar Elementos",
  "Criar Ilusão",
  "Dardo Gélido",
  "Despedaçar",
  "Detectar Ameaças",
  "Disfarce Ilusório",
  "Enfeitiçar",
  "Escuridão",
  "Explosão de Chamas",
  "Hipnotismo",
  "Imagem Espelhada",
  "Infligir Ferimentos",
  "Jato Corrosivo",
  "Leque Cromático",
  "Luz",
  "Névoa",
  "Orientação",
  "Perdição",
  "Primor Atlético",
  "Profanar",
  "Proteção Mística",
  "Queda Suave",
  "Raio do Enfraquecimento",
  "Resistência a Energia",
  "Santuário",
  "Seta Infalível",
  "Sono",
  "Suporte Ambiental",
  "Toque Chocante",
  "Tranca Arcana",
  "Tranquilidade",
  "Transmutar Objetos",
  "Visão Mística",
  "Vitalidade Fantasma",
  "Voz Divina",
];

const byName = new Map<string, Spell>();

function addSpells(names: string[], klass: ClassId, tradition: "arcana" | "divina", tag: string) {
  for (const name of names) {
    const existing = byName.get(name);
    if (existing) {
      if (!existing.classes.includes(klass)) existing.classes.push(klass);
      if (!existing.traditions.includes(tradition)) existing.traditions.push(tradition);
      if (!existing.tags.includes(tag)) existing.tags.push(tag);
    } else {
      byName.set(name, {
        id: id(name),
        name,
        traditions: [tradition],
        classes: [klass],
        circle: 1,
        tags: [tag],
      });
    }
  }
}

addSpells(bardo, "bardo", "arcana", "Bardo");
addSpells(clerigo, "clerigo", "divina", "Clérigo");
addSpells(druida, "druida", "divina", "Druida");
addSpells(mago, "mago", "arcana", "Mago");

export const spells = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

export const spellById = Object.fromEntries(spells.map((spell) => [spell.id, spell])) as Record<
  string,
  Spell
>;

export function getSpellsForClass(klass: ClassId) {
  return spells.filter((spell) => spell.classes.includes(klass));
}
