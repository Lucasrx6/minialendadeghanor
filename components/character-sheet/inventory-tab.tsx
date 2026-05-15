"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Package, Sword, Shield, Shirt, Beaker, Star, Clock,
  Plus, Minus, ShoppingBag, ArrowUpDown, Trash2, Pencil, ChevronDown
} from "lucide-react";
import {
  formatMoney, formatMoneyPP, carryCapacity, maxCarryCapacity, totalSpaces,
  isOverloaded, maxWornItems, priceWithArcanium,
} from "@/lib/ghanor/inventory";
import {
  moveItem, sellItem, adjustQuantity, type InventoryLocation
} from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ItemRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price_pc: number;
  spaces: number;
  description: string | null;
  weapon_proficiency: string | null;
  weapon_grip: string | null;
  weapon_damage_dice: string | null;
  weapon_critical: string | null;
  weapon_range: string | null;
  weapon_damage_type: string | null;
  weapon_abilities: string[];
  armor_category: string | null;
  armor_defense_bonus: number | null;
  armor_penalty: number | null;
  is_stackable: boolean;
};

type InvEntry = {
  id: string;
  quantity: number;
  location: string;
  improvements: number;
  is_arcanium: boolean;
  arcanium_spell_circle: number | null;
  notes: string | null;
  custom_label: string | null;
  acquired_from: string | null;
  acquired_at: string;
  custom_name: string | null;
  custom_data: Record<string, unknown> | null;
  items: ItemRow | null;
};

type MoneyTx = {
  id: string;
  amount_pc: number;
  reason: string;
  balance_after_pc: number;
  created_at: string;
};

type Props = {
  characterId: string;
  strMod: number;
  level: number;
  moneyPc: number;
  inventory: InvEntry[];
  transactions: MoneyTx[];
  characterClass: string;
};

// ─── Utils ────────────────────────────────────────────────────────────────────

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  arma:                   <Sword size={14} />,
  armadura:               <Shield size={14} />,
  escudo:                 <Shield size={14} />,
  vestuario:              <Shirt size={14} />,
  alquimico_preparado:    <Beaker size={14} />,
  alquimico_veneno:       <Beaker size={14} />,
  esoterico:              <Star size={14} />,
};

const CATEGORY_LABEL: Record<string, string> = {
  arma: "Arma", armadura: "Armadura", escudo: "Escudo",
  vestuario: "Vestuário", equipamento_aventura: "Aventura",
  ferramenta: "Ferramenta", esoterico: "Esotérico",
  alquimico_preparado: "Alquímico", alquimico_veneno: "Veneno",
  alquimico_catalisador: "Catalisador", municao: "Munição",
  animal: "Animal", servico: "Serviço", bens_comuns: "Bens",
};

function itemName(entry: InvEntry): string {
  return entry.custom_label || entry.items?.name || entry.custom_name || "Item desconhecido";
}

function itemSpaces(entry: InvEntry): number {
  const baseSpaces = entry.items?.spaces ?? (entry.custom_data?.spaces as number ?? 1);
  return baseSpaces * entry.quantity;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function InventoryTab({ characterId, strMod, level, moneyPc, inventory, transactions, characterClass }: Props) {
  const [tab, setTab] = useState<"equipped" | "carried" | "storage" | "history">("carried");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [sellConfirm, setSellConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Separa inventário por localização
  const carried  = inventory.filter(i => i.location === "carried");
  const equipped = inventory.filter(i => i.location === "equipped");
  const worn     = inventory.filter(i => i.location === "worn");
  const storage  = inventory.filter(i => i.location === "storage" || i.location === "mount");

  const active = [...carried, ...equipped, ...worn];
  const usedSpaces = active.reduce((s, i) => s + itemSpaces(i), 0);
  const capacity = carryCapacity(strMod);
  const maxCarry = maxCarryCapacity(strMod);
  const overloaded = isOverloaded(usedSpaces, strMod);
  const wornCount = [...equipped, ...worn].length;
  const maxWorn = maxWornItems(level);
  const isMaxCarry = usedSpaces > maxCarry;

  const pct = Math.min(100, (usedSpaces / capacity) * 100);

  function handleMove(id: string, loc: InventoryLocation) {
    startTransition(async () => {
      await moveItem(id, loc);
      showToast("Item movido.");
    });
  }

  function handleSell(id: string) {
    startTransition(async () => {
      const r = await sellItem(id);
      setSellConfirm(null);
      showToast(`Vendido! +${formatMoney(r.refund)}. Saldo: ${formatMoney(r.newBalance)}`);
    });
  }

  function handleQty(id: string, delta: number, current: number) {
    const next = current + delta;
    if (next < 0) return;
    startTransition(async () => { await adjustQuantity(id, next); });
  }

  const tabs = [
    { key: "equipped", label: "Equipado", count: equipped.length + worn.length },
    { key: "carried",  label: "Carregado", count: carried.length },
    { key: "storage",  label: "Guardado",  count: storage.length },
    { key: "history",  label: "Histórico", count: null },
  ] as const;

  return (
    <div className="space-y-4">
      {/* ── Barra de carga ─────────────────────────────────── */}
      <div className="rounded-xl bg-stone-950 px-5 py-4 text-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-amber-200 flex items-center gap-2">
            <Package size={16} /> Carga
          </span>
          <span className={isMaxCarry ? "text-red-400 font-bold" : overloaded ? "text-amber-300 font-semibold" : "text-stone-400"}>
            {usedSpaces.toFixed(1)} / {capacity} espaços
            {isMaxCarry ? ` (máx. ${maxCarry})` : overloaded ? " (sobrecarregado)" : ""}
          </span>
        </div>
        <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${overloaded ? "bg-red-500" : "bg-amber-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {isMaxCarry ? (
          <p className="mt-2 text-red-400 text-xs font-semibold">
            ⚠ CARGA MÁXIMA — reduz o personagem a zero progresso e exige descarte imediato.
          </p>
        ) : overloaded ? (
          <p className="mt-2 text-red-400 text-xs font-semibold">
            ⚠ SOBRECARGA — −5 em penalidade de armadura, deslocamento −3m
          </p>
        ) : null}
        <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
          <span>Itens vestidos: <span className={wornCount > maxWorn ? "text-red-400 font-bold" : "text-stone-300"}>{wornCount}/{maxWorn}</span></span>
          <span className="text-amber-300 font-bold">{formatMoney(moneyPc)}</span>
        </div>
      </div>

      {/* Botão loja */}
      <button
        onClick={() => router.push(`/characters/${characterId}/shop`)}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm border-2 border-dashed border-amber-700 text-amber-800 hover:bg-amber-50 transition"
      >
        <ShoppingBag size={16} /> Visitar Mercador
      </button>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${
              tab === t.key
                ? "bg-amber-800 text-amber-50 shadow"
                : "text-stone-600 hover:bg-stone-200"
            }`}
          >
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span className={`ml-1 rounded-full px-1.5 text-[10px] ${tab === t.key ? "bg-amber-600" : "bg-stone-300 text-stone-600"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Carregado ─────────────────────────────────── */}
      {tab === "carried" && (
        <div className="space-y-2">
          {carried.length === 0 ? (
            <EmptyState icon={<Package size={32} />} label="Nada na mochila" />
          ) : (
            carried.map(entry => (
              <InventoryCard
                key={entry.id}
                entry={entry}
                isPending={isPending}
                onEquip={() => {
                  const loc: InventoryLocation =
                    entry.items?.category === "armadura" || entry.items?.category === "vestuario"
                      ? "worn" : "equipped";
                  handleMove(entry.id, loc);
                }}
                onStore={() => handleMove(entry.id, "storage")}
                onSell={() => setSellConfirm(entry.id)}
                onQty={(d) => handleQty(entry.id, d, entry.quantity)}
              />
            ))
          )}
        </div>
      )}

      {/* ── Tab: Equipado ─────────────────────────────────── */}
      {tab === "equipped" && (
        <div className="space-y-2">
          {[...equipped, ...worn].length === 0 ? (
            <EmptyState icon={<Shield size={32} />} label="Nada equipado" />
          ) : (
            [...equipped, ...worn].map(entry => (
              <InventoryCard
                key={entry.id}
                entry={entry}
                badge="Equipado"
                isPending={isPending}
                onUnequip={() => handleMove(entry.id, "carried")}
                onSell={() => setSellConfirm(entry.id)}
                onQty={undefined}
              />
            ))
          )}
        </div>
      )}

      {/* ── Tab: Guardado ─────────────────────────────────── */}
      {tab === "storage" && (
        <div className="space-y-2">
          {storage.length === 0 ? (
            <EmptyState icon={<ArrowUpDown size={32} />} label="Nada guardado" />
          ) : (
            storage.map(entry => (
              <InventoryCard
                key={entry.id}
                entry={entry}
                badge="Guardado"
                isPending={isPending}
                onEquip={() => handleMove(entry.id, "carried")}
                onSell={() => setSellConfirm(entry.id)}
                onQty={(d) => handleQty(entry.id, d, entry.quantity)}
              />
            ))
          )}
        </div>
      )}

      {/* ── Tab: Histórico ────────────────────────────────── */}
      {tab === "history" && (
        <div className="space-y-1.5">
          {transactions.length === 0 ? (
            <EmptyState icon={<Clock size={32} />} label="Sem transações" />
          ) : (
            transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between rounded-lg bg-stone-50 border border-stone-200 px-4 py-2.5 text-sm">
                <div>
                  <p className="font-medium text-stone-800">{tx.reason}</p>
                  <p className="text-xs text-stone-400">{new Date(tx.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="text-right">
                  <p className={`font-black ${tx.amount_pc >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {tx.amount_pc >= 0 ? "+" : ""}{formatMoney(tx.amount_pc)}
                  </p>
                  <p className="text-xs text-stone-400">Saldo: {formatMoney(tx.balance_after_pc)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Confirmação de venda ───────────────────────────── */}
      {sellConfirm && (() => {
        const entry = inventory.find(i => i.id === sellConfirm);
        if (!entry) return null;
        const price = priceWithArcanium(entry.items?.price_pc ?? 0, entry.improvements, entry.arcanium_spell_circle ?? undefined);
        const refund = Math.floor(price * 0.5);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
              <h3 className="font-black text-lg text-stone-950">Vender {itemName(entry)}?</h3>
              <p className="text-stone-600 text-sm">
                Preço de venda: <strong className="text-amber-800">{formatMoneyPP(refund)}</strong> (50% do preço cheio)
              </p>
              <p className="text-xs text-stone-400">Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setSellConfirm(null)}>Cancelar</Button>
                <button
                  onClick={() => handleSell(sellConfirm)}
                  disabled={isPending}
                  className="flex-1 rounded-xl py-3 font-black text-sm bg-amber-800 text-amber-50 hover:bg-amber-700 transition disabled:opacity-50"
                >
                  Vender 💰
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Toast ───────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-5 py-3 text-sm font-semibold text-amber-50 shadow-xl"
          style={{ background: "linear-gradient(135deg, #78350f, #b45309)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── Card de item ─────────────────────────────────────────────────────────────

function InventoryCard({
  entry, badge, isPending,
  onEquip, onUnequip, onStore, onSell, onQty,
}: {
  entry: InvEntry;
  badge?: string;
  isPending: boolean;
  onEquip?: () => void;
  onUnequip?: () => void;
  onStore?: () => void;
  onSell?: () => void;
  onQty?: (delta: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const item = entry.items;
  const name = itemName(entry);
  const cat = item?.category ?? (entry.custom_data?.category as string) ?? "outro";
  const price = item ? priceWithArcanium(item.price_pc, entry.improvements, entry.arcanium_spell_circle ?? undefined) : 0;

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 transition"
      >
        <span className="text-stone-400">{CATEGORY_ICON[cat] ?? <Package size={14} />}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-stone-900 truncate">{name}</p>
          <p className="text-xs text-stone-500">
            {CATEGORY_LABEL[cat] ?? cat}
            {item?.weapon_damage_dice && ` · ${item.weapon_damage_dice}`}
            {item?.armor_defense_bonus && ` · +${item.armor_defense_bonus} Def`}
          </p>
        </div>
        {entry.quantity > 1 && (
          <span className="text-xs font-bold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">×{entry.quantity}</span>
        )}
        {badge && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">{badge}</span>
        )}
        <ChevronDown size={14} className={`text-stone-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-stone-100 px-4 py-3 space-y-3 bg-stone-50">
          {item?.description && <p className="text-xs text-stone-600 italic">{item.description}</p>}

          {/* Stats de arma */}
          {item?.weapon_damage_dice && (
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span className="text-stone-500">Dano</span><span className="font-bold">{item.weapon_damage_dice} ({item.weapon_critical})</span>
              <span className="text-stone-500">Alcance</span><span className="font-bold capitalize">{item.weapon_range ?? "—"}</span>
              <span className="text-stone-500">Proficiência</span><span className="font-bold capitalize">{item.weapon_proficiency ?? "—"}</span>
              {item.weapon_abilities?.length > 0 && (
                <><span className="text-stone-500">Habilidades</span><span className="font-bold">{item.weapon_abilities.join(", ")}</span></>
              )}
            </div>
          )}

          {/* Stats de armadura */}
          {item?.armor_defense_bonus && (
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span className="text-stone-500">Bônus de Defesa</span><span className="font-bold">+{item.armor_defense_bonus}</span>
              <span className="text-stone-500">Penalidade</span><span className="font-bold text-red-600">{item.armor_penalty ?? 0}</span>
            </div>
          )}

          {/* Melhorias */}
          {(entry.improvements > 0 || entry.is_arcanium) && (
            <div className="flex gap-2 flex-wrap">
              {entry.improvements > 0 && <span className="text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 font-bold">+{entry.improvements} melhoria{entry.improvements > 1 ? "s" : ""}</span>}
              {entry.is_arcanium && <span className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-0.5 font-bold">Arcanium {entry.arcanium_spell_circle}º</span>}
            </div>
          )}

          {entry.notes && <p className="text-xs italic text-stone-500 border-l-2 border-amber-300 pl-2">{entry.notes}</p>}

          {/* Preço */}
          <p className="text-xs text-stone-400">Valor: {formatMoneyPP(price)} · {(item?.spaces ?? 1) * entry.quantity} espaço{(item?.spaces ?? 1) * entry.quantity !== 1 ? "s" : ""}</p>

          {/* Ações */}
          <div className="flex flex-wrap gap-2">
            {onEquip && <button onClick={onEquip} disabled={isPending} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-800 text-amber-50 hover:bg-amber-700 transition disabled:opacity-50">Equipar</button>}
            {onUnequip && <button onClick={onUnequip} disabled={isPending} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-stone-700 text-white hover:bg-stone-600 transition disabled:opacity-50">Desequipar</button>}
            {onStore && <button onClick={onStore} disabled={isPending} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300 transition disabled:opacity-50">Guardar</button>}
            {onSell && <button onClick={onSell} disabled={isPending} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50">Vender</button>}
            {onQty && entry.items?.is_stackable && (
              <div className="flex items-center gap-1 ml-auto">
                <button onClick={() => onQty(-1)} disabled={isPending || entry.quantity <= 1} className="w-7 h-7 rounded-lg bg-stone-200 text-stone-700 font-bold hover:bg-stone-300 disabled:opacity-30 transition"><Minus size={12} /></button>
                <span className="w-6 text-center text-xs font-bold">{entry.quantity}</span>
                <button onClick={() => onQty(+1)} disabled={isPending} className="w-7 h-7 rounded-lg bg-stone-200 text-stone-700 font-bold hover:bg-stone-300 disabled:opacity-30 transition"><Plus size={12} /></button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-stone-400">
      {icon}
      <p className="text-sm">{label}</p>
    </div>
  );
}
