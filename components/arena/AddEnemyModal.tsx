"use client";

import { useState } from "react";
import { X, Search, Shield, Swords, Zap, ChevronDown, ChevronRight } from "lucide-react";
import {
  enemies, enemyById,
  CATEGORY_LABELS, ENEMY_TIER_LABELS, CATEGORY_THEME,
  type EnemyCategory, type EnemyTemplate,
} from "@/lib/ghanor/bestiary";

type Props = {
  onAdd: (template: EnemyTemplate) => void;
  onClose: () => void;
};

const CATEGORY_ORDER: EnemyCategory[] = [
  "humanoide", "morto_vivo", "besta", "aberracao",
  "elemental", "gigante", "dragao", "construto",
];

const TIER_ORDER = ["fraco", "padrao", "poderoso", "chefe"];

const TIER_BADGE: Record<string, string> = {
  fraco:    "bg-stone-800 text-stone-300",
  padrao:   "bg-blue-900/60 text-blue-200",
  poderoso: "bg-purple-900/60 text-purple-200",
  chefe:    "bg-red-900/60 text-red-300",
};

function attr(n: number) { return n >= 0 ? `+${n}` : `${n}`; }

export function AddEnemyModal({ onAdd, onClose }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<EnemyCategory | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = enemies.filter((e) => {
    const matchCat = activeCategory === "all" || e.category === activeCategory;
    const matchSearch = search.trim() === "" || e.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // group by category in defined order, then by tier
  const grouped: Partial<Record<EnemyCategory, EnemyTemplate[]>> = {};
  for (const e of filtered) {
    if (!grouped[e.category]) grouped[e.category] = [];
    grouped[e.category]!.push(e);
  }
  for (const cat of Object.keys(grouped) as EnemyCategory[]) {
    grouped[cat]!.sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
  }

  const orderedCats = CATEGORY_ORDER.filter((c) => grouped[c]?.length);

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(5,5,10,0.85)" }}
    >
      <div className="w-full sm:max-w-2xl bg-stone-950 rounded-t-2xl sm:rounded-2xl border border-stone-800 flex flex-col"
        style={{ maxHeight: "90dvh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-stone-800 shrink-0">
          <p className="font-black text-stone-100 text-lg">Adicionar Inimigo</p>
          <button onClick={onClose} className="rounded-full p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 transition">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          <div className="flex items-center gap-2 rounded-xl bg-stone-900 border border-stone-700 px-3 py-2">
            <Search size={14} className="text-stone-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar inimigo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-stone-100 placeholder-stone-500 outline-none"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="px-4 pb-2 shrink-0 overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            <button
              onClick={() => setActiveCategory("all")}
              className={`rounded-full px-3 py-1 text-[11px] font-bold transition border ${
                activeCategory === "all"
                  ? "bg-stone-700 text-stone-100 border-stone-500"
                  : "bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-600"
              }`}
            >
              Todos ({enemies.length})
            </button>
            {CATEGORY_ORDER.map((cat) => {
              const theme = CATEGORY_THEME[cat];
              const count = enemies.filter((e) => e.category === cat).length;
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition border ${
                    active ? theme.badge : "bg-stone-900 text-stone-500 border-stone-800 hover:border-stone-600"
                  }`}
                >
                  {CATEGORY_LABELS[cat]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Enemy list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-sm text-stone-500 py-8">Nenhum inimigo encontrado.</p>
          )}

          {orderedCats.map((cat) => (
            <div key={cat}>
              {activeCategory === "all" && (
                <p className="text-[10px] font-black uppercase tracking-widest mb-2 mt-1"
                  style={{ color: CATEGORY_THEME[cat].iconClr }}>
                  {CATEGORY_LABELS[cat]}
                </p>
              )}
              <div className="space-y-2">
                {grouped[cat]!.map((enemy) => {
                  const theme = CATEGORY_THEME[enemy.category];
                  const expanded = expandedId === enemy.id;
                  const dmgStr = enemy.damage_mod !== 0
                    ? `${enemy.damage_dice}${enemy.damage_mod > 0 ? "+" : ""}${enemy.damage_mod}`
                    : enemy.damage_dice;
                  return (
                    <div key={enemy.id} className="rounded-xl overflow-hidden border transition"
                      style={{ borderColor: theme.border + "40" }}>
                      {/* Main row */}
                      <div className="flex items-center gap-3 px-3 py-2.5"
                        style={{ background: `linear-gradient(90deg, ${theme.gradFrom}, ${theme.gradTo})` }}>
                        {/* Emoji */}
                        <span className="text-2xl shrink-0 leading-none">{enemy.emoji}</span>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-black text-sm text-stone-100 truncate">{enemy.name}</p>
                            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold border ${TIER_BADGE[enemy.tier]}`}>
                              {ENEMY_TIER_LABELS[enemy.tier]}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-[11px] text-stone-400">
                            <span>Nv. {enemy.level}</span>
                            <span className="flex items-center gap-0.5">
                              <span style={{ color: theme.iconClr }}>♥</span> {enemy.hp} PV
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Shield size={9} style={{ color: theme.iconClr }} /> {enemy.defense}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Swords size={9} style={{ color: theme.iconClr }} />
                              {enemy.attack_bonus >= 0 ? "+" : ""}{enemy.attack_bonus}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Zap size={9} style={{ color: theme.iconClr }} /> {dmgStr}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setExpandedId(expanded ? null : enemy.id)}
                            className="rounded-lg p-1.5 text-stone-400 hover:text-stone-200 transition"
                          >
                            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                          <button
                            onClick={() => { onAdd(enemy); }}
                            className="rounded-lg px-3 py-1.5 text-[11px] font-black transition active:scale-95"
                            style={{ background: theme.border + "25", color: theme.iconClr, border: `1px solid ${theme.border}50` }}
                          >
                            + Adicionar
                          </button>
                        </div>
                      </div>

                      {/* Expanded: abilities */}
                      {expanded && (
                        <div className="px-3 py-2.5 bg-stone-950 border-t"
                          style={{ borderColor: theme.border + "25" }}>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
                            style={{ color: theme.iconClr }}>Habilidades</p>
                          <ul className="space-y-1">
                            {enemy.abilities.map((ab, i) => (
                              <li key={i} className="text-[11px] text-stone-300 leading-snug">
                                • {ab}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-2 grid grid-cols-6 gap-1 text-[10px] text-stone-400">
                            {(["str","dex","con","int","wis","cha"] as const).map((a) => (
                              <div key={a} className="text-center">
                                <p className="uppercase font-bold" style={{ color: theme.iconClr }}>{a}</p>
                                <p>{attr(enemy[`attr_${a}`])}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
