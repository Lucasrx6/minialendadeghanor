"use client";

import { useState, useTransition } from "react";
import { X, Plus, Minus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { ItemIcon } from "@/components/ui/item-icon";
import { addToInventory, addCustomItem, addQuickItem } from "@/app/actions/inventory";
import { formatMoneyPP } from "@/lib/ghanor/inventory";

// ─── Types ────────────────────────────────────────────────────────────────────

type AddLocation = "equipped" | "worn" | "carried" | "storage";

type CatalogItem = {
  slug: string;
  name: string;
  category: string;
  price_pc: number;
  spaces: number;
  description: string | null;
  weapon_damage_dice: string | null;
  weapon_critical: string | null;
  armor_defense_bonus: number | null;
  is_stackable: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  characterId: string;
  catalog: CatalogItem[];
  isDmMode: boolean;
  onSuccess: (msg: string) => void;
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<string, string> = {
  arma: "Arma",
  armadura: "Armadura",
  escudo: "Escudo",
  municao: "Munição",
  equipamento_aventura: "Aventura",
  ferramenta: "Ferramenta",
  vestuario: "Vestuário",
  esoterico: "Esotérico",
  alquimico_preparado: "Alquímico",
  alquimico_catalisador: "Catalisador",
  alquimico_veneno: "Veneno",
  alquimia_mistica: "Alq. Mística",
  servico: "Serviço",
  bens_comuns: "Bens Comuns",
  item_magico: "Item Mágico",
};

const CATEGORY_ORDER = [
  "arma", "armadura", "escudo", "equipamento_aventura", "bens_comuns",
  "vestuario", "ferramenta", "esoterico", "alquimico_preparado",
  "alquimico_catalisador", "alquimico_veneno", "alquimia_mistica",
  "item_magico", "municao", "servico",
];

// ─── Componente ───────────────────────────────────────────────────────────────

export function AddItemModal({ open, onClose, characterId, catalog, isDmMode, onSuccess }: Props) {
  const [tab, setTab] = useState<"catalog" | "custom" | "quick">("catalog");

  // Catalog tab
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [selected, setSelected] = useState<CatalogItem | null>(null);
  const [qty, setQty] = useState(1);
  const [location, setLocation] = useState<AddLocation>("carried");
  const [chargePc, setChargePc] = useState(false);
  const [improvements, setImprovements] = useState(0);
  const [isArcanium, setIsArcanium] = useState(false);
  const [arcaniumCircle, setArcaniumCircle] = useState(1);

  // Custom tab
  const [customName, setCustomName] = useState("");
  const [customSpaces, setCustomSpaces] = useState(1);
  const [customDesc, setCustomDesc] = useState("");

  // Quick tab
  const [quickName, setQuickName] = useState("");
  const [quickNotes, setQuickNotes] = useState("");

  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  // ─── Filtros ────────────────────────────────────────────────────────────────

  const availableCategories = CATEGORY_ORDER.filter((k) => catalog.some((i) => i.category === k));

  const filtered = catalog.filter((item) => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || item.category === filterCat;
    return matchSearch && matchCat;
  });

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function selectItem(item: CatalogItem) {
    setSelected(item);
    setQty(1);
    setImprovements(0);
    setIsArcanium(false);
  }

  function submitCatalog() {
    if (!selected) return;
    startTransition(async () => {
      const result = await addToInventory({
        characterId,
        itemSlug: selected.slug,
        quantity: qty,
        location,
        improvements: isDmMode ? improvements : 0,
        isArcanium: isDmMode ? isArcanium : false,
        arcaniumSpellCircle: isDmMode && isArcanium ? arcaniumCircle : undefined,
        acquiredFrom: isDmMode ? "dm_manual" : "loot",
        chargePc: isDmMode && chargePc,
        isDmMode,
      });
      if ("error" in result) {
        onSuccess(result.error!);
      } else {
        onSuccess(`${selected.name} adicionado ao inventário.`);
        onClose();
      }
    });
  }

  function submitCustom() {
    if (!customName.trim()) return;
    startTransition(async () => {
      const result = await addCustomItem({
        characterId,
        name: customName,
        category: "bens_comuns",
        spaces: customSpaces,
        description: customDesc,
      });
      if (result.error) {
        onSuccess(result.error);
      } else {
        onSuccess(`${customName} adicionado.`);
        onClose();
      }
    });
  }

  function submitQuick() {
    if (!quickName.trim()) return;
    startTransition(async () => {
      const result = await addQuickItem({
        characterId,
        name: quickName,
        notes: quickNotes,
        location,
        isDmMode,
      });
      if (result.error) {
        onSuccess(result.error);
      } else {
        onSuccess(`${quickName} anotado.`);
        onClose();
      }
    });
  }

  const canSubmit =
    tab === "catalog" ? !!selected :
    tab === "custom" ? !!customName.trim() :
    !!quickName.trim();

  const showImprovements =
    isDmMode && selected && ["arma", "armadura", "escudo", "esoterico"].includes(selected.category);
  const showArcanium =
    isDmMode && selected && ["arma", "armadura", "escudo"].includes(selected.category);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-2xl bg-amber-50 shadow-2xl sm:rounded-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/15 px-4 py-3 flex-shrink-0">
          <h2 className="text-lg font-black">Adicionar item</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-amber-100" aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-amber-900/10 px-3 py-2 flex-shrink-0">
          {(["catalog", "custom", "quick"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                tab === t ? "bg-amber-800 text-amber-50" : "text-stone-600 hover:bg-amber-100"
              }`}
            >
              {t === "catalog" ? "Catálogo" : t === "custom" ? "Customizado" : "Rápido"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">

          {/* ── Tab: Catálogo ─────────────────────────────────── */}
          {tab === "catalog" && (
            <>
              {/* Search */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar item..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelected(null); }}
                  className="w-full pl-8 pr-8 py-2.5 rounded-xl border border-amber-900/20 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-stone-400"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(""); setSelected(null); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Category chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setFilterCat("")}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                    !filterCat
                      ? "bg-amber-800 text-amber-50"
                      : "bg-white border border-stone-200 text-stone-600 hover:border-amber-400"
                  }`}
                >
                  Tudo
                </button>
                {availableCategories.map((k) => (
                  <button
                    key={k}
                    onClick={() => setFilterCat((f) => (f === k ? "" : k))}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                      filterCat === k
                        ? "bg-amber-800 text-amber-50"
                        : "bg-white border border-stone-200 text-stone-600 hover:border-amber-400"
                    }`}
                  >
                    {CATEGORY_LABEL[k] ?? k}
                  </button>
                ))}
              </div>

              {/* Count */}
              <p className="text-xs text-stone-400">
                {filtered.length} {filtered.length === 1 ? "item" : "itens"}
              </p>

              {/* Item list */}
              <div className="max-h-52 overflow-y-auto rounded-xl border border-amber-900/10 bg-white p-1 space-y-0.5">
                {filtered.length === 0 ? (
                  <p className="py-6 text-center text-xs text-stone-400">Nenhum item encontrado</p>
                ) : (
                  filtered.map((item) => {
                    const isSelected = selected?.slug === item.slug;
                    return (
                      <button
                        key={item.slug}
                        type="button"
                        onClick={() => selectItem(item)}
                        className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left transition ${
                          isSelected ? "bg-amber-800 text-amber-50" : "hover:bg-amber-50"
                        }`}
                      >
                        <span className="shrink-0">
                          <ItemIcon slug={item.slug} category={item.category} size={18} />
                        </span>
                        <span className="flex-1 min-w-0 text-sm font-semibold truncate">
                          {item.name}
                        </span>
                        <span
                          className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            isSelected ? "bg-amber-700 text-amber-100" : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          {CATEGORY_LABEL[item.category] ?? item.category}
                        </span>
                        {item.spaces > 0 && (
                          <span className={`shrink-0 text-[10px] ${isSelected ? "text-amber-200" : "text-stone-400"}`}>
                            {item.spaces}esp
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Selected item config */}
              {selected && (
                <div className="rounded-xl border border-amber-300 bg-amber-100/60 px-4 py-3 space-y-3">
                  {/* Item summary */}
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 text-amber-800">
                      <ItemIcon slug={selected.slug} category={selected.category} size={20} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-stone-900 text-sm">{selected.name}</p>
                      <p className="text-xs text-stone-500">
                        {selected.weapon_damage_dice && `${selected.weapon_damage_dice} · ${selected.weapon_critical} · `}
                        {selected.armor_defense_bonus != null && `+${selected.armor_defense_bonus} Def · `}
                        {selected.spaces > 0 && `${selected.spaces} espaço${selected.spaces !== 1 ? "s" : ""} · `}
                        {formatMoneyPP(selected.price_pc)}
                      </p>
                      {selected.description && (
                        <p className="text-xs text-stone-500 italic mt-0.5 line-clamp-2">
                          {selected.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Qty + Location */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-stone-600 mb-1.5">Quantidade</p>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          className="w-7 h-7 rounded-lg bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-8 text-center font-bold text-sm">{qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty((q) => q + 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-stone-600 mb-1.5">Local</p>
                      <select
                        className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs"
                        value={location}
                        onChange={(e) => setLocation(e.target.value as AddLocation)}
                      >
                        <option value="carried">Carregado</option>
                        <option value="equipped">Equipado</option>
                        <option value="worn">Vestido</option>
                        <option value="storage">Guardado</option>
                      </select>
                    </div>
                  </div>

                  {/* DM extras */}
                  {isDmMode && (
                    <div className="space-y-2 border-t border-amber-300/60 pt-2">
                      {showImprovements && (
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-stone-600">
                            Melhorias {improvements === 4 ? "(obra-prima)" : ""}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setImprovements((i) => Math.max(0, i - 1))}
                              className="w-6 h-6 rounded bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-50"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="w-5 text-center text-xs font-bold">{improvements}</span>
                            <button
                              type="button"
                              onClick={() => setImprovements((i) => Math.min(4, i + 1))}
                              className="w-6 h-6 rounded bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-50"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>
                      )}
                      {showArcanium && (
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-2 text-xs font-semibold text-stone-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isArcanium}
                              onChange={(e) => setIsArcanium(e.target.checked)}
                              className="accent-amber-700"
                            />
                            Metal Arcanium
                          </label>
                          {isArcanium && (
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setArcaniumCircle(c)}
                                  className={`flex-1 py-1 rounded text-xs font-bold transition ${
                                    arcaniumCircle === c
                                      ? "bg-purple-700 text-white"
                                      : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                                  }`}
                                >
                                  {c}º
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={chargePc}
                          onChange={(e) => setChargePc(e.target.checked)}
                          className="accent-amber-700"
                        />
                        Cobrar do personagem
                      </label>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── Tab: Customizado ──────────────────────────────── */}
          {tab === "custom" && (
            <>
              <p className="text-xs text-stone-500">
                Item personalizado vinculado ao personagem. Não aparece no catálogo geral.
              </p>
              <label className="block text-sm font-semibold">
                Nome
                <Input value={customName} onChange={(e) => setCustomName(e.target.value)} />
              </label>
              <label className="block text-sm font-semibold">
                Espaços
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={customSpaces}
                  onChange={(e) => setCustomSpaces(Number(e.target.value))}
                />
              </label>
              <label className="block text-sm font-semibold">
                Descrição
                <Textarea value={customDesc} onChange={(e) => setCustomDesc(e.target.value)} />
              </label>
            </>
          )}

          {/* ── Tab: Rápido ───────────────────────────────────── */}
          {tab === "quick" && (
            <>
              <p className="text-xs text-stone-500">
                Anotação rápida de item — útil para recompensas únicas ou itens temporários.
              </p>
              <label className="block text-sm font-semibold">
                Nome
                <Input value={quickName} onChange={(e) => setQuickName(e.target.value)} />
              </label>
              <label className="block text-sm font-semibold">
                Notas
                <Textarea value={quickNotes} onChange={(e) => setQuickNotes(e.target.value)} />
              </label>
              <label className="block text-sm font-semibold">
                Local
                <select
                  className="mt-1 min-h-12 w-full rounded-xl border border-amber-900/20 bg-white px-3"
                  value={location}
                  onChange={(e) => setLocation(e.target.value as AddLocation)}
                >
                  <option value="carried">Carregado</option>
                  <option value="equipped">Equipado</option>
                  <option value="worn">Vestido</option>
                  <option value="storage">Guardado</option>
                </select>
              </label>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-amber-900/10 p-4 flex-shrink-0">
          <Button
            fullWidth
            size="lg"
            disabled={isPending || !canSubmit}
            onClick={tab === "catalog" ? submitCatalog : tab === "custom" ? submitCustom : submitQuick}
          >
            <Plus size={18} /> Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
}
