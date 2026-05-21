"use client";

import { Heart, Sparkles, Shield, Sword } from "lucide-react";
import { ClassIcon } from "@/components/ui/item-icon";
import { tierForLevel, TIER_LABELS } from "@/lib/ghanor/leveling";
import type { ArenaParticipant } from "@/app/actions/arena";

type Props = {
  participant: ArenaParticipant;
  onOpenActions: (p: ArenaParticipant) => void;
  flash?: boolean;
};

function HealthStatus(hp: number, hpMax: number) {
  const pct = hpMax > 0 ? hp / hpMax : 0;
  if (pct > 0.5) return "green";
  if (pct > 0.25) return "yellow";
  return "red";
}

const STATUS_BORDER: Record<string, string> = {
  green: "border-emerald-400/60",
  yellow: "border-yellow-400/60",
  red: "border-red-400/60",
};
const STATUS_BADGE: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
};
const STATUS_BAR: Record<string, string> = {
  green: "bg-emerald-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
};
const STATUS_LABEL: Record<string, string> = {
  green: "Saudável",
  yellow: "Ferido",
  red: "Crítico",
};

export function ArenaPlayerCard({ participant, onOpenActions, flash }: Props) {
  const { character: char, hp_current, mp_current } = participant;
  const hpPct = char.hp_max > 0 ? Math.round((hp_current / char.hp_max) * 100) : 0;
  const mpPct = char.mp_max > 0 ? Math.round((mp_current / char.mp_max) * 100) : 0;
  const status = HealthStatus(hp_current, char.hp_max);
  const tier = tierForLevel(char.current_level ?? 1);

  return (
    <div
      className={`relative rounded-2xl border-2 bg-amber-50/90 shadow-sm transition-all ${STATUS_BORDER[status]} ${
        flash ? "animate-pulse" : ""
      }`}
    >
      {/* Header: retrato + nome */}
      <div className="flex gap-3 p-3 pb-2">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-900">
          {char.portrait_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={char.portrait_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ClassIcon classId={char.class} size={34} className="opacity-80" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-stone-900 truncate leading-tight">{char.name}</p>
          <p className="text-xs text-stone-500 capitalize mt-0.5 truncate">
            {char.race} · {char.class}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold text-amber-800">
              Nv. {char.current_level ?? 1} · {TIER_LABELS[tier]}
            </span>
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${STATUS_BADGE[status]}`}>
              {STATUS_LABEL[status]}
            </span>
          </div>
        </div>
      </div>

      {/* Barras de PV e PM */}
      <div className="px-3 pb-2 space-y-1.5">
        {/* PV */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="flex items-center gap-1 text-[10px] font-bold text-stone-600 uppercase">
              <Heart size={9} /> PV
            </span>
            <span className="text-[10px] font-black text-stone-700">
              {hp_current}<span className="font-normal text-stone-400">/{char.hp_max}</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-stone-200/70 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${STATUS_BAR[status]}`}
              style={{ width: `${hpPct}%` }}
            />
          </div>
        </div>

        {/* PM */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="flex items-center gap-1 text-[10px] font-bold text-stone-600 uppercase">
              <Sparkles size={9} /> PM
            </span>
            <span className="text-[10px] font-black text-stone-700">
              {mp_current}<span className="font-normal text-stone-400">/{char.mp_max}</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-stone-200/70 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-400 transition-all duration-500"
              style={{ width: `${mpPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer: defesa + botão ações */}
      <div className="flex items-center justify-between px-3 pb-3 pt-1">
        <span className="flex items-center gap-1 text-xs text-stone-600">
          <Shield size={12} /> {char.defense}
        </span>
        <button
          onClick={() => onOpenActions(participant)}
          className="flex items-center gap-1.5 rounded-xl bg-amber-800 px-3 py-1.5 text-xs font-bold text-amber-50 transition hover:bg-amber-700 active:scale-95 cursor-pointer"
        >
          <Sword size={12} /> Ações
        </button>
      </div>
    </div>
  );
}
