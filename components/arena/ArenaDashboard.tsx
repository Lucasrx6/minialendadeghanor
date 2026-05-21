"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { closeArena } from "@/app/actions/arena";
import { ArenaTokenShare } from "@/components/arena/ArenaTokenShare";
import { ArenaPlayerCard } from "@/components/arena/ArenaPlayerCard";
import { DmActionDrawer } from "@/components/arena/DmActionDrawer";
import { Button } from "@/components/ui/button";
import type { ArenaWithParticipants, ArenaParticipant } from "@/app/actions/arena";

export function ArenaDashboard({ arena: initial }: { arena: ArenaWithParticipants }) {
  const [participants, setParticipants] = useState<ArenaParticipant[]>(initial.participants);
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const [activeParticipant, setActiveParticipant] = useState<ArenaParticipant | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`arena:${initial.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "arena_participants",
          filter: `arena_id=eq.${initial.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const updated = payload.new as { id: string; hp_current: number; mp_current: number };
            setParticipants((prev) =>
              prev.map((p) =>
                p.id === updated.id
                  ? { ...p, hp_current: updated.hp_current, mp_current: updated.mp_current }
                  : p
              )
            );
            // Flash visual no card atualizado
            setFlashIds((prev) => {
              const next = new Set(prev);
              next.add(updated.id);
              return next;
            });
            setTimeout(() => {
              setFlashIds((prev) => {
                const next = new Set(prev);
                next.delete(updated.id);
                return next;
              });
            }, 800);
            // Atualiza o drawer se estiver aberto para este participante
            setActiveParticipant((prev) =>
              prev?.id === updated.id
                ? { ...prev, hp_current: updated.hp_current, mp_current: updated.mp_current }
                : prev
            );
          } else if (payload.eventType === "INSERT") {
            // Novo jogador entrou — recarrega dados completos (precisa do join com characters)
            router.refresh();
          } else if (payload.eventType === "DELETE") {
            const deleted = payload.old as { id: string };
            setParticipants((prev) => prev.filter((p) => p.id !== deleted.id));
            setActiveParticipant((prev) => (prev?.id === deleted.id ? null : prev));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [initial.id, router]);

  // Sincroniza participants com refresh do server
  useEffect(() => {
    setParticipants(initial.participants);
  }, [initial.participants]);

  function handleClose() {
    if (!window.confirm("Encerrar a arena? Os jogadores serão desconectados.")) return;
    startTransition(async () => {
      await closeArena(initial.id);
      router.push("/arena");
    });
  }

  function handleUpdated(participantId: string, patch: Partial<ArenaParticipant>) {
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, ...patch } : p))
    );
    setActiveParticipant((prev) =>
      prev?.id === participantId ? { ...prev, ...patch } : prev
    );
  }

  function handleRemoved(participantId: string) {
    setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    setActiveParticipant(null);
  }

  return (
    <div className="space-y-4">
      {/* Header da arena */}
      <div className="rounded-2xl border border-amber-700/20 bg-amber-800/5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-black text-stone-900 truncate">{initial.name}</h1>
            <p className="text-xs text-stone-500 mt-0.5">Mesa ao vivo · Modo Arena</p>
          </div>
          <Button
            variant="danger"
            disabled={isPending}
            onClick={handleClose}
            className="shrink-0 text-xs py-1.5 px-3"
          >
            <XCircle size={14} /> Encerrar
          </Button>
        </div>
        <div className="mt-3">
          <p className="text-xs font-bold text-stone-500 mb-1.5">Token de acesso</p>
          <ArenaTokenShare token={initial.token} />
        </div>
      </div>

      {/* Contador de participantes */}
      <div className="flex items-center gap-2 text-sm font-bold text-stone-600">
        <Users size={16} />
        {participants.length === 0
          ? "Aguardando jogadores…"
          : `${participants.length} jogador${participants.length !== 1 ? "es" : ""} na arena`}
      </div>

      {/* Grid de cards */}
      {participants.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-amber-900/20 py-12 text-center">
          <p className="text-sm text-stone-500">
            Compartilhe o token acima para que os jogadores entrem.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {participants.map((p) => (
            <ArenaPlayerCard
              key={p.id}
              participant={p}
              onOpenActions={setActiveParticipant}
              flash={flashIds.has(p.id)}
            />
          ))}
        </div>
      )}

      {/* Gaveta de ações */}
      <DmActionDrawer
        participant={activeParticipant}
        arenaId={initial.id}
        onClose={() => setActiveParticipant(null)}
        onUpdated={handleUpdated}
        onRemoved={handleRemoved}
      />
    </div>
  );
}
