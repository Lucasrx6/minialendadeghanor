"use client";

import { create } from "zustand";
import type { Attribute, Attributes, ClassId, RaceId } from "@/lib/ghanor/types";

export type WizardState = {
  step: number;
  name: string;
  concept: string;
  attrMethod: "points" | "rolls";
  baseAttributes: Attributes;
  race: RaceId;
  raceChoices: { attributes: Attribute[]; extraAttribute?: Attribute; mutations: string[] };
  class: ClassId;
  classChoices: Record<string, string | undefined>;
  origin: string;
  extraOrigin?: string;
  trainedSkills: string[];
  powers: string[];
  spells: string[];
  equipment: Array<{ name: string; qty: number; source: string }>;
  silverPieces: number;
  age?: number;
  appearance: string;
  personality: string;
  history: string;
  objective: string;
  armor: "none" | "couro" | "couro_batido" | "gibao_peles" | "brunea";
  shield: "none" | "escudo_leve";
  setStep: (step: number) => void;
  update: (patch: Partial<WizardState>) => void;
};

export const defaultAttributes: Attributes = {
  str: 0,
  dex: 0,
  con: 0,
  int: 0,
  wis: 0,
  cha: 0,
};

export const useWizardStore = create<WizardState>((set) => ({
  step: 1,
  name: "",
  concept: "",
  attrMethod: "points",
  baseAttributes: defaultAttributes,
  race: "humano",
  raceChoices: { attributes: ["str", "dex", "con"], mutations: [] },
  class: "barbaro",
  classChoices: { initialSkill: "luta", socialSkill: "diplomacia", keyAttribute: "str" },
  origin: "acolito",
  trainedSkills: [],
  powers: [],
  spells: [],
  equipment: [],
  silverPieces: 14,
  appearance: "",
  personality: "",
  history: "",
  objective: "",
  armor: "couro",
  shield: "none",
  setStep: (step) => set({ step }),
  update: (patch) => set(patch),
}));
