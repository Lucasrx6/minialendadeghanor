"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swords } from "lucide-react";
import { getArenaParticipation } from "@/app/actions/arena";

export function ArenaBanner({ characterId }: { characterId: string }) {
  const [arena, setArena] = useState<{ arenaToken: string; arenaName: string } | null>(undefined as unknown as null);

  useEffect(() => {
    getArenaParticipation(characterId).then(setArena);
  }, [characterId]);

  if (!arena) return null;

  return (
    <Link
      href={`/arena/${arena.arenaToken}`}
      className="flex items-center gap-3 rounded-2xl border border-amber-700/30 bg-amber-800/10 px-4 py-3 transition hover:bg-amber-800/15 print:hidden"
    >
      <Swords size={18} className="text-amber-800 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-amber-900 truncate">
          Em Arena: {arena.arenaName}
        </p>
        <p className="text-[10px] text-stone-500">
          Token: <span className="font-mono font-bold tracking-wider">{arena.arenaToken}</span>
          {" · "}Toque para abrir
        </p>
      </div>
    </Link>
  );
}
