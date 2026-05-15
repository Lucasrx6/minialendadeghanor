import type { ClassId } from "./types";

export type Spell = {
  id: string;
  name: string;
  traditions: Array<"arcana" | "divina">;
  classes: ClassId[];
};

const id = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

export const spells: Spell[] = [
  "Armadura Arcana",
  "Disfarce Ilusório",
  "Enfeitiçar",
  "Imagem Espelhada",
  "Luz",
  "Mísseis Mágicos",
  "Névoa",
  "Sono",
  "Curar Ferimentos",
  "Benção",
  "Comando",
  "Detectar Ameaças",
].map((name) => ({
  id: id(name),
  name,
  traditions: name.includes("Curar") || name === "Benção" || name === "Comando" ? ["divina"] : ["arcana"],
  classes:
    name.includes("Curar") || name === "Benção" || name === "Comando"
      ? ["clerigo"]
      : ["bardo", "mago"],
}));
