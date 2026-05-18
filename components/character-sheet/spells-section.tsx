"use client";

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import {
  ChevronDown,
  ChevronRight,
  Flame,
  Heart,
  Sparkles,
  Zap,
  Eye,
  Star,
  Wrench,
  Sword,
  Swords,
  X,
  Plus,
  Search,
  Play,
  Dices,
  Shield,
} from "lucide-react";
import { RollDialog } from "@/components/dice/RollDialog";
import { spellById, spellByName, spells as ALL_SPELLS, type SpellEffectType, type Spell } from "@/lib/ghanor/spells";
import { powerById, powerByName, powers as ALL_POWERS, type Power, type PowerActivation } from "@/lib/ghanor/powers";
import {
  addSpellToCharacter,
  removeSpellFromCharacter,
  addPowerToCharacter,
  removePowerFromCharacter,
} from "@/app/actions/dm";

// ─── Config ───────────────────────────────────────────────────────────────────

const EFFECT_CONFIG: Record<SpellEffectType, {
  label: string; bgClass: string; textClass: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}> = {
  dano:        { label: "Dano",      bgClass: "bg-red-100",    textClass: "text-red-700",    Icon: Flame },
  cura:        { label: "Cura",      bgClass: "bg-green-100",  textClass: "text-green-700",  Icon: Heart },
  buff:        { label: "Buff",      bgClass: "bg-blue-100",   textClass: "text-blue-700",   Icon: Sparkles },
  debuff:      { label: "Debuff",    bgClass: "bg-orange-100", textClass: "text-orange-700", Icon: Zap },
  controle:    { label: "Controle",  bgClass: "bg-purple-100", textClass: "text-purple-700", Icon: Eye },
  utilidade:   { label: "Utilidade", bgClass: "bg-stone-100",  textClass: "text-stone-600",  Icon: Wrench },
  "invocação": { label: "Invocação", bgClass: "bg-teal-100",   textClass: "text-teal-700",   Icon: Star },
};

const ACTIVATION_CONFIG: Record<PowerActivation, { label: string; bgClass: string; textClass: string }> = {
  passivo:       { label: "Passivo",     bgClass: "bg-stone-100",  textClass: "text-stone-600"  },
  "ação":        { label: "Ação",        bgClass: "bg-amber-100",  textClass: "text-amber-700"  },
  "ação rápida": { label: "Ação Rápida", bgClass: "bg-yellow-100", textClass: "text-yellow-700" },
  reação:        { label: "Reação",      bgClass: "bg-orange-100", textClass: "text-orange-700" },
  livre:         { label: "Livre",       bgClass: "bg-green-100",  textClass: "text-green-700"  },
};

const CIRCLE_LABELS: Record<number, string> = {
  1: "Círculo 1", 2: "Círculo 2", 3: "Círculo 3", 4: "Círculo 4", 5: "Círculo 5",
};

export type ActiveEffect = { id: string; spellId: string; name: string; duration: string };

// ─── Resolvers ────────────────────────────────────────────────────────────────

function resolveSpell(id: string): Spell | undefined {
  return spellById[id] ?? spellByName[id];
}

function resolvePower(id: string): Power | undefined {
  return powerById[id] ?? powerByName[id];
}

// ─── Dice formula parser ──────────────────────────────────────────────────────

const ATTR_ALIASES: Record<string, string> = {
  str: "str", for: "str",
  dex: "dex", des: "dex",
  con: "con",
  int: "int",
  sab: "wis", wis: "wis",
  car: "cha", cha: "cha",
};

function parseDice(
  formula: string,
  attrs: Record<string, number>,
): { counts: Partial<Record<4|6|8|10|12|20, number>>; modifier: number; modBreakdown: string } {
  const diceMatch = formula.match(/(\d+)d(\d+)/i);
  const attrMatch = formula.match(/[+-]([a-zA-Z]+|\d+)/);

  const count = diceMatch ? parseInt(diceMatch[1]) : 1;
  const sides = diceMatch ? parseInt(diceMatch[2]) : 6;

  let modifier = 0;
  let modBreakdown = "";

  if (attrMatch) {
    const token = attrMatch[1].toLowerCase();
    const sign = attrMatch[0].startsWith("-") ? -1 : 1;
    const attrKey = ATTR_ALIASES[token];
    if (attrKey && attrs[attrKey] != null) {
      modifier = sign * attrs[attrKey];
      modBreakdown = `${token.charAt(0).toUpperCase() + token.slice(1)} (${modifier >= 0 ? "+" : ""}${modifier})`;
    } else if (/^\d+$/.test(token)) {
      modifier = sign * parseInt(token);
      modBreakdown = `${sign >= 0 ? "+" : "-"}${token}`;
    }
  }

  const validSides = [4, 6, 8, 10, 12, 20];
  const safeSides = validSides.includes(sides) ? sides : 6;

  return {
    counts: { [safeSides as 4|6|8|10|12|20]: count } as Partial<Record<4|6|8|10|12|20, number>>,
    modifier,
    modBreakdown,
  };
}

// ─── SpellUseModal ────────────────────────────────────────────────────────────

function SpellUseModal({
  spell,
  amplifyIndex,
  onAmplifyChange,
  mpCurrent,
  attrs,
  onConfirm,
  onClose,
}: {
  spell: Spell;
  amplifyIndex: number;
  onAmplifyChange: (i: number) => void;
  mpCurrent: number;
  attrs?: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  onConfirm: (totalMp: number) => void;
  onClose: () => void;
}) {
  const [rollOpen, setRollOpen] = useState<"spell" | "attack" | null>(null);

  const ampEntry = amplifyIndex >= 0 ? spell.amplify?.[amplifyIndex] : null;
  const extraMp = ampEntry?.extra_mp ?? 0;
  const totalMp = spell.mp_cost + extraMp;
  const canConfirm = mpCurrent >= totalMp;

  const effectiveAttrs = attrs ?? { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  const diceConfig = spell.dice ? parseDice(spell.dice, effectiveAttrs) : null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-4"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full overflow-hidden rounded-t-3xl border border-stone-800 bg-stone-950 shadow-2xl sm:max-w-sm sm:rounded-2xl">
          {/* Handle bar */}
          <div className="flex justify-center pb-1 pt-3 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-stone-700" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between px-5 pb-3 pt-3">
            <div>
              <p className="text-xs font-semibold uppercase text-stone-400">Usar magia</p>
              <h2 className="text-lg font-black text-amber-50">{spell.name}</h2>
              <p className="text-xs text-stone-500">
                {spell.casting_time} · {spell.range} · {spell.target}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-stone-600 transition hover:bg-stone-800 hover:text-stone-300"
            >
              <X size={16} />
            </button>
          </div>

          {/* Amplification picker */}
          {spell.amplify && spell.amplify.length > 0 && (
            <div className="space-y-1.5 px-5 pb-4">
              <p className="text-xs font-semibold uppercase text-stone-400">Amplificação</p>
              {/* Base option */}
              <button
                className={`w-full rounded-xl border p-3 text-left transition ${amplifyIndex === -1 ? "border-amber-600 bg-amber-900/25" : "border-stone-700 bg-stone-900 hover:border-stone-600"}`}
                onClick={() => onAmplifyChange(-1)}
              >
                <div className="flex items-center gap-2">
                  <RadioDotDark selected={amplifyIndex === -1} />
                  <div>
                    <p className="text-sm font-bold text-amber-50">Base — {spell.mp_cost} PM</p>
                    {spell.dice && <p className="text-xs text-stone-400">Dados: {spell.dice}</p>}
                  </div>
                </div>
              </button>
              {spell.amplify.map((amp, i) => {
                const cost = spell.mp_cost + amp.extra_mp;
                const affordable = mpCurrent >= cost;
                return (
                  <button
                    key={i}
                    disabled={!affordable}
                    className={`w-full rounded-xl border p-3 text-left transition ${!affordable ? "cursor-not-allowed border-stone-800 bg-stone-900/50 opacity-40" : amplifyIndex === i ? "border-amber-600 bg-amber-900/25" : "border-stone-700 bg-stone-900 hover:border-stone-600"}`}
                    onClick={() => affordable && onAmplifyChange(i)}
                  >
                    <div className="flex items-center gap-2">
                      <RadioDotDark selected={amplifyIndex === i} />
                      <div>
                        <p className="text-sm font-bold text-amber-50">
                          +{amp.extra_mp} PM —{" "}
                          <span className="text-amber-300">{cost} total</span>
                        </p>
                        <p className="text-xs text-stone-400">{amp.effect}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Save / attack info */}
          {(spell.save || spell.attack) && (
            <div className="flex flex-wrap gap-2 px-5 pb-4">
              {spell.save && (
                <div className="flex items-center gap-1.5 rounded-lg border border-amber-700/30 bg-amber-900/20 px-3 py-1.5 text-xs text-amber-200">
                  <Shield size={11} />
                  Alvo: teste de {spell.save}
                </div>
              )}
              {spell.attack && (
                <div className="flex items-center gap-1.5 rounded-lg border border-blue-700/30 bg-blue-900/20 px-3 py-1.5 text-xs text-blue-200">
                  <Swords size={11} />
                  Requer teste de ataque
                </div>
              )}
            </div>
          )}

          {/* Roll buttons */}
          {(spell.attack || diceConfig) && (
            <div className="space-y-2 px-5 pb-4">
              {spell.attack && (
                <button
                  onClick={() => setRollOpen("attack")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-700/40 bg-blue-900/20 py-2.5 text-sm font-bold text-blue-200 transition hover:bg-blue-900/40"
                >
                  <Dices size={14} />
                  Rolar ataque — 1d20
                </button>
              )}
              {diceConfig && (
                <button
                  onClick={() => setRollOpen("spell")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-700/40 bg-amber-900/20 py-2.5 text-sm font-bold text-amber-200 transition hover:bg-amber-900/40"
                >
                  <Dices size={14} />
                  Rolar {spell.dice}
                  {diceConfig.modBreakdown && (
                    <span className="text-xs text-amber-400/70">({diceConfig.modBreakdown})</span>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Confirm */}
          <div className="px-5 pb-5">
            {!canConfirm && (
              <p className="mb-2 text-center text-xs text-red-400">
                PM insuficiente ({mpCurrent}/{totalMp})
              </p>
            )}
            <button
              disabled={!canConfirm}
              onClick={() => onConfirm(totalMp)}
              className="w-full rounded-xl py-4 text-base font-black uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: canConfirm
                  ? "linear-gradient(135deg, #1e3a8a, #2563eb)"
                  : "#1f2937",
                color: canConfirm ? "#dbeafe" : "#6b7280",
                boxShadow: canConfirm ? "0 4px 15px rgba(37,99,235,0.35)" : "none",
              }}
            >
              Confirmar — {totalMp} PM
            </button>
          </div>
        </div>
      </div>

      {/* Roll dialog (appears above the modal) */}
      {rollOpen && (
        <RollDialog
          open={!!rollOpen}
          onClose={() => setRollOpen(null)}
          preLabel={rollOpen === "attack" ? "Ataque mágico" : `Dano — ${spell.name}`}
          preCounts={rollOpen === "attack" ? { 20: 1 } : (diceConfig?.counts ?? { 6: 1 })}
          preModifier={rollOpen === "spell" ? (diceConfig?.modifier ?? 0) : 0}
          preModifierBreakdown={rollOpen === "spell" && diceConfig?.modBreakdown ? diceConfig.modBreakdown : undefined}
        />
      )}
    </>
  );
}

function RadioDotDark({ selected }: { selected: boolean }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-amber-500 bg-amber-500" : "border-stone-600"}`}
    >
      {selected && <span className="h-2 w-2 rounded-full bg-stone-950" />}
    </span>
  );
}

// ─── DM Add Panel ─────────────────────────────────────────────────────────────

function DmAddPanel<T extends { id: string; name: string }>({
  items,
  onAdd,
  onClose,
  placeholder,
}: {
  items: T[];
  onAdd: (id: string) => void;
  onClose: () => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div
      ref={ref}
      className="absolute z-20 left-0 right-0 mt-1 rounded-xl border border-indigo-200 bg-white shadow-xl overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-indigo-100">
        <Search size={13} className="text-stone-400 shrink-0" />
        <input
          autoFocus
          className="flex-1 text-sm outline-none placeholder:text-stone-400"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
          <X size={14} />
        </button>
      </div>
      <ul className="max-h-56 overflow-y-auto divide-y divide-stone-100">
        {filtered.length === 0 ? (
          <li className="px-3 py-2 text-xs text-stone-400">Nenhum resultado.</li>
        ) : (
          filtered.map((item) => (
            <li key={item.id}>
              <button
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-indigo-50 transition"
                onClick={() => { onAdd(item.id); onClose(); }}
              >
                {item.name}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

// ─── SpellCard ────────────────────────────────────────────────────────────────

function SpellCard({
  spell,
  isDmMode,
  onRemove,
  dmPending,
  mpCurrent,
  onUse,
}: {
  spell: Spell;
  isDmMode: boolean;
  onRemove: () => void;
  dmPending: boolean;
  mpCurrent: number;
  onUse: (spell: Spell) => void;
}) {
  const [open, setOpen] = useState(false);
  const ec = EFFECT_CONFIG[spell.effect_type] ?? EFFECT_CONFIG.utilidade;
  const canUse = mpCurrent >= spell.mp_cost;

  return (
    <div className="rounded-lg border border-amber-900/10 bg-white/60 overflow-hidden">
      <div className="flex items-center">
        <button
          className="flex-1 flex items-center gap-2 px-3 py-2 text-left hover:bg-amber-50/80 transition"
          onClick={() => setOpen((v) => !v)}
        >
          {open
            ? <ChevronDown size={13} className="shrink-0 text-stone-400" />
            : <ChevronRight size={13} className="shrink-0 text-stone-400" />}
          <ec.Icon size={13} className={`shrink-0 ${ec.textClass}`} />
          <span className="flex-1 text-sm font-medium text-stone-900">{spell.name}</span>
          {spell.dice && (
            <span className="hidden sm:block text-[11px] text-amber-700 font-medium mr-1">{spell.dice}</span>
          )}
          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${ec.bgClass} ${ec.textClass}`}>
            {spell.mp_cost} PM
          </span>
          <span className="text-[11px] text-stone-400 ml-1 tabular-nums">C{spell.circle}</span>
        </button>

        {/* Usar button */}
        <button
          onClick={() => onUse(spell)}
          disabled={!canUse}
          title={canUse ? `Usar ${spell.name} (${spell.mp_cost} PM)` : "PM insuficiente"}
          className={`flex items-center gap-1 px-2 py-2 text-[11px] font-semibold transition ${
            canUse
              ? "text-blue-600 hover:text-blue-800"
              : "text-stone-300 cursor-not-allowed"
          }`}
        >
          <Play size={11} />
        </button>

        {isDmMode && (
          <button
            onClick={onRemove}
            disabled={dmPending}
            className="px-2 py-2 text-stone-300 hover:text-red-500 transition disabled:opacity-40"
            title="Remover magia"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {open && (
        <div className="px-3 pb-3 pt-1.5 space-y-1.5 border-t border-amber-900/10">
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-stone-500">
            <span>{spell.casting_time}</span>
            <span>·</span>
            <span>{spell.range}</span>
            <span>·</span>
            <span>{spell.target}</span>
            <span>·</span>
            <span>{spell.duration}</span>
            {spell.save && <><span>·</span><span className="text-amber-700">Teste: {spell.save}</span></>}
            {spell.attack && <><span>·</span><span className="text-amber-700">Requer ataque</span></>}
            {spell.dice && <><span>·</span><span className="text-amber-700 font-semibold">{spell.dice}</span></>}
          </div>
          <p className="text-xs text-stone-700 leading-relaxed">{spell.description}</p>
          {spell.amplify && spell.amplify.length > 0 && (
            <div className="space-y-0.5 pt-0.5">
              {spell.amplify.map((a, i) => (
                <p key={i} className="text-[11px] text-indigo-700">
                  <span className="font-semibold">+{a.extra_mp} PM:</span> {a.effect}
                </p>
              ))}
            </div>
          )}
          {!canUse && (
            <p className="text-[11px] font-semibold text-red-500">PM insuficiente ({mpCurrent}/{spell.mp_cost} necessário)</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PowerCard ────────────────────────────────────────────────────────────────

function PowerCard({
  power,
  isDmMode,
  onRemove,
  dmPending,
  remainingUses,
  onUse,
}: {
  power: Power;
  isDmMode: boolean;
  onRemove: () => void;
  dmPending: boolean;
  remainingUses: number;
  onUse: (power: Power) => void;
}) {
  const [open, setOpen] = useState(false);
  const ac = ACTIVATION_CONFIG[power.activation] ?? ACTIVATION_CONFIG.passivo;
  const hasUses = power.uses_per_scene != null;
  const canUse = hasUses && remainingUses > 0;
  const exhausted = hasUses && remainingUses === 0;

  return (
    <div className="rounded-lg border border-amber-900/10 bg-white/60 overflow-hidden">
      <div className="flex items-center">
        <button
          className="flex-1 flex items-center gap-2 px-3 py-2 text-left hover:bg-amber-50/80 transition"
          onClick={() => setOpen((v) => !v)}
        >
          {open
            ? <ChevronDown size={13} className="shrink-0 text-stone-400" />
            : <ChevronRight size={13} className="shrink-0 text-stone-400" />}
          <Sword size={13} className="shrink-0 text-amber-600" />
          <span className={`flex-1 text-sm font-medium ${exhausted ? "text-stone-400" : "text-stone-900"}`}>
            {power.name}
          </span>
          {hasUses && (
            <span className={`text-[11px] tabular-nums mr-1 font-semibold ${exhausted ? "text-red-500" : "text-stone-500"}`}>
              {exhausted ? "0" : remainingUses}/{power.uses_per_scene}
            </span>
          )}
          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${ac.bgClass} ${ac.textClass}`}>
            {ac.label}
          </span>
        </button>

        {/* Usar button — only for powers with uses_per_scene */}
        {hasUses && (
          <button
            onClick={() => onUse(power)}
            disabled={!canUse}
            title={exhausted ? "Usos esgotados" : `Usar ${power.name}`}
            className={`flex items-center gap-1 px-2 py-2 text-[11px] font-semibold transition ${
              canUse
                ? "text-amber-600 hover:text-amber-800"
                : "text-stone-300 cursor-not-allowed"
            }`}
          >
            <Play size={11} />
          </button>
        )}

        {isDmMode && (
          <button
            onClick={onRemove}
            disabled={dmPending}
            className="px-2 py-2 text-stone-300 hover:text-red-500 transition disabled:opacity-40"
            title="Remover poder"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {open && (
        <div className="px-3 pb-3 pt-1.5 space-y-1.5 border-t border-amber-900/10">
          {(power.class || power.tier || power.prerequisite) && (
            <div className="flex flex-wrap gap-1 text-[11px]">
              {power.class && (
                <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded capitalize">{power.class}</span>
              )}
              {power.tier && (
                <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded capitalize">{power.tier}</span>
              )}
              {power.prerequisite && (
                <span className="text-stone-500">Req: {power.prerequisite}</span>
              )}
            </div>
          )}
          <p className="text-xs text-stone-700 leading-relaxed">{power.description}</p>
          <div className="flex flex-wrap gap-2 text-[11px]">
            {power.dice && <span className="text-amber-700 font-semibold">{power.dice}</span>}
            {power.mp_cost != null && <span className="text-indigo-700 font-semibold">{power.mp_cost} PM</span>}
          </div>
          {exhausted && (
            <p className="text-[11px] font-semibold text-red-500">Usos esgotados — recupera na próxima cena.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  label,
  isDmMode,
  onAdd,
}: {
  label: string;
  isDmMode: boolean;
  onAdd?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">{label}</p>
      {isDmMode && onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 transition"
        >
          <Plus size={12} />
          Adicionar
        </button>
      )}
    </div>
  );
}

// ─── SpellsSection ────────────────────────────────────────────────────────────

interface SpellsSectionProps {
  spells: string[];
  powers: string[];
  isDmMode?: boolean;
  characterId?: string;
  mpCurrent?: number;
  onUseMp?: (amount: number) => void;
  /** Increments when a rest/scene-reset happens, triggering uses reload */
  restKey?: number;
  /** Character's final attribute modifiers for dice rolls */
  attrs?: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  /** Called when a persistent-duration spell is confirmed */
  onAddEffect?: (effect: ActiveEffect) => void;
}

export function SpellsSection({
  spells: spellIds,
  powers: powerIds,
  isDmMode = false,
  characterId,
  mpCurrent = 0,
  onUseMp,
  restKey = 0,
  attrs,
  onAddEffect,
}: SpellsSectionProps) {
  const [dmPending, startDmTransition] = useTransition();
  const [showAddSpells, setShowAddSpells] = useState(false);
  const [showAddPowers, setShowAddPowers] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [spellModal, setSpellModal] = useState<{ spell: Spell; amplifyIndex: number } | null>(null);

  // ── Power uses (localStorage per character) ───────────────────
  const [powerUses, setPowerUses] = useState<Record<string, number>>({});

  // Load uses from localStorage on mount
  useEffect(() => {
    if (!characterId) return;
    try {
      const stored = localStorage.getItem(`ghanor:uses:${characterId}`);
      if (stored) setPowerUses(JSON.parse(stored));
    } catch { /* ignore */ }
  }, [characterId]);

  // Reset uses when rest/scene key increments
  useEffect(() => {
    if (!characterId || restKey === 0) return;
    setPowerUses({});
    try { localStorage.removeItem(`ghanor:uses:${characterId}`); } catch { /* ignore */ }
  }, [restKey, characterId]);

  function showToastMsg(msg: string) {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast(msg);
    toastRef.current = setTimeout(() => setToast(null), 2500);
  }

  function getRemainingUses(power: Power): number {
    if (power.uses_per_scene == null) return Infinity;
    return powerUses[power.id] ?? power.uses_per_scene;
  }

  const handleUseSpell = useCallback((spell: Spell) => {
    if (!onUseMp || mpCurrent < spell.mp_cost) return;
    const needsModal = !!(spell.dice || spell.amplify?.length || spell.save || spell.attack);
    if (needsModal) {
      setSpellModal({ spell, amplifyIndex: -1 });
      return;
    }
    onUseMp(spell.mp_cost);
    showToastMsg(`${spell.name} — ${spell.mp_cost} PM gastos`);
  }, [onUseMp, mpCurrent]);

  function handleUsePower(power: Power) {
    if (power.uses_per_scene == null) return;
    const current = getRemainingUses(power);
    if (current <= 0) return;
    const next = current - 1;
    const updated = { ...powerUses, [power.id]: next };
    setPowerUses(updated);
    try {
      if (characterId) localStorage.setItem(`ghanor:uses:${characterId}`, JSON.stringify(updated));
    } catch { /* ignore */ }
    showToastMsg(`${power.name} — ${next} uso${next !== 1 ? "s" : ""} restante${next !== 1 ? "s" : ""}`);
  }

  // ── DM mutations ──────────────────────────────────────────────
  function handleRemoveSpell(spellId: string) {
    if (!characterId) return;
    startDmTransition(async () => { await removeSpellFromCharacter(characterId, spellId); });
  }
  function handleAddSpell(spellId: string) {
    if (!characterId) return;
    startDmTransition(async () => { await addSpellToCharacter(characterId, spellId); });
  }
  function handleRemovePower(powerId: string) {
    if (!characterId) return;
    startDmTransition(async () => { await removePowerFromCharacter(characterId, powerId); });
  }
  function handleAddPower(powerId: string) {
    if (!characterId) return;
    startDmTransition(async () => { await addPowerToCharacter(characterId, powerId); });
  }

  // ── Resolve catalog entries ───────────────────────────────────
  const hasPowers = powerIds.length > 0;
  const hasSpells = spellIds.length > 0;
  if (!hasPowers && !hasSpells && !isDmMode) return null;

  const resolvedPowers = powerIds.map(resolvePower).filter((p): p is Power => p != null);
  const unknownPowers  = powerIds.filter((id) => !resolvePower(id));

  const resolvedSpells = spellIds.map(resolveSpell).filter((s): s is Spell => s != null);
  const unknownSpells  = spellIds.filter((id) => !resolveSpell(id));

  const spellsByCircle = new Map<number, Spell[]>();
  for (const spell of resolvedSpells) {
    if (!spellsByCircle.has(spell.circle)) spellsByCircle.set(spell.circle, []);
    spellsByCircle.get(spell.circle)!.push(spell);
  }
  const circles = Array.from(spellsByCircle.keys()).sort((a, b) => a - b);

  const availableSpells  = ALL_SPELLS.filter((s) => !spellIds.includes(s.id));
  const availablePowers  = ALL_POWERS.filter((p) => !powerIds.includes(p.id));

  return (
    <div className="space-y-4">
      {/* Spell use modal */}
      {spellModal && (
        <SpellUseModal
          spell={spellModal.spell}
          amplifyIndex={spellModal.amplifyIndex}
          onAmplifyChange={(i) => setSpellModal({ ...spellModal, amplifyIndex: i })}
          mpCurrent={mpCurrent}
          attrs={attrs}
          onConfirm={(totalMp) => {
            onUseMp?.(totalMp);
            const d = spellModal.spell.duration.toLowerCase();
            if (d.includes("concentração") || d.includes("cena")) {
              onAddEffect?.({
                id: `${spellModal.spell.id}-${Date.now()}`,
                spellId: spellModal.spell.id,
                name: spellModal.spell.name,
                duration: spellModal.spell.duration,
              });
            }
            showToastMsg(`${spellModal.spell.name} — ${totalMp} PM gastos`);
            setSpellModal(null);
          }}
          onClose={() => setSpellModal(null)}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 transition-opacity">
          {toast}
        </div>
      )}

      {/* Poderes */}
      {(hasPowers || isDmMode) && (
        <div className="relative">
          <SectionHeader label="Poderes" isDmMode={isDmMode} onAdd={() => setShowAddPowers(true)} />
          {showAddPowers && (
            <DmAddPanel
              items={availablePowers}
              onAdd={handleAddPower}
              onClose={() => setShowAddPowers(false)}
              placeholder="Buscar poder..."
            />
          )}
          <div className="space-y-1.5">
            {resolvedPowers.map((p) => (
              <PowerCard
                key={p.id}
                power={p}
                isDmMode={isDmMode}
                onRemove={() => handleRemovePower(p.id)}
                dmPending={dmPending}
                remainingUses={getRemainingUses(p)}
                onUse={handleUsePower}
              />
            ))}
          </div>
          {unknownPowers.length > 0 && (
            <div className="mt-1.5 space-y-0.5">
              {unknownPowers.map((id, i) => <p key={i} className="text-sm text-stone-600">• {id}</p>)}
            </div>
          )}
          {isDmMode && !hasPowers && (
            <p className="text-xs text-stone-400 italic">Nenhum poder aprendido.</p>
          )}
        </div>
      )}

      {/* Magias por círculo */}
      {(hasSpells || isDmMode) && (
        <div className="relative">
          <SectionHeader label="Magias" isDmMode={isDmMode} onAdd={() => setShowAddSpells(true)} />
          {showAddSpells && (
            <DmAddPanel
              items={availableSpells}
              onAdd={handleAddSpell}
              onClose={() => setShowAddSpells(false)}
              placeholder="Buscar magia..."
            />
          )}
          <div className="space-y-3">
            {circles.map((circle) => (
              <div key={circle}>
                <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wider mb-1.5">
                  {CIRCLE_LABELS[circle] ?? `Círculo ${circle}`}
                </p>
                <div className="space-y-1.5">
                  {spellsByCircle.get(circle)!.map((s) => (
                    <SpellCard
                      key={s.id}
                      spell={s}
                      isDmMode={isDmMode}
                      onRemove={() => handleRemoveSpell(s.id)}
                      dmPending={dmPending}
                      mpCurrent={mpCurrent}
                      onUse={handleUseSpell}
                    />
                  ))}
                </div>
              </div>
            ))}
            {unknownSpells.length > 0 && (
              <div>
                <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wider mb-1.5">Outras Magias</p>
                <div className="space-y-0.5">
                  {unknownSpells.map((id, i) => <p key={i} className="text-sm text-stone-600">• {id}</p>)}
                </div>
              </div>
            )}
            {isDmMode && !hasSpells && (
              <p className="text-xs text-stone-400 italic">Nenhuma magia aprendida.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
