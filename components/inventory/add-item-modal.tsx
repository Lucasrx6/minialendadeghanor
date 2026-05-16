"use client";

import { useState, useTransition } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { addToInventory, addCustomItem, addQuickItem } from "@/app/actions/inventory";

type AddLocation = "equipped" | "worn" | "carried" | "storage";

type CatalogItem = {
  slug: string;
  name: string;
  category: string;
  price_pc: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  characterId: string;
  catalog: CatalogItem[];
  isDmMode: boolean;
  onSuccess: (msg: string) => void;
};

export function AddItemModal({ open, onClose, characterId, catalog, isDmMode, onSuccess }: Props) {
  const [tab, setTab] = useState<"catalog" | "custom" | "quick">("catalog");
  const [search, setSearch] = useState("");
  const [slug, setSlug] = useState("");
  const [qty, setQty] = useState(1);
  const [location, setLocation] = useState<AddLocation>("carried");
  const [chargePc, setChargePc] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [customName, setCustomName] = useState("");
  const [customSpaces, setCustomSpaces] = useState(1);
  const [customDesc, setCustomDesc] = useState("");

  const [quickName, setQuickName] = useState("");
  const [quickNotes, setQuickNotes] = useState("");

  if (!open) return null;

  const filtered = catalog.filter(
    (i) => !search || i.name.toLowerCase().includes(search.toLowerCase()),
  ).slice(0, 40);

  function submitCatalog() {
    if (!slug) return;
    startTransition(async () => {
      const result = await addToInventory({
        characterId,
        itemSlug: slug,
        quantity: qty,
        location,
        improvements: 0,
        isArcanium: false,
        acquiredFrom: "loot",
        chargePc: isDmMode && chargePc,
        isDmMode,
      });
      if (result.error) {
        onSuccess(result.error);
      } else {
        onSuccess("Item adicionado ao inventário.");
        onClose();
      }
    });
  }

  function submitCustom() {
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-2xl bg-amber-50 shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-amber-900/15 px-4 py-3">
          <h2 className="text-lg font-black">Adicionar item</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-amber-100" aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-1 border-b border-amber-900/10 px-3 py-2">
          {(["catalog", "custom", "quick"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 text-xs font-bold ${tab === t ? "bg-amber-800 text-amber-50" : "text-stone-600"}`}
            >
              {t === "catalog" ? "Catálogo" : t === "custom" ? "Custom" : "Rápido"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tab === "catalog" && (
            <>
              <Input placeholder="Buscar…" value={search} onChange={(e) => setSearch(e.target.value)} />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filtered.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => setSlug(item.slug)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${slug === item.slug ? "bg-amber-800 text-amber-50" : "bg-white hover:bg-amber-100"}`}
                  >
                    {item.name}
                    <span className="ml-2 text-xs opacity-70">{CATEGORY_LABEL[item.category] ?? item.category}</span>
                  </button>
                ))}
              </div>
              <label className="block text-sm font-semibold">
                Quantidade
                <Input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
              </label>
              <label className="block text-sm font-semibold">
                Local
                <select className="mt-1 min-h-12 w-full rounded-xl border border-amber-900/20 px-3" value={location} onChange={(e) => setLocation(e.target.value as AddLocation)}>
                  <option value="carried">Carregado</option>
                  <option value="equipped">Equipado</option>
                  <option value="worn">Vestido</option>
                  <option value="storage">Guardado</option>
                </select>
              </label>
              {isDmMode && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={chargePc} onChange={(e) => setChargePc(e.target.checked)} />
                  Cobrar do personagem
                </label>
              )}
            </>
          )}

          {tab === "custom" && (
            <>
              <label className="block text-sm font-semibold">Nome<Input value={customName} onChange={(e) => setCustomName(e.target.value)} /></label>
              <label className="block text-sm font-semibold">Espaços<Input type="number" min={0} step={0.5} value={customSpaces} onChange={(e) => setCustomSpaces(Number(e.target.value))} /></label>
              <label className="block text-sm font-semibold">Descrição<Textarea value={customDesc} onChange={(e) => setCustomDesc(e.target.value)} /></label>
            </>
          )}

          {tab === "quick" && (
            <>
              <label className="block text-sm font-semibold">Nome<Input value={quickName} onChange={(e) => setQuickName(e.target.value)} /></label>
              <label className="block text-sm font-semibold">Notas<Textarea value={quickNotes} onChange={(e) => setQuickNotes(e.target.value)} /></label>
            </>
          )}
        </div>

        <div className="border-t border-amber-900/10 p-4">
          <Button
            fullWidth
            size="lg"
            disabled={isPending}
            onClick={tab === "catalog" ? submitCatalog : tab === "custom" ? submitCustom : submitQuick}
          >
            <Plus size={18} /> Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
}

const CATEGORY_LABEL: Record<string, string> = {
  arma: "Arma",
  armadura: "Armadura",
  escudo: "Escudo",
};
