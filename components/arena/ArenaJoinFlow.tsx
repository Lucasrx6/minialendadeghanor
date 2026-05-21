"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Sparkles, Shield, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { joinArena } from "@/app/actions/arena";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClassIcon } from "@/components/ui/item-icon";

type SimpleCharacter = {
  id: string;
  name: string;
  race: string;
  class: string;
  current_level: number | null;
  hp_max: number;
  mp_max: number;
  defense: number;
  portrait_url: string | null;
};

export function ArenaJoinFlow({ token, arenaName }: { token: string; arenaName: string }) {
  const [characters, setCharacters] = useState<SimpleCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("characters")
      .select("id, name, race, class, current_level, hp_max, mp_max, defense, portrait_url")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setCharacters(data ?? []);
        setLoading(false);
      });
  }, []);

  function handleJoin() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const result = await joinArena({ token, characterId: selected });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (loading) {
    return (
      <div className="py-16 text-center text-stone-500 text-sm">
        Carregando seus personagens…
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <Card className="text-center space-y-3 py-8">
        <Users size={32} className="mx-auto text-stone-400" />
        <p className="font-bold text-stone-700">Nenhum personagem encontrado.</p>
        <p className="text-sm text-stone-500">Crie um personagem antes de entrar na arena.</p>
        <Button variant="secondary" onClick={() => router.push("/characters/new/guided")}>
          Criar personagem
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-amber-700/30 bg-amber-50 p-4 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Entrando na arena</p>
        <p className="mt-1 text-lg font-black text-stone-900">{arenaName}</p>
        <p className="text-xs text-stone-500 mt-0.5 font-mono tracking-wider">{token}</p>
      </div>

      <p className="text-sm font-bold text-stone-700">Escolha seu personagem:</p>

      <div className="space-y-2">
        {characters.map((char) => (
          <button
            key={char.id}
            onClick={() => setSelected(char.id)}
            className={`w-full text-left flex items-center gap-3 rounded-xl border-2 p-3 transition cursor-pointer ${
              selected === char.id
                ? "border-amber-700 bg-amber-100 shadow-md"
                : "border-amber-900/15 bg-white/70 hover:border-amber-400 hover:bg-amber-50"
            }`}
          >
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-800">
              {char.portrait_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={char.portrait_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ClassIcon classId={char.class} size={32} className="opacity-80" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-black text-stone-900 truncate">{char.name}</p>
              <p className="text-xs text-stone-500 capitalize">
                {char.race} · {char.class}
                {char.current_level ? ` · Nv. ${char.current_level}` : ""}
              </p>
              <div className="mt-1 flex gap-3 text-xs font-semibold text-amber-900">
                <span className="flex items-center gap-1"><Heart size={10} /> {char.hp_max}</span>
                <span className="flex items-center gap-1"><Sparkles size={10} /> {char.mp_max}</span>
                <span className="flex items-center gap-1"><Shield size={10} /> {char.defense}</span>
              </div>
            </div>
            {selected === char.id && (
              <span className="shrink-0 h-5 w-5 rounded-full bg-amber-700 flex items-center justify-center">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>

      {error && <p className="text-sm font-semibold text-red-700">{error}</p>}

      <Button
        fullWidth
        size="lg"
        disabled={!selected || isPending}
        onClick={handleJoin}
        className="bg-amber-800 hover:bg-amber-700"
      >
        {isPending ? "Entrando…" : "Entrar na Arena"}
      </Button>
    </div>
  );
}
