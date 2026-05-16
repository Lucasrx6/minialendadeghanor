import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLevelUpHistory } from "@/app/actions/levelup";
import { LevelUpWizard } from "@/components/wizard/LevelUpWizard";

export default async function LevelUpPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: character, error } = await supabase
    .from("characters")
    .select("id, name, class, class_levels, current_level, race, origin, attr_str, attr_dex, attr_con, attr_int, attr_wis, attr_cha, hp_max, mp_max")
    .eq("id", id)
    .single();

  if (error || !character) notFound();
  if ((character.current_level ?? 1) >= 20) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="text-4xl mb-4">🏆</p>
        <h1 className="text-2xl font-black text-stone-950">Nível máximo atingido!</h1>
        <p className="text-stone-600 mt-2">
          {character.name} é uma Lenda. Não há mais níveis a escalar.
        </p>
      </main>
    );
  }

  const levelUpHistory = await getLevelUpHistory(id);

  const classLevels =
    character.class_levels && Object.keys(character.class_levels as Record<string, number>).length > 0
      ? (character.class_levels as Record<string, number>)
      : { [character.class]: 1 };

  return (
    <LevelUpWizard
      character={{
        id: character.id,
        name: character.name,
        class: character.class,
        class_levels: classLevels,
        current_level: character.current_level ?? 1,
        race: character.race,
        origin: character.origin,
        attr_str: character.attr_str,
        attr_dex: character.attr_dex,
        attr_con: character.attr_con,
        attr_int: character.attr_int,
        attr_wis: character.attr_wis,
        attr_cha: character.attr_cha,
        hp_max: character.hp_max,
        mp_max: character.mp_max,
        levelUpHistory: levelUpHistory.map((lu) => ({
          to_level: lu.to_level,
          attr_increased: lu.attr_increased,
        })),
      }}
    />
  );
}
