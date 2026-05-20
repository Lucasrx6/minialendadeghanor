"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  return user;
}

async function assertOwns(characterId: string, userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("characters")
    .select("id")
    .eq("id", characterId)
    .eq("user_id", userId)
    .single();
  if (!data) throw new Error("Personagem não encontrado.");
}

// ── Editar atributos e stats de combate ───────────────────────────────────────

const StatsSchema = z.object({
  characterId: z.string().uuid(),
  attr_str:    z.number().int().min(-5).max(10).optional(),
  attr_dex:    z.number().int().min(-5).max(10).optional(),
  attr_con:    z.number().int().min(-5).max(10).optional(),
  attr_int:    z.number().int().min(-5).max(10).optional(),
  attr_wis:    z.number().int().min(-5).max(10).optional(),
  attr_cha:    z.number().int().min(-5).max(10).optional(),
  hp_max:      z.number().int().min(1).max(9999).optional(),
  mp_max:      z.number().int().min(0).max(9999).optional(),
  defense:     z.number().int().min(1).max(99).optional(),
  movement_m:  z.number().int().min(0).max(99).optional(),
});

export async function dmEditCharacterStats(raw: z.infer<typeof StatsSchema>) {
  const input = StatsSchema.parse(raw);
  const user = await getAuthUser();
  await assertOwns(input.characterId, user.id);

  const { characterId, ...rest } = input;
  const patch = Object.fromEntries(
    Object.entries(rest).filter(([, v]) => v !== undefined),
  );
  if (Object.keys(patch).length === 0) return;

  const admin = createAdminClient();
  const { error } = await admin
    .from("characters")
    .update(patch)
    .eq("id", characterId);

  if (error) throw new Error(error.message);
  revalidatePath(`/characters/${characterId}`);
}

// ── Editar item do inventário (melhorias, arcanium, rótulo, notas) ────────────

const ItemEditSchema = z.object({
  inventoryId:        z.string().uuid(),
  characterId:        z.string().uuid(),
  customLabel:        z.string().max(100).optional(),
  notes:              z.string().max(2000).optional(),
  improvements:       z.number().int().min(0).max(4).optional(),
  isArcanium:         z.boolean().optional(),
  arcaniumSpellCircle: z.number().int().min(1).max(5).optional(),
  quantity:           z.number().int().min(1).optional(),
});

export async function dmEditInventoryItem(raw: z.infer<typeof ItemEditSchema>) {
  const input = ItemEditSchema.parse(raw);
  const user = await getAuthUser();
  await assertOwns(input.characterId, user.id);

  const admin = createAdminClient();

  const { data: inv } = await admin
    .from("character_inventory")
    .select("id, user_id")
    .eq("id", input.inventoryId)
    .single();

  if (!inv || inv.user_id !== user.id) throw new Error("Item não encontrado.");

  const patch: Record<string, unknown> = {};
  if (input.customLabel !== undefined) patch.custom_label = input.customLabel || null;
  if (input.notes !== undefined) patch.notes = input.notes || null;
  if (input.improvements !== undefined) patch.improvements = input.improvements;
  if (input.isArcanium !== undefined) {
    patch.is_arcanium = input.isArcanium;
    patch.arcanium_spell_circle = input.isArcanium
      ? (input.arcaniumSpellCircle ?? 1)
      : null;
  }
  if (input.quantity !== undefined) patch.quantity = input.quantity;

  if (Object.keys(patch).length === 0) return;

  const { error } = await admin
    .from("character_inventory")
    .update(patch)
    .eq("id", input.inventoryId);

  if (error) throw new Error(error.message);
  revalidatePath(`/characters/${input.characterId}`);
}

// ── Remover item permanentemente ──────────────────────────────────────────────

export async function dmDeleteInventoryItem(inventoryId: string, characterId: string) {
  const user = await getAuthUser();
  await assertOwns(characterId, user.id);

  const admin = createAdminClient();
  const { error } = await admin
    .from("character_inventory")
    .delete()
    .eq("id", inventoryId);

  if (error) throw new Error(error.message);
  revalidatePath(`/characters/${characterId}`);
}

// ── Gerenciar magias do personagem (DM) ───────────────────────────────────────

export async function addSpellToCharacter(
  characterId: string,
  spellId: string,
): Promise<{ ok: true } | { error: string }> {
  try {
    const user = await getAuthUser();
    await assertOwns(characterId, user.id);

    const admin = createAdminClient();
    const { data: char } = await admin
      .from("characters")
      .select("spells")
      .eq("id", characterId)
      .single();

    if (!char) return { error: "Personagem não encontrado." };

    const current: string[] = char.spells ?? [];
    if (current.includes(spellId)) return { ok: true };

    const { error } = await admin
      .from("characters")
      .update({ spells: [...current, spellId] })
      .eq("id", characterId);

    if (error) return { error: error.message };
    revalidatePath(`/characters/${characterId}`);
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removeSpellFromCharacter(
  characterId: string,
  spellId: string,
): Promise<{ ok: true } | { error: string }> {
  try {
    const user = await getAuthUser();
    await assertOwns(characterId, user.id);

    const admin = createAdminClient();
    const { data: char } = await admin
      .from("characters")
      .select("spells")
      .eq("id", characterId)
      .single();

    if (!char) return { error: "Personagem não encontrado." };

    const updated = (char.spells ?? []).filter((s: string) => s !== spellId);

    const { error } = await admin
      .from("characters")
      .update({ spells: updated })
      .eq("id", characterId);

    if (error) return { error: error.message };
    revalidatePath(`/characters/${characterId}`);
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ── Editar perícias treinadas do personagem (DM) ─────────────────────────────

const SkillsSchema = z.object({
  characterId:   z.string().uuid(),
  trainedSkills: z.array(z.string()),
});

export async function dmEditCharacterSkills(raw: z.infer<typeof SkillsSchema>) {
  const input = SkillsSchema.parse(raw);
  const user = await getAuthUser();
  await assertOwns(input.characterId, user.id);

  const admin = createAdminClient();
  const { error } = await admin
    .from("characters")
    .update({ trained_skills: input.trainedSkills })
    .eq("id", input.characterId);

  if (error) throw new Error(error.message);
  revalidatePath(`/characters/${input.characterId}`);
}

// ── Gerenciar poderes do personagem (DM) ──────────────────────────────────────

export async function addPowerToCharacter(
  characterId: string,
  powerId: string,
): Promise<{ ok: true } | { error: string }> {
  try {
    const user = await getAuthUser();
    await assertOwns(characterId, user.id);

    const admin = createAdminClient();
    const { data: char } = await admin
      .from("characters")
      .select("powers")
      .eq("id", characterId)
      .single();

    if (!char) return { error: "Personagem não encontrado." };

    const current: string[] = char.powers ?? [];
    if (current.includes(powerId)) return { ok: true };

    const { error } = await admin
      .from("characters")
      .update({ powers: [...current, powerId] })
      .eq("id", characterId);

    if (error) return { error: error.message };
    revalidatePath(`/characters/${characterId}`);
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

export async function removePowerFromCharacter(
  characterId: string,
  powerId: string,
): Promise<{ ok: true } | { error: string }> {
  try {
    const user = await getAuthUser();
    await assertOwns(characterId, user.id);

    const admin = createAdminClient();
    const { data: char } = await admin
      .from("characters")
      .select("powers")
      .eq("id", characterId)
      .single();

    if (!char) return { error: "Personagem não encontrado." };

    const updated = (char.powers ?? []).filter((p: string) => p !== powerId);

    const { error } = await admin
      .from("characters")
      .update({ powers: updated })
      .eq("id", characterId);

    if (error) return { error: error.message };
    revalidatePath(`/characters/${characterId}`);
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
