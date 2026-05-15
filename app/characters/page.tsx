import Link from "next/link";
import { Plus, User, Heart, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { classById } from "@/lib/ghanor/classes";
import { originById } from "@/lib/ghanor/origins";
import { raceById } from "@/lib/ghanor/races";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default async function CharactersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-dvh">
        <PageContainer className="flex min-h-dvh flex-col items-center justify-center py-12">
          <Card className="w-full space-y-4 text-center">
            <h1 className="text-2xl font-black">Entre para abrir sua mesa.</h1>
            <Link href="/login" className="block">
              <Button fullWidth size="lg">
                Entrar
              </Button>
            </Link>
          </Card>
        </PageContainer>
      </main>
    );
  }

  const { data: characters } = await supabase
    .from("characters")
    .select("id,name,race,class,origin,hp_max,mp_max,defense,portrait_url,created_at,current_level")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,#f5c86a_0,#f6ead0_35%,#efe1bd_100%)]">
      <PageContainer withBottomNav>
        <PageHeader
          title="Meus personagens"
          subtitle="Escolha um herói ou comece uma nova lenda."
          right={
            <Link href="/">
              <Button size="icon" variant="secondary" aria-label="Novo personagem">
                <Plus size={20} />
              </Button>
            </Link>
          }
        />

        <div className="flex flex-col gap-3">
          {characters?.map((character) => (
            <Link key={character.id} href={`/characters/${character.id}`} className="block active:scale-[0.99]">
              <Card className="flex gap-3 p-3 transition-shadow active:shadow-md">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-900">
                  {character.portrait_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={character.portrait_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-stone-600">
                      <User size={36} className="opacity-50" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <h2 className="truncate text-lg font-black text-stone-950">{character.name}</h2>
                  <p className="truncate text-sm text-stone-600">
                    {raceById[character.race as keyof typeof raceById]?.name}{" "}
                    {classById[character.class as keyof typeof classById]?.name}
                    {character.current_level ? ` · Nv. ${character.current_level}` : ""}
                  </p>
                  <p className="truncate text-xs text-stone-500">
                    {originById[character.origin]?.name}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-amber-900">
                    <span className="flex items-center gap-1">
                      <Heart size={12} /> {character.hp_max}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles size={12} /> {character.mp_max}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield size={12} /> {character.defense}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
          {characters?.length === 0 && (
            <Card className="text-center text-sm text-stone-700">
              <p className="font-semibold">Nenhum personagem ainda.</p>
              <p className="mt-1">A primeira ficha sempre vem com cheiro de pergaminho novo.</p>
              <Link href="/" className="mt-4 inline-block">
                <Button>Criar personagem</Button>
              </Link>
            </Card>
          )}
        </div>
      </PageContainer>
    </main>
  );
}
