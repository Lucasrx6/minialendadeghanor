"use client";

import { useState, useEffect, useRef } from "react";
import { X, RotateCcw, Palette } from "lucide-react";
import { HitEffect, type HitEffectType } from "@/components/dice/HitEffect";

// ─── Tipos ────────────────────────────────────────────────────────────────────

const DICE_TYPES = [4, 6, 8, 10, 12, 20] as const;
type DieType = (typeof DICE_TYPES)[number];
type DicePalette = Record<DieType, { bg: string; border: string; text: string }>;

type DiceSkin = {
  id: string;
  name: string;
  swatch: string;
  palette: DicePalette;
  table: string;
};

const SKINS: DiceSkin[] = [
  {
    id: "classico",
    name: "Clássico",
    swatch: "#d97706",
    palette: {
      4:  { bg: "#7c2d12", border: "#ea580c", text: "#fed7aa" },
      6:  { bg: "#1e3a5f", border: "#3b82f6", text: "#bfdbfe" },
      8:  { bg: "#14532d", border: "#22c55e", text: "#bbf7d0" },
      10: { bg: "#4a1d96", border: "#a855f7", text: "#e9d5ff" },
      12: { bg: "#881337", border: "#f43f5e", text: "#fecdd3" },
      20: { bg: "#78350f", border: "#d97706", text: "#fef3c7" },
    },
    table: [
      "radial-gradient(ellipse at 50% 115%, rgba(160,90,20,0.22) 0%, transparent 55%)",
      "radial-gradient(ellipse at 50% 60%, rgba(60,38,18,0.55) 0%, transparent 80%)",
      "linear-gradient(180deg, #0e0905 0%, #1c1309 35%, #281a0d 65%, #1a0e06 100%)",
    ].join(", "),
  },
  {
    id: "ouro",
    name: "Ouro Real",
    swatch: "#fbbf24",
    palette: {
      4:  { bg: "#451a03", border: "#d97706", text: "#fde68a" },
      6:  { bg: "#3d1f00", border: "#f59e0b", text: "#fef3c7" },
      8:  { bg: "#522b0e", border: "#fbbf24", text: "#fefce8" },
      10: { bg: "#78350f", border: "#fb923c", text: "#ffedd5" },
      12: { bg: "#5c2d0a", border: "#f97316", text: "#fff7ed" },
      20: { bg: "#1c0a00", border: "#fcd34d", text: "#fffbeb" },
    },
    table: [
      "radial-gradient(ellipse at 50% 100%, rgba(200,140,20,0.28) 0%, transparent 60%)",
      "linear-gradient(180deg, #0a0500 0%, #150d02 40%, #1e1302 70%, #0a0500 100%)",
    ].join(", "),
  },
  {
    id: "sangue",
    name: "Sangue",
    swatch: "#ef4444",
    palette: {
      4:  { bg: "#3f0000", border: "#dc2626", text: "#fecaca" },
      6:  { bg: "#450a0a", border: "#ef4444", text: "#fee2e2" },
      8:  { bg: "#4c0519", border: "#f43f5e", text: "#ffe4e6" },
      10: { bg: "#500724", border: "#e11d48", text: "#fce7f3" },
      12: { bg: "#3f0011", border: "#fb7185", text: "#fff1f2" },
      20: { bg: "#7f1d1d", border: "#f87171", text: "#fff5f5" },
    },
    table: [
      "radial-gradient(ellipse at 50% 100%, rgba(185,28,28,0.22) 0%, transparent 60%)",
      "linear-gradient(180deg, #080000 0%, #140202 40%, #1c0303 70%, #080000 100%)",
    ].join(", "),
  },
  {
    id: "gelo",
    name: "Gelo",
    swatch: "#38bdf8",
    palette: {
      4:  { bg: "#0c1a2e", border: "#38bdf8", text: "#e0f2fe" },
      6:  { bg: "#0a1929", border: "#7dd3fc", text: "#bae6fd" },
      8:  { bg: "#042f4b", border: "#0ea5e9", text: "#e0f2fe" },
      10: { bg: "#0f2a44", border: "#60a5fa", text: "#dbeafe" },
      12: { bg: "#0c1a2e", border: "#93c5fd", text: "#eff6ff" },
      20: { bg: "#0a1a3f", border: "#bae6fd", text: "#f0f9ff" },
    },
    table: [
      "radial-gradient(ellipse at 50% 100%, rgba(14,165,233,0.18) 0%, transparent 60%)",
      "linear-gradient(180deg, #020507 0%, #030c14 40%, #041420 70%, #020507 100%)",
    ].join(", "),
  },
  {
    id: "floresta",
    name: "Floresta",
    swatch: "#22c55e",
    palette: {
      4:  { bg: "#052e16", border: "#22c55e", text: "#bbf7d0" },
      6:  { bg: "#14532d", border: "#4ade80", text: "#dcfce7" },
      8:  { bg: "#052e16", border: "#16a34a", text: "#bbf7d0" },
      10: { bg: "#1a2e05", border: "#84cc16", text: "#ecfccb" },
      12: { bg: "#2d1b0a", border: "#a3e635", text: "#f7fee7" },
      20: { bg: "#064e3b", border: "#6ee7b7", text: "#d1fae5" },
    },
    table: [
      "radial-gradient(ellipse at 50% 100%, rgba(22,163,74,0.18) 0%, transparent 60%)",
      "linear-gradient(180deg, #030a05 0%, #061008 40%, #081508 70%, #030a05 100%)",
    ].join(", "),
  },
  {
    id: "arcano",
    name: "Arcano",
    swatch: "#a855f7",
    palette: {
      4:  { bg: "#2e1065", border: "#8b5cf6", text: "#ede9fe" },
      6:  { bg: "#3b0764", border: "#a855f7", text: "#f3e8ff" },
      8:  { bg: "#1e1b4b", border: "#818cf8", text: "#e0e7ff" },
      10: { bg: "#2e1065", border: "#c084fc", text: "#faf5ff" },
      12: { bg: "#4a044e", border: "#d946ef", text: "#fdf4ff" },
      20: { bg: "#18181b", border: "#e879f9", text: "#fce7f3" },
    },
    table: [
      "radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.22) 0%, transparent 60%)",
      "linear-gradient(180deg, #030205 0%, #070412 40%, #0c051e 70%, #030205 100%)",
    ].join(", "),
  },
  {
    id: "sombra",
    name: "Sombra",
    swatch: "#94a3b8",
    palette: {
      4:  { bg: "#09090b", border: "#6b7280", text: "#d1d5db" },
      6:  { bg: "#111827", border: "#9ca3af", text: "#e5e7eb" },
      8:  { bg: "#0f0f23", border: "#6366f1", text: "#e0e7ff" },
      10: { bg: "#0c0c1a", border: "#818cf8", text: "#e0e7ff" },
      12: { bg: "#09090b", border: "#4b5563", text: "#d1d5db" },
      20: { bg: "#0a0a14", border: "#e2e8f0", text: "#f8fafc" },
    },
    table: [
      "radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.12) 0%, transparent 60%)",
      "linear-gradient(180deg, #020202 0%, #050508 40%, #080810 70%, #020202 100%)",
    ].join(", "),
  },
];

const SKIN_STORAGE_KEY = "dice-skin-id";

type RollEntry = { die: DieType; result: number };

type Props = {
  open: boolean;
  onClose: () => void;
  preLabel?: string;
  preModifier?: number;
  preModifierBreakdown?: string;
  preCounts?: Partial<Record<4 | 6 | 8 | 10 | 12 | 20, number>>;
  hitEffect?: HitEffectType;
};

const CONTAINER_ID = "dice-box-scene";

// ─── Ícone SVG do dado ────────────────────────────────────────────────────────

function DieIcon({
  die, fill, stroke, textColor, disabled,
}: {
  die: DieType; fill: string; stroke: string; textColor: string; disabled: boolean;
}) {
  const detailColor = disabled ? "#4b5563" : textColor;

  const poly = {
    fill, stroke,
    strokeWidth: 3.5,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };

  const num = (x: number, y: number, size: number) => (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
      fontSize={size} fontWeight="900"
      fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
      fill={textColor} style={{ userSelect: "none", pointerEvents: "none" }}>
      {die}
    </text>
  );

  const detail = (d: string) => (
    <path d={d} stroke={detailColor} strokeWidth={1.5} fill="none" opacity={0.25} strokeLinecap="round" />
  );

  switch (die) {
    case 4:
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,5 93,88 7,88" {...poly} />
          {detail("M50,5 L50,88 M93,88 L28.5,46.5 M7,88 L71.5,46.5")}
          {num(50, 68, 21)}
        </svg>
      );
    case 6:
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,12 86,32 50,52 14,32" {...poly} />
          <polygon points="14,32 14,72 50,92 50,52" {...poly} />
          <polygon points="50,52 86,32 86,72 50,92" {...poly} />
          {num(50, 64, 24)}
        </svg>
      );
    case 8:
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,5 95,50 50,95 5,50" {...poly} />
          {detail("M50,5 L50,95 M5,50 L95,50")}
          {num(50, 53, 24)}
        </svg>
      );
    case 10:
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,5 90,44 68,93 32,93 10,44" {...poly} />
          {detail("M50,5 L50,93 M10,44 L90,44")}
          {num(50, 58, 19)}
        </svg>
      );
    case 12:
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,8 92,37 76,88 24,88 8,37" {...poly} />
          {detail("M50,8 L50,52 M92,37 L50,52 M76,88 L50,52 M24,88 L50,52 M8,37 L50,52")}
          {num(50, 55, 20)}
        </svg>
      );
    case 20:
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,10 90,82 10,82" {...poly} />
          {detail("M70,46 L50,82 L30,46 Z")}
          {num(50, 64, 18)}
        </svg>
      );
  }
}

// ─── Seletor de Skin ──────────────────────────────────────────────────────────

function SkinPicker({
  skins,
  currentId,
  onSelect,
}: {
  skins: DiceSkin[];
  currentId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5 border-t border-stone-800 bg-stone-900/60"
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 shrink-0 mr-1">
        Skin
      </span>
      {skins.map((skin) => {
        const active = skin.id === currentId;
        return (
          <button
            key={skin.id}
            title={skin.name}
            onClick={() => onSelect(skin.id)}
            className="relative shrink-0 rounded-full transition-transform active:scale-90"
            style={{
              width: 26,
              height: 26,
              background: skin.swatch,
              boxShadow: active
                ? `0 0 0 2px #1c1917, 0 0 0 4px ${skin.swatch}`
                : "none",
              border: active ? `2px solid ${skin.swatch}` : "2px solid transparent",
            }}
          >
            {active && (
              <span
                className="absolute inset-0 flex items-center justify-center text-[10px] font-black"
                style={{ color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
              >
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function RollDialog({
  open, onClose, preLabel,
  preModifier = 0, preModifierBreakdown,
  preCounts: _preCounts, hitEffect,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const diceBoxRef = useRef<any>(null);
  const hasRolledRef = useRef(false);

  const [ready, setReady]           = useState(false);
  const [isRolling, setIsRolling]   = useState(false);
  const [results, setResults]       = useState<RollEntry[]>([]);
  const [initError, setInitError]   = useState<string | null>(null);
  const [playingEffect, setPlayingEffect] = useState(false);
  const [showSkins, setShowSkins]   = useState(false);

  const [skinId, setSkinId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(SKIN_STORAGE_KEY) ?? "classico";
    }
    return "classico";
  });

  const currentSkin = SKINS.find((s) => s.id === skinId) ?? SKINS[0];
  const COLORS = currentSkin.palette;

  function selectSkin(id: string) {
    setSkinId(id);
    localStorage.setItem(SKIN_STORAGE_KEY, id);
  }

  const naturalSum = results.reduce((s, r) => s + r.result, 0);
  const finalTotal = naturalSum + preModifier;

  // ── Fechar (com efeito opcional) ────────────────────────────────────────────

  function requestClose() {
    if (hitEffect && results.length > 0 && !playingEffect) {
      setPlayingEffect(true);
    } else {
      onClose();
    }
  }

  // ── Init / cleanup ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) {
      if (diceBoxRef.current) {
        try { diceBoxRef.current.clear(); } catch { /* ignore */ }
        diceBoxRef.current = null;
      }
      setReady(false);
      setIsRolling(false);
      setResults([]);
      setInitError(null);
      setPlayingEffect(false);
      setShowSkins(false);
      hasRolledRef.current = false;
      return;
    }

    let cancelled = false;

    const run = async () => {
      await new Promise<void>((r) => setTimeout(r, 150));
      if (cancelled || !containerRef.current) return;

      try {
        // Carrega direto do /public — evita problema de imports circulares no webpack
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mod = await (Function('return import("/dice-box/dice-box.es.js")')() as Promise<any>);
        const DiceBox = mod.default;
        if (cancelled) return;

        const db = new DiceBox({
          container: `#${CONTAINER_ID}`,
          assetPath: "/dice-box/",
          theme: "default",
          offscreen: false,
          gravity: 2, mass: 1, friction: 0.8, restitution: 0.4,
          angularDamping: 0.4, linearDamping: 0.4,
          spinForce: 5, throwForce: 4, startingHeight: 8, scale: 6,
          id: "dice-box-canvas-el",
        });

        await db.init();
        if (cancelled) return;

        const canvas = document.getElementById("dice-box-canvas-el") as HTMLCanvasElement | null;
        if (canvas) { canvas.style.width = "100%"; canvas.style.height = "100%"; }

        db.onRollComplete = (allResults: Array<{ sides: number; value: number }>) => {
          setResults(allResults.map((r) => ({ die: r.sides as DieType, result: r.value })));
          setIsRolling(false);
        };

        diceBoxRef.current = db;
        setReady(true);
      } catch (err) {
        if (!cancelled) {
          console.error("[DiceBox] init error:", err);
          setInitError(err instanceof Error ? err.message : String(err));
        }
      }
    };

    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Esc para fechar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (open && e.key === "Escape") requestClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, hitEffect, playingEffect]);

  // ── Ações ───────────────────────────────────────────────────────────────────

  function addDie(die: DieType) {
    const db = diceBoxRef.current;
    if (!db || !ready) return;
    setIsRolling(true);
    if (!hasRolledRef.current) {
      hasRolledRef.current = true;
      db.roll(`1d${die}`);
    } else {
      db.add(`1d${die}`);
    }
  }

  function handleClear() {
    const db = diceBoxRef.current;
    if (!db) return;
    db.clear();
    setResults([]);
    hasRolledRef.current = false;
    setIsRolling(false);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (!open) return null;

  const isCrit   = results.length >= 1 && results.some(r => r.die === 20 && r.result === 20);
  const isFumble = results.length === 1 && results[0].die === 20 && results[0].result === 1;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(5,5,10,0.90)" }}
      role="dialog" aria-modal="true" aria-label="Rolagem de dados"
    >
      {/* ── Canvas 3D ── */}
      <div
        id={CONTAINER_ID}
        ref={containerRef}
        className="flex-1 relative"
        style={{
          minHeight: 200,
          background: currentSkin.table,
          boxShadow: "inset 0 -60px 80px rgba(0,0,0,0.3)",
        }}
      />

      {/* ── Animação de dano (cobre o canvas quando fechar é acionado) ── */}
      {playingEffect && hitEffect && (
        <HitEffect type={hitEffect} onDone={onClose} />
      )}

      {/* Cabeçalho flutuante */}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between px-5 pt-5 pointer-events-none z-10">
        <div className="pointer-events-auto">
          {preLabel && (
            <p className="font-black text-amber-50 text-xl drop-shadow-lg">{preLabel}</p>
          )}
          {preModifier !== 0 && preModifierBreakdown && (
            <p className="text-xs text-stone-400 mt-0.5 drop-shadow">
              {preModifierBreakdown}{" "}={" "}
              <span className="text-amber-400 font-bold">
                {preModifier >= 0 ? "+" : ""}{preModifier}
              </span>
            </p>
          )}
        </div>
        <button
          onClick={requestClose}
          className="pointer-events-auto rounded-full p-2 bg-stone-900/70 text-stone-400 hover:text-white hover:bg-stone-800 transition"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
      </div>

      {/* ── Painel inferior ── */}
      <div className="bg-stone-950 border-t border-stone-800 shrink-0">

        {/* Skin picker — expande acima do painel */}
        {showSkins && (
          <SkinPicker skins={SKINS} currentId={skinId} onSelect={(id) => { selectSkin(id); }} />
        )}

        <div className="px-4 pt-3 pb-safe pb-5">
          {/* Resultados */}
          {results.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              {results.map((r, i) => (
                <span key={i}
                  className="inline-flex flex-col items-center justify-center rounded-lg w-10 h-10 shrink-0 animate-in fade-in zoom-in duration-200"
                  style={{ background: COLORS[r.die].bg, border: `1.5px solid ${COLORS[r.die].border}` }}
                >
                  <span className="font-black text-sm leading-none" style={{ color: COLORS[r.die].text }}>
                    {r.result}
                  </span>
                  <span className="text-[9px] opacity-50" style={{ color: COLORS[r.die].text }}>d{r.die}</span>
                </span>
              ))}
              <div className="ml-auto text-right shrink-0">
                {preModifier !== 0 ? (
                  <>
                    <p className="text-[10px] text-stone-500 leading-none">
                      {naturalSum} {preModifier >= 0 ? "+" : ""}{preModifier}
                    </p>
                    <p className="text-3xl font-black text-amber-400 leading-tight">{finalTotal}</p>
                  </>
                ) : (
                  <p className="text-3xl font-black text-amber-400">{naturalSum}</p>
                )}
              </div>
            </div>
          )}

          {/* Crítico / falha */}
          {!isRolling && results.length > 0 && (isCrit || isFumble) && (
            <p className={`text-xs font-black text-center mb-2 tracking-widest ${isCrit ? "text-amber-400" : "text-red-400"}`}>
              {isCrit ? "⚡ ACERTO CRÍTICO!" : "💀 FALHA CRÍTICA!"}
            </p>
          )}

          {/* Botões de dados — ícones SVG */}
          <div className="grid grid-cols-6 gap-2 mb-3">
            {DICE_TYPES.map((die) => {
              const c = COLORS[die];
              const disabled = !ready || !!initError;
              return (
                <button key={die} onClick={() => addDie(die)} disabled={disabled}
                  title={`Rolar 1d${die}`}
                  className="flex items-center justify-center rounded-xl transition active:scale-90 hover:brightness-125 focus-visible:outline-none"
                  style={{
                    aspectRatio: "1", padding: "6px",
                    background: disabled ? "#1f2937" : c.bg + "33",
                    border: `2px solid ${disabled ? "#374151" : c.border}`,
                  }}
                >
                  <DieIcon die={die}
                    fill={disabled ? "#374151" : c.bg}
                    stroke={disabled ? "#4b5563" : c.border}
                    textColor={disabled ? "#6b7280" : c.text}
                    disabled={disabled}
                  />
                </button>
              );
            })}
          </div>

          {/* Rodapé */}
          <div className="flex items-center gap-2">
            <button onClick={handleClear} disabled={results.length === 0 && !isRolling}
              className="rounded-xl p-2.5 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Limpar mesa" aria-label="Limpar dados"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={() => setShowSkins((v) => !v)}
              title="Trocar skin dos dados"
              className="rounded-xl p-2.5 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:bg-stone-800 transition"
              style={{
                borderColor: showSkins ? currentSkin.swatch + "88" : undefined,
                color: showSkins ? currentSkin.swatch : undefined,
              }}
            >
              <Palette size={16} />
            </button>

            <p className="flex-1 text-center text-xs text-stone-600">
              {initError ? `Erro: ${initError}`
                : !ready        ? "Carregando…"
                : isRolling     ? "Rolando…"
                : results.length === 0 ? "Toque em um dado para rolar"
                : "Toque para adicionar mais dados"}
            </p>

            <button onClick={requestClose}
              className="rounded-xl px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-sm transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
