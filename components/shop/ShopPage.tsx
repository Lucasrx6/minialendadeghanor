"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search, ShoppingCart, X, Sword, Shield, Package,
  Shirt, Beaker, Star, ChevronLeft, Plus, Minus, RefreshCw, Clock,
} from "lucide-react";
import { formatMoneyPP, formatMoney, priceWithArcanium } from "@/lib/ghanor/inventory";
import {
  buyFromSession, createShopSession,
  type SessionItem, type ShopSession,
} from "@/app/actions/shop-session";
import { STAGE_INFO } from "@/lib/ghanor/shop-stages";
import { ItemIcon } from "@/components/ui/item-icon";

// ─── Types ────────────────────────────────────────────────────────────────────

type CartEntry = {
  item: SessionItem;
  quantity: number;
  improvements: number;
  isArcanium: boolean;
  arcaniumCircle?: number;
};

type Props = {
  characterId: string;
  moneyPc: number;
  characterClass: string;
  initialSession: ShopSession | null;
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "", label: "Tudo" },
  { key: "arma", label: "Armas", icon: <Sword size={14} /> },
  { key: "armadura", label: "Armaduras", icon: <Shield size={14} /> },
  { key: "escudo", label: "Escudos", icon: <Shield size={14} /> },
  { key: "equipamento_aventura", label: "Aventura", icon: <Package size={14} /> },
  { key: "bens_comuns", label: "Bens Comuns", icon: <Package size={14} /> },
  { key: "vestuario", label: "Vestuário", icon: <Shirt size={14} /> },
  { key: "ferramenta", label: "Ferramentas", icon: <Package size={14} /> },
  { key: "esoterico", label: "Esotérico", icon: <Star size={14} /> },
  { key: "alquimico_preparado", label: "Alquímicos", icon: <Beaker size={14} /> },
  { key: "alquimico_catalisador", label: "Catalisadores", icon: <Beaker size={14} /> },
  { key: "alquimia_mistica", label: "Alq. Mística", icon: <Beaker size={14} /> },
  { key: "alquimico_veneno", label: "Venenos", icon: <Beaker size={14} /> },
  { key: "item_magico", label: "Bazar Arcano", icon: <Star size={14} /> },
] as const;

const PROF_LABELS: Record<string, string> = {
  simples: "Simples", marcial: "Marcial", exotica: "Exótica",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isExpired(session: ShopSession): boolean {
  return new Date(session.expires_at) <= new Date();
}

function secondsUntil(isoDate: string): number {
  return Math.max(0, Math.floor((new Date(isoDate).getTime() - Date.now()) / 1000));
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ShopPage({ characterId, moneyPc, initialSession }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const validInitial = initialSession && !isExpired(initialSession) ? initialSession : null;

  const [session, setSession] = useState<ShopSession | null>(validInitial);
  const [sessionItems, setSessionItems] = useState<SessionItem[]>(validInitial?.items ?? []);
  const [countdown, setCountdown] = useState(validInitial ? secondsUntil(validInitial.expires_at) : 0);
  const [isCreating, setIsCreating] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SessionItem | null>(null);
  const [configImprovements, setConfigImprovements] = useState(0);
  const [configArcanium, setConfigArcanium] = useState(false);
  const [configArcaniumCircle, setConfigArcaniumCircle] = useState(1);
  const [currentMoney, setCurrentMoney] = useState(moneyPc);

  // Countdown timer — resets when session changes
  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => {
      const s = secondsUntil(session.expires_at);
      setCountdown(s);
      if (s === 0) {
        setSession(null);
        setSessionItems([]);
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [session]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  // ─── Stage selection ────────────────────────────────────────────────────────

  async function handleSelectStage(stage: number) {
    setIsCreating(true);
    const result = await createShopSession(stage);
    setIsCreating(false);
    if ("error" in result) {
      showToast(result.error);
      return;
    }
    setSession(result.session);
    setSessionItems(result.session.items);
    setCountdown(secondsUntil(result.session.expires_at));
    setCart([]);
    setCategory("");
    setSearch("");
  }

  // ─── Filters ────────────────────────────────────────────────────────────────

  const availableItems = sessionItems.filter((item) => item.qty !== 0);
  const availableCategoryKeys = new Set(availableItems.map((i) => i.category));
  const filteredCategories = CATEGORIES.filter((c) => !c.key || availableCategoryKeys.has(c.key));

  const filtered = availableItems.filter((item) => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || item.category === category;
    return matchSearch && matchCat;
  });

  // ─── Cart ────────────────────────────────────────────────────────────────────

  function addToCart(
    item: SessionItem,
    improvements = 0,
    isArcanium = false,
    arcaniumCircle?: number,
  ) {
    if (item.qty !== -1) {
      const inCart = cart
        .filter((e) => e.item.slug === item.slug)
        .reduce((s, e) => s + e.quantity, 0);
      if (inCart >= item.qty) {
        showToast(`Estoque insuficiente. Disponível: ${item.qty}`);
        return;
      }
    }

    setCart((prev) => {
      const existing = prev.find(
        (e) =>
          e.item.slug === item.slug &&
          e.improvements === improvements &&
          e.isArcanium === isArcanium &&
          e.arcaniumCircle === arcaniumCircle,
      );
      if (existing && item.is_stackable) {
        return prev.map((e) => (e === existing ? { ...e, quantity: e.quantity + 1 } : e));
      }
      return [...prev, { item, quantity: 1, improvements, isArcanium, arcaniumCircle }];
    });
    setSelectedItem(null);
    setConfigImprovements(0);
    setConfigArcanium(false);
    showToast(`${item.name} adicionado ao carrinho.`);
  }

  function removeFromCart(idx: number) {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  }

  const cartTotal = cart.reduce((s, e) => {
    const unit = priceWithArcanium(e.item.price_pc, e.improvements, e.arcaniumCircle);
    return s + unit * e.quantity;
  }, 0);

  const canAfford = currentMoney >= cartTotal;

  // ─── Buy ─────────────────────────────────────────────────────────────────────

  function handleBuy() {
    if (!session) return;
    startTransition(async () => {
      let newBalance = currentMoney;
      let updatedItems = sessionItems;

      for (const entry of cart) {
        const result = await buyFromSession({
          characterId,
          sessionId: session.id,
          itemSlug: entry.item.slug,
          quantity: entry.quantity,
          improvements: entry.improvements,
          isArcanium: entry.isArcanium,
          arcaniumSpellCircle: entry.arcaniumCircle,
        });
        if ("error" in result) {
          setSessionItems(updatedItems);
          showToast(result.error);
          return;
        }
        newBalance = result.newBalance;
        updatedItems = result.updatedItems;
      }

      setCurrentMoney(newBalance);
      setSessionItems(updatedItems);
      setCart([]);
      setShowCart(false);
      showToast(`Compra realizada! Saldo: ${formatMoney(newBalance)}`);
    });
  }

  const configPrice = selectedItem
    ? priceWithArcanium(
        selectedItem.price_pc,
        configImprovements,
        configArcanium ? configArcaniumCircle : undefined,
      )
    : 0;

  const stageInfo = session ? STAGE_INFO[session.stage as 1 | 2 | 3 | 4 | 5] : null;

  // ─── Stage selector ──────────────────────────────────────────────────────────

  if (!session) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f5c86a_0,#f6ead0_40%,#efe1bd_100%)]">
        <div className="sticky top-0 z-30 bg-stone-950/95 backdrop-blur border-b border-stone-800 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-full p-2 hover:bg-stone-800 transition text-stone-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <p className="text-xs text-stone-500 font-medium">Mercador Aldric</p>
            <p className="text-sm font-black text-amber-200 leading-tight">
              &ldquo;Onde estamos, viajante?&rdquo;
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black text-stone-800">Estágio da Loja</h2>
            <p className="text-stone-500 text-sm mt-1">
              O Narrador escolhe o tipo de localidade. Os itens são gerados aleatoriamente e
              compartilhados por 10 minutos.
            </p>
          </div>

          <div className="space-y-3">
            {([1, 2, 3, 4, 5] as const).map((stage) => {
              const info = STAGE_INFO[stage]!;
              return (
                <button
                  key={stage}
                  disabled={isCreating}
                  onClick={() => handleSelectStage(stage)}
                  className="w-full text-left bg-white/80 hover:bg-white border border-amber-200 hover:border-amber-400 rounded-2xl p-4 shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl leading-none mt-0.5">{info.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-stone-800">Estágio {stage}</span>
                        <span className="text-stone-400">—</span>
                        <span className="font-bold text-amber-800">{info.label}</span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        {info.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {isCreating && (
            <p className="text-center text-stone-500 text-sm animate-pulse">
              Gerando mercadorias...
            </p>
          )}
        </div>

        {toast && (
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-5 py-3 text-sm font-semibold text-amber-50 shadow-xl"
            style={{ background: "linear-gradient(135deg, #78350f, #b45309)", minWidth: 240 }}
          >
            {toast}
          </div>
        )}
      </div>
    );
  }

  // ─── Shop view ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f5c86a_0,#f6ead0_40%,#efe1bd_100%)]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-stone-950/95 backdrop-blur border-b border-stone-800 px-4 py-3 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="rounded-full p-2 hover:bg-stone-800 transition text-stone-400 hover:text-white shrink-0"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">{stageInfo?.icon}</span>
            <p className="text-xs text-stone-400 font-medium truncate">{stageInfo?.label}</p>
            <span
              className={`flex items-center gap-1 text-xs ml-auto shrink-0 ${
                countdown < 60 ? "text-red-400 animate-pulse" : "text-stone-500"
              }`}
            >
              <Clock size={11} />
              {formatCountdown(countdown)}
            </span>
          </div>
          <p className="text-sm font-black text-amber-200 leading-tight truncate">
            &ldquo;Bem-vindo, viajante. O que procura hoje?&rdquo;
          </p>
        </div>
        <button
          onClick={() => setSession(null)}
          className="rounded-full p-2 hover:bg-stone-800 transition text-stone-400 hover:text-stone-200 shrink-0"
          title="Nova loja"
        >
          <RefreshCw size={16} />
        </button>
        <div className="text-right shrink-0">
          <p className="text-xs text-stone-500">Saldo</p>
          <p className="text-sm font-black text-amber-400">{formatMoney(currentMoney)}</p>
        </div>
        <button
          onClick={() => setShowCart(true)}
          className="relative rounded-full p-2.5 bg-amber-800 hover:bg-amber-700 transition text-amber-50 shrink-0"
        >
          <ShoppingCart size={20} />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
              {cart.reduce((s, e) => s + e.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/80 border border-amber-200 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtros de categoria */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filteredCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                category === cat.key
                  ? "bg-amber-800 text-amber-50"
                  : "bg-white/70 text-stone-600 border border-stone-200 hover:border-amber-400"
              }`}
            >
              {"icon" in cat && cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-stone-500">
          {filtered.length} {filtered.length === 1 ? "item" : "itens"}
        </p>

        {/* Lista de itens */}
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.slug}
              className="bg-white/80 border border-amber-100 rounded-xl overflow-hidden shadow-sm"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-100">
                  <ItemIcon slug={item.slug} category={item.category} size={22} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-stone-900">{item.name}</p>
                    {item.qty !== -1 && (
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          item.qty === 1
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        ×{item.qty}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 truncate">
                    {item.weapon_damage_dice &&
                      `${item.weapon_damage_dice} · ${item.weapon_critical} · `}
                    {item.armor_defense_bonus && `+${item.armor_defense_bonus} Def · `}
                    {item.weapon_proficiency && `${PROF_LABELS[item.weapon_proficiency]} · `}
                    {item.spaces > 0 && `${item.spaces} espaço${item.spaces !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-amber-900 text-sm">{formatMoneyPP(item.price_pc)}</p>
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setConfigImprovements(0);
                      setConfigArcanium(false);
                    }}
                    className="mt-1 text-xs font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2"
                  >
                    + Carrinho
                  </button>
                </div>
              </div>

              {item.description && (
                <div className="px-4 pb-3">
                  <p className="text-xs text-stone-500 italic">{item.description}</p>
                  {item.weapon_abilities?.length > 0 && (
                    <p className="text-xs text-amber-700 mt-1">
                      ✦ {item.weapon_abilities.join(", ")}
                    </p>
                  )}
                  {item.armor_penalty !== null && item.armor_penalty !== 0 && (
                    <p className="text-xs text-red-600 mt-1">Penalidade: {item.armor_penalty}</p>
                  )}
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-stone-400">
              <Package size={36} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">Nenhum item encontrado</p>
              <p className="text-sm mt-1">Tente outro termo ou categoria</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: configurar item ─────────────────────────────────────────── */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div className="w-full sm:max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-amber-900 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="font-black text-amber-50">{selectedItem.name}</p>
                <p className="text-amber-300 text-xs">
                  {formatMoneyPP(selectedItem.price_pc)} base
                  {selectedItem.qty !== -1 && (
                    <span
                      className={`ml-2 px-1.5 rounded-full text-[10px] font-black ${
                        selectedItem.qty === 1
                          ? "bg-red-900/60 text-red-200"
                          : "bg-amber-800/60 text-amber-200"
                      }`}
                    >
                      ×{selectedItem.qty} em estoque
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-amber-300 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {selectedItem.description && (
                <p className="text-sm text-stone-600 italic">{selectedItem.description}</p>
              )}

              {/* Item Superior */}
              {["arma", "armadura", "escudo", "esoterico"].includes(selectedItem.category) && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Item Superior
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setConfigImprovements((i) => Math.max(0, i - 1))}
                      className="w-8 h-8 rounded-lg bg-stone-100 font-bold text-stone-700 hover:bg-stone-200 transition flex items-center justify-center"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="flex-1 text-center font-bold text-sm">
                      {configImprovements} melhoria{configImprovements !== 1 ? "s" : ""}
                      {configImprovements === 4 ? " (obra-prima)" : ""}
                    </span>
                    <button
                      onClick={() => setConfigImprovements((i) => Math.min(4, i + 1))}
                      className="w-8 h-8 rounded-lg bg-stone-100 font-bold text-stone-700 hover:bg-stone-200 transition flex items-center justify-center"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="text-xs text-stone-400 mt-1 text-center">
                    Cada melhoria: +50% no preço
                  </p>
                </div>
              )}

              {/* Arcanium */}
              {["arma", "armadura", "escudo"].includes(selectedItem.category) && (
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="arcanium"
                      checked={configArcanium}
                      onChange={(e) => setConfigArcanium(e.target.checked)}
                      className="accent-amber-700"
                    />
                    <label htmlFor="arcanium" className="text-sm font-bold text-stone-700">
                      Metal Arcanium
                    </label>
                  </div>
                  {configArcanium && (
                    <div className="mt-2">
                      <p className="text-xs text-stone-500 mb-1">Círculo da magia:</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((c) => (
                          <button
                            key={c}
                            onClick={() => setConfigArcaniumCircle(c)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                              configArcaniumCircle === c
                                ? "bg-purple-700 text-white"
                                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                            }`}
                          >
                            {c}º
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Preço final */}
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex justify-between items-center">
                <span className="text-sm text-stone-600">Preço final</span>
                <span className="font-black text-amber-900 text-lg">
                  {formatMoneyPP(configPrice)}
                </span>
              </div>

              {currentMoney < configPrice && (
                <p className="text-xs text-red-600 text-center">
                  Saldo insuficiente para este item.
                </p>
              )}

              <button
                disabled={currentMoney < configPrice}
                onClick={() =>
                  addToCart(
                    selectedItem,
                    configImprovements,
                    configArcanium,
                    configArcanium ? configArcaniumCircle : undefined,
                  )
                }
                className="w-full py-3.5 rounded-xl font-black text-base transition disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #78350f, #b45309)", color: "#fef3c7" }}
              >
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Carrinho ──────────────────────────────────────────────────────── */}
      {showCart && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div className="w-full sm:max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-stone-950 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 text-amber-50">
                <ShoppingCart size={18} />
                <p className="font-black">
                  Carrinho ({cart.reduce((s, e) => s + e.quantity, 0)} itens)
                </p>
              </div>
              <button onClick={() => setShowCart(false)} className="text-stone-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-stone-400">
                  <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Carrinho vazio</p>
                </div>
              ) : (
                cart.map((entry, i) => {
                  const unitPrice = priceWithArcanium(
                    entry.item.price_pc,
                    entry.improvements,
                    entry.arcaniumCircle,
                  );
                  return (
                    <div key={i} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-stone-900 text-sm truncate">
                          {entry.item.name}
                        </p>
                        <p className="text-xs text-stone-400">
                          {formatMoneyPP(unitPrice)} × {entry.quantity}
                          {entry.improvements > 0 && ` · +${entry.improvements} melhoria`}
                          {entry.isArcanium && ` · Arcanium ${entry.arcaniumCircle}º`}
                        </p>
                      </div>
                      <p className="font-black text-amber-800 text-sm shrink-0">
                        {formatMoneyPP(unitPrice * entry.quantity)}
                      </p>
                      <button
                        onClick={() => removeFromCart(i)}
                        className="text-stone-400 hover:text-red-500 transition shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-stone-200 px-5 py-4 space-y-3 flex-shrink-0">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Total</span>
                <span className="font-black text-stone-900">{formatMoneyPP(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Saldo após compra</span>
                <span
                  className={`font-black ${canAfford ? "text-emerald-700" : "text-red-600"}`}
                >
                  {formatMoney(currentMoney - cartTotal)}
                </span>
              </div>
              {!canAfford && (
                <p className="text-xs text-red-600 text-center">Saldo insuficiente.</p>
              )}

              <button
                onClick={handleBuy}
                disabled={!canAfford || isPending || cart.length === 0}
                className="w-full py-4 rounded-xl font-black text-base uppercase tracking-widest transition disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #78350f, #b45309)", color: "#fef3c7" }}
              >
                {isPending ? "Processando..." : "💰 Finalizar Compra"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-5 py-3 text-sm font-semibold text-amber-50 shadow-xl"
          style={{ background: "linear-gradient(135deg, #78350f, #b45309)", minWidth: 240 }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
