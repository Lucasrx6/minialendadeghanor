"use client";

import { useState } from "react";
import { Swords, Dices, Crosshair, ChevronDown, ChevronRight } from "lucide-react";
import { RollDialog } from "@/components/dice/RollDialog";
import { type HitEffectType } from "@/components/dice/HitEffect";
import { hasWeaponProficiency } from "@/lib/ghanor/inventory";
import { useTilt } from "@/lib/hooks/useTilt";

type WeaponItem = {
  slug: string;
  name: string;
  weapon_damage_dice: string;
  weapon_critical: string;
  weapon_range: string | null;
  weapon_damage_type: string | null;
  weapon_proficiency: "simples" | "marcial" | "exotica";
  weapon_grip: string | null;
  weapon_abilities: string[];
};

type EquippedWeapon = {
  inventoryId: string;
  item: WeaponItem;
  improvements: number;
  is_arcanium: boolean;
  custom_label: string | null;
};

type Props = {
  weapons: EquippedWeapon[];
  strMod: number;
  dexMod: number;
  level: number;
  characterClass: string;
  fightBonus: number;
  aimBonus: number;
};

type RollConfig = { label: string; preModifier: number; preModifierBreakdown?: string; hitEffect?: HitEffectType };

const DAMAGE_LABELS: Record<string, string> = {
  corte: "Corte", impacto: "Impacto", perfuracao: "Perfuração",
  corte_perfuracao: "Corte/Perf.", impacto_perfuracao: "Imp./Perf.", corte_impacto: "Corte/Imp.",
};

const CRIT_LABELS: Record<string, string> = {
  x2: "×2", x3: "×3", x4: "×4",
  "19": "19-20/×2", "18": "18-20/×2", "19/x3": "19-20/×3",
};

function isRanged(item: WeaponItem): boolean {
  return item.weapon_range !== null && item.weapon_range !== "nenhum";
}

function computeAttackMod(
  item: WeaponItem, strMod: number, dexMod: number, level: number,
  hasProficiency: boolean, skillBonus: number,
): { total: number; breakdown: string; noProfPenalty: boolean } {
  const halfLevel = Math.floor(level / 2);
  const isLight = item.weapon_grip === "leve" || item.weapon_abilities?.includes("ligeira");
  const ranged = isRanged(item);
  const attrMod   = (ranged || isLight) ? dexMod : strMod;
  const attrLabel = (ranged || isLight) ? "Des" : "For";
  const noProfPenalty = !hasProficiency;
  const profMod = noProfPenalty ? -5 : 0;
  const total = attrMod + halfLevel + skillBonus + profMod;
  const parts = [`${attrLabel} ${attrMod >= 0 ? "+" : ""}${attrMod}`, `nível/2 +${halfLevel}`];
  if (skillBonus) parts.push(`perícia +${skillBonus}`);
  if (noProfPenalty) parts.push("sem prof. −5");
  return { total, breakdown: parts.join(" + ") + ` = ${total >= 0 ? "+" : ""}${total}`, noProfPenalty };
}

function damageLine(item: WeaponItem, strMod: number, dexMod: number): string {
  const isLight = item.weapon_grip === "leve" || item.weapon_abilities?.includes("ligeira");
  const ranged = isRanged(item);
  const mod = (ranged || isLight) ? dexMod : strMod;
  if (!item.weapon_damage_dice) return "—";
  const modStr = mod > 0 ? `+${mod}` : mod < 0 ? `${mod}` : "";
  return `${item.weapon_damage_dice}${modStr}`;
}

// ─── WeaponCard ───────────────────────────────────────────────────────────────

function WeaponCard({
  weapon, strMod, dexMod, level, characterClass, fightBonus, aimBonus, onRoll,
}: {
  weapon: EquippedWeapon; strMod: number; dexMod: number; level: number;
  characterClass: string; fightBonus: number; aimBonus: number;
  onRoll: (cfg: RollConfig) => void;
}) {
  const [open, setOpen] = useState(false);
  const tilt = useTilt(7);
  const { item } = weapon;
  const ranged = isRanged(item);
  const hasProficiency = hasWeaponProficiency(characterClass, item.weapon_proficiency);
  const skillBonus = ranged ? aimBonus : fightBonus;
  const { total: atkTotal, breakdown: atkBreakdown, noProfPenalty } = computeAttackMod(
    item, strMod, dexMod, level, hasProficiency, skillBonus,
  );
  const dmgLine = damageLine(item, strMod, dexMod);
  const critLabel = CRIT_LABELS[item.weapon_critical] ?? item.weapon_critical;
  const displayName = weapon.custom_label ?? item.name;
  const isLight = item.weapon_grip === "leve" || item.weapon_abilities?.includes("ligeira");
  const mod = (ranged || isLight) ? dexMod : strMod;

  const theme = ranged
    ? { gradFrom: "#0f172a", gradTo: "#1e293b", border: "#3b82f6", iconClr: "#93c5fd", accentBg: "rgba(59,130,246,0.15)" }
    : { gradFrom: "#1c1a17", gradTo: "#3c3330", border: "#d97706", iconClr: "#fcd34d", accentBg: "rgba(217,119,6,0.15)" };

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={{ transformStyle: "preserve-3d", transition: "transform 0.12s ease", borderRadius: "0.75rem" }}
    >
    <div
      className="flex flex-col rounded-xl overflow-hidden transition-all duration-150"
      style={{
        border: `1.5px solid ${open ? theme.border : theme.border + "40"}`,
        boxShadow: open ? `0 0 14px ${theme.border}25` : "none",
      }}
    >
      {/* Card face */}
      <button
        className="relative flex flex-col items-center gap-2 px-2 pt-5 pb-3 text-center focus:outline-none"
        style={{ background: `linear-gradient(160deg, ${theme.gradFrom} 0%, ${theme.gradTo} 100%)` }}
        onClick={() => setOpen((v) => !v)}
      >
        {/* Type badge */}
        <span
          className="absolute top-2 left-2 rounded-full px-1.5 py-0.5 text-[9px] font-black"
          style={{ background: `${theme.border}30`, color: theme.iconClr, border: `1px solid ${theme.border}40` }}
        >
          {ranged ? "Distância" : "C/C"}
        </span>

        {ranged
          ? <Crosshair size={32} style={{ color: theme.iconClr, filter: `drop-shadow(0 2px 8px ${theme.border}90)` }} />
          : <Swords   size={32} style={{ color: theme.iconClr, filter: `drop-shadow(0 2px 8px ${theme.border}90)` }} />
        }

        <p className="text-[11px] font-black leading-tight line-clamp-2 px-1 text-stone-100">
          {displayName}
          {weapon.improvements > 0 && <span style={{ color: theme.iconClr }}> +{weapon.improvements}</span>}
          {weapon.is_arcanium && <span className="ml-1 text-purple-300"> ✦</span>}
        </p>

        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-xl font-black" style={{ color: theme.iconClr }}>
              {atkTotal >= 0 ? "+" : ""}{atkTotal}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-stone-400">{ranged ? "Pontaria" : "Luta"}</p>
          </div>
          <div className="h-8 w-px bg-stone-700" />
          <div className="text-center">
            <p className="text-sm font-black text-stone-200">{dmgLine}</p>
            <p className="text-[9px] uppercase tracking-wider text-stone-400">Dano</p>
          </div>
        </div>

        {noProfPenalty && (
          <span className="rounded-full border border-red-700/30 bg-red-900/40 px-2 py-0.5 text-[9px] font-bold text-red-400">
            Sem prof. −5
          </span>
        )}
      </button>

      {/* Action bar */}
      <div className="flex gap-1 border-t bg-stone-900 p-1.5" style={{ borderColor: `${theme.border}25` }}>
        <button
          onClick={() => onRoll({ label: `Ataque — ${displayName}`, preModifier: atkTotal, preModifierBreakdown: atkBreakdown })}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-bold transition active:scale-95"
          style={{ background: theme.accentBg, color: theme.iconClr, border: `1px solid ${theme.border}35` }}
        >
          <Dices size={11} /> Ataque
        </button>
        <button
          onClick={() => onRoll({ label: `Dano — ${displayName}`, preModifier: mod, preModifierBreakdown: `mod ${mod >= 0 ? "+" : ""}${mod}`, hitEffect: ranged ? "arrow" : "slash" })}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-bold bg-stone-800 text-stone-300 transition hover:bg-stone-700 active:scale-95"
        >
          <Dices size={11} /> Dano
        </button>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg px-2 text-stone-500 hover:text-stone-300 transition bg-stone-800"
        >
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
      </div>

      {/* Expanded details */}
      <div className={`overflow-hidden transition-all duration-200 ${open ? "max-h-48" : "max-h-0"}`}>
        <div className="space-y-2 border-t bg-stone-900/90 px-3 py-3" style={{ borderColor: `${theme.border}25` }}>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <span className="text-stone-500">Crítico</span>
            <span className="font-bold text-stone-200">{critLabel}</span>
            {item.weapon_damage_type && (
              <>
                <span className="text-stone-500">Tipo</span>
                <span className="font-bold capitalize text-stone-200">{DAMAGE_LABELS[item.weapon_damage_type] ?? item.weapon_damage_type}</span>
              </>
            )}
            <span className="text-stone-500">Proficiência</span>
            <span className="font-bold capitalize text-stone-200">{item.weapon_proficiency}</span>
            {item.weapon_grip && (
              <>
                <span className="text-stone-500">Empunhadura</span>
                <span className="font-bold capitalize text-stone-200">{item.weapon_grip.replace("_", " ")}</span>
              </>
            )}
            {ranged && item.weapon_range && (
              <>
                <span className="text-stone-500">Alcance</span>
                <span className="font-bold text-stone-200">{item.weapon_range}</span>
              </>
            )}
          </div>
          {item.weapon_abilities?.length > 0 && (
            <p className="text-[11px]" style={{ color: theme.iconClr }}>✦ {item.weapon_abilities.join(", ")}</p>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

// ─── AttacksSection ───────────────────────────────────────────────────────────

export function AttacksSection({ weapons, strMod, dexMod, level, characterClass, fightBonus, aimBonus }: Props) {
  const [rollConfig, setRollConfig] = useState<RollConfig | null>(null);

  if (weapons.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 px-6 py-8 text-center text-sm text-stone-400">
        <Swords size={28} className="mx-auto mb-2 opacity-40" />
        <p>Nenhuma arma equipada.</p>
        <p className="mt-1 text-xs">Vá ao Inventário e clique em <strong>Equipar</strong> numa arma.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 items-start">
        {weapons.map((w) => (
          <WeaponCard
            key={w.inventoryId}
            weapon={w}
            strMod={strMod}
            dexMod={dexMod}
            level={level}
            characterClass={characterClass}
            fightBonus={fightBonus}
            aimBonus={aimBonus}
            onRoll={setRollConfig}
          />
        ))}
      </div>

      {rollConfig && (
        <RollDialog
          open={!!rollConfig}
          onClose={() => setRollConfig(null)}
          preLabel={rollConfig.label}
          preModifier={rollConfig.preModifier}
          preModifierBreakdown={rollConfig.preModifierBreakdown}
          hitEffect={rollConfig.hitEffect}
        />
      )}
    </div>
  );
}
