"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ANIMAL_CONFIGS, type Companion, type CompanionKind, type CompanionType } from "@/lib/ghanor/animals";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  return user;
}

async function assertOwnership(companionId: string, userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("companions")
    .select("id, character_id")
    .eq("id", companionId)
    .eq("user_id", userId)
    .single();
  if (!data) throw new Error("Parceiro não encontrado.");
  return data;
}

// ─── getCompanions ────────────────────────────────────────────────────────────

export async function getCompanions(characterId: string): Promise<Companion[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("companions")
    .select("*")
    .eq("character_id", characterId)
    .eq("user_id", user.id)
    .order("acquired_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Companion[];
}

// ─── addAnimalCompanion ───────────────────────────────────────────────────────

export async function addAnimalCompanion(input: {
  characterId: string;
  animalSlug: string;
  customName?: string;
  deductCost: boolean;
}): Promise<{ companionId: string; error?: never } | { error: string; companionId?: never }> {
  try {
    const user = await getAuthenticatedUser();
    const admin = createAdminClient();

    const { data: character } = await admin
      .from("characters")
      .select("id, money_pc")
      .eq("id", input.characterId)
      .eq("user_id", user.id)
      .single();
    if (!character) return { error: "Personagem não encontrado." };

    const config = ANIMAL_CONFIGS[input.animalSlug];
    if (!config) return { error: "Animal não reconhecido." };

    if (input.deductCost) {
      const { data: catalogItem } = await admin
        .from("items")
        .select("price_pc, name")
        .eq("slug", input.animalSlug)
        .single();

      if (!catalogItem) return { error: "Animal não encontrado no catálogo." };
      if (character.money_pc < catalogItem.price_pc) {
        return { error: "Saldo insuficiente para comprar este animal." };
      }

      const newBalance = character.money_pc - catalogItem.price_pc;
      await admin.from("characters").update({ money_pc: newBalance }).eq("id", input.characterId);
      await admin.from("money_transactions").insert({
        character_id: input.characterId,
        user_id: user.id,
        amount_pc: -catalogItem.price_pc,
        reason: `Compra: ${config.species}`,
        balance_after_pc: newBalance,
      });
    }

    const { data: companion, error } = await admin
      .from("companions")
      .insert({
        character_id: input.characterId,
        user_id: user.id,
        name: input.customName?.trim() || config.defaultName,
        species: config.species,
        kind: "animal" as CompanionKind,
        companion_type: config.companionType as CompanionType,
        power_level: "iniciante",
        acquired_from: input.deductCost ? "shop" : "manual",
        carry_capacity_spaces: config.carryCapacity,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    revalidatePath(`/characters/${input.characterId}`);
    return { companionId: companion.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao adicionar animal." };
  }
}

// ─── addCustomCompanion ───────────────────────────────────────────────────────

export async function addCustomCompanion(input: {
  characterId: string;
  name: string;
  kind: CompanionKind;
  companionType?: CompanionType;
  species?: string;
  notes?: string;
  carryCapacity?: number;
}): Promise<{ companionId: string; error?: never } | { error: string; companionId?: never }> {
  try {
    const user = await getAuthenticatedUser();
    const admin = createAdminClient();

    const { data: character } = await admin
      .from("characters")
      .select("id")
      .eq("id", input.characterId)
      .eq("user_id", user.id)
      .single();
    if (!character) return { error: "Personagem não encontrado." };

    const { data: companion, error } = await admin
      .from("companions")
      .insert({
        character_id: input.characterId,
        user_id: user.id,
        name: input.name.trim(),
        species: input.species ?? null,
        kind: input.kind,
        companion_type: input.companionType ?? null,
        power_level: "iniciante",
        acquired_from: "manual",
        carry_capacity_spaces: input.carryCapacity ?? 0,
        notes: input.notes ?? null,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    revalidatePath(`/characters/${input.characterId}`);
    return { companionId: companion.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao adicionar parceiro." };
  }
}

// ─── updateCompanion ──────────────────────────────────────────────────────────

export async function updateCompanion(input: {
  companionId: string;
  name?: string;
  notes?: string;
  appearance?: string;
  currentHp?: number;
  carryCapacitySpaces?: number;
}): Promise<{ error?: string }> {
  try {
    const user = await getAuthenticatedUser();
    const comp = await assertOwnership(input.companionId, user.id);
    const admin = createAdminClient();

    const patch: Record<string, unknown> = {};
    if (input.name !== undefined) patch.name = input.name.trim();
    if (input.notes !== undefined) patch.notes = input.notes;
    if (input.appearance !== undefined) patch.appearance = input.appearance;
    if (input.currentHp !== undefined) patch.current_hp = input.currentHp;
    if (input.carryCapacitySpaces !== undefined) patch.carry_capacity_spaces = input.carryCapacitySpaces;

    await admin.from("companions").update(patch).eq("id", input.companionId);
    revalidatePath(`/characters/${comp.character_id}`);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao atualizar parceiro." };
  }
}

// ─── markCompanionDead ────────────────────────────────────────────────────────

export async function markCompanionDead(companionId: string): Promise<{ error?: string }> {
  try {
    const user = await getAuthenticatedUser();
    const comp = await assertOwnership(companionId, user.id);
    const admin = createAdminClient();

    await admin.from("companions").update({ is_alive: false }).eq("id", companionId);

    // Return items from this companion back to carried
    await admin
      .from("character_inventory")
      .update({ location: "carried", companion_id: null })
      .eq("companion_id", companionId);

    revalidatePath(`/characters/${comp.character_id}`);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro." };
  }
}

// ─── removeCompanion ─────────────────────────────────────────────────────────

export async function removeCompanion(companionId: string): Promise<{ error?: string }> {
  try {
    const user = await getAuthenticatedUser();
    const comp = await assertOwnership(companionId, user.id);
    const admin = createAdminClient();

    await admin
      .from("character_inventory")
      .update({ location: "carried", companion_id: null })
      .eq("companion_id", companionId);

    await admin.from("companions").delete().eq("id", companionId);
    revalidatePath(`/characters/${comp.character_id}`);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao remover parceiro." };
  }
}
