"use client";

import { useState } from "react";
import { Skull, Plus, Shield, Dices, Swords, CheckCircle, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { RollDialog } from "@/components/dice/RollDialog";
import { AddEnemyModal } from "@/components/arena/AddEnemyModal";
import {
  enemyById, CATEGORY_THEME, CATEGORY_LABELS, ENEMY_TIER_LABELS, STATUS_EFFECTS,
  type EnemyTemplate,
} from "@/lib/ghanor/bestiary";
import {
  dmAddEnemy, dmAdjustEnemyHp, dmToggleEnemyStatus,
  dmDefeatEnemy, dmRemoveEnemy,
} from "@/app/actions/arena";
import type { ArenaEnemy } from "@/app/actions/arena";

type RollConfig = { label: string; preModifier: number; preModifierBreakdown?: string };

type Props = {
  arenaId: string;
  initialEnemies: ArenaEnemy[];
};

// ─── Barra de PV ─────────────────────────────────────────────────────────────

function HpBar({ current, max, themeColor }: { current: number; max: number; themeColor: string }) {
  const pct = max > 0 ? Math.round((current / max) * 100) : 0;
  const barColor = pct > 50 ? "#22c55e" : pct > 25 ? "#eab308" : pct > 0 ? "#ef4444" : "#374151";
  return (
    <div className="h-2 rounded-full bg-stone-800 overflow-hidden w-full">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, background: barColor }}
      />
    </div>
  );
}

// ─── Card de Inimigo ──────────────────────────────────────────────────────────

function EnemyCard({
  enemy, arenaId, onRoll, onUpdated, onRemoved,
}: {
  enemy: ArenaEnemy;
  arenaId: string;
  onRoll: (cfg: RollConfig) => void;
  onUpdated: (id: string, patch: Partial<ArenaEnemy>) => void;
  onRemoved: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pendingHp, setPendingHp] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(false);

  const template = enemyById[enemy.template_id];
  const theme = CATEGORY_THEME[template?.category ?? "humanoide"];
  const displayName = enemy.custom_name ?? template?.name ?? enemy.template_id;
  const hpPct = enemy.hp_max > 0 ? Math.round((enemy.hp_current / enemy.hp_max) * 100) : 0;
  const dmgStr = enemy.damage_mod !== 0
    ? `${enemy.damage_dice}${enemy.damage_mod > 0 ? "+" : ""}${enemy.damage_mod}`
    : enemy.damage_dice;

  async function adjustHp(delta: number) {
    if (pendingHp) return;
    const optimisticHp = Math.max(0, Math.min(enemy.hp_max, enemy.hp_current + delta));
    onUpdated(enemy.id, { hp_current: optimisticHp, is_defeated: optimisticHp === 0 });
    setPendingHp(true);
    const res = await dmAdjustEnemyHp({ arenaId, enemyId: enemy.id, delta });
    setPendingHp(false);
    if ("error" in res) onUpdated(enemy.id, { hp_current: enemy.hp_current });
  }

  async function toggleStatus(statusId: string) {
    if (pendingStatus) return;
    const current = enemy.status_effects ?? [];
    const updated = current.includes(statusId)
      ? current.filter((s) => s !== statusId)
      : [...current, statusId];
    onUpdated(enemy.id, { status_effects: updated });
    setPendingStatus(true);
    await dmToggleEnemyStatus({ arenaId, enemyId: enemy.id, status: statusId });
    setPendingStatus(false);
  }

  async function handleDefeat() {
    onUpdated(enemy.id, { hp_current: 0, is_defeated: true });
    await dmDefeatEnemy({ arenaId, enemyId: enemy.id });
  }

  async function handleRemove() {
    onRemoved(enemy.id);
    await dmRemoveEnemy({ arenaId, enemyId: enemy.id });
  }

  return (
    <div
      className={`rounded-xl overflow-hidden border transition-all ${enemy.is_defeated ? "opacity-50 grayscale" : ""}`}
      style={{ borderColor: enemy.is_defeated ? "#374151" : theme.border + "50" }}
    >
      {/* Card face */}
      <div
        className="px-3 pt-3 pb-2"
        style={{ background: `linear-gradient(160deg, ${theme.gradFrom}, ${theme.gradTo})` }}
      >
        {/* Header */}
        <div className="flex items-start gap-2 mb-2">
          <span className="text-3xl leading-none shrink-0">{template?.emoji ?? "👾"}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-black text-sm text-stone-100 leading-tight">{displayName}</p>
              {enemy.is_defeated && (
                <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold bg-stone-800 text-stone-400 border border-stone-700">
                  Derrotado
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[10px]">
              <span className="text-stone-400">Nv. {template?.level}</span>
              {template && (
                <span className={`rounded-full px-1.5 py-0.5 font-bold border ${theme.badge}`} style={{ fontSize: "9px" }}>
                  {CATEGORY_LABELS[template.category]}
                </span>
              )}
              {template && (
                <span className="text-stone-500">{ENEMY_TIER_LABELS[template.tier]}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-stone-500 hover:text-stone-300 transition shrink-0 mt-0.5"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {/* HP bar */}
        <div className="mb-1.5">
          <div className="flex items-center justify-between mb-1 text-[10px]">
            <span className="flex items-center gap-1 text-stone-400 font-bold uppercase">
              ♥ PV
            </span>
            <span className="font-black text-stone-200">
              {enemy.hp_current}
              <span className="font-normal text-stone-500">/{enemy.hp_max}</span>
              <span className="text-stone-500 ml-1">({hpPct}%)</span>
            </span>
          </div>
          <HpBar current={enemy.hp_current} max={enemy.hp_max} themeColor={theme.border} />
        </div>

        {/* HP quick controls */}
        <div className="flex gap-1 mt-2">
          {([-10, -5, -1] as const).map((d) => (
            <button
              key={d}
              onClick={() => adjustHp(d)}
              disabled={pendingHp || enemy.hp_current === 0}
              className="flex-1 rounded-lg py-1 text-[10px] font-black text-red-300 border border-red-900/40 bg-red-950/30 transition hover:bg-red-900/50 active:scale-95 disabled:opacity-30"
            >
              {d}
            </button>
          ))}
          <div className="w-px bg-stone-700 mx-0.5" />
          {([1, 5, 10] as const).map((d) => (
            <button
              key={d}
              onClick={() => adjustHp(d)}
              disabled={pendingHp || enemy.hp_current >= enemy.hp_max}
              className="flex-1 rounded-lg py-1 text-[10px] font-black text-emerald-300 border border-emerald-900/40 bg-emerald-950/30 transition hover:bg-emerald-900/50 active:scale-95 disabled:opacity-30"
            >
              +{d}
            </button>
          ))}
        </div>
      </div>

      {/* Attack / Damage row */}
      <div className="flex gap-1 px-2 py-1.5 bg-stone-900 border-t" style={{ borderColor: theme.border + "20" }}>
        <span className="flex items-center gap-0.5 text-[10px] text-stone-500 mr-1">
          <Shield size={9} /> {enemy.defense}
        </span>
        <div className="w-px bg-stone-800 mx-1" />
        <button
          onClick={() => onRoll({
            label: `Ataque — ${displayName}`,
            preModifier: enemy.attack_bonus,
            preModifierBreakdown: `Luta ${enemy.attack_bonus >= 0 ? "+" : ""}${enemy.attack_bonus}`,
          })}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold transition active:scale-95"
          style={{ background: theme.border + "18", color: theme.iconClr, border: `1px solid ${theme.border}30` }}
        >
          <Dices size={10} /> Ataque {enemy.attack_bonus >= 0 ? "+" : ""}{enemy.attack_bonus}
        </button>
        <button
          onClick={() => onRoll({
            label: `Dano — ${displayName} (${dmgStr})`,
            preModifier: enemy.damage_mod,
            preModifierBreakdown: enemy.damage_mod !== 0 ? `mod ${enemy.damage_mod >= 0 ? "+" : ""}${enemy.damage_mod}` : undefined,
          })}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold bg-stone-800 text-stone-300 transition hover:bg-stone-700 active:scale-95"
        >
          <Swords size={10} /> {dmgStr}
        </button>
      </div>

      {/* Status effects */}
      <div className="px-2 pb-1.5 bg-stone-900 border-t" style={{ borderColor: theme.border + "15" }}>
        <div className="flex flex-wrap gap-1 pt-1.5">
          {STATUS_EFFECTS.map((se) => {
            const active = enemy.status_effects?.includes(se.id);
            return (
              <button
                key={se.id}
                onClick={() => toggleStatus(se.id)}
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold border transition ${
                  active ? se.cls : "bg-stone-900 text-stone-600 border-stone-700 hover:border-stone-500"
                }`}
              >
                {se.emoji} {se.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded: abilities + attrs */}
      {expanded && template && (
        <div className="bg-stone-950 border-t px-3 py-2.5" style={{ borderColor: theme.border + "20" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: theme.iconClr }}>
            Habilidades
          </p>
          <ul className="space-y-1 mb-2">
            {template.abilities.map((ab, i) => (
              <li key={i} className="text-[11px] text-stone-300 leading-snug">• {ab}</li>
            ))}
          </ul>
          <div className="grid grid-cols-6 gap-1 text-[10px] text-stone-400">
            {(["str","dex","con","int","wis","cha"] as const).map((a) => (
              <div key={a} className="text-center">
                <p className="uppercase font-bold" style={{ color: theme.iconClr }}>{a}</p>
                <p>{template[`attr_${a}`] >= 0 ? "+" : ""}{template[`attr_${a}`]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer: defeat / remove */}
      <div className="flex gap-1 px-2 pb-2 bg-stone-900 pt-1">
        {!enemy.is_defeated ? (
          <button
            onClick={handleDefeat}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold text-amber-400 border border-amber-900/40 bg-amber-950/20 transition hover:bg-amber-900/30 active:scale-95"
          >
            <CheckCircle size={11} /> Derrotado
          </button>
        ) : (
          <div className="flex-1 text-center text-[10px] text-stone-600 font-bold py-1.5">
            ✓ Derrotado
          </div>
        )}
        <button
          onClick={handleRemove}
          className="rounded-lg px-2 py-1.5 text-[10px] font-bold text-red-400 border border-red-900/30 bg-red-950/20 transition hover:bg-red-900/30 active:scale-95"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

// ─── ArenaEnemyPanel ──────────────────────────────────────────────────────────

export function ArenaEnemyPanel({ arenaId, initialEnemies }: Props) {
  const [enemies, setEnemies] = useState<ArenaEnemy[]>(initialEnemies);
  const [showModal, setShowModal] = useState(false);
  const [rollConfig, setRollConfig] = useState<RollConfig | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  function handleUpdated(id: string, patch: Partial<ArenaEnemy>) {
    setEnemies((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function handleRemoved(id: string) {
    setEnemies((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleAdd(template: EnemyTemplate) {
    setIsAdding(true);
    const res = await dmAddEnemy({
      arenaId,
      templateId: template.id,
      hp: template.hp,
      defense: template.defense,
      attackBonus: template.attack_bonus,
      damageDice: template.damage_dice,
      damageMod: template.damage_mod,
    });
    setIsAdding(false);
    if ("ok" in res) {
      setEnemies((prev) => [...prev, res.enemy]);
    }
  }

  // Sync with realtime updates from parent (ArenaDashboard passes them down)
  // We also expose a method for ArenaDashboard to call directly
  const active = enemies.filter((e) => !e.is_defeated);
  const defeated = enemies.filter((e) => e.is_defeated);

  return (
    <div className="rounded-2xl border border-red-900/20 bg-red-950/5 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skull size={16} className="text-red-400" />
          <h2 className="font-black text-stone-900 text-sm">Inimigos</h2>
          {enemies.length > 0 && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700">
              {active.length} ativo{active.length !== 1 ? "s" : ""}
              {defeated.length > 0 && ` · ${defeated.length} derrotado${defeated.length !== 1 ? "s" : ""}`}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={isAdding}
          className="flex items-center gap-1.5 rounded-xl bg-red-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-600 active:scale-95 disabled:opacity-50"
        >
          <Plus size={12} /> Adicionar
        </button>
      </div>

      {/* Enemy grid */}
      {enemies.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-red-900/20 py-8 text-center">
          <Skull size={24} className="mx-auto mb-2 text-red-900/40" />
          <p className="text-sm text-stone-500">Nenhum inimigo na batalha.</p>
          <p className="text-xs text-stone-400 mt-1">Clique em <strong>Adicionar</strong> para inserir criaturas.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {active.map((e) => (
            <EnemyCard
              key={e.id}
              enemy={e}
              arenaId={arenaId}
              onRoll={setRollConfig}
              onUpdated={handleUpdated}
              onRemoved={handleRemoved}
            />
          ))}
          {defeated.map((e) => (
            <EnemyCard
              key={e.id}
              enemy={e}
              arenaId={arenaId}
              onRoll={setRollConfig}
              onUpdated={handleUpdated}
              onRemoved={handleRemoved}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <AddEnemyModal
          onAdd={(template) => { handleAdd(template); }}
          onClose={() => setShowModal(false)}
        />
      )}

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
