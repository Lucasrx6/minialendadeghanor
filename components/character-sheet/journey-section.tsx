"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, TrendingUp, Sparkles, Star } from "lucide-react";
import { classById } from "@/lib/ghanor/classes";
import { TIER_LABELS, tierForLevel } from "@/lib/ghanor/leveling";

type LevelUpEntry = {
  id: string;
  from_level: number;
  to_level: number;
  class_taken: string;
  is_multiclass: boolean;
  hp_gained: number;
  mp_gained: number;
  power_chosen: string | null;
  new_spells: string[];
  attr_increased: string | null;
  notes: string | null;
  created_at: string;
};

const ATTR_SHORT: Record<string, string> = {
  str: "For", dex: "Des", con: "Con", int: "Int", wis: "Sab", cha: "Car",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  if (days < 30) return `${days} dias atrás`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? "mês" : "meses"} atrás`;
  return `${Math.floor(months / 12)} anos atrás`;
}

export function JourneySection({ history }: { history: LevelUpEntry[] }) {
  const [open, setOpen] = useState(false);

  if (history.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-900/20 bg-amber-50/60 overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-amber-100/50 transition"
      >
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-amber-800" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800">Jornada</h3>
          <span className="ml-2 rounded-full bg-amber-800 px-2 py-0.5 text-xs font-bold text-amber-50">
            {history.length} {history.length === 1 ? "evolução" : "evoluções"}
          </span>
        </div>
        {open ? (
          <ChevronUp size={18} className="text-amber-700" />
        ) : (
          <ChevronDown size={18} className="text-amber-700" />
        )}
      </button>

      {/* Timeline */}
      {open && (
        <div className="px-6 pb-6 space-y-3">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-amber-200" />

            <div className="space-y-4">
              {history.map((lu, idx) => {
                const tier = tierForLevel(lu.to_level);
                const isFirst = idx === 0;
                const className = classById[lu.class_taken as keyof typeof classById]?.name ?? lu.class_taken;

                return (
                  <div key={lu.id} className="flex gap-4">
                    {/* Dot */}
                    <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-800 text-amber-50 text-xs font-black shadow">
                      {lu.to_level}
                    </div>

                    {/* Content */}
                    <div className="flex-1 rounded-lg bg-white/70 border border-amber-100 px-4 py-3 text-sm shadow-sm">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <span className="font-bold text-stone-950">Nível {lu.to_level}</span>
                          {lu.is_multiclass && (
                            <span className="ml-2 text-xs font-bold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5">
                              Multiclasse
                            </span>
                          )}
                          {isFirst && (
                            <span className="ml-2 text-xs text-stone-400">
                              {TIER_LABELS[tier]}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-stone-400 whitespace-nowrap">
                          {timeAgo(lu.created_at)}
                        </span>
                      </div>

                      <p className="text-stone-600">
                        Como <span className="font-semibold text-amber-900">{className}</span>
                        {" "}· <span className="text-emerald-700">+{lu.hp_gained} PV</span>
                        {" "}· <span className="text-blue-700">+{lu.mp_gained} PM</span>
                      </p>

                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {lu.power_chosen && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-xs text-amber-900">
                            <Star size={10} /> {lu.power_chosen}
                          </span>
                        )}
                        {lu.attr_increased && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 border border-sky-200 px-2 py-0.5 text-xs text-sky-900">
                            ↑ {ATTR_SHORT[lu.attr_increased] ?? lu.attr_increased}
                          </span>
                        )}
                        {lu.new_spells?.map((spell) => (
                          <span key={spell} className="inline-flex items-center gap-1 rounded-full bg-purple-100 border border-purple-200 px-2 py-0.5 text-xs text-purple-900">
                            <Sparkles size={10} /> {spell}
                          </span>
                        ))}
                      </div>

                      {lu.notes && (
                        <p className="mt-2 italic text-xs text-stone-500 border-l-2 border-amber-300 pl-2">
                          {lu.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
