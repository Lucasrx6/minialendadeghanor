"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  calculateDefense,
  calculateHp,
  calculateMp,
  getFinalAttributes,
  getMovement,
  getRequiredClassSkills,
  getSize,
} from "@/lib/ghanor/rules";
import type { CharacterBuild } from "@/lib/ghanor/types";
import type { WizardState } from "@/components/wizard/store";

export async function saveCharacter(input: WizardState) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Entre na sua conta antes de salvar o personagem.");
  }

  const build: CharacterBuild = {
    race: input.race,
    class: input.class,
    origin: input.origin,
    extraOrigin: input.extraOrigin,
    baseAttributes: input.baseAttributes,
    raceChoices: input.raceChoices,
    classChoices: input.classChoices,
    armor: input.armor,
    shield: input.shield,
    trainedSkills: [...new Set([...getRequiredClassSkills(input), ...input.trainedSkills])],
  };
  const attrs = getFinalAttributes(build);

  const { data, error } = await supabase
    .from("characters")
    .insert({
      user_id: user.id,
      name: input.name || "Aventureiro sem nome",
      concept: input.concept,
      attr_method: input.attrMethod,
      attr_str: attrs.str,
      attr_dex: attrs.dex,
      attr_con: attrs.con,
      attr_int: attrs.int,
      attr_wis: attrs.wis,
      attr_cha: attrs.cha,
      race: input.race,
      race_choices: input.raceChoices,
      class: input.class,
      class_choices: input.classChoices,
      origin: input.origin,
      origin_choices: { extraOrigin: input.extraOrigin },
      trained_skills: build.trainedSkills,
      powers: input.powers,
      spells: input.spells,
      equipment: input.equipment,
      silver_pieces: input.silverPieces,
      hp_max: calculateHp(build),
      mp_max: calculateMp(build),
      defense: calculateDefense(build),
      size: getSize(build),
      movement_m: getMovement(build),
      age: input.age,
      appearance: input.appearance,
      personality: input.personality,
      history: input.history,
      objective: input.objective,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/characters");
  return data.id as string;
}

export async function deleteCharacter(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("characters").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/characters");
}

export async function saveGuidedCharacter(input: {
  name: string;
  age?: number;
  appearance?: string;
  objective?: string;
  race: string;
  raceChoices: any;
  origin: string;
  extraOrigin?: string;
  class: string;
  answers: any[];
  computed: any;
  silverPieces: number;
  spells: string[];
  equipment: any[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Entre na sua conta antes de salvar o personagem.");
  }

  const build: CharacterBuild = {
    race: input.race as any,
    class: input.class as any,
    origin: input.origin,
    extraOrigin: input.extraOrigin,
    baseAttributes: input.computed.baseAttributes,
    raceChoices: input.raceChoices,
    armor: input.computed.armor,
    shield: input.computed.shield,
    trainedSkills: input.computed.trainedSkills,
  };
  const attrs = getFinalAttributes(build);

  const { data, error } = await supabase
    .from("characters")
    .insert({
      user_id: user.id,
      name: input.name || "Aventureiro sem nome",
      concept: input.computed.concept,
      attr_method: "points",
      attr_str: attrs.str,
      attr_dex: attrs.dex,
      attr_con: attrs.con,
      attr_int: attrs.int,
      attr_wis: attrs.wis,
      attr_cha: attrs.cha,
      race: input.race,
      race_choices: input.raceChoices,
      class: input.class,
      class_choices: {},
      origin: input.origin,
      origin_choices: { extraOrigin: input.extraOrigin },
      trained_skills: build.trainedSkills,
      powers: [],
      spells: input.spells,
      equipment: input.equipment,
      silver_pieces: input.silverPieces,
      hp_max: calculateHp(build),
      mp_max: calculateMp(build),
      defense: calculateDefense(build),
      size: getSize(build),
      movement_m: getMovement(build),
      age: input.age,
      appearance: input.appearance,
      objective: input.objective,
      creation_mode: "guided",
      quiz_answers: input.answers,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/characters");
  return data.id as string;
}
