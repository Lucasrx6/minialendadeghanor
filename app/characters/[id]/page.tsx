import { notFound } from "next/navigation";
import { CharacterSheet } from "@/components/character-sheet/character-sheet";
import { createClient } from "@/lib/supabase/server";
import { getLevelUpHistory } from "@/app/actions/levelup";
import { getInventory, getMoneyTransactions } from "@/app/actions/inventory";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default async function CharacterPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ levelup?: string }>;
}) {
  const { id } = await params;
  const { levelup } = await searchParams;
  const supabase = await createClient();

  const { data: character, error } = await supabase
    .from("characters")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !character) notFound();

  const admin = createAdminClient();
  const [levelUpHistory, inventory, transactions, catalogResult] = await Promise.all([
    getLevelUpHistory(id),
    getInventory(id).catch(() => []),
    getMoneyTransactions(id).catch(() => []),
    admin.from("items").select("slug, name, category, price_pc").order("name"),
  ]);
  const catalog = catalogResult.data ?? [];

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,#f5c86a_0,#f6ead0_35%,#efe1bd_100%)]">
      <PageContainer className="pb-20">
        <PageHeader title="Ficha" backHref="/characters" backLabel="Heróis" />
        <CharacterSheet
          character={character}
          levelUpHistory={levelUpHistory}
          justLeveledUpTo={levelup ? Number(levelup) : undefined}
          inventory={inventory as Parameters<typeof CharacterSheet>[0]["inventory"]}
          transactions={transactions as Parameters<typeof CharacterSheet>[0]["transactions"]}
          catalog={catalog}
        />
      </PageContainer>
    </main>
  );
}
