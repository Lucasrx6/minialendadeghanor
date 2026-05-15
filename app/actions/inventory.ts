"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { priceWithArcanium } from "@/lib/ghanor/inventory";
import crypto from "crypto";

// ─── Helpers internos ──────────────────────────────────────────────────────────

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  return user;
}

async function assertOwnership(characterId: string, userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("characters")
    .select("id, money_pc")
    .eq("id", characterId)
    .eq("user_id", userId)
    .single();
  if (!data) throw new Error("Personagem não encontrado.");
  return data;
}

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type InventoryLocation = "equipped" | "worn" | "carried" | "mount" | "storage" | "sold";

// ─── addToInventory ────────────────────────────────────────────────────────────

const AddSchema = z.object({
  characterId: z.string().uuid(),
  itemSlug: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  improvements: z.number().int().min(0).max(4).default(0),
  isArcanium: z.boolean().default(false),
  arcaniumSpellCircle: z.number().int().min(1).max(5).optional(),
  customLabel: z.string().max(100).optional(),
  acquiredFrom: z.enum(["starter", "origin", "shop", "loot", "craft", "gift"]).default("loot"),
  location: z.enum(["equipped", "worn", "carried", "mount", "storage"]).default("carried"),
});

export async function addToInventory(raw: z.infer<typeof AddSchema>) {
  const input = AddSchema.parse(raw);
  const user = await getAuthenticatedUser();
  await assertOwnership(input.characterId, user.id);

  const admin = createAdminClient();

  // Busca o item no catálogo
  const { data: item } = await admin
    .from("items")
    .select("id, is_stackable")
    .eq("slug", input.itemSlug)
    .single();

  if (!item) throw new Error(`Item "${input.itemSlug}" não encontrado no catálogo.`);

  // Se empilhável, tenta agrupar com item existente idêntico
  if (item.is_stackable && input.improvements === 0 && !input.isArcanium) {
    const { data: existing } = await admin
      .from("character_inventory")
      .select("id, quantity")
      .eq("character_id", input.characterId)
      .eq("item_id", item.id)
      .eq("location", input.location)
      .eq("improvements", 0)
      .eq("is_arcanium", false)
      .maybeSingle();

    if (existing) {
      await admin
        .from("character_inventory")
        .update({ quantity: existing.quantity + input.quantity })
        .eq("id", existing.id);

      revalidatePath(`/characters/${input.characterId}`);
      return { inventoryId: existing.id };
    }
  }

  // Cria novo registro
  const { data: inv, error } = await admin
    .from("character_inventory")
    .insert({
      character_id: input.characterId,
      user_id: user.id,
      item_id: item.id,
      quantity: input.quantity,
      location: input.location,
      improvements: input.improvements,
      is_arcanium: input.isArcanium,
      arcanium_spell_circle: input.arcaniumSpellCircle ?? null,
      custom_label: input.customLabel ?? null,
      acquired_from: input.acquiredFrom,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/characters/${input.characterId}`);
  return { inventoryId: inv.id };
}

// ─── moveItem ─────────────────────────────────────────────────────────────────

export async function moveItem(inventoryId: string, newLocation: InventoryLocation) {
  const user = await getAuthenticatedUser();
  const admin = createAdminClient();

  const { data: inv } = await admin
    .from("character_inventory")
    .select("character_id, user_id")
    .eq("id", inventoryId)
    .single();

  if (!inv || inv.user_id !== user.id) throw new Error("Item não encontrado.");

  await admin
    .from("character_inventory")
    .update({ location: newLocation })
    .eq("id", inventoryId);

  revalidatePath(`/characters/${inv.character_id}`);
}

// ─── buyItem ──────────────────────────────────────────────────────────────────

const BuySchema = z.object({
  characterId: z.string().uuid(),
  itemSlug: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  improvements: z.number().int().min(0).max(4).default(0),
  isArcanium: z.boolean().default(false),
  arcaniumSpellCircle: z.number().int().min(1).max(5).optional(),
});

export async function buyItem(raw: z.infer<typeof BuySchema>) {
  const input = BuySchema.parse(raw);
  const user = await getAuthenticatedUser();
  const character = await assertOwnership(input.characterId, user.id);
  const admin = createAdminClient();

  const { data: item } = await admin
    .from("items")
    .select("id, name, price_pc, is_stackable")
    .eq("slug", input.itemSlug)
    .single();

  if (!item) throw new Error("Item não encontrado no catálogo.");

  const unitPrice = priceWithArcanium(item.price_pc, input.improvements, input.arcaniumSpellCircle);
  const totalCost = unitPrice * input.quantity;

  if (character.money_pc < totalCost) {
    const needed = Math.ceil((totalCost - character.money_pc) / 10);
    throw new Error(`Saldo insuficiente. Faltam ${needed} PP.`);
  }

  const newBalance = character.money_pc - totalCost;

  // 1. Adiciona ao inventário
  let inventoryId: string;
  if (item.is_stackable && input.improvements === 0 && !input.isArcanium) {
    const { data: existing } = await admin
      .from("character_inventory")
      .select("id, quantity")
      .eq("character_id", input.characterId)
      .eq("item_id", item.id)
      .eq("location", "carried")
      .eq("improvements", 0)
      .eq("is_arcanium", false)
      .maybeSingle();

    if (existing) {
      await admin
        .from("character_inventory")
        .update({ quantity: existing.quantity + input.quantity })
        .eq("id", existing.id);
      inventoryId = existing.id;
    } else {
      const { data: inv } = await admin
        .from("character_inventory")
        .insert({ character_id: input.characterId, user_id: user.id, item_id: item.id, quantity: input.quantity, location: "carried", improvements: input.improvements, is_arcanium: input.isArcanium, arcanium_spell_circle: input.arcaniumSpellCircle ?? null, acquired_from: "shop" })
        .select("id")
        .single();
      inventoryId = inv!.id;
    }
  } else {
    const { data: inv } = await admin
      .from("character_inventory")
      .insert({ character_id: input.characterId, user_id: user.id, item_id: item.id, quantity: input.quantity, location: "carried", improvements: input.improvements, is_arcanium: input.isArcanium, arcanium_spell_circle: input.arcaniumSpellCircle ?? null, acquired_from: "shop" })
      .select("id")
      .single();
    inventoryId = inv!.id;
  }

  // 2. Debita dinheiro
  await admin.from("characters").update({ money_pc: newBalance }).eq("id", input.characterId);

  // 3. Registra transação
  await admin.from("money_transactions").insert({
    character_id: input.characterId,
    user_id: user.id,
    amount_pc: -totalCost,
    reason: `Compra: ${item.name}${input.quantity > 1 ? ` ×${input.quantity}` : ""}`,
    related_inventory_id: inventoryId,
    balance_after_pc: newBalance,
  });

  revalidatePath(`/characters/${input.characterId}`);
  return { inventoryId, newBalance };
}

// ─── sellItem ─────────────────────────────────────────────────────────────────

export async function sellItem(inventoryId: string, quantity: number = 1) {
  const user = await getAuthenticatedUser();
  const admin = createAdminClient();

  const { data: inv } = await admin
    .from("character_inventory")
    .select("character_id, user_id, quantity, improvements, is_arcanium, arcanium_spell_circle, items(name, price_pc)")
    .eq("id", inventoryId)
    .single();

  if (!inv || inv.user_id !== user.id) throw new Error("Item não encontrado.");
  if (quantity > inv.quantity) throw new Error("Quantidade maior que o disponível.");

  const item = inv.items as unknown as { name: string; price_pc: number };
  const unitPrice = priceWithArcanium(
    item.price_pc,
    inv.improvements,
    inv.arcanium_spell_circle ?? undefined
  );
  const refund = Math.floor(unitPrice * 0.5) * quantity; // 50% do preço

  const character = await assertOwnership(inv.character_id, user.id);
  const newBalance = character.money_pc + refund;

  // Atualiza ou remove item
  if (quantity >= inv.quantity) {
    await admin.from("character_inventory").update({ location: "sold", quantity }).eq("id", inventoryId);
  } else {
    await admin.from("character_inventory").update({ quantity: inv.quantity - quantity }).eq("id", inventoryId);
  }

  // Atualiza saldo
  await admin.from("characters").update({ money_pc: newBalance }).eq("id", inv.character_id);

  // Transação
  await admin.from("money_transactions").insert({
    character_id: inv.character_id,
    user_id: user.id,
    amount_pc: refund,
    reason: `Venda: ${item.name}${quantity > 1 ? ` ×${quantity}` : ""} (50%)`,
    related_inventory_id: inventoryId,
    balance_after_pc: newBalance,
  });

  revalidatePath(`/characters/${inv.character_id}`);
  return { refund, newBalance };
}

// ─── customizeItem ────────────────────────────────────────────────────────────

export async function customizeItem(inventoryId: string, customLabel?: string, notes?: string) {
  const user = await getAuthenticatedUser();
  const admin = createAdminClient();

  const { data: inv } = await admin
    .from("character_inventory")
    .select("character_id, user_id")
    .eq("id", inventoryId)
    .single();

  if (!inv || inv.user_id !== user.id) throw new Error("Item não encontrado.");

  await admin.from("character_inventory")
    .update({ custom_label: customLabel ?? null, notes: notes ?? null })
    .eq("id", inventoryId);

  revalidatePath(`/characters/${inv.character_id}`);
}

// ─── adjustQuantity ───────────────────────────────────────────────────────────

export async function adjustQuantity(inventoryId: string, newQuantity: number) {
  if (newQuantity < 0) throw new Error("Quantidade inválida.");
  const user = await getAuthenticatedUser();
  const admin = createAdminClient();

  const { data: inv } = await admin
    .from("character_inventory")
    .select("character_id, user_id")
    .eq("id", inventoryId)
    .single();

  if (!inv || inv.user_id !== user.id) throw new Error("Item não encontrado.");

  if (newQuantity === 0) {
    await admin.from("character_inventory").delete().eq("id", inventoryId);
  } else {
    await admin.from("character_inventory").update({ quantity: newQuantity }).eq("id", inventoryId);
  }

  revalidatePath(`/characters/${inv.character_id}`);
}

// ─── addCustomItem ────────────────────────────────────────────────────────────

export async function addCustomItem(input: {
  characterId: string;
  name: string;
  category: string;
  spaces: number;
  description?: string;
}) {
  const user = await getAuthenticatedUser();
  await assertOwnership(input.characterId, user.id);
  const admin = createAdminClient();

  const { data: inv, error } = await admin
    .from("character_inventory")
    .insert({
      character_id: input.characterId,
      user_id: user.id,
      custom_name: input.name,
      custom_data: { category: input.category, spaces: input.spaces, description: input.description },
      quantity: 1,
      location: "carried",
      acquired_from: "loot",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath(`/characters/${input.characterId}`);
  return { inventoryId: inv.id };
}

// ─── rollStartingMoney ────────────────────────────────────────────────────────

export async function rollStartingMoney(characterId: string) {
  const user = await getAuthenticatedUser();
  const character = await assertOwnership(characterId, user.id);
  const admin = createAdminClient();

  // 4d6 PP usando crypto para integridade
  const rolls = Array.from({ length: 4 }, () => crypto.randomInt(1, 7));
  const pp = rolls.reduce((s, r) => s + r, 0);
  const addedPc = pp * 10;
  const newBalance = character.money_pc + addedPc;

  await admin.from("characters").update({ money_pc: newBalance }).eq("id", characterId);
  await admin.from("money_transactions").insert({
    character_id: characterId,
    user_id: user.id,
    amount_pc: addedPc,
    reason: `Dinheiro inicial: ${pp} PP (4d6: ${rolls.join("+")})`,
    balance_after_pc: newBalance,
  });

  revalidatePath(`/characters/${characterId}`);
  return { pp, newBalance };
}

// ─── getInventory ─────────────────────────────────────────────────────────────

export async function getInventory(characterId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("character_inventory")
    .select(`
      id, quantity, location, improvements, is_arcanium, arcanium_spell_circle,
      mortifice_improvements, notes, custom_label, acquired_from, acquired_at,
      custom_name, custom_data,
      items (
        id, slug, name, category, price_pc, spaces, description,
        weapon_proficiency, weapon_grip, weapon_purpose,
        weapon_damage_dice, weapon_critical, weapon_range, weapon_damage_type,
        weapon_abilities, armor_category, armor_defense_bonus, armor_penalty,
        is_stackable
      )
    `)
    .eq("character_id", characterId)
    .neq("location", "sold")
    .order("acquired_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getMoneyTransactions(characterId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("money_transactions")
    .select("*")
    .eq("character_id", characterId)
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}
