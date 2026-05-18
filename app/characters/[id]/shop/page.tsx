import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShopPage } from "@/components/shop/ShopPage";
import { getActiveShopSession } from "@/app/actions/shop-session";

export default async function ShopRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: character } = await supabase
    .from("characters")
    .select("id, class, money_pc")
    .eq("id", id)
    .single();

  if (!character) notFound();

  const session = await getActiveShopSession();

  return (
    <ShopPage
      characterId={character.id}
      moneyPc={character.money_pc ?? 0}
      characterClass={character.class}
      initialSession={session}
    />
  );
}
