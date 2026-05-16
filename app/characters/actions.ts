"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculateDefense,
  calculateHp,
  calculateMp,
  getFinalAttributes,
  getMovement,
  getRequiredClassSkills,
  getSize,
} from "@/lib/ghanor/rules";
import {
  getStarterItems,
  hasMartialProficiency,
  hasHeavyArmorProficiency,
  hasShieldProficiency,
} from "@/lib/ghanor/inventory";
import type { CharacterBuild } from "@/lib/ghanor/types";
import type { WizardState } from "@/components/wizard/store";
import crypto from "crypto";

/** Concede o kit inicial ao personagem recém-criado. */
async function grantStarterKit(characterId: string, userId: string, classId: string, moneyPc: number) {
  const admin = createAdminClient();
  const hasMartial = hasMartialProficiency(classId);
  const hasHeavy   = hasHeavyArmorProficiency(classId);
  const hasShield  = hasShieldProficiency(classId);
  const slugs = getStarterItems(classId, hasMartial, hasHeavy, hasShield);

  if (slugs.length === 0) return;

  // Busca IDs dos itens no catálogo
  const { data: items } = await admin
    .from("items")
    .select("id, slug, is_stackable")
    .in("slug", slugs);

  if (!items || items.length === 0) return;

  const rows = items.map(item => ({
    character_id: characterId,
    user_id: userId,
    item_id: item.id,
    quantity: 1,
    location: "carried" as const,
    improvements: 0,
    is_arcanium: false,
    acquired_from: "starter" as const,
  }));

  await admin.from("character_inventory").insert(rows);

  // Dinheiro inicial: 4d6 PP
  const rolls = Array.from({ length: 4 }, () => crypto.randomInt(1, 7));
  const startingPp = rolls.reduce((s, r) => s + r, 0);
  const startingPc = startingPp * 10;
  const newBalance = moneyPc + startingPc;

  await admin.from("characters").update({ money_pc: newBalance }).eq("id", characterId);
  await admin.from("money_transactions").insert({
    character_id: characterId,
    user_id: userId,
    amount_pc: startingPc,
    reason: `Dinheiro inicial: ${startingPp} PP (4d6: ${rolls.join("+")})`,
    balance_after_pc: newBalance,
  });
}

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

  // Kit inicial automático
  await grantStarterKit(data.id, user.id, input.class, 0).catch(() => null);

  revalidatePath("/characters");
  return data.id as string;
}

// ─── Editar campos narrativos de um personagem existente ─────────────────────

export async function updateCharacter(
  id: string,
  fields: {
    name?: string;
    concept?: string;
    age?: number | null;
    appearance?: string;
    personality?: string;
    history?: string;
    objective?: string;
  },
) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Não autenticado.");

  const admin = createAdminClient();

  const { data: owned } = await admin
    .from("characters")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!owned) throw new Error("Personagem não encontrado.");

  const patch: Record<string, unknown> = {};
  if (fields.name !== undefined) patch.name = fields.name.trim() || "Aventureiro sem nome";
  if (fields.concept !== undefined) patch.concept = fields.concept || null;
  if (fields.age !== undefined) patch.age = fields.age ?? null;
  if (fields.appearance !== undefined) patch.appearance = fields.appearance || null;
  if (fields.personality !== undefined) patch.personality = fields.personality || null;
  if (fields.history !== undefined) patch.history = fields.history || null;
  if (fields.objective !== undefined) patch.objective = fields.objective || null;

  const { error: updateError } = await admin
    .from("characters")
    .update(patch)
    .eq("id", id);

  if (updateError) throw new Error(updateError.message);

  revalidatePath(`/characters/${id}`);
  revalidatePath("/characters");
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

  // Kit inicial automático
  await grantStarterKit(data.id, user.id, input.class, 0).catch(() => null);

  revalidatePath("/characters");
  return data.id as string;
}
