"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { priceWithArcanium, WORN_LIMIT } from "@/lib/ghanor/inventory";
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
  acquiredFrom: z.enum(["starter", "origin", "shop", "loot", "craft", "gift", "manual", "dm_manual"]).default("loot"),
  locationDetails: z.string().max(200).optional(),
  chargePc: z.boolean().optional(),
  isDmMode: z.boolean().optional(),
  location: z.enum(["equipped", "worn", "carried", "mount", "storage"]).default("carried"),
});

export async function addToInventory(raw: z.infer<typeof AddSchema>): Promise<{ inventoryId: string; error?: never } | { error: string; inventoryId?: never }> {
  try {
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

    if (!item) return { error: `Item "${input.itemSlug}" não encontrado no catálogo.` };

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
        acquired_from: input.isDmMode ? "dm_manual" : "loot",
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    if (input.chargePc) {
      const { data: catalogItem } = await admin.from("items").select("name, price_pc").eq("id", item.id).single();
      if (catalogItem) {
        const character = await assertOwnership(input.characterId, user.id);
        const cost = catalogItem.price_pc * input.quantity;
        if (character.money_pc < cost) return { error: "Saldo insuficiente." };
        const newBalance = character.money_pc - cost;
        await admin.from("characters").update({ money_pc: newBalance }).eq("id", input.characterId);
        await admin.from("money_transactions").insert({
          character_id: input.characterId,
          user_id: user.id,
          amount_pc: -cost,
          reason: `Compra manual: ${catalogItem.name}`,
          related_inventory_id: inv.id,
          balance_after_pc: newBalance,
        });
      }
    }

    revalidatePath(`/characters/${input.characterId}`);
    return { inventoryId: inv.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao adicionar item." };
  }
}

// ─── moveItem ─────────────────────────────────────────────────────────────────

type ItemFlags = { category: string; can_be_held: boolean; can_be_worn: boolean; is_two_handed: boolean; is_cosmetic: boolean };

export async function moveItem(
  inventoryId: string,
  newLocation: InventoryLocation,
  options?: { isDmMode?: boolean },
): Promise<{ success: true } | { error: string }> {
  try {
    const user = await getAuthenticatedUser();
    const admin = createAdminClient();

    const { data: inv } = await admin
      .from("character_inventory")
      .select("character_id, user_id, item_id, custom_name, items(category, can_be_held, can_be_worn, is_two_handed, is_cosmetic)")
      .eq("id", inventoryId)
      .single();

    if (!inv || inv.user_id !== user.id) return { error: "Item não encontrado." };

    const isDmMode = options?.isDmMode ?? false;
    const isCustom = !inv.item_id;
    const item = inv.items as unknown as ItemFlags | null;

    if (!isDmMode && !isCustom && item) {
      if ((newLocation === "equipped" || newLocation === "worn") && item.is_cosmetic) {
        return { error: "Itens cosméticos ficam no inventário sem precisar ser equipados (livro pág. 97)." };
      }

      if (newLocation === "equipped") {
        if (!item.can_be_held) return { error: "Este item não pode ser empunhado." };

        const { data: equippedRows } = await admin
          .from("character_inventory")
          .select("items(category, is_two_handed)")
          .eq("character_id", inv.character_id)
          .eq("location", "equipped")
          .neq("id", inventoryId);

        const equipped = (equippedRows ?? [])
          .map(r => r.items as unknown as ItemFlags | null)
          .filter(Boolean) as ItemFlags[];

        if (item.category === "escudo" && equipped.some(e => e.category === "escudo")) {
          return { error: "Já há um escudo empunhado. Desequipe o escudo atual primeiro." };
        }

        const slotsUsed = equipped.reduce((n, e) => n + (e.is_two_handed ? 2 : 1), 0);
        const slotsNeeded = item.is_two_handed ? 2 : 1;
        if (slotsUsed + slotsNeeded > 2) {
          return {
            error: item.is_two_handed
              ? "Esta arma exige ambas as mãos. Desequipe todos os itens primeiro."
              : "Mãos insuficientes. Desequipe um item para liberar espaço.",
          };
        }
      }

      if (newLocation === "worn") {
        if (!item.can_be_worn) return { error: "Este item não pode ser vestido." };

        const { count: wornCount } = await admin
          .from("character_inventory")
          .select("id", { count: "exact", head: true })
          .eq("character_id", inv.character_id)
          .eq("location", "worn")
          .neq("id", inventoryId);

        if ((wornCount ?? 0) >= WORN_LIMIT) {
          return { error: `Limite de ${WORN_LIMIT} itens vestidos atingido.` };
        }

        if (item.category === "armadura") {
          const { data: wornRows } = await admin
            .from("character_inventory")
            .select("items(category)")
            .eq("character_id", inv.character_id)
            .eq("location", "worn")
            .neq("id", inventoryId);

          const hasArmor = (wornRows ?? []).some(r => (r.items as unknown as ItemFlags | null)?.category === "armadura");
          if (hasArmor) return { error: "Já há uma armadura vestida. Desvista a armadura atual primeiro." };
        }
      }
    }

    await admin
      .from("character_inventory")
      .update({ location: newLocation })
      .eq("id", inventoryId);

    revalidatePath(`/characters/${inv.character_id}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao mover item." };
  }
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
  const newEntry = {
    character_id: input.characterId,
    user_id: user.id,
    item_id: item.id,
    quantity: input.quantity,
    location: "carried" as const,
    improvements: input.improvements,
    is_arcanium: input.isArcanium,
    arcanium_spell_circle: input.arcaniumSpellCircle ?? null,
    acquired_from: "shop" as const,
  };

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
      const { data: inv, error: invErr } = await admin
        .from("character_inventory")
        .insert(newEntry)
        .select("id")
        .single();
      if (invErr || !inv) throw new Error(invErr?.message ?? "Erro ao inserir item no inventário.");
      inventoryId = inv.id;
    }
  } else {
    const { data: inv, error: invErr } = await admin
      .from("character_inventory")
      .insert(newEntry)
      .select("id")
      .single();
    if (invErr || !inv) throw new Error(invErr?.message ?? "Erro ao inserir item no inventário.");
    inventoryId = inv.id;
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
}): Promise<{ inventoryId: string; error?: never } | { error: string; inventoryId?: never }> {
  try {
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

    if (error) return { error: error.message };
    revalidatePath(`/characters/${input.characterId}`);
    return { inventoryId: inv.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao adicionar item." };
  }
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
  // Use admin client so the items join is not blocked by items-table RLS.
  // Ownership is enforced explicitly via user_id filter.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("character_inventory")
    .select(`
      id, quantity, location, improvements, is_arcanium, arcanium_spell_circle,
      notes, custom_label, acquired_from, acquired_at,
      custom_name, custom_data,
      items (
        id, slug, name, category, price_pc, spaces, description,
        weapon_proficiency, weapon_grip,
        weapon_damage_dice, weapon_critical, weapon_range, weapon_damage_type,
        weapon_abilities, armor_category, armor_defense_bonus, armor_penalty,
        is_stackable, can_be_held, can_be_worn, is_two_handed, is_cosmetic
      )
    `)
    .eq("character_id", characterId)
    .eq("user_id", user.id)
    .neq("location", "sold")
    .order("acquired_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ─── addQuickItem ─────────────────────────────────────────────────────────────

export async function addQuickItem(input: {
  characterId: string;
  name: string;
  spaces?: number;
  notes?: string;
  location?: InventoryLocation;
  quantity?: number;
  isDmMode?: boolean;
}): Promise<{ inventoryId: string; error?: never } | { error: string; inventoryId?: never }> {
  try {
    const user = await getAuthenticatedUser();
    await assertOwnership(input.characterId, user.id);
    const admin = createAdminClient();

    const { data: inv, error } = await admin.from("character_inventory").insert({
      character_id: input.characterId,
      user_id: user.id,
      custom_name: input.name,
      custom_data: {
        category: "bens_comuns",
        spaces: input.spaces ?? 1,
        description: input.notes ?? null,
      },
      quantity: input.quantity ?? 1,
      location: input.location ?? "carried",
      acquired_from: input.isDmMode ? "dm_manual" : "loot",
      notes: input.notes ?? null,
    }).select("id").single();

    if (error) return { error: error.message };
    revalidatePath(`/characters/${input.characterId}`);
    return { inventoryId: inv.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao adicionar item." };
  }
}

// ─── editInventoryItem ────────────────────────────────────────────────────────

const EditSchema = z.object({
  inventoryId: z.string().uuid(),
  updates: z.object({
    quantity: z.number().int().positive().optional(),
    location: z.enum(["equipped", "worn", "carried", "mount", "storage"]).optional(),
    locationDetails: z.string().max(200).optional(),
    customLabel: z.string().max(100).optional(),
    notes: z.string().max(2000).optional(),
    improvements: z.number().int().min(0).max(4).optional(),
    isArcanium: z.boolean().optional(),
    arcaniumSpellCircle: z.number().int().min(1).max(5).optional(),
    customData: z.record(z.string(), z.unknown()).optional(),
    customName: z.string().min(1).max(120).optional(),
  }),
  isDmMode: z.boolean().optional(),
});

export async function editInventoryItem(raw: z.infer<typeof EditSchema>) {
  const input = EditSchema.parse(raw);
  const user = await getAuthenticatedUser();
  const admin = createAdminClient();

  const { data: inv } = await admin
    .from("character_inventory")
    .select("character_id, user_id, item_id, custom_name")
    .eq("id", input.inventoryId)
    .single();

  if (!inv || inv.user_id !== user.id) throw new Error("Item não encontrado.");

  const patch: Record<string, unknown> = {};
  const u = input.updates;
  if (u.quantity != null) patch.quantity = u.quantity;
  if (u.location) patch.location = u.location;
  if (u.locationDetails !== undefined) patch.location_details = u.locationDetails;
  if (u.customLabel !== undefined) patch.custom_label = u.customLabel;
  if (u.notes !== undefined) patch.notes = u.notes;
  if (input.isDmMode && u.improvements != null) patch.improvements = u.improvements;
  if (input.isDmMode && u.isArcanium != null) {
    patch.is_arcanium = u.isArcanium;
    patch.arcanium_spell_circle = u.isArcanium ? (u.arcaniumSpellCircle ?? 1) : null;
  }
  if (inv.custom_name && u.customName) patch.custom_name = u.customName;
  if (inv.custom_name && u.customData) patch.custom_data = u.customData;

  await admin.from("character_inventory").update(patch).eq("id", input.inventoryId);
  revalidatePath(`/characters/${inv.character_id}`);
}

// ─── deleteInventoryItem ──────────────────────────────────────────────────────

export async function deleteInventoryItem(inventoryId: string) {
  const user = await getAuthenticatedUser();
  const admin = createAdminClient();
  const { data: inv } = await admin
    .from("character_inventory")
    .select("character_id, user_id")
    .eq("id", inventoryId)
    .single();
  if (!inv || inv.user_id !== user.id) throw new Error("Item não encontrado.");
  await admin.from("character_inventory").delete().eq("id", inventoryId);
  revalidatePath(`/characters/${inv.character_id}`);
}

// ─── splitStack ───────────────────────────────────────────────────────────────

export async function splitStack(inventoryId: string, splitQuantity: number) {
  if (splitQuantity < 1) throw new Error("Quantidade inválida.");
  const user = await getAuthenticatedUser();
  const admin = createAdminClient();
  const { data: inv } = await admin
    .from("character_inventory")
    .select("*")
    .eq("id", inventoryId)
    .single();
  if (!inv || inv.user_id !== user.id) throw new Error("Item não encontrado.");
  if (splitQuantity >= inv.quantity) throw new Error("Quantidade maior que a pilha.");

  await admin.from("character_inventory").update({ quantity: inv.quantity - splitQuantity }).eq("id", inventoryId);

  const { item_id, custom_name, custom_data, location, improvements, is_arcanium, arcanium_spell_circle, custom_label, notes, acquired_from, character_id, user_id } = inv;
  const { data: created, error } = await admin.from("character_inventory").insert({
    character_id,
    user_id,
    item_id,
    custom_name,
    custom_data,
    quantity: splitQuantity,
    location,
    improvements,
    is_arcanium,
    arcanium_spell_circle,
    custom_label,
    notes,
    acquired_from,
  }).select("id").single();

  if (error) throw new Error(error.message);
  revalidatePath(`/characters/${character_id}`);
  return { newInventoryId: created.id };
}

// ─── adjustMoney ──────────────────────────────────────────────────────────────

export async function adjustMoney(input: {
  characterId: string;
  amountPc: number;
  reason: string;
  isDmMode?: boolean;
}) {
  if (!input.reason.trim()) throw new Error("Informe o motivo do ajuste.");
  const user = await getAuthenticatedUser();
  const character = await assertOwnership(input.characterId, user.id);
  const admin = createAdminClient();

  const newBalance = character.money_pc + input.amountPc;
  if (newBalance < 0) throw new Error("Saldo não pode ficar negativo.");

  await admin.from("characters").update({ money_pc: newBalance }).eq("id", input.characterId);
  await admin.from("money_transactions").insert({
    character_id: input.characterId,
    user_id: user.id,
    amount_pc: input.amountPc,
    reason: input.isDmMode ? `[DM] ${input.reason}` : input.reason,
    balance_after_pc: newBalance,
  });

  revalidatePath(`/characters/${input.characterId}`);
  return { newBalance };
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
