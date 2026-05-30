"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeLevelUp } from "@/lib/ghanor/leveling";
import type { ClassId, Attribute } from "@/lib/ghanor/types";

const LevelUpInputSchema = z.object({
  characterId: z.string().uuid(),
  newClassId: z.enum(["barbaro","bardo","bucaneiro","cacador","cavaleiro","clerigo","druida","ladino","mago","nobre","soldado"]),
  isMulticlass: z.boolean().default(false),
  powerChosen: z.string().optional(),
  attrIncreased: z.enum(["str","dex","con","int","wis","cha"]).optional(),
  newSpells: z.array(z.string()).default([]),
  notes: z.string().max(500).optional(),
});

export type LevelUpInput = z.infer<typeof LevelUpInputSchema>;

export async function saveLevelUp(raw: LevelUpInput): Promise<{ success: true; newLevel: number } | { success: false; error: string }> {
  const parsed = LevelUpInputSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Dados inválidos." };
  const input = parsed.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Não autenticado." };

  // Busca o personagem
  const { data: character } = await supabase
    .from("characters")
    .select("id, user_id, current_level, class_levels, class, race, origin, attr_str, attr_dex, attr_con, attr_int, attr_wis, attr_cha, hp_max, mp_max")
    .eq("id", input.characterId)
    .eq("user_id", user.id)
    .single();

  if (!character) return { success: false, error: "Personagem não encontrado." };
  if (character.current_level >= 20) return { success: false, error: "Nível máximo (20) já atingido." };

  // Garante class_levels populado
  const classLevels: Record<string, number> =
    character.class_levels && Object.keys(character.class_levels).length > 0
      ? (character.class_levels as Record<string, number>)
      : { [character.class]: 1 };

  const charForLevelUp = {
    current_level: character.current_level ?? 1,
    class_levels: classLevels,
    class: character.class,
    race: character.race,
    origin: character.origin,
    attr_str: character.attr_str,
    attr_dex: character.attr_dex,
    attr_con: character.attr_con,
    attr_int: character.attr_int,
    attr_wis: character.attr_wis,
    attr_cha: character.attr_cha,
    hp_max: character.hp_max,
    mp_max: character.mp_max,
  };

  const result = computeLevelUp(charForLevelUp, {
    newClassId: input.newClassId as ClassId,
    isMulticlass: input.isMulticlass,
    attrIncreased: input.attrIncreased as Attribute | undefined,
  });

  const admin = createAdminClient();

  // 1. Registra o level_up
  const { error: luError } = await admin.from("level_ups").insert({
    character_id: input.characterId,
    user_id: user.id,
    from_level: charForLevelUp.current_level,
    to_level: result.newLevel,
    class_taken: input.newClassId,
    is_multiclass: input.isMulticlass,
    hp_gained: result.hpGained,
    mp_gained: result.mpGained,
    power_chosen: input.powerChosen ?? null,
    new_spells: input.newSpells,
    attr_increased: input.attrIncreased ?? null,
    notes: input.notes ?? null,
  });

  if (luError) return { success: false, error: luError.message };

  // 2. Atualiza o personagem
  const updatePayload: Record<string, unknown> = {
    current_level: result.newLevel,
    class_levels: result.newClassLevels,
    hp_max: result.newHpMax,
    mp_max: result.newMpMax,
  };

  // Aplica aumento de atributo se necessário
  if (input.attrIncreased && result.newAttributes) {
    const attrKey = `attr_${input.attrIncreased}` as string;
    updatePayload[attrKey] = result.newAttributes[input.attrIncreased];
  }

  // Adiciona magias aprendidas
  if (input.newSpells.length > 0) {
    // Busca as magias existentes para concatenar
    const { data: existing } = await admin
      .from("characters")
      .select("spells")
      .eq("id", input.characterId)
      .single();
    const currentSpells: string[] = existing?.spells ?? [];
    updatePayload.spells = [...new Set([...currentSpells, ...input.newSpells])];
  }

  // Adiciona poder
  if (input.powerChosen) {
    const { data: existing } = await admin
      .from("characters")
      .select("powers")
      .eq("id", input.characterId)
      .single();
    const currentPowers: string[] = existing?.powers ?? [];
    updatePayload.powers = [...currentPowers, input.powerChosen];
  }

  const { error: updateError } = await admin
    .from("characters")
    .update(updatePayload)
    .eq("id", input.characterId);

  if (updateError) return { success: false, error: updateError.message };

  // Renda do Aristocrata: 300 PP × novo nível, concedida ao subir de nível
  const isAristocrata =
    character.origin === "aristocrata" ||
    (character as { extra_origin?: string }).extra_origin === "aristocrata";
  if (isAristocrata) {
    const rendaPc = result.newLevel * 300 * 10; // 300 PP × nível, convertido para PC
    const { data: charMoney } = await admin
      .from("characters")
      .select("money_pc")
      .eq("id", input.characterId)
      .single();
    const currentMoney = (charMoney?.money_pc ?? 0) as number;
    const newBalance = currentMoney + rendaPc;
    await admin
      .from("characters")
      .update({ money_pc: newBalance })
      .eq("id", input.characterId);
    await admin.from("money_transactions").insert({
      character_id: input.characterId,
      user_id: user.id,
      amount_pc: rendaPc,
      reason: `Renda aristocrática — nível ${result.newLevel} (${result.newLevel * 300} PP)`,
      balance_after_pc: newBalance,
    });
  }

  revalidatePath(`/characters/${input.characterId}`);
  revalidatePath("/characters");

  return { success: true, newLevel: result.newLevel };
}

export async function getLevelUpHistory(characterId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("level_ups")
    .select("*")
    .eq("character_id", characterId)
    .order("to_level", { ascending: true });
  return data ?? [];
}
