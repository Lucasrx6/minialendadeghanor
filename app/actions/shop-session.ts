"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { priceWithArcanium } from "@/lib/ghanor/inventory";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SessionItem = {
  item_id: string;
  slug: string;
  name: string;
  category: string;
  price_pc: number;
  spaces: number;
  qty: number; // -1 = unlimited
  description: string | null;
  can_be_held: boolean;
  can_be_worn: boolean;
  is_two_handed: boolean;
  is_stackable: boolean;
  weapon_proficiency: string | null;
  weapon_grip: string | null;
  weapon_damage_dice: string | null;
  weapon_critical: string | null;
  weapon_range: string | null;
  weapon_damage_type: string | null;
  weapon_abilities: string[];
  armor_category: string | null;
  armor_defense_bonus: number | null;
  armor_penalty: number | null;
};

export type ShopSession = {
  id: string;
  stage: number;
  items: SessionItem[];
  created_at: string;
  expires_at: string;
};

// ─── Get active session ───────────────────────────────────────────────────────

export async function getActiveShopSession(): Promise<ShopSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("shop_sessions")
    .select("*")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ? (data as unknown as ShopSession) : null;
}

// ─── Create session ───────────────────────────────────────────────────────────

export async function createShopSession(
  stage: number,
): Promise<{ session: ShopSession } | { error: string }> {
  if (stage < 1 || stage > 5) return { error: "Estágio inválido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const admin = createAdminClient();

  const { data: catalog, error: catErr } = await admin
    .from("items")
    .select(
      "id, slug, name, category, price_pc, spaces, description, can_be_held, can_be_worn, is_two_handed, is_stackable, weapon_proficiency, weapon_grip, weapon_damage_dice, weapon_critical, weapon_range, weapon_damage_type, weapon_abilities, armor_category, armor_defense_bonus, armor_penalty",
    )
    .eq("is_purchasable", true)
    .not("category", "in", "(animal,veiculo,servico)");

  if (catErr || !catalog) return { error: "Erro ao carregar catálogo." };

  const items = generateItemsForStage(catalog, stage);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from("shop_sessions")
    .insert({ stage, items, expires_at: expiresAt, created_by: user.id })
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? "Erro ao criar sessão." };
  return { session: data as unknown as ShopSession };
}

// ─── Buy from session ─────────────────────────────────────────────────────────

export async function buyFromSession(input: {
  characterId: string;
  sessionId: string;
  itemSlug: string;
  quantity: number;
  improvements: number;
  isArcanium: boolean;
  arcaniumSpellCircle?: number;
}): Promise<{ newBalance: number; updatedItems: SessionItem[] } | { error: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado." };

    const admin = createAdminClient();

    const { data: session } = await admin
      .from("shop_sessions")
      .select("items, expires_at, stage")
      .eq("id", input.sessionId)
      .single();

    if (!session) return { error: "Sessão não encontrada." };
    if (new Date(session.expires_at) < new Date()) return { error: "Sessão expirada." };

    const items = session.items as SessionItem[];
    const idx = items.findIndex((i) => i.slug === input.itemSlug);
    if (idx === -1) return { error: "Item não disponível nesta loja." };

    const sessionItem = items[idx];
    if (sessionItem.qty !== -1 && sessionItem.qty < input.quantity) {
      return { error: `Estoque insuficiente. Disponível: ${sessionItem.qty}` };
    }

    // Check character ownership + money
    const { data: character } = await admin
      .from("characters")
      .select("id, money_pc")
      .eq("id", input.characterId)
      .eq("user_id", user.id)
      .single();

    if (!character) return { error: "Personagem não encontrado." };

    const unitPrice = priceWithArcanium(
      sessionItem.price_pc,
      input.improvements,
      input.arcaniumSpellCircle,
    );
    const totalCost = unitPrice * input.quantity;

    if (character.money_pc < totalCost) {
      const needed = Math.ceil((totalCost - character.money_pc) / 10);
      return { error: `Saldo insuficiente. Faltam ${needed} PP.` };
    }

    // Deduct session stock
    const updatedItems = items.map((item, i) =>
      i === idx && item.qty !== -1 ? { ...item, qty: item.qty - input.quantity } : item,
    );

    await admin
      .from("shop_sessions")
      .update({ items: updatedItems })
      .eq("id", input.sessionId);

    // Add to character inventory
    const { data: catalogItem } = await admin
      .from("items")
      .select("id, is_stackable")
      .eq("slug", input.itemSlug)
      .single();

    if (!catalogItem) return { error: "Item não encontrado no catálogo." };

    let inventoryId: string;

    if (catalogItem.is_stackable && input.improvements === 0 && !input.isArcanium) {
      const { data: existing } = await admin
        .from("character_inventory")
        .select("id, quantity")
        .eq("character_id", input.characterId)
        .eq("item_id", catalogItem.id)
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
          .insert({
            character_id: input.characterId,
            user_id: user.id,
            item_id: catalogItem.id,
            quantity: input.quantity,
            location: "carried",
            improvements: 0,
            is_arcanium: false,
            acquired_from: "shop",
          })
          .select("id")
          .single();
        if (invErr || !inv) return { error: invErr?.message ?? "Erro ao inserir no inventário." };
        inventoryId = inv.id;
      }
    } else {
      const { data: inv, error: invErr } = await admin
        .from("character_inventory")
        .insert({
          character_id: input.characterId,
          user_id: user.id,
          item_id: catalogItem.id,
          quantity: input.quantity,
          location: "carried",
          improvements: input.improvements,
          is_arcanium: input.isArcanium,
          arcanium_spell_circle: input.arcaniumSpellCircle ?? null,
          acquired_from: "shop",
        })
        .select("id")
        .single();
      if (invErr || !inv) return { error: invErr?.message ?? "Erro ao inserir no inventário." };
      inventoryId = inv.id;
    }

    // Update character money
    const newBalance = character.money_pc - totalCost;
    await admin.from("characters").update({ money_pc: newBalance }).eq("id", input.characterId);

    await admin.from("money_transactions").insert({
      character_id: input.characterId,
      user_id: user.id,
      amount_pc: -totalCost,
      reason: `Compra (loja estágio ${session.stage}): ${sessionItem.name}${input.quantity > 1 ? ` ×${input.quantity}` : ""}`,
      related_inventory_id: inventoryId,
      balance_after_pc: newBalance,
    });

    revalidatePath(`/characters/${input.characterId}`);
    return { newBalance, updatedItems };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao processar compra." };
  }
}

// ─── Item generation ──────────────────────────────────────────────────────────

function generateItemsForStage(catalog: Record<string, unknown>[], stage: number): SessionItem[] {
  const ri = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const sample = <T>(arr: T[], n: number): T[] => {
    if (n <= 0 || arr.length === 0) return [];
    return [...arr].sort(() => 0.5 - Math.random()).slice(0, Math.min(n, arr.length));
  };

  // Price multipliers by stage (village = 1.5x, small town = 1.2x, rest = 1.0x)
  const multiplier = ([0, 1.5, 1.2, 1.0, 1.0, 1.0] as const)[stage] ?? 1.0;
  const adj = (p: number) => Math.round((p * multiplier) / 10) * 10;

  const byCat = (cat: string) => catalog.filter((i) => i.category === cat);
  const simpleWeapons = catalog.filter(
    (i) => i.category === "arma" && i.weapon_proficiency === "simples" && !i.is_stackable,
  );
  const martialWeapons = catalog.filter(
    (i) => i.category === "arma" && i.weapon_proficiency === "marcial",
  );
  const lightArmor = catalog.filter(
    (i) => i.category === "armadura" && i.armor_category === "leve",
  );
  const heavyArmor = catalog.filter(
    (i) => i.category === "armadura" && i.armor_category === "pesada",
  );
  const ammo = catalog.filter((i) => i.category === "arma" && i.is_stackable);

  const result: SessionItem[] = [];

  const add = (
    items: Record<string, unknown>[],
    count: [number, number],
    qty: [number, number] | null,
  ) => {
    const n = ri(count[0], count[1]);
    for (const item of sample(items, n)) {
      const q = qty === null ? -1 : ri(qty[0], qty[1]);
      result.push(toSessionItem(item, q, adj(item.price_pc as number)));
    }
  };

  // Stage 1+: village essentials
  add(byCat("bens_comuns"), [5, 8], null);
  add(byCat("equipamento_aventura"), [2, 4], [1, 3]);
  add(byCat("vestuario"), [1, 2], [1, 2]);
  add(simpleWeapons, [1, 2], [1, 2]);
  add(ammo, [0, 1], [10, 30]);

  // Stage 2+: small town
  if (stage >= 2) {
    add(byCat("ferramenta"), [1, 3], [1, 2]);
    add(lightArmor, [0, 2], [1, 2]);
    add(byCat("escudo"), [0, 1], [1, 2]);
    add(simpleWeapons, [0, 1], [1, 3]);
    add(martialWeapons, [0, 1], [1, 2]);
    add(ammo, [0, 1], [10, 40]);
  }

  // Stage 3+: town
  if (stage >= 3) {
    add(martialWeapons, [2, 4], [1, 3]);
    add(lightArmor, [1, 2], [1, 3]);
    add(byCat("escudo"), [0, 2], [1, 3]);
    add(byCat("alquimico_preparado"), [1, 3], [1, 5]);
    add(byCat("alquimico_catalisador"), [0, 2], [1, 3]);
    add(byCat("equipamento_aventura"), [2, 4], [2, 6]);
  }

  // Stage 4+: large city
  if (stage >= 4) {
    add(heavyArmor, [1, 3], [1, 2]);
    add(martialWeapons, [2, 4], [2, 5]);
    add(byCat("alquimico_veneno"), [0, 2], [1, 3]);
    add(byCat("alquimia_mistica"), [0, 3], [1, 2]);
    add(byCat("esoterico"), [1, 3], [1, 3]);
    add(byCat("ferramenta"), [1, 3], [2, 5]);
  }

  // Stage 5: metropolis
  if (stage >= 5) {
    add(byCat("item_magico"), [2, 5], [1, 3]);
    add(martialWeapons, [2, 4], [3, 8]);
    add(heavyArmor, [1, 2], [1, 3]);
    add(byCat("alquimico_preparado"), [2, 4], [3, 10]);
    add(byCat("alquimia_mistica"), [1, 3], [1, 5]);
    add(byCat("esoterico"), [1, 3], [1, 5]);
  }

  // Deduplicate by slug
  const seen = new Set<string>();
  return result.filter((item) => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

function toSessionItem(
  item: Record<string, unknown>,
  qty: number,
  price_pc: number,
): SessionItem {
  return {
    item_id: item.id as string,
    slug: item.slug as string,
    name: item.name as string,
    category: item.category as string,
    price_pc,
    spaces: (item.spaces as number) ?? 0,
    qty,
    description: (item.description as string) ?? null,
    can_be_held: (item.can_be_held as boolean) ?? false,
    can_be_worn: (item.can_be_worn as boolean) ?? false,
    is_two_handed: (item.is_two_handed as boolean) ?? false,
    is_stackable: (item.is_stackable as boolean) ?? false,
    weapon_proficiency: (item.weapon_proficiency as string) ?? null,
    weapon_grip: (item.weapon_grip as string) ?? null,
    weapon_damage_dice: (item.weapon_damage_dice as string) ?? null,
    weapon_critical: (item.weapon_critical as string) ?? null,
    weapon_range: (item.weapon_range as string) ?? null,
    weapon_damage_type: (item.weapon_damage_type as string) ?? null,
    weapon_abilities: (item.weapon_abilities as string[]) ?? [],
    armor_category: (item.armor_category as string) ?? null,
    armor_defense_bonus: (item.armor_defense_bonus as number) ?? null,
    armor_penalty: (item.armor_penalty as number) ?? null,
  };
}
