"use client";

import { useState, useTransition } from "react";
import { Swords, Dices, Crosshair } from "lucide-react";
import { RollDialog } from "@/components/dice/RollDialog";
import { hasWeaponProficiency } from "@/lib/ghanor/inventory";

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
  /** slug da classe principal para checar proficiência */
  characterClass: string;
  /** bônus de Luta do personagem */
  fightBonus: number;
  /** bônus de Pontaria do personagem */
  aimBonus: number;
};

const DAMAGE_LABELS: Record<string, string> = {
  corte: "Corte",
  impacto: "Impacto",
  perfuracao: "Perfuração",
  corte_perfuracao: "Corte/Perf.",
  impacto_perfuracao: "Imp./Perf.",
  corte_impacto: "Corte/Imp.",
};

const CRIT_LABELS: Record<string, string> = {
  x2: "×2", x3: "×3", x4: "×4",
  "19": "19-20/×2", "18": "18-20/×2",
  "19/x3": "19-20/×3",
};

// Decide se a arma usa Pontaria (distância) ou Luta (corpo a corpo)
function isRanged(item: WeaponItem): boolean {
  return item.weapon_range !== null && item.weapon_range !== "nenhum";
}

// Calcula o modificador de ataque total
function computeAttackMod(
  item: WeaponItem,
  strMod: number,
  dexMod: number,
  level: number,
  hasProficiency: boolean,
  skillBonus: number   // bônus de Luta ou Pontaria já treinado
): { total: number; breakdown: string; noProfPenalty: boolean } {
  const halfLevel = Math.floor(level / 2);
  const isLight = item.weapon_grip === "leve" || item.weapon_abilities?.includes("ligeira");
  const ranged = isRanged(item);

  // Ligeira: pode usar Destreza mesmo em corpo a corpo
  const attrMod = (ranged || isLight) ? dexMod : strMod;
  const attrLabel = (ranged || isLight) ? "Des" : "For";

  const noProfPenalty = !hasProficiency;
  const profMod = noProfPenalty ? -5 : 0;

  const total = attrMod + halfLevel + skillBonus + profMod;
  const parts = [
    `${attrLabel} ${attrMod >= 0 ? "+" : ""}${attrMod}`,
    `nível/2 +${halfLevel}`,
  ];
  if (skillBonus) parts.push(`perícia +${skillBonus}`);
  if (noProfPenalty) parts.push("sem prof. −5");
  const breakdown = parts.join(" + ") + ` = ${total >= 0 ? "+" : ""}${total}`;

  return { total, breakdown, noProfPenalty };
}

// Formata dado de dano com modificador de For/Des
function damageLine(item: WeaponItem, strMod: number, dexMod: number): string {
  const isLight = item.weapon_grip === "leve" || item.weapon_abilities?.includes("ligeira");
  const ranged = isRanged(item);
  const mod = (ranged || isLight) ? dexMod : strMod;

  const dice = item.weapon_damage_dice;
  if (!dice) return "—";
  const modStr = mod > 0 ? `+${mod}` : mod < 0 ? `${mod}` : "";
  return `${dice}${modStr}`;
}

export function AttacksSection({
  weapons, strMod, dexMod, level, characterClass, fightBonus, aimBonus,
}: Props) {
  const [rollConfig, setRollConfig] = useState<{
    label: string; preModifier: number; preModifierBreakdown?: string;
  } | null>(null);

  if (weapons.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 px-6 py-8 text-center text-stone-400 text-sm">
        <Swords size={28} className="mx-auto mb-2 opacity-40" />
        <p>Nenhuma arma equipada.</p>
        <p className="text-xs mt-1">Vá ao Inventário e clique em <strong>Equipar</strong> numa arma.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {weapons.map((w) => {
        const item = w.item;
        const ranged = isRanged(item);
        const hasProficiency = hasWeaponProficiency(characterClass, item.weapon_proficiency);
        const skillBonus = ranged ? aimBonus : fightBonus;
        const { total: atkTotal, breakdown: atkBreakdown, noProfPenalty } = computeAttackMod(
          item, strMod, dexMod, level, hasProficiency, skillBonus
        );
        const dmgLine = damageLine(item, strMod, dexMod);
        const critLabel = CRIT_LABELS[item.weapon_critical] ?? item.weapon_critical;
        const displayName = w.custom_label ?? item.name;
        const isLight = item.weapon_grip === "leve" || item.weapon_abilities?.includes("ligeira");
        const mod = (ranged || isLight) ? dexMod : strMod;

        return (
          <div
            key={w.inventoryId}
            className="rounded-xl border border-amber-200 bg-amber-50/60 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="text-amber-700">
                {ranged ? <Crosshair size={18} /> : <Swords size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-stone-900">
                  {displayName}
                  {w.improvements > 0 && (
                    <span className="ml-2 text-xs font-bold text-amber-700 bg-amber-200 rounded-full px-1.5 py-0.5">
                      +{w.improvements}
                    </span>
                  )}
                  {w.is_arcanium && (
                    <span className="ml-1 text-xs font-bold text-purple-700 bg-purple-100 rounded-full px-1.5 py-0.5">
                      Arcanium
                    </span>
                  )}
                </p>
                <p className="text-xs text-stone-500 capitalize">
                  {item.weapon_proficiency}
                  {" · "}
                  {item.weapon_grip?.replace("_", " ")}
                  {ranged && ` · ${item.weapon_range}`}
                  {item.weapon_damage_type && ` · ${DAMAGE_LABELS[item.weapon_damage_type] ?? item.weapon_damage_type}`}
                </p>
              </div>

              {noProfPenalty && (
                <span className="text-xs font-bold text-red-600 bg-red-100 rounded-full px-2 py-0.5">
                  Sem prof.
                </span>
              )}
            </div>

            {/* Stats + botões */}
            <div className="grid grid-cols-2 gap-px bg-amber-200">
              {/* Ataque */}
              <div className="bg-white px-4 py-2.5">
                <p className="text-xs text-stone-500 font-medium mb-0.5">
                  {ranged ? "Pontaria" : "Luta"}
                </p>
                <p className={`text-xl font-black ${noProfPenalty ? "text-red-600" : "text-stone-950"}`}>
                  {atkTotal >= 0 ? "+" : ""}{atkTotal}
                </p>
                <button
                  onClick={() => setRollConfig({
                    label: `Ataque — ${displayName}`,
                    preModifier: atkTotal,
                    preModifierBreakdown: atkBreakdown,
                  })}
                  className="mt-1.5 flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 transition"
                >
                  <Dices size={12} /> Rolar ataque
                </button>
              </div>

              {/* Dano */}
              <div className="bg-white px-4 py-2.5">
                <p className="text-xs text-stone-500 font-medium mb-0.5">
                  Dano · Crítico
                </p>
                <p className="text-xl font-black text-stone-950">{dmgLine}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-stone-400 mt-0.5">{critLabel}</p>
                  <button
                    onClick={() => setRollConfig({
                      label: `Dano — ${displayName}`,
                      preModifier: mod,
                      preModifierBreakdown: `modificador ${mod >= 0 ? "+" : ""}${mod}`,
                    })}
                    className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 transition"
                  >
                    <Dices size={12} /> Rolar dano
                  </button>
                </div>
              </div>
            </div>

            {/* Habilidades especiais */}
            {item.weapon_abilities?.length > 0 && (
              <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
                <p className="text-xs text-amber-800">
                  ✦ {item.weapon_abilities.join(", ")}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Modal de rolagem */}
      {rollConfig && (
        <RollDialog
          open={!!rollConfig}
          onClose={() => setRollConfig(null)}
          preLabel={rollConfig.label}
          preModifier={rollConfig.preModifier}
          preModifierBreakdown={rollConfig.preModifierBreakdown}
        />
      )}
    </div>
  );
}
