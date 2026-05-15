import { notFound } from "next/navigation";
import { CharacterSheet } from "@/components/character-sheet/character-sheet";
import { createClient } from "@/lib/supabase/server";

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: character, error } = await supabase.from("characters").select("*").eq("id", id).single();

  if (error || !character) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <CharacterSheet character={character} />
    </main>
  );
}
