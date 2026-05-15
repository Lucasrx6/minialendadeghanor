import { notFound } from "next/navigation";
import { CharacterSheet } from "@/components/character-sheet/character-sheet";
import { createClient } from "@/lib/supabase/server";
import { getLevelUpHistory } from "@/app/actions/levelup";
import { getInventory, getMoneyTransactions } from "@/app/actions/inventory";

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

  const [levelUpHistory, inventory, transactions] = await Promise.all([
    getLevelUpHistory(id),
    getInventory(id).catch(() => []),
    getMoneyTransactions(id).catch(() => []),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <CharacterSheet
        character={character}
        levelUpHistory={levelUpHistory}
        justLeveledUpTo={levelup ? Number(levelup) : undefined}
        inventory={inventory as Parameters<typeof CharacterSheet>[0]["inventory"]}
        transactions={transactions as Parameters<typeof CharacterSheet>[0]["transactions"]}
      />
    </main>
  );
}

