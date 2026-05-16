import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ShopPage } from "@/components/shop/ShopPage";

export default async function ShopRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: character } = await supabase
    .from("characters")
    .select("id, class, money_pc")
    .eq("id", id)
    .single();

  if (!character) notFound();

  // Busca catálogo completo (itens à venda, exceto categorias não-comerciais)
  const { data: items } = await admin
    .from("items")
    .select("*")
    .not("category", "in", "(bens_comuns,servico,animal,veiculo,municao)")
    .eq("is_purchasable", true)
    .order("category")
    .order("price_pc");

  return (
    <ShopPage
      characterId={character.id}
      moneyPc={character.money_pc ?? 0}
      items={(items ?? []) as Parameters<typeof ShopPage>[0]["items"]}
      characterClass={character.class}
    />
  );
}
