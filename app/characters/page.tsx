import Link from "next/link";
import { Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { classById } from "@/lib/ghanor/classes";
import { originById } from "@/lib/ghanor/origins";
import { raceById } from "@/lib/ghanor/races";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function CharactersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Card className="space-y-4 text-center">
          <h1 className="text-3xl font-black">Entre para abrir sua mesa.</h1>
          <Link href="/login">
            <Button>Entrar</Button>
          </Link>
        </Card>
      </main>
    );
  }

  const { data: characters } = await supabase
    .from("characters")
    .select("id,name,race,class,origin,hp_max,mp_max,defense,portrait_url,created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-black">Personagens</h1>
          <p className="text-stone-700">Escolha um herói salvo ou comece uma nova lenda.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button><Plus size={16} /> Novo personagem</Button>
          </Link>
          <LogoutButton variant="secondary" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {characters?.map((character) => (
          <Link key={character.id} href={`/characters/${character.id}`}>
            <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-4 aspect-[4/3] overflow-hidden rounded-md bg-stone-900">
                {character.portrait_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={character.portrait_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-stone-900 text-stone-700">
                    <User size={64} className="opacity-50" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-black">{character.name}</h2>
              <p className="text-sm text-stone-700">
                {raceById[character.race as keyof typeof raceById]?.name} {classById[character.class as keyof typeof classById]?.name} -
                {originById[character.origin]?.name}
              </p>
              <p className="mt-3 text-sm font-semibold">PV {character.hp_max} | PM {character.mp_max} | Defesa {character.defense}</p>
            </Card>
          </Link>
        ))}
        {characters?.length === 0 && (
          <Card className="md:col-span-2 lg:col-span-3">
            <p>Nenhum personagem ainda. A primeira ficha sempre vem com cheiro de pergaminho novo.</p>
          </Card>
        )}
      </div>
    </main>
  );
}
