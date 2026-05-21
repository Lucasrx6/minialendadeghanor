"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { X, Heart, Sparkles, Coins, Package, ExternalLink, UserMinus, Wand2, ChevronDown, ChevronRight } from "lucide-react";
import { dmAdjustHp, dmSetHp, dmAdjustMp, dmSetMp, dmAdjustMoney, removeParticipantByDm, searchArenaItems, dmAddCustomItem, dmAdjustAttribute } from "@/app/actions/arena";
import { addToInventory } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import { formatMoney, toPc } from "@/lib/ghanor/inventory";
import type { ArenaParticipant, CatalogItem } from "@/app/actions/arena";

type Props = {
  participant: ArenaParticipant | null;
  arenaId: string;
  onClose: () => void;
  onUpdated: (participantId: string, patch: Partial<ArenaParticipant>) => void;
  onRemoved: (participantId: string) => void;
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
  const [isPendingAttr, startAttr] = useTransition();
  const [showAttrs, setShowAttrs] = useState(false);

  const [moneyPo, setMoneyPo] = useState("");
  const [moneyReason, setMoneyReason] = useState("");
  const [moneyMode, setMoneyMode] = useState<"give" | "take">("give");
  const [moneyError, setMoneyError] = useState<string | null>(null);

  const [itemMode, setItemMode] = useState<"catalog" | "custom">("catalog");
  const [itemSearch, setItemSearch] = useState("");
  const [searchResults, setSearchResults] = useState<CatalogItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);
  const [itemSuccess, setItemSuccess] = useState<string | null>(null);

  const [customName, setCustomName] = useState("");
  const [customSpaces, setCustomSpaces] = useState("0");
  const [customNotes, setCustomNotes] = useState("");
  const [isPendingCustom, startCustom] = useTransition();

  const overlayRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (itemSearch.trim().length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      const results = await searchArenaItems(itemSearch);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [itemSearch]);

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
      setItemSuccess(`${item.name} adicionado!`);
      setTimeout(() => setItemSuccess(null), 3000);
    });
  }

  function handleAddCustomItem() {
    if (!customName.trim()) { setItemError("Informe o nome do item."); return; }
    setItemError(null);
    setItemSuccess(null);
    startCustom(async () => {
      const res = await dmAddCustomItem({
        arenaId,
        characterId: participant!.character_id,
        name: customName.trim(),
        spaces: parseFloat(customSpaces) || 0,
        notes: customNotes,
      });
      if ("error" in res) { setItemError(res.error); return; }
      setItemSuccess(`"${customName.trim()}" adicionado ao inventário!`);
      setCustomName("");
      setCustomSpaces("0");
      setCustomNotes("");
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

  type AttrKey = "str" | "dex" | "con" | "int" | "wis" | "cha";
  const ATTR_INFO: { key: AttrKey; label: string; short: string }[] = [
    { key: "str", label: "Força",        short: "FOR" },
    { key: "dex", label: "Destreza",     short: "DES" },
    { key: "con", label: "Constituição", short: "CON" },
    { key: "int", label: "Inteligência", short: "INT" },
    { key: "wis", label: "Sabedoria",    short: "SAB" },
    { key: "cha", label: "Carisma",      short: "CAR" },
  ];

  const [localAttrs, setLocalAttrs] = useState<Record<AttrKey, number>>({
    str: char.attr_str, dex: char.attr_dex, con: char.attr_con,
    int: char.attr_int, wis: char.attr_wis, cha: char.attr_cha,
  });

  function handleAdjustAttr(attr: AttrKey, delta: number) {
    startAttr(async () => {
      const res = await dmAdjustAttribute({ arenaId, characterId: participant!.character_id, attr, delta });
      if ("ok" in res) {
        setLocalAttrs((prev) => ({ ...prev, [attr]: res.newValue }));
      }
    });
  }


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
        style={{ height: "78dvh", maxHeight: "88dvh" }}
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

              {/* ── Atributos ── */}
              <div>
                <button
                  onClick={() => setShowAttrs((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl border border-amber-900/15 bg-white/60 px-3 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-amber-50 cursor-pointer"
                >
                  <span>Atributos &amp; Bônus</span>
                  {showAttrs ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </button>

                {showAttrs && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {ATTR_INFO.map(({ key, label, short }) => (
                      <div key={key} className="flex items-center justify-between rounded-xl border border-amber-900/10 bg-white/80 px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-wider text-stone-400">{short}</p>
                          <p className="text-lg font-black text-stone-900 leading-none">
                            {localAttrs[key] >= 0 ? "+" : ""}{localAttrs[key]}
                          </p>
                          <p className="text-[10px] text-stone-400 truncate">{label}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleAdjustAttr(key, +1)}
                            disabled={isPendingAttr}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-sm font-black transition hover:bg-emerald-200 disabled:opacity-40 cursor-pointer"
                          >+</button>
                          <button
                            onClick={() => handleAdjustAttr(key, -1)}
                            disabled={isPendingAttr}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-700 text-sm font-black transition hover:bg-red-200 disabled:opacity-40 cursor-pointer"
                          >−</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
              {/* Toggle catálogo / customizado */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setItemMode("catalog"); setItemError(null); setItemSuccess(null); }}
                  className={`rounded-xl py-2.5 text-sm font-bold transition cursor-pointer ${
                    itemMode === "catalog"
                      ? "bg-amber-800 text-amber-50"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  <Package size={13} className="inline mr-1.5" />Catálogo
                </button>
                <button
                  onClick={() => { setItemMode("custom"); setItemError(null); setItemSuccess(null); }}
                  className={`rounded-xl py-2.5 text-sm font-bold transition cursor-pointer ${
                    itemMode === "custom"
                      ? "bg-indigo-700 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  <Wand2 size={13} className="inline mr-1.5" />Customizado
                </button>
              </div>

              {itemSuccess && (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{itemSuccess}</p>
              )}
              {itemError && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{itemError}</p>
              )}

              {/* ── Catálogo ── */}
              {itemMode === "catalog" && (
                <>
                  <div>
                    <label className="text-sm font-bold text-stone-700 block mb-1.5">
                      Buscar item do catálogo
                    </label>
                    <input
                      autoFocus
                      type="text"
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      placeholder="Ex: Espada, Poção, Capa…"
                      className="w-full rounded-xl border border-amber-900/20 bg-white px-4 py-3 text-sm focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  </div>

                  {isSearching && (
                    <p className="text-sm text-stone-400 text-center">Buscando…</p>
                  )}
                  {!isSearching && itemSearch.length >= 2 && searchResults.length === 0 && (
                    <p className="text-sm text-stone-500 text-center py-2">Nenhum item encontrado.</p>
                  )}
                  {itemSearch.length < 2 && (
                    <p className="text-xs text-stone-400 text-center">Digite ao menos 2 letras para buscar.</p>
                  )}

                  <div className="space-y-1.5">
                    {searchResults.map((item) => (
                      <div
                        key={item.slug}
                        className="flex items-center justify-between rounded-xl border border-amber-900/10 bg-white/80 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-stone-900 truncate">{item.name}</p>
                          <p className="text-[10px] text-stone-500 capitalize">{item.category} · {item.spaces} esp.</p>
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

              {/* ── Item Customizado ── */}
              {itemMode === "custom" && (
                <div className="space-y-3">
                  <p className="text-xs text-stone-500">
                    Crie um item livre — recompensas, armas únicas, amuletos, bônus mágicos, etc.
                  </p>
                  <div>
                    <label className="text-sm font-bold text-stone-700 block mb-1">Nome do item *</label>
                    <input
                      autoFocus
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Ex: Espada do Rei Sombrio, Amuleto +2…"
                      maxLength={100}
                      className="w-full rounded-xl border border-amber-900/20 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-stone-700 block mb-1">Espaços de carga</label>
                    <input
                      type="number"
                      value={customSpaces}
                      onChange={(e) => setCustomSpaces(e.target.value)}
                      min={0}
                      step={0.5}
                      className="w-full rounded-xl border border-amber-900/20 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-stone-700 block mb-1">Descrição / efeito (opcional)</label>
                    <textarea
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="Concede +2 em Força, causa 2d8 de dano…"
                      rows={3}
                      maxLength={300}
                      className="w-full rounded-xl border border-amber-900/20 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                    />
                  </div>
                  <Button
                    fullWidth
                    disabled={isPendingCustom || !customName.trim()}
                    onClick={handleAddCustomItem}
                    className="bg-indigo-700 hover:bg-indigo-600"
                  >
                    <Wand2 size={15} />
                    {isPendingCustom ? "Adicionando…" : "Adicionar item customizado"}
                  </Button>
                </div>
              )}
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
