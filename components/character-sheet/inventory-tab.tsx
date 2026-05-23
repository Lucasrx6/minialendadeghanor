"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Package, Sword, Shield, Shirt, Beaker, Star, Clock,
  Plus, Minus, ShoppingBag, ArrowUpDown, Trash2, ChevronDown, ChevronRight, Wand2,
} from "lucide-react";
import {
  formatMoney, formatMoneyPP, carryCapacity, maxCarryCapacity,
  carryZone, WORN_LIMIT, priceWithArcanium,
} from "@/lib/ghanor/inventory";
import {
  moveItem, sellItem, adjustQuantity, adjustMoney, consumeItem, type InventoryLocation,
} from "@/app/actions/inventory";
import { ConsumeEffect, getConsumeType, type ConsumeType } from "@/components/character-sheet/ConsumeEffect";
import { AddItemModal } from "@/components/inventory/add-item-modal";
import { Button } from "@/components/ui/button";
import { ItemIcon } from "@/components/ui/item-icon";
import { ItemImage } from "@/components/ui/ItemImage";
import { Input, Textarea } from "@/components/ui/input";
import { dmEditInventoryItem, dmDeleteInventoryItem } from "@/app/actions/dm";

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
  can_be_held: boolean;
  can_be_worn: boolean;
  is_two_handed: boolean;
  is_cosmetic: boolean;
  is_purchasable: boolean;
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
  catalog: Array<{ slug: string; name: string; category: string; price_pc: number; spaces: number; description: string | null; weapon_damage_dice: string | null; weapon_critical: string | null; armor_defense_bonus: number | null; is_stackable: boolean }>;
  isDmMode: boolean;
};

// ─── Temas por categoria ──────────────────────────────────────────────────────

type CatTheme = { gradFrom: string; gradTo: string; border: string; iconClr: string; accentBg: string };

const CAT_THEME: Record<string, CatTheme> = {
  arma:                  { gradFrom: "#1c1a17", gradTo: "#3c3330", border: "#d97706", iconClr: "#fcd34d", accentBg: "rgba(217,119,6,0.15)" },
  armadura:              { gradFrom: "#0f1529", gradTo: "#1a2a4a", border: "#6366f1", iconClr: "#a5b4fc", accentBg: "rgba(99,102,241,0.15)" },
  escudo:                { gradFrom: "#0f1529", gradTo: "#1a2a4a", border: "#6366f1", iconClr: "#a5b4fc", accentBg: "rgba(99,102,241,0.15)" },
  vestuario:             { gradFrom: "#1a0f2e", gradTo: "#2d1645", border: "#a855f7", iconClr: "#d8b4fe", accentBg: "rgba(168,85,247,0.15)" },
  equipamento_aventura:  { gradFrom: "#0f1c12", gradTo: "#143322", border: "#22c55e", iconClr: "#86efac", accentBg: "rgba(34,197,94,0.15)" },
  ferramenta:            { gradFrom: "#1a1a10", gradTo: "#2a2a16", border: "#84cc16", iconClr: "#bef264", accentBg: "rgba(132,204,22,0.15)" },
  esoterico:             { gradFrom: "#200f2e", gradTo: "#341640", border: "#ec4899", iconClr: "#f9a8d4", accentBg: "rgba(236,72,153,0.15)" },
  alquimico_preparado:   { gradFrom: "#0a1a1a", gradTo: "#0e2929", border: "#06b6d4", iconClr: "#67e8f9", accentBg: "rgba(6,182,212,0.15)" },
  alquimico_veneno:      { gradFrom: "#0a1a0c", gradTo: "#0e2912", border: "#4ade80", iconClr: "#86efac", accentBg: "rgba(74,222,128,0.15)" },
  alquimico_catalisador: { gradFrom: "#1a140a", gradTo: "#2d200c", border: "#fb923c", iconClr: "#fdba74", accentBg: "rgba(251,146,60,0.15)" },
  alquimia_mistica:      { gradFrom: "#1a0f2e", gradTo: "#2d1645", border: "#c084fc", iconClr: "#e9d5ff", accentBg: "rgba(192,132,252,0.15)" },
  municao:               { gradFrom: "#1a1710", gradTo: "#2d2516", border: "#ca8a04", iconClr: "#fde047", accentBg: "rgba(202,138,4,0.15)" },
  item_magico:           { gradFrom: "#1c0f2e", gradTo: "#2e1050", border: "#e879f9", iconClr: "#f0abfc", accentBg: "rgba(232,121,249,0.15)" },
};
const DEFAULT_CAT_THEME: CatTheme = { gradFrom: "#171717", gradTo: "#262626", border: "#78716c", iconClr: "#d6d3d1", accentBg: "rgba(120,113,108,0.15)" };

// ─── Utils ────────────────────────────────────────────────────────────────────

type IconComp = React.ComponentType<{ size?: number; style?: React.CSSProperties }>;

const CATEGORY_ICON_COMPONENT: Record<string, IconComp> = {
  arma: Sword, armadura: Shield, escudo: Shield, vestuario: Shirt,
  alquimico_preparado: Beaker, alquimico_veneno: Beaker,
  alquimico_catalisador: Beaker, alquimia_mistica: Beaker, esoterico: Star,
};

const CATEGORY_LABEL: Record<string, string> = {
  arma: "Arma", armadura: "Armadura", escudo: "Escudo",
  vestuario: "Vestuário", equipamento_aventura: "Aventura",
  ferramenta: "Ferramenta", esoterico: "Esotérico",
  alquimico_preparado: "Alquímico", alquimico_veneno: "Veneno",
  alquimico_catalisador: "Catalisador", alquimia_mistica: "Alq. Mística",
  municao: "Munição", animal: "Animal", veiculo: "Veículo",
  servico: "Serviço", bens_comuns: "Bens", item_magico: "Item Mágico",
};

const CRIT_LABELS: Record<string, string> = {
  x2: "×2", x3: "×3", x4: "×4",
  "19": "19-20/×2", "18": "18-20/×2", "19/x3": "19-20/×3",
};

function itemName(entry: InvEntry): string {
  return entry.custom_label || entry.items?.name || entry.custom_name || "Item desconhecido";
}

function itemSpaces(entry: InvEntry): number {
  if (entry.items?.is_cosmetic) return 0;
  const baseSpaces = entry.items?.spaces ?? (entry.custom_data?.spaces as number ?? 1);
  return baseSpaces * entry.quantity;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function InventoryTab({ characterId, strMod, level, moneyPc, inventory, transactions, characterClass, catalog, isDmMode }: Props) {
  const [tab, setTab] = useState<"equipped" | "carried" | "storage" | "history">("carried");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [sellConfirm, setSellConfirm] = useState<string | null>(null);
  const [consumeEffect, setConsumeEffect] = useState<{ type: ConsumeType; itemName: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showMoney, setShowMoney] = useState(false);
  const [moneyReason, setMoneyReason] = useState("");
  const [moneyPcAdj, setMoneyPcAdj] = useState(0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const carried  = inventory.filter(i => i.location === "carried");
  const equipped = inventory.filter(i => i.location === "equipped");
  const worn     = inventory.filter(i => i.location === "worn");
  const storage  = inventory.filter(i => i.location === "storage" || i.location === "mount");

  const active = [...carried, ...equipped, ...worn];
  const usedSpaces = active.reduce((s, i) => s + itemSpaces(i), 0);
  const capacity = carryCapacity(strMod);
  const maxCarry = maxCarryCapacity(strMod);
  const zone = carryZone(usedSpaces, strMod);
  const wornCount = [...equipped, ...worn].filter(i => !i.items?.is_cosmetic).length;
  const maxWorn = WORN_LIMIT;

  const pct = Math.min(100, (usedSpaces / capacity) * 100);

  function handleMove(id: string, loc: InventoryLocation) {
    startTransition(async () => {
      const result = await moveItem(id, loc, { isDmMode });
      if ("error" in result) showToast(result.error);
      else showToast("Item movido.");
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

  function handleConsume(entry: InvEntry) {
    const cat = entry.items?.category ?? (entry.custom_data?.category as string) ?? "bens_comuns";
    const name = itemName(entry);
    startTransition(async () => {
      const result = await consumeItem(entry.id);
      if ("error" in result) { showToast(result.error); return; }
      setConsumeEffect({ type: getConsumeType(cat), itemName: name });
    });
  }

  const CONSUMABLE_CATS = new Set(["bens_comuns", "alquimico_preparado", "alquimia_mistica", "alquimico_veneno", "municao"]);

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
          <span className={zone === "blocked" ? "text-red-400 font-bold" : zone === "overloaded" ? "text-amber-300 font-semibold" : "text-emerald-300"}>
            {usedSpaces.toFixed(1)} / {capacity} espaços
            {zone === "blocked" ? ` (máx. ${maxCarry})` : zone === "overloaded" ? " (sobrecarregado)" : ""}
          </span>
        </div>
        <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${zone === "blocked" ? "bg-red-600" : zone === "overloaded" ? "bg-amber-500" : "bg-emerald-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {zone === "blocked" ? (
          <p className="mt-2 text-red-400 text-xs font-semibold">
            ⚠ CARGA MÁXIMA — reduz o personagem a zero progresso e exige descarte imediato.
          </p>
        ) : zone === "overloaded" ? (
          <p className="mt-2 text-red-400 text-xs font-semibold">
            ⚠ SOBRECARGA — −5 em penalidade de armadura, deslocamento −3m
          </p>
        ) : null}
        <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
          <span>Itens vestidos: <span className={wornCount > maxWorn ? "text-red-400 font-bold" : "text-stone-300"}>{wornCount}/{maxWorn}</span></span>
          <span className="text-amber-300 font-bold">{formatMoney(moneyPc)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button fullWidth variant="primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Adicionar item
        </Button>
        <Button fullWidth variant="secondary" onClick={() => setShowMoney(true)}>
          Ajustar dinheiro
        </Button>
      </div>

      <button
        onClick={() => router.push(`/characters/${characterId}/shop`)}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm border-2 border-dashed border-amber-700 text-amber-800 hover:bg-amber-50 transition"
      >
        <ShoppingBag size={16} /> Visitar Mercador
      </button>

      <AddItemModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        characterId={characterId}
        catalog={catalog}
        isDmMode={isDmMode}
        onSuccess={showToast}
      />

      {showMoney && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-2xl bg-amber-50 p-4 sm:rounded-2xl space-y-3">
            <h3 className="text-lg font-black">Ajustar dinheiro</h3>
            <p className="text-sm text-stone-600">Saldo atual: {formatMoney(moneyPc)}</p>
            <label className="block text-sm font-semibold">
              Valor em PC (+ ou −)
              <Input type="number" value={moneyPcAdj} onChange={(e) => setMoneyPcAdj(Number(e.target.value))} />
            </label>
            <label className="block text-sm font-semibold">
              Motivo{!isDmMode && " (obrigatório)"}
              <Textarea value={moneyReason} onChange={(e) => setMoneyReason(e.target.value)} />
            </label>
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setShowMoney(false)}>Cancelar</Button>
              <Button
                fullWidth
                disabled={!isDmMode && !moneyReason.trim()}
                onClick={() => startTransition(async () => {
                  try {
                    await adjustMoney({ characterId, amountPc: moneyPcAdj, reason: moneyReason || "Ajuste DM", isDmMode });
                    setShowMoney(false);
                    showToast("Dinheiro atualizado.");
                  } catch (e) {
                    showToast(e instanceof Error ? e.message : "Erro.");
                  }
                })}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      )}

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
        <div className="grid grid-cols-2 gap-2 items-start">
          {carried.length === 0 ? (
            <div className="col-span-2"><EmptyState icon={<Package size={32} />} label="Nada na mochila" /></div>
          ) : (
            carried.map(entry => {
              const isCustom = !entry.items;
              const isCosmetic = !isCustom && (entry.items?.is_cosmetic ?? false);
              const canHold = !isCosmetic && (isCustom || isDmMode || (entry.items?.can_be_held ?? false));
              const canWear = !isCosmetic && (isCustom || isDmMode || (entry.items?.can_be_worn ?? false));
              const cat = entry.items?.category ?? (entry.custom_data?.category as string) ?? "";
              const canConsume = (entry.items?.is_stackable ?? false) && CONSUMABLE_CATS.has(cat);
              return (
                <InventoryCard
                  key={entry.id}
                  entry={entry}
                  isPending={isPending}
                  isDmMode={isDmMode}
                  characterId={characterId}
                  onHold={canHold ? () => handleMove(entry.id, "equipped") : undefined}
                  onWear={canWear ? () => handleMove(entry.id, "worn") : undefined}
                  onStore={() => handleMove(entry.id, "storage")}
                  onSell={() => setSellConfirm(entry.id)}
                  onQty={(d) => handleQty(entry.id, d, entry.quantity)}
                  onConsume={canConsume ? () => handleConsume(entry) : undefined}
                />
              );
            })
          )}
        </div>
      )}

      {/* ── Tab: Equipado ─────────────────────────────────── */}
      {tab === "equipped" && (
        <div className="grid grid-cols-2 gap-2 items-start">
          {[...equipped, ...worn].length === 0 ? (
            <div className="col-span-2"><EmptyState icon={<Shield size={32} />} label="Nada equipado" /></div>
          ) : (
            [...equipped, ...worn].map(entry => (
              <InventoryCard
                key={entry.id}
                entry={entry}
                badge="Equipado"
                isPending={isPending}
                isDmMode={isDmMode}
                characterId={characterId}
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
        <div className="grid grid-cols-2 gap-2 items-start">
          {storage.length === 0 ? (
            <div className="col-span-2"><EmptyState icon={<ArrowUpDown size={32} />} label="Nada guardado" /></div>
          ) : (
            storage.map(entry => (
              <InventoryCard
                key={entry.id}
                entry={entry}
                badge="Guardado"
                isPending={isPending}
                isDmMode={isDmMode}
                characterId={characterId}
                onRetrieve={() => handleMove(entry.id, "carried")}
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
        const isNonPurchasable = entry.items?.is_purchasable === false;
        const price = isNonPurchasable ? 0 : priceWithArcanium(entry.items?.price_pc ?? 0, entry.improvements, entry.arcanium_spell_circle ?? undefined);
        const refund = Math.floor(price * 0.5);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
              <h3 className="font-black text-lg text-stone-950">Vender {itemName(entry)}?</h3>
              {isNonPurchasable ? (
                <p className="text-amber-700 text-sm border border-amber-200 bg-amber-50 rounded-lg px-3 py-2">
                  Este item não tem valor comercial — nenhum mercador pagará por ele (0 PC).
                </p>
              ) : (
                <p className="text-stone-600 text-sm">
                  Preço de venda: <strong className="text-amber-800">{formatMoneyPP(refund)}</strong> (50% do preço cheio)
                </p>
              )}
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

      {/* ── Consume effect overlay ───────────────────────────── */}
      {consumeEffect && (
        <ConsumeEffect
          type={consumeEffect.type}
          itemName={consumeEffect.itemName}
          onDone={() => setConsumeEffect(null)}
        />
      )}
    </div>
  );
}

// ─── Card de item ─────────────────────────────────────────────────────────────

function InventoryCard({
  entry, badge, isPending, isDmMode, characterId,
  onHold, onWear, onRetrieve, onUnequip, onStore, onSell, onQty, onConsume,
}: {
  entry: InvEntry;
  badge?: string;
  isPending: boolean;
  isDmMode?: boolean;
  characterId: string;
  onHold?: () => void;
  onWear?: () => void;
  onRetrieve?: () => void;
  onUnequip?: () => void;
  onStore?: () => void;
  onSell?: () => void;
  onQty?: (delta: number) => void;
  onConsume?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [dmLabel, setDmLabel] = useState(entry.custom_label ?? "");
  const [dmNotes, setDmNotes] = useState(entry.notes ?? "");
  const [dmImprovements, setDmImprovements] = useState(entry.improvements ?? 0);
  const [dmIsArcanium, setDmIsArcanium] = useState(entry.is_arcanium ?? false);
  const [dmArcaniumCircle, setDmArcaniumCircle] = useState(entry.arcanium_spell_circle ?? 1);
  const [dmSaving, startDmSave] = useTransition();
  const [dmSaved, setDmSaved] = useState(false);
  const [dmConfirmDelete, setDmConfirmDelete] = useState(false);

  const item = entry.items;
  const name = itemName(entry);
  const cat = item?.category ?? (entry.custom_data?.category as string) ?? "outro";
  const price = item ? priceWithArcanium(item.price_pc, entry.improvements, entry.arcanium_spell_circle ?? undefined) : 0;
  const theme = CAT_THEME[cat] ?? DEFAULT_CAT_THEME;
  const FallbackIcon: IconComp = CATEGORY_ICON_COMPONENT[cat] ?? Package;

  // Primary action for action bar
  const primaryAction = onHold ? { label: "Empunhar", fn: onHold }
    : onWear   ? { label: "Vestir",    fn: onWear }
    : onRetrieve ? { label: "Recuperar", fn: onRetrieve }
    : onUnequip  ? { label: "Desequipar", fn: onUnequip }
    : null;

  // Key stat shown on card face
  const statLine = item?.weapon_damage_dice
    ? item.weapon_damage_dice
    : item?.armor_defense_bonus
    ? `+${item.armor_defense_bonus} Def`
    : item?.spaces && item.spaces > 0
    ? `${item.spaces} esp.`
    : null;

  const critLabel = item?.weapon_critical ? (CRIT_LABELS[item.weapon_critical] ?? item.weapon_critical) : null;

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden transition-all duration-150"
      style={{
        border: `1.5px solid ${open ? theme.border : theme.border + "40"}`,
        boxShadow: open ? `0 0 14px ${theme.border}25` : "none",
      }}
    >
      {/* Card face */}
      <button
        className="relative flex flex-col items-center gap-1.5 px-2 pt-6 pb-3 text-center focus:outline-none"
        style={{ background: `linear-gradient(160deg, ${theme.gradFrom} 0%, ${theme.gradTo} 100%)` }}
        onClick={() => setOpen(v => !v)}
      >
        {/* Category badge */}
        <span
          className="absolute top-2 left-2 rounded-full px-1.5 py-0.5 text-[9px] font-black"
          style={{ background: `${theme.border}30`, color: theme.iconClr, border: `1px solid ${theme.border}40` }}
        >
          {CATEGORY_LABEL[cat] ?? cat}
        </span>

        {/* Equipped / Stored badge */}
        {badge && (
          <span className="absolute top-2 right-2 rounded-full px-1.5 py-0.5 text-[9px] font-black bg-emerald-900/60 text-emerald-300 border border-emerald-700/40">
            {badge}
          </span>
        )}

        {/* Image / Icon */}
        {item?.slug ? (
          <ItemImage
            slug={item.slug}
            name={name}
            borderColor={theme.border}
            iconFallback={<FallbackIcon size={20} style={{ color: theme.iconClr }} />}
          />
        ) : (
          <div
            className="mt-1 flex h-11 w-11 items-center justify-center rounded-full"
            style={{ background: `${theme.border}20`, border: `1.5px solid ${theme.border}50` }}
          >
            <FallbackIcon size={20} style={{ color: theme.iconClr }} />
          </div>
        )}

        {/* Name */}
        <p className="text-[11px] font-black leading-tight line-clamp-2 px-1 text-stone-100">
          {name}
          {entry.improvements > 0 && <span style={{ color: theme.iconClr }}> +{entry.improvements}</span>}
          {entry.is_arcanium && <span className="ml-1 text-purple-300"> ✦</span>}
        </p>

        {/* Stat */}
        {statLine && (
          <p className="text-base font-black" style={{ color: theme.iconClr }}>{statLine}</p>
        )}

        {/* Small badges */}
        <div className="flex flex-wrap gap-1 justify-center min-h-[14px]">
          {entry.quantity > 1 && (
            <span className="text-[9px] font-bold rounded-full px-1.5" style={{ background: `${theme.border}25`, color: theme.iconClr }}>
              ×{entry.quantity}
            </span>
          )}
          {item?.is_cosmetic && (
            <span className="text-[9px] font-bold rounded-full px-1.5 bg-stone-800/80 text-stone-400">cosmético</span>
          )}
          {item && item.is_purchasable === false && (
            <span className="text-[9px] font-bold rounded-full px-1.5 bg-amber-900/40 text-amber-400">não-comercial</span>
          )}
        </div>
      </button>

      {/* Action bar */}
      <div className="flex gap-1 border-t bg-stone-900 p-1.5" style={{ borderColor: `${theme.border}25` }}>
        {primaryAction ? (
          <button
            onClick={primaryAction.fn}
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-bold transition active:scale-95 disabled:opacity-50"
            style={{ background: theme.accentBg, color: theme.iconClr, border: `1px solid ${theme.border}35` }}
          >
            {primaryAction.label}
          </button>
        ) : onStore ? (
          <button
            onClick={onStore}
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-bold bg-stone-800 text-stone-300 transition hover:bg-stone-700 active:scale-95 disabled:opacity-50"
          >
            Guardar
          </button>
        ) : null}

        {/* Show Guardar as second button when there's a primary action */}
        {primaryAction && onStore && (
          <button
            onClick={onStore}
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-bold bg-stone-800 text-stone-300 transition hover:bg-stone-700 active:scale-95 disabled:opacity-50"
          >
            Guardar
          </button>
        )}

        <button
          onClick={() => setOpen(v => !v)}
          className="rounded-lg px-2 text-stone-500 hover:text-stone-300 transition bg-stone-800"
        >
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
      </div>

      {/* Expanded details */}
      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: open ? "700px" : "0" }}
      >
        <div className="space-y-2 border-t bg-stone-900/90 px-3 py-3" style={{ borderColor: `${theme.border}25` }}>

          {/* Notices */}
          {item?.is_cosmetic && (
            <p className="text-[10px] text-stone-400 italic border-l-2 border-stone-600 pl-2">
              Cosmético — não conta no limite de espaços nem no de itens vestidos.
            </p>
          )}
          {item && item.is_purchasable === false && (
            <p className="text-[10px] text-amber-500 italic border-l-2 border-amber-700 pl-2">
              Não-comercial — sem valor de mercado.
            </p>
          )}
          {item?.description && (
            <p className="text-[10px] text-stone-400 italic">{item.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
            {item?.weapon_damage_dice && (<>
              <span className="text-stone-500">Dano</span>
              <span className="font-bold text-stone-200">{item.weapon_damage_dice}{critLabel ? ` (${critLabel})` : ""}</span>
              <span className="text-stone-500">Alcance</span>
              <span className="font-bold capitalize text-stone-200">{item.weapon_range ?? "—"}</span>
              <span className="text-stone-500">Proficiência</span>
              <span className="font-bold capitalize text-stone-200">{item.weapon_proficiency ?? "—"}</span>
              {item.weapon_abilities?.length > 0 && (<>
                <span className="text-stone-500">Habilidades</span>
                <span className="font-bold text-stone-200">{item.weapon_abilities.join(", ")}</span>
              </>)}
            </>)}
            {item?.armor_defense_bonus && (<>
              <span className="text-stone-500">Bônus Def.</span>
              <span className="font-bold text-stone-200">+{item.armor_defense_bonus}</span>
              <span className="text-stone-500">Penalidade</span>
              <span className="font-bold text-red-400">{item.armor_penalty ?? 0}</span>
            </>)}
          </div>

          {/* Improvements / Arcanium badges */}
          {(entry.improvements > 0 || entry.is_arcanium) && (
            <div className="flex gap-1.5 flex-wrap">
              {entry.improvements > 0 && (
                <span className="text-[10px] rounded-full px-2 py-0.5 font-bold" style={{ background: `${theme.border}20`, color: theme.iconClr }}>
                  +{entry.improvements} melhoria{entry.improvements > 1 ? "s" : ""}
                </span>
              )}
              {entry.is_arcanium && (
                <span className="text-[10px] rounded-full px-2 py-0.5 font-bold bg-purple-900/40 text-purple-300">
                  Arcanium {entry.arcanium_spell_circle}º
                </span>
              )}
            </div>
          )}

          {entry.notes && (
            <p className="text-[10px] italic text-stone-400 border-l-2 pl-2" style={{ borderColor: `${theme.border}60` }}>
              {entry.notes}
            </p>
          )}

          <p className="text-[10px] text-stone-500">
            Valor: {formatMoneyPP(price)} · {(item?.spaces ?? 1) * entry.quantity} espaço{(item?.spaces ?? 1) * entry.quantity !== 1 ? "s" : ""}
          </p>

          {/* Extra actions */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {onConsume && (
              <button
                onClick={onConsume}
                disabled={isPending}
                className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                style={{ background: `${theme.border}25`, color: theme.iconClr, border: `1px solid ${theme.border}40` }}
              >
                Consumir
              </button>
            )}
            {onSell && !isDmMode && (
              <button
                onClick={onSell}
                disabled={isPending}
                className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-red-900/40 text-red-400 border border-red-700/30 hover:bg-red-900/60 transition disabled:opacity-50"
              >
                Vender
              </button>
            )}
            {onQty && entry.items?.is_stackable && (
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => onQty(-1)}
                  disabled={isPending || entry.quantity <= 1}
                  className="w-7 h-7 rounded-lg bg-stone-800 text-stone-300 font-bold hover:bg-stone-700 disabled:opacity-30 transition flex items-center justify-center"
                >
                  <Minus size={11} />
                </button>
                <span className="w-6 text-center text-xs font-bold text-stone-200">{entry.quantity}</span>
                <button
                  onClick={() => onQty(+1)}
                  disabled={isPending}
                  className="w-7 h-7 rounded-lg bg-stone-800 text-stone-300 font-bold hover:bg-stone-700 disabled:opacity-30 transition flex items-center justify-center"
                >
                  <Plus size={11} />
                </button>
              </div>
            )}
          </div>

          {/* DM Panel */}
          {isDmMode && (
            <div className="border-t border-indigo-900/50 rounded-lg bg-indigo-950/40 px-3 py-3 mt-1 space-y-3">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                <Wand2 size={10} /> Narrador
              </p>

              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Rótulo</span>
                <input
                  type="text"
                  value={dmLabel}
                  onChange={(e) => setDmLabel(e.target.value)}
                  placeholder={item?.name ?? "Nome personalizado…"}
                  className="mt-1 block w-full rounded-lg border border-indigo-800/50 bg-stone-900 px-3 py-1.5 text-sm text-stone-200 focus:border-indigo-500 focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Notas homebrew</span>
                <textarea
                  value={dmNotes}
                  onChange={(e) => setDmNotes(e.target.value)}
                  placeholder="Bônus especiais, descrição da narrativa…"
                  rows={2}
                  className="mt-1 block w-full resize-none rounded-lg border border-indigo-800/50 bg-stone-900 px-3 py-1.5 text-sm text-stone-200 focus:border-indigo-500 focus:outline-none"
                />
              </label>

              {item && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Melhorias</span>
                  <div className="mt-1 flex gap-1.5">
                    {[0, 1, 2, 3, 4].map((n) => (
                      <button
                        key={n}
                        onClick={() => setDmImprovements(n)}
                        className={`h-8 w-8 rounded-lg text-xs font-black transition cursor-pointer ${
                          dmImprovements === n
                            ? "bg-indigo-700 text-white shadow"
                            : "bg-stone-800 border border-indigo-800/50 text-stone-400 hover:bg-indigo-900/40"
                        }`}
                      >
                        {n === 0 ? "—" : `+${n}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {item && (
                <div>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={dmIsArcanium}
                      onChange={(e) => setDmIsArcanium(e.target.checked)}
                      className="accent-indigo-600"
                    />
                    <span className="text-xs font-bold text-stone-400">Arcanium</span>
                  </label>
                  {dmIsArcanium && (
                    <div className="mt-1.5 flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setDmArcaniumCircle(n)}
                          className={`h-7 w-7 rounded-lg text-xs font-black transition cursor-pointer ${
                            dmArcaniumCircle === n
                              ? "bg-purple-700 text-white shadow"
                              : "bg-stone-800 border border-purple-800/50 text-stone-400 hover:bg-purple-900/40"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                      <span className="ml-1 self-center text-xs text-purple-500">º círculo</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  disabled={dmSaving}
                  onClick={() =>
                    startDmSave(async () => {
                      await dmEditInventoryItem({
                        inventoryId: entry.id,
                        characterId,
                        customLabel: dmLabel || undefined,
                        notes: dmNotes || undefined,
                        improvements: dmImprovements,
                        isArcanium: item ? dmIsArcanium : undefined,
                        arcaniumSpellCircle: item && dmIsArcanium ? dmArcaniumCircle : undefined,
                      });
                      setDmSaved(true);
                      setTimeout(() => setDmSaved(false), 2500);
                    })
                  }
                  className="flex-1 rounded-lg bg-indigo-700 py-2 text-xs font-bold text-white transition hover:bg-indigo-600 disabled:opacity-50 cursor-pointer"
                >
                  {dmSaving ? "Salvando…" : dmSaved ? "✓ Salvo!" : "Salvar alterações"}
                </button>

                {!dmConfirmDelete ? (
                  <button
                    onClick={() => setDmConfirmDelete(true)}
                    className="rounded-lg border border-red-800/40 bg-red-900/30 px-3 py-2 text-xs font-bold text-red-400 transition hover:bg-red-900/50 cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-red-400 font-semibold">Confirmar?</span>
                    <button
                      disabled={dmSaving}
                      onClick={() => startDmSave(async () => {
                        await dmDeleteInventoryItem(entry.id, characterId);
                      })}
                      className="rounded-lg bg-red-700 px-2 py-1 text-xs font-bold text-white hover:bg-red-600 transition cursor-pointer disabled:opacity-50"
                    >
                      Sim
                    </button>
                    <button
                      onClick={() => setDmConfirmDelete(false)}
                      className="rounded-lg bg-stone-700 px-2 py-1 text-xs font-bold text-stone-200 hover:bg-stone-600 transition cursor-pointer"
                    >
                      Não
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
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
