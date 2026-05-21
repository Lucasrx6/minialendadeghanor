"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { X, Heart, Sparkles, Coins, Package, ExternalLink, UserMinus } from "lucide-react";
import { dmAdjustHp, dmSetHp, dmAdjustMp, dmSetMp, dmAdjustMoney, removeParticipantByDm } from "@/app/actions/arena";
import { addToInventory } from "@/app/actions/inventory";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { formatMoney, toPc } from "@/lib/ghanor/inventory";
import type { ArenaParticipant } from "@/app/actions/arena";

type Props = {
  participant: ArenaParticipant | null;
  arenaId: string;
  onClose: () => void;
  onUpdated: (participantId: string, patch: Partial<ArenaParticipant>) => void;
  onRemoved: (participantId: string) => void;
};

type CatalogItem = {
  slug: string;
  name: string;
  category: string;
  price_pc: number;
  spaces: number;
};

function StatControl({
  label, icon, current, max, color,
  onDelta, onSet, isPending,
}: {
  label: string;
  icon: React.ReactNode;
  current: number;
  max: number;
  color: "red" | "blue";
  onDelta: (d: number) => void;
  onSet: (v: number) => void;
  isPending: boolean;
}) {
  const [directInput, setDirectInput] = useState("");
  const pct = max > 0 ? Math.round((current / max) * 100) : 0;
  const barColor = color === "red" ? "bg-red-500" : "bg-blue-400";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider text-stone-600">{label}</span>
        <span className="ml-auto text-sm font-black text-stone-800">
          {current}<span className="text-xs font-normal text-stone-400">/{max}</span>
        </span>
      </div>

      <div className="h-2 rounded-full bg-stone-200 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>

      {/* Botões rápidos */}
      <div className="grid grid-cols-6 gap-1">
        {[-10, -5, -1, +1, +5, +10].map((d) => (
          <button
            key={d}
            onClick={() => onDelta(d)}
            disabled={isPending}
            className={`rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
              d < 0
                ? "bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-300"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 active:bg-emerald-300"
            } disabled:opacity-40`}
          >
            {d > 0 ? "+" : ""}{d}
          </button>
        ))}
      </div>

      {/* Definir diretamente */}
      <div className="flex gap-2">
        <input
          type="number"
          value={directInput}
          onChange={(e) => setDirectInput(e.target.value)}
          placeholder={`Definir ${label}…`}
          min={0}
          max={max}
          className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
        <Button
          variant="secondary"
          disabled={isPending || directInput === ""}
          onClick={() => {
            const v = parseInt(directInput, 10);
            if (!isNaN(v)) { onSet(v); setDirectInput(""); }
          }}
        >
          OK
        </Button>
      </div>
    </div>
  );
}

export function DmActionDrawer({ participant, arenaId, onClose, onUpdated, onRemoved }: Props) {
  const [activeSection, setActiveSection] = useState<"stats" | "items" | "money">("stats");
  const [isPendingHp, startHp] = useTransition();
  const [isPendingMp, startMp] = useTransition();
  const [isPendingMoney, startMoney] = useTransition();
  const [isPendingItem, startItem] = useTransition();
  const [isPendingRemove, startRemove] = useTransition();

  const [moneyPo, setMoneyPo] = useState("");
  const [moneyReason, setMoneyReason] = useState("");
  const [moneyMode, setMoneyMode] = useState<"give" | "take">("give");
  const [moneyError, setMoneyError] = useState<string | null>(null);

  const [itemSearch, setItemSearch] = useState("");
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [itemError, setItemError] = useState<string | null>(null);
  const [itemSuccess, setItemSuccess] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSection !== "items" || catalog.length > 0) return;
    const supabase = createClient();
    supabase
      .from("items")
      .select("slug, name, category, price_pc, spaces")
      .eq("is_purchasable", true)
      .order("name")
      .then(({ data }) => setCatalog(data ?? []));
  }, [activeSection, catalog.length]);

  if (!participant) return null;

  const char = participant.character;

  function handleAdjustHp(delta: number) {
    startHp(async () => {
      const res = await dmAdjustHp({ arenaId, characterId: participant!.character_id, delta });
      if ("ok" in res) onUpdated(participant!.id, { hp_current: res.newHp });
    });
  }

  function handleSetHp(hp: number) {
    startHp(async () => {
      const res = await dmSetHp({ arenaId, characterId: participant!.character_id, hp });
      if ("ok" in res) onUpdated(participant!.id, { hp_current: res.newHp });
    });
  }

  function handleAdjustMp(delta: number) {
    startMp(async () => {
      const res = await dmAdjustMp({ arenaId, characterId: participant!.character_id, delta });
      if ("ok" in res) onUpdated(participant!.id, { mp_current: res.newMp });
    });
  }

  function handleSetMp(mp: number) {
    startMp(async () => {
      const res = await dmSetMp({ arenaId, characterId: participant!.character_id, mp });
      if ("ok" in res) onUpdated(participant!.id, { mp_current: res.newMp });
    });
  }

  function handleMoney() {
    const po = parseFloat(moneyPo);
    if (isNaN(po) || po <= 0) { setMoneyError("Informe um valor válido."); return; }
    const amountPc = Math.round(toPc(po));
    const finalAmount = moneyMode === "give" ? amountPc : -amountPc;
    setMoneyError(null);
    startMoney(async () => {
      const res = await dmAdjustMoney({
        arenaId, characterId: participant!.character_id,
        amountPc: finalAmount,
        reason: moneyReason || (moneyMode === "give" ? "Dado pelo Mestre" : "Cobrado pelo Mestre"),
      });
      if ("error" in res) { setMoneyError(res.error); return; }
      setMoneyPo("");
      setMoneyReason("");
    });
  }

  function handleAddItem(item: CatalogItem) {
    setItemError(null);
    setItemSuccess(null);
    startItem(async () => {
      const res = await addToInventory({
        characterId: participant!.character_id,
        itemSlug: item.slug,
        quantity: 1,
        improvements: 0,
        isArcanium: false,
        acquiredFrom: "dm_manual",
        location: "carried",
        isDmMode: true,
      });
      if ("error" in res) { setItemError(res.error ?? "Erro ao adicionar item."); return; }
      setItemSuccess(`${item.name} adicionado ao inventário!`);
      setTimeout(() => setItemSuccess(null), 3000);
    });
  }

  function handleRemove() {
    if (!window.confirm(`Remover ${char.name} da arena?`)) return;
    startRemove(async () => {
      await removeParticipantByDm({ arenaId, characterId: participant!.character_id });
      onRemoved(participant!.id);
      onClose();
    });
  }

  const filteredCatalog = itemSearch.length >= 2
    ? catalog.filter((i) => i.name.toLowerCase().includes(itemSearch.toLowerCase())).slice(0, 30)
    : [];

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed inset-x-0 bottom-0 z-[60] flex flex-col rounded-t-3xl bg-amber-50 shadow-2xl"
        style={{ maxHeight: "88dvh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-stone-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-amber-900/10">
          <div className="min-w-0">
            <p className="font-black text-stone-900 truncate">{char.name}</p>
            <p className="text-xs text-stone-500 capitalize">{char.race} · {char.class}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/characters/${participant.character_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-900/15 bg-white text-amber-800 hover:bg-amber-100 transition"
              title="Ver ficha completa"
            >
              <ExternalLink size={15} />
            </a>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-900/15 bg-white text-stone-600 hover:bg-stone-100 transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-amber-900/10 px-5 gap-1 pt-2">
          {(["stats", "items", "money"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className={`flex-1 rounded-t-lg py-2 text-xs font-bold transition cursor-pointer ${
                activeSection === s
                  ? "bg-amber-800 text-amber-50"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {s === "stats" ? "PV / PM" : s === "items" ? "Itens" : "Dinheiro"}
            </button>
          ))}
        </div>

        {/* Conteúdo com scroll */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5" style={{ paddingBottom: "calc(1rem + var(--safe-bottom))" }}>

          {/* ── Stats ── */}
          {activeSection === "stats" && (
            <>
              <StatControl
                label="PV" icon={<Heart size={13} className="text-red-500" />}
                current={participant.hp_current} max={char.hp_max}
                color="red" isPending={isPendingHp}
                onDelta={handleAdjustHp} onSet={handleSetHp}
              />
              <div className="h-px bg-stone-200" />
              <StatControl
                label="PM" icon={<Sparkles size={13} className="text-blue-500" />}
                current={participant.mp_current} max={char.mp_max}
                color="blue" isPending={isPendingMp}
                onDelta={handleAdjustMp} onSet={handleSetMp}
              />
              <div className="h-px bg-stone-200" />
              <button
                onClick={handleRemove}
                disabled={isPendingRemove}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 active:bg-red-200 cursor-pointer disabled:opacity-40"
              >
                <UserMinus size={15} /> Remover da arena
              </button>
            </>
          )}

          {/* ── Itens ── */}
          {activeSection === "items" && (
            <>
              <div>
                <label className="text-sm font-bold text-stone-700 block mb-1.5">
                  Buscar item do catálogo
                </label>
                <input
                  type="text"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  placeholder="Digite o nome do item…"
                  className="w-full rounded-xl border border-amber-900/20 bg-white px-4 py-3 text-sm focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>

              {itemSuccess && (
                <p className="text-sm font-semibold text-emerald-700">{itemSuccess}</p>
              )}
              {itemError && (
                <p className="text-sm font-semibold text-red-700">{itemError}</p>
              )}

              {itemSearch.length >= 2 && filteredCatalog.length === 0 && (
                <p className="text-sm text-stone-500 text-center py-4">Nenhum item encontrado.</p>
              )}

              <div className="space-y-1.5">
                {filteredCatalog.map((item) => (
                  <div
                    key={item.slug}
                    className="flex items-center justify-between rounded-xl border border-amber-900/10 bg-white/80 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-stone-500">{item.category} · {item.spaces} esp.</p>
                    </div>
                    <Button
                      variant="secondary"
                      disabled={isPendingItem}
                      onClick={() => handleAddItem(item)}
                      className="ml-3 shrink-0 text-xs py-1 px-3"
                    >
                      <Package size={12} /> Dar
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Dinheiro ── */}
          {activeSection === "money" && (
            <>
              <div className="rounded-xl bg-stone-100/80 px-4 py-3 text-center">
                <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Saldo atual</p>
                <p className="text-2xl font-black text-amber-900 mt-1">
                  {formatMoney(char.money_pc)}
                </p>
              </div>

              {/* Modo dar / cobrar */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMoneyMode("give")}
                  className={`rounded-xl py-2.5 text-sm font-bold transition cursor-pointer ${
                    moneyMode === "give"
                      ? "bg-emerald-700 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Dar dinheiro
                </button>
                <button
                  onClick={() => setMoneyMode("take")}
                  className={`rounded-xl py-2.5 text-sm font-bold transition cursor-pointer ${
                    moneyMode === "take"
                      ? "bg-red-700 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Cobrar
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-sm font-bold text-stone-700 block mb-1">
                    Valor em PO (peças de ouro)
                  </label>
                  <input
                    type="number"
                    value={moneyPo}
                    onChange={(e) => setMoneyPo(e.target.value)}
                    min={0}
                    step={0.1}
                    placeholder="Ex: 5 (= 5 PO = 5.000 PC)"
                    className="w-full rounded-xl border border-amber-900/20 bg-white px-4 py-3 text-sm focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-stone-700 block mb-1">
                    Motivo (opcional)
                  </label>
                  <input
                    type="text"
                    value={moneyReason}
                    onChange={(e) => setMoneyReason(e.target.value)}
                    maxLength={120}
                    placeholder="Recompensa da missão…"
                    className="w-full rounded-xl border border-amber-900/20 bg-white px-4 py-3 text-sm focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>

              {moneyError && <p className="text-sm font-semibold text-red-700">{moneyError}</p>}

              <Button
                fullWidth
                disabled={isPendingMoney || !moneyPo}
                onClick={handleMoney}
                className={moneyMode === "give" ? "bg-emerald-700 hover:bg-emerald-600" : "bg-red-700 hover:bg-red-600"}
              >
                <Coins size={15} />
                {isPendingMoney
                  ? "Processando…"
                  : moneyMode === "give"
                  ? "Dar dinheiro"
                  : "Cobrar"}
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
