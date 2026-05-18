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
  Shield,
  ShieldAlert,
  X,
  Plus,
  Search,
  Play,
  Dices,
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
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  gradFrom: string; gradTo: string; border: string; iconClr: string; txtClr: string;
}> = {
  dano:        { label: "Dano",      Icon: Flame,    gradFrom: "#7c1d1d", gradTo: "#991b1b", border: "#ef4444", iconClr: "#fca5a5", txtClr: "#fee2e2" },
  cura:        { label: "Cura",      Icon: Heart,    gradFrom: "#14532d", gradTo: "#166534", border: "#22c55e", iconClr: "#86efac", txtClr: "#dcfce7" },
  buff:        { label: "Buff",      Icon: Sparkles, gradFrom: "#1e3a5f", gradTo: "#1e40af", border: "#3b82f6", iconClr: "#93c5fd", txtClr: "#dbeafe" },
  debuff:      { label: "Debuff",    Icon: Zap,      gradFrom: "#7c2d12", gradTo: "#9a3412", border: "#f97316", iconClr: "#fdba74", txtClr: "#ffedd5" },
  controle:    { label: "Controle",  Icon: Eye,      gradFrom: "#4a1d96", gradTo: "#5b21b6", border: "#a855f7", iconClr: "#d8b4fe", txtClr: "#ede9fe" },
  utilidade:   { label: "Utilidade", Icon: Wrench,   gradFrom: "#292524", gradTo: "#44403c", border: "#78716c", iconClr: "#d6d3d1", txtClr: "#f5f5f4" },
  "invocação": { label: "Invocação", Icon: Star,     gradFrom: "#134e4a", gradTo: "#115e59", border: "#14b8a6", iconClr: "#5eead4", txtClr: "#ccfbf1" },
};

const ACTIVATION_CONFIG: Record<PowerActivation, {
  label: string; bgClass: string; textClass: string;
  Icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}> = {
  passivo:       { label: "Passivo",     bgClass: "bg-stone-700",  textClass: "text-stone-300",  Icon: Shield    },
  "ação":        { label: "Ação",        bgClass: "bg-amber-800",  textClass: "text-amber-200",  Icon: Sword     },
  "ação rápida": { label: "Ação Rápida", bgClass: "bg-yellow-800", textClass: "text-yellow-200", Icon: Zap       },
  reação:        { label: "Reação",      bgClass: "bg-orange-800", textClass: "text-orange-200", Icon: ShieldAlert },
  livre:         { label: "Livre",       bgClass: "bg-emerald-800",textClass: "text-emerald-200",Icon: Star      },
};

const CIRCLE_LABELS: Record<number, string> = {
  1: "Círculo I", 2: "Círculo II", 3: "Círculo III", 4: "Círculo IV", 5: "Círculo V",
};

export type ActiveEffect = { id: string; spellId: string; name: string; duration: string };

// ─── Resolvers ────────────────────────────────────────────────────────────────

function resolveSpell(id: string): Spell | undefined { return spellById[id] ?? spellByName[id]; }
function resolvePower(id: string): Power | undefined { return powerById[id] ?? powerByName[id]; }

// ─── Dice formula parser ──────────────────────────────────────────────────────

const ATTR_ALIASES: Record<string, string> = {
  str: "str", for: "str", dex: "dex", des: "dex",
  con: "con", int: "int", sab: "wis", wis: "wis", car: "cha", cha: "cha",
};

function parseDice(
  formula: string,
  attrs: Record<string, number>,
): { counts: Partial<Record<4|6|8|10|12|20, number>>; modifier: number; modBreakdown: string } {
  const diceMatch = formula.match(/(\d+)d(\d+)/i);
  const attrMatch = formula.match(/[+-]([a-zA-Z]+|\d+)/);
  const count = diceMatch ? parseInt(diceMatch[1]) : 1;
  const sides  = diceMatch ? parseInt(diceMatch[2]) : 6;
  let modifier = 0, modBreakdown = "";
  if (attrMatch) {
    const token  = attrMatch[1].toLowerCase();
    const sign   = attrMatch[0].startsWith("-") ? -1 : 1;
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
  const safeSides  = validSides.includes(sides) ? sides : 6;
  return {
    counts: { [safeSides as 4|6|8|10|12|20]: count } as Partial<Record<4|6|8|10|12|20, number>>,
    modifier, modBreakdown,
  };
}

// ─── SpellCastEffect ──────────────────────────────────────────────────────────

function SpellCastEffect({ spell, totalMp, onDone }: { spell: Spell; totalMp: number; onDone: () => void }) {
  const ec = EFFECT_CONFIG[spell.effect_type] ?? EFFECT_CONFIG.utilidade;
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("show"), 30);
    const t2 = setTimeout(() => setPhase("exit"), 950);
    const t3 = setTimeout(onDone, 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = phase === "show";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transition: visible ? "opacity 0.15s ease-in" : "opacity 0.45s ease-out",
      }}
    >
      {/* Radial backdrop glow */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at center, ${ec.border}22 0%, transparent 60%)` }}
      />
      {/* Card */}
      <div
        className="relative flex flex-col items-center gap-3 rounded-3xl px-10 py-8 shadow-2xl"
        style={{
          background: `linear-gradient(145deg, ${ec.gradFrom}, ${ec.gradTo})`,
          border: `1.5px solid ${ec.border}`,
          boxShadow: `0 0 40px ${ec.border}50, 0 8px 32px rgba(0,0,0,0.6)`,
          transform: visible ? "scale(1)" : "scale(0.6)",
          transition: visible
            ? "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)"
            : "transform 0.25s ease-in",
        }}
      >
        <ec.Icon size={56} style={{ color: ec.iconClr, filter: `drop-shadow(0 0 12px ${ec.border})` }} />
        <p className="text-center text-xl font-black leading-tight" style={{ color: ec.txtClr }}>
          {spell.name}
        </p>
        <div
          className="rounded-full px-4 py-1 text-sm font-black"
          style={{ background: `${ec.border}28`, color: ec.iconClr, border: `1px solid ${ec.border}40` }}
        >
          −{totalMp} PM
        </div>
      </div>
    </div>
  );
}

// ─── SpellUseModal ────────────────────────────────────────────────────────────

function SpellUseModal({
  spell, amplifyIndex, onAmplifyChange, mpCurrent, attrs, onConfirm, onClose,
}: {
  spell: Spell; amplifyIndex: number; onAmplifyChange: (i: number) => void;
  mpCurrent: number;
  attrs?: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  onConfirm: (totalMp: number) => void; onClose: () => void;
}) {
  const [rollOpen, setRollOpen] = useState<"spell" | "attack" | null>(null);
  const ampEntry   = amplifyIndex >= 0 ? spell.amplify?.[amplifyIndex] : null;
  const extraMp    = ampEntry?.extra_mp ?? 0;
  const totalMp    = spell.mp_cost + extraMp;
  const canConfirm = mpCurrent >= totalMp;
  const effectiveAttrs = attrs ?? { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  const diceConfig = spell.dice ? parseDice(spell.dice, effectiveAttrs) : null;
  const ec = EFFECT_CONFIG[spell.effect_type] ?? EFFECT_CONFIG.utilidade;

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
        role="dialog" aria-modal="true"
      >
        <div className="w-full overflow-hidden rounded-t-3xl border border-stone-800 bg-stone-950 shadow-2xl sm:max-w-sm sm:rounded-2xl">
          <div className="flex justify-center pb-1 pt-3 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-stone-700" />
          </div>

          {/* Header */}
          <div className="flex items-start gap-3 px-5 pb-4 pt-4" style={{ borderBottom: `1px solid ${ec.border}30` }}>
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: `linear-gradient(135deg, ${ec.gradFrom}, ${ec.gradTo})`, border: `1px solid ${ec.border}60` }}
            >
              <ec.Icon size={24} style={{ color: ec.iconClr }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase text-stone-400">Usar magia</p>
              <h2 className="text-lg font-black leading-tight text-amber-50">{spell.name}</h2>
              <p className="text-xs text-stone-500">{spell.casting_time} · {spell.range} · {spell.target}</p>
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 text-stone-600 transition hover:bg-stone-800 hover:text-stone-300">
              <X size={16} />
            </button>
          </div>

          {/* Amplification */}
          {spell.amplify && spell.amplify.length > 0 && (
            <div className="space-y-1.5 px-5 py-4">
              <p className="text-xs font-semibold uppercase text-stone-400">Amplificação</p>
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
                    key={i} disabled={!affordable}
                    className={`w-full rounded-xl border p-3 text-left transition ${!affordable ? "cursor-not-allowed border-stone-800 bg-stone-900/50 opacity-40" : amplifyIndex === i ? "border-amber-600 bg-amber-900/25" : "border-stone-700 bg-stone-900 hover:border-stone-600"}`}
                    onClick={() => affordable && onAmplifyChange(i)}
                  >
                    <div className="flex items-center gap-2">
                      <RadioDotDark selected={amplifyIndex === i} />
                      <div>
                        <p className="text-sm font-bold text-amber-50">+{amp.extra_mp} PM — <span className="text-amber-300">{cost} total</span></p>
                        <p className="text-xs text-stone-400">{amp.effect}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Save / attack badges */}
          {(spell.save || spell.attack) && (
            <div className="flex flex-wrap gap-2 px-5 pb-4">
              {spell.save && (
                <div className="flex items-center gap-1.5 rounded-lg border border-amber-700/30 bg-amber-900/20 px-3 py-1.5 text-xs text-amber-200">
                  <Shield size={11} /> Alvo: teste de {spell.save}
                </div>
              )}
              {spell.attack && (
                <div className="flex items-center gap-1.5 rounded-lg border border-blue-700/30 bg-blue-900/20 px-3 py-1.5 text-xs text-blue-200">
                  <Swords size={11} /> Requer teste de ataque
                </div>
              )}
            </div>
          )}

          {/* Roll buttons */}
          {(spell.attack || diceConfig) && (
            <div className="space-y-2 px-5 pb-4">
              {spell.attack && (
                <button onClick={() => setRollOpen("attack")} className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-700/40 bg-blue-900/20 py-2.5 text-sm font-bold text-blue-200 transition hover:bg-blue-900/40">
                  <Dices size={14} /> Rolar ataque — 1d20
                </button>
              )}
              {diceConfig && (
                <button onClick={() => setRollOpen("spell")} className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-700/40 bg-amber-900/20 py-2.5 text-sm font-bold text-amber-200 transition hover:bg-amber-900/40">
                  <Dices size={14} /> Rolar {spell.dice}
                  {diceConfig.modBreakdown && <span className="text-xs text-amber-400/70">({diceConfig.modBreakdown})</span>}
                </button>
              )}
            </div>
          )}

          {/* Confirm */}
          <div className="px-5 pb-5">
            {!canConfirm && <p className="mb-2 text-center text-xs text-red-400">PM insuficiente ({mpCurrent}/{totalMp})</p>}
            <button
              disabled={!canConfirm}
              onClick={() => onConfirm(totalMp)}
              className="w-full rounded-xl py-4 text-base font-black uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: canConfirm ? `linear-gradient(135deg, ${ec.gradFrom}, ${ec.gradTo})` : "#1f2937",
                color: canConfirm ? ec.txtClr : "#6b7280",
                border: canConfirm ? `1px solid ${ec.border}50` : "none",
                boxShadow: canConfirm ? `0 4px 20px ${ec.border}45` : "none",
              }}
            >
              Lançar Magia — {totalMp} PM
            </button>
          </div>
        </div>
      </div>

      {rollOpen && (
        <RollDialog
          open={!!rollOpen} onClose={() => setRollOpen(null)}
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
    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition ${selected ? "border-amber-500 bg-amber-500" : "border-stone-600"}`}>
      {selected && <span className="h-2 w-2 rounded-full bg-stone-950" />}
    </span>
  );
}

// ─── DM Add Panel ─────────────────────────────────────────────────────────────

function DmAddPanel<T extends { id: string; name: string }>({
  items, onAdd, onClose, placeholder,
}: { items: T[]; onAdd: (id: string) => void; onClose: () => void; placeholder: string }) {
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const filtered = items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} className="absolute z-20 left-0 right-0 mt-1 rounded-xl border border-indigo-200 bg-white shadow-xl overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-indigo-100">
        <Search size={13} className="text-stone-400 shrink-0" />
        <input
          autoFocus
          className="flex-1 text-sm outline-none placeholder:text-stone-400"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={14} /></button>
      </div>
      <ul className="max-h-56 overflow-y-auto divide-y divide-stone-100">
        {filtered.length === 0 ? (
          <li className="px-3 py-2 text-xs text-stone-400">Nenhum resultado.</li>
        ) : filtered.map((item) => (
          <li key={item.id}>
            <button className="w-full px-3 py-1.5 text-left text-sm hover:bg-indigo-50 transition" onClick={() => { onAdd(item.id); onClose(); }}>
              {item.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── SpellCard (grid) ─────────────────────────────────────────────────────────

function SpellCard({
  spell, isDmMode, onRemove, dmPending, mpCurrent, onUse,
}: {
  spell: Spell; isDmMode: boolean; onRemove: () => void;
  dmPending: boolean; mpCurrent: number; onUse: (spell: Spell) => void;
}) {
  const [open, setOpen] = useState(false);
  const ec = EFFECT_CONFIG[spell.effect_type] ?? EFFECT_CONFIG.utilidade;
  const canUse = mpCurrent >= spell.mp_cost;

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden transition-all duration-150"
      style={{ border: `1.5px solid ${open ? ec.border : ec.border + "40"}`, boxShadow: open ? `0 0 12px ${ec.border}30` : "none" }}
    >
      {/* Main face */}
      <button
        className="relative flex flex-col items-center justify-center gap-1.5 px-2 pt-5 pb-3 text-center focus:outline-none"
        style={{ background: `linear-gradient(160deg, ${ec.gradFrom} 0%, ${ec.gradTo} 100%)` }}
        onClick={() => setOpen((v) => !v)}
      >
        {/* Circle badge */}
        <span
          className="absolute top-2 left-2 rounded-full px-1.5 py-0.5 text-[9px] font-black"
          style={{ background: `${ec.border}35`, color: ec.iconClr, border: `1px solid ${ec.border}50` }}
        >
          C{spell.circle}
        </span>

        {/* DM remove */}
        {isDmMode && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            onKeyDown={(e) => e.key === "Enter" && onRemove()}
            className="absolute top-1.5 right-1.5 rounded-full p-0.5 text-white/30 hover:text-white/70 transition cursor-pointer"
          >
            <X size={11} />
          </span>
        )}

        <ec.Icon
          size={32}
          style={{ color: ec.iconClr, filter: `drop-shadow(0 2px 6px ${ec.border}80)` }}
        />
        <p className="text-[11px] font-black leading-tight line-clamp-2 px-1" style={{ color: ec.txtClr }}>
          {spell.name}
        </p>
        {spell.dice && (
          <p className="text-[10px] font-bold" style={{ color: ec.iconClr }}>
            {spell.dice}
          </p>
        )}
        <div
          className="mt-0.5 rounded-full px-2.5 py-0.5 text-[11px] font-black"
          style={{ background: `${ec.border}28`, color: ec.border, border: `1px solid ${ec.border}40` }}
        >
          {spell.mp_cost} PM
        </div>
      </button>

      {/* Action bar */}
      <div className="flex items-center justify-between bg-stone-900 border-t px-2 py-1.5" style={{ borderColor: `${ec.border}25` }}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-stone-500 hover:text-stone-300 transition"
          title={open ? "Recolher" : "Ver detalhes"}
        >
          {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onUse(spell); }}
          disabled={!canUse}
          title={canUse ? `Usar ${spell.name} (${spell.mp_cost} PM)` : "PM insuficiente"}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          style={canUse ? {
            background: `linear-gradient(135deg, ${ec.gradFrom}, ${ec.gradTo})`,
            color: ec.txtClr,
            border: `1px solid ${ec.border}50`,
          } : { background: "#1f2937", color: "#4b5563" }}
        >
          <Play size={10} fill="currentColor" />
          Usar
        </button>
      </div>

      {/* Expanded details */}
      <div className={`overflow-hidden transition-all duration-200 ${open ? "max-h-72" : "max-h-0"}`}>
        <div className="space-y-2 border-t bg-stone-900/90 px-3 py-3" style={{ borderColor: `${ec.border}25` }}>
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-stone-400">
            <span>{spell.casting_time}</span>
            <span>·</span>
            <span>{spell.range}</span>
            <span>·</span>
            <span>{spell.target}</span>
            <span>·</span>
            <span>{spell.duration}</span>
            {spell.save && <><span>·</span><span className="font-semibold" style={{ color: ec.iconClr }}>Teste: {spell.save}</span></>}
          </div>
          <p className="text-xs leading-relaxed text-stone-300">{spell.description}</p>
          {spell.amplify && spell.amplify.length > 0 && (
            <div className="space-y-0.5 border-t border-stone-800 pt-1.5">
              {spell.amplify.map((a, i) => (
                <p key={i} className="text-[11px] text-indigo-400">
                  <span className="font-semibold">+{a.extra_mp} PM:</span> {a.effect}
                </p>
              ))}
            </div>
          )}
          {!canUse && (
            <p className="text-[11px] font-semibold text-red-400">
              PM insuficiente ({mpCurrent}/{spell.mp_cost})
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PowerCard (grid) ─────────────────────────────────────────────────────────

function PowerCard({
  power, isDmMode, onRemove, dmPending, remainingUses, onUse,
}: {
  power: Power; isDmMode: boolean; onRemove: () => void;
  dmPending: boolean; remainingUses: number; onUse: (power: Power) => void;
}) {
  const [open, setOpen] = useState(false);
  const ac = ACTIVATION_CONFIG[power.activation] ?? ACTIVATION_CONFIG.passivo;
  const hasUses  = power.uses_per_scene != null;
  const canUse   = hasUses && remainingUses > 0;
  const exhausted = hasUses && remainingUses === 0;
  const dots = Math.min(power.uses_per_scene ?? 0, 6);

  return (
    <div
      className={`flex flex-col rounded-xl overflow-hidden transition-all duration-150 ${exhausted ? "opacity-55" : ""}`}
      style={{ border: `1.5px solid ${open ? "#b45309" : "rgba(120,113,108,0.25)"}` }}
    >
      {/* Main face */}
      <button
        className="relative flex flex-col items-center justify-center gap-1.5 px-2 pt-5 pb-3 text-center focus:outline-none"
        style={{
          background: exhausted
            ? "linear-gradient(160deg, #1c1917, #292524)"
            : "linear-gradient(160deg, #292524, #3c3330)",
        }}
        onClick={() => setOpen((v) => !v)}
      >
        {/* Activation badge */}
        <span className={`absolute top-2 left-2 rounded-full px-1.5 py-0.5 text-[9px] font-black ${ac.bgClass} ${ac.textClass}`}>
          {ac.label}
        </span>

        {isDmMode && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); if (!dmPending) onRemove(); }}
            onKeyDown={(e) => e.key === "Enter" && onRemove()}
            className="absolute top-1.5 right-1.5 rounded-full p-0.5 text-white/30 hover:text-white/70 transition cursor-pointer"
          >
            <X size={11} />
          </span>
        )}

        <ac.Icon
          size={30}
          className={exhausted ? "text-stone-600" : "text-amber-400"}
          style={exhausted ? {} : { filter: "drop-shadow(0 2px 6px #f59e0b80)" }}
        />
        <p className={`text-[11px] font-black leading-tight line-clamp-2 px-1 ${exhausted ? "text-stone-500" : "text-stone-100"}`}>
          {power.name}
        </p>

        {/* Uses dots */}
        {hasUses && (
          <div className="flex items-center gap-1 mt-0.5">
            {Array.from({ length: dots }).map((_, i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full transition-colors"
                style={{ background: i < remainingUses ? "#f59e0b" : "#374151" }}
              />
            ))}
            {(power.uses_per_scene ?? 0) > 6 && (
              <span className="text-[10px] text-stone-500 font-bold ml-0.5">
                {remainingUses}/{power.uses_per_scene}
              </span>
            )}
          </div>
        )}

        {!hasUses && power.mp_cost != null && (
          <div className="mt-0.5 rounded-full bg-indigo-900/60 px-2.5 py-0.5 text-[11px] font-black text-indigo-300 border border-indigo-700/40">
            {power.mp_cost} PM
          </div>
        )}
      </button>

      {/* Action bar */}
      <div className="flex items-center justify-between border-t border-stone-800 bg-stone-900 px-2 py-1.5">
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-stone-500 hover:text-stone-300 transition"
          title={open ? "Recolher" : "Ver detalhes"}
        >
          {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
        {hasUses && (
          <button
            onClick={(e) => { e.stopPropagation(); onUse(power); }}
            disabled={!canUse}
            title={exhausted ? "Usos esgotados" : `Usar ${power.name}`}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
            style={canUse ? {
              background: "linear-gradient(135deg, #78350f, #b45309)",
              color: "#fef3c7",
              border: "1px solid #d9770650",
            } : { background: "#1f2937", color: "#4b5563" }}
          >
            <Play size={10} fill="currentColor" />
            {exhausted ? "Esgotado" : "Usar"}
          </button>
        )}
      </div>

      {/* Expanded details */}
      <div className={`overflow-hidden transition-all duration-200 ${open ? "max-h-72" : "max-h-0"}`}>
        <div className="space-y-2 border-t border-stone-800 bg-stone-900/90 px-3 py-3">
          {(power.class || power.tier || power.prerequisite) && (
            <div className="flex flex-wrap gap-1 text-[11px]">
              {power.class      && <span className="rounded bg-amber-100 px-1.5 py-0.5 capitalize text-amber-700">{power.class}</span>}
              {power.tier       && <span className="rounded bg-indigo-100 px-1.5 py-0.5 capitalize text-indigo-700">{power.tier}</span>}
              {power.prerequisite && <span className="text-stone-500">Req: {power.prerequisite}</span>}
            </div>
          )}
          <p className="text-xs leading-relaxed text-stone-300">{power.description}</p>
          {power.dice && <p className="text-[11px] font-semibold text-amber-400">{power.dice}</p>}
          {exhausted && <p className="text-[11px] font-semibold text-red-400">Usos esgotados — recupera na próxima cena.</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ label, isDmMode, onAdd }: { label: string; isDmMode: boolean; onAdd?: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">{label}</p>
      {isDmMode && onAdd && (
        <button onClick={onAdd} className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 transition">
          <Plus size={12} /> Adicionar
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
  restKey?: number;
  attrs?: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
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
  const [castEffect, setCastEffect] = useState<{ spell: Spell; totalMp: number } | null>(null);

  // ── Power uses ────────────────────────────────────────────────
  const [powerUses, setPowerUses] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!characterId) return;
    try {
      const stored = localStorage.getItem(`ghanor:uses:${characterId}`);
      if (stored) setPowerUses(JSON.parse(stored));
    } catch { /* ignore */ }
  }, [characterId]);

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
    if (needsModal) { setSpellModal({ spell, amplifyIndex: -1 }); return; }
    onUseMp(spell.mp_cost);
    setCastEffect({ spell, totalMp: spell.mp_cost });
    showToastMsg(`${spell.name} — ${spell.mp_cost} PM gastos`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ── Resolve ───────────────────────────────────────────────────
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

  const availableSpells = ALL_SPELLS.filter((s) => !spellIds.includes(s.id));
  const availablePowers = ALL_POWERS.filter((p) => !powerIds.includes(p.id));

  return (
    <div className="space-y-5">
      {/* Spell cast visual effect */}
      {castEffect && (
        <SpellCastEffect
          spell={castEffect.spell}
          totalMp={castEffect.totalMp}
          onDone={() => setCastEffect(null)}
        />
      )}

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
            setCastEffect({ spell: spellModal.spell, totalMp });
            showToastMsg(`${spellModal.spell.name} — ${totalMp} PM gastos`);
            setSpellModal(null);
          }}
          onClose={() => setSpellModal(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          {toast}
        </div>
      )}

      {/* ── Poderes ── */}
      {(hasPowers || isDmMode) && (
        <div className="relative">
          <SectionHeader label="Poderes" isDmMode={isDmMode} onAdd={() => setShowAddPowers(true)} />
          {showAddPowers && (
            <DmAddPanel items={availablePowers} onAdd={handleAddPower} onClose={() => setShowAddPowers(false)} placeholder="Buscar poder..." />
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {resolvedPowers.map((p) => (
              <PowerCard
                key={p.id} power={p} isDmMode={isDmMode}
                onRemove={() => handleRemovePower(p.id)} dmPending={dmPending}
                remainingUses={getRemainingUses(p)} onUse={handleUsePower}
              />
            ))}
          </div>
          {unknownPowers.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {unknownPowers.map((id, i) => <p key={i} className="text-sm text-stone-500">• {id}</p>)}
            </div>
          )}
          {isDmMode && !hasPowers && <p className="text-xs italic text-stone-400">Nenhum poder aprendido.</p>}
        </div>
      )}

      {/* ── Magias por círculo ── */}
      {(hasSpells || isDmMode) && (
        <div className="relative space-y-4">
          <SectionHeader label="Magias" isDmMode={isDmMode} onAdd={() => setShowAddSpells(true)} />
          {showAddSpells && (
            <DmAddPanel items={availableSpells} onAdd={handleAddSpell} onClose={() => setShowAddSpells(false)} placeholder="Buscar magia..." />
          )}

          {circles.map((circle) => (
            <div key={circle}>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                {CIRCLE_LABELS[circle] ?? `Círculo ${circle}`}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {spellsByCircle.get(circle)!.map((s) => (
                  <SpellCard
                    key={s.id} spell={s} isDmMode={isDmMode}
                    onRemove={() => handleRemoveSpell(s.id)} dmPending={dmPending}
                    mpCurrent={mpCurrent} onUse={handleUseSpell}
                  />
                ))}
              </div>
            </div>
          ))}

          {unknownSpells.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-400">Outras Magias</p>
              <div className="space-y-0.5">
                {unknownSpells.map((id, i) => <p key={i} className="text-sm text-stone-500">• {id}</p>)}
              </div>
            </div>
          )}
          {isDmMode && !hasSpells && <p className="text-xs italic text-stone-400">Nenhuma magia aprendida.</p>}
        </div>
      )}
    </div>
  );
}
