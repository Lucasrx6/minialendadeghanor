"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Sparkles, Shield, LogOut, ExternalLink, Swords } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { leaveArena } from "@/app/actions/arena";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ArenaWithParticipants, ArenaParticipant } from "@/app/actions/arena";

export function ArenaPlayerView({
  arena: initial,
  myCharacterId,
}: {
  arena: ArenaWithParticipants;
  myCharacterId: string;
}) {
  const [participants, setParticipants] = useState<ArenaParticipant[]>(initial.participants);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const me = participants.find((p) => p.character_id === myCharacterId);
  const others = participants.filter((p) => p.character_id !== myCharacterId);

  // Realtime — atualiza HP/MP ao vivo
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`arena-player:${initial.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "arena_participants",
          filter: `arena_id=eq.${initial.id}`,
        },
        (payload) => {
          const updated = payload.new as { id: string; hp_current: number; mp_current: number };
          setParticipants((prev) =>
            prev.map((p) =>
              p.id === updated.id
                ? { ...p, hp_current: updated.hp_current, mp_current: updated.mp_current }
                : p
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "arena_participants",
          filter: `arena_id=eq.${initial.id}`,
        },
        (payload) => {
          const deleted = payload.old as { id: string };
          setParticipants((prev) => prev.filter((p) => p.id !== deleted.id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [initial.id]);

  useEffect(() => {
    setParticipants(initial.participants);
  }, [initial.participants]);

  function handleLeave() {
    if (!window.confirm("Sair da arena?")) return;
    startTransition(async () => {
      if (!me) return;
      await leaveArena({ arenaId: initial.id, characterId: myCharacterId });
      router.push(`/characters/${myCharacterId}`);
    });
  }

  function healthColor(hp: number, max: number) {
    const pct = max > 0 ? hp / max : 0;
    if (pct > 0.5) return "bg-emerald-500";
    if (pct > 0.25) return "bg-yellow-500";
    return "bg-red-500";
  }

  return (
    <div className="space-y-4">
      {/* Banner da arena */}
      <div className="flex items-center gap-3 rounded-2xl border border-amber-700/30 bg-amber-800/10 px-4 py-3">
        <Swords size={20} className="text-amber-800 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-black text-stone-900 truncate">{initial.name}</p>
          <p className="text-xs text-stone-500">
            Token: <span className="font-mono font-bold tracking-wider">{initial.token}</span>
          </p>
        </div>
      </div>

      {/* Meu personagem */}
      {me && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-stone-700">Meu personagem</p>
            <a
              href={`/characters/${myCharacterId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-amber-800 hover:underline"
            >
              <ExternalLink size={12} /> Ver ficha
            </a>
          </div>

          <p className="font-black text-stone-900 text-lg">{me.character.name}</p>

          {/* PV */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1 text-xs font-bold text-stone-600 uppercase">
                <Heart size={10} className="text-red-500" /> PV
              </span>
              <span className="text-sm font-black text-stone-800">
                {me.hp_current}<span className="text-xs font-normal text-stone-400">/{me.character.hp_max}</span>
              </span>
            </div>
            <div className="h-3 rounded-full bg-stone-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${healthColor(me.hp_current, me.character.hp_max)}`}
                style={{ width: `${me.character.hp_max > 0 ? (me.hp_current / me.character.hp_max) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* PM */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1 text-xs font-bold text-stone-600 uppercase">
                <Sparkles size={10} className="text-blue-500" /> PM
              </span>
              <span className="text-sm font-black text-stone-800">
                {me.mp_current}<span className="text-xs font-normal text-stone-400">/{me.character.mp_max}</span>
              </span>
            </div>
            <div className="h-3 rounded-full bg-stone-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-400 transition-all duration-500"
                style={{ width: `${me.character.mp_max > 0 ? (me.mp_current / me.character.mp_max) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-stone-600">
            <Shield size={12} /> Defesa {me.character.defense}
          </div>
        </Card>
      )}

      {/* Outros jogadores (read-only) */}
      {others.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-bold text-stone-600">Na mesa</p>
          {others.map((p) => {
            const pct = p.character.hp_max > 0 ? p.hp_current / p.character.hp_max : 0;
            return (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-amber-900/15 bg-white/70 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-stone-800 truncate">{p.character.name}</p>
                  <p className="text-[10px] text-stone-500 capitalize">{p.character.race} · {p.character.class}</p>
                </div>
                {/* Barra de saúde anônima */}
                <div className="w-20">
                  <div className="h-2 rounded-full bg-stone-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${healthColor(p.hp_current, p.character.hp_max)}`}
                      style={{ width: `${pct * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sair */}
      <Button
        variant="secondary"
        fullWidth
        disabled={isPending}
        onClick={handleLeave}
        className="border-red-200 text-red-700 hover:bg-red-50"
      >
        <LogOut size={15} />
        {isPending ? "Saindo…" : "Sair da Arena"}
      </Button>
    </div>
  );
}
