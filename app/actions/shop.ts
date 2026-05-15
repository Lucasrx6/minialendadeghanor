"use server";

import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateShopInventory,
  type Stage,
  type MerchantType,
  type CatalogItem,
} from "@/lib/ghanor/shop";

export async function getShopStock(
  characterId: string,
  stage: Stage,
  merchantType: MerchantType,
  refresh = false,
  dmMode = false,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const admin = createAdminClient();
  const { data: character } = await admin
    .from("characters")
    .select("id, user_id")
    .eq("id", characterId)
    .eq("user_id", user.id)
    .single();
  if (!character) throw new Error("Personagem não encontrado.");

  if (!refresh) {
    const { data: existing } = await admin
      .from("shop_inventories")
      .select("items_in_stock, refresh_token")
      .eq("character_id", characterId)
      .eq("stage", stage)
      .eq("merchant_type", merchantType)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.items_in_stock) {
      return {
        stock: existing.items_in_stock as Record<string, number>,
        refreshToken: existing.refresh_token,
      };
    }
  }

  const { data: catalog } = await admin
    .from("items")
    .select("slug, category, price_pc, min_stage")
    .order("name");

  const stock = generateShopInventory(
    (catalog ?? []) as CatalogItem[],
    stage,
    merchantType,
    dmMode,
  );

  const refreshToken = crypto.randomUUID();
  await admin.from("shop_inventories").insert({
    character_id: characterId,
    user_id: user.id,
    stage,
    merchant_type: merchantType,
    refresh_token: refreshToken,
    items_in_stock: stock,
  });

  return { stock, refreshToken };
}
