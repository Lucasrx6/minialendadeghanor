import { notFound } from "next/navigation";
import { CharacterSheet } from "@/components/character-sheet/character-sheet";
import { createClient } from "@/lib/supabase/server";
import { getLevelUpHistory } from "@/app/actions/levelup";

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

  const levelUpHistory = await getLevelUpHistory(id);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <CharacterSheet
        character={character}
        levelUpHistory={levelUpHistory}
        justLeveledUpTo={levelup ? Number(levelup) : undefined}
      />
    </main>
  );
}
