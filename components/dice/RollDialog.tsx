"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, RotateCcw, Palette } from "lucide-react";
import { HitEffect, type HitEffectType } from "@/components/dice/HitEffect";
import { DiceBox3D, type DiceBox3DHandle, type DiceResult } from "@/components/dice/DiceBox3D";

// ─── Tipos ────────────────────────────────────────────────────────────────────

const DICE_TYPES = [4, 6, 8, 10, 12, 20] as const;
type DieType = (typeof DICE_TYPES)[number];

type DiceSkin = {
  id: string;
  name: string;
  swatch: string;
  themeColor: string;
  table: string;
};

const SKINS: DiceSkin[] = [
  {
    id: "classico",
    name: "Clássico",
    swatch: "#d97706",
    themeColor: "#b45309",
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
    themeColor: "#d97706",
    table: [
      "radial-gradient(ellipse at 50% 100%, rgba(200,140,20,0.28) 0%, transparent 60%)",
      "linear-gradient(180deg, #0a0500 0%, #150d02 40%, #1e1302 70%, #0a0500 100%)",
    ].join(", "),
  },
  {
    id: "sangue",
    name: "Sangue",
    swatch: "#ef4444",
    themeColor: "#dc2626",
    table: [
      "radial-gradient(ellipse at 50% 100%, rgba(185,28,28,0.22) 0%, transparent 60%)",
      "linear-gradient(180deg, #080000 0%, #140202 40%, #1c0303 70%, #080000 100%)",
    ].join(", "),
  },
  {
    id: "gelo",
    name: "Gelo",
    swatch: "#38bdf8",
    themeColor: "#0284c7",
    table: [
      "radial-gradient(ellipse at 50% 100%, rgba(14,165,233,0.18) 0%, transparent 60%)",
      "linear-gradient(180deg, #020507 0%, #030c14 40%, #041420 70%, #020507 100%)",
    ].join(", "),
  },
  {
    id: "floresta",
    name: "Floresta",
    swatch: "#22c55e",
    themeColor: "#15803d",
    table: [
      "radial-gradient(ellipse at 50% 100%, rgba(22,163,74,0.18) 0%, transparent 60%)",
      "linear-gradient(180deg, #030a05 0%, #061008 40%, #081508 70%, #030a05 100%)",
    ].join(", "),
  },
  {
    id: "arcano",
    name: "Arcano",
    swatch: "#a855f7",
    themeColor: "#7c3aed",
    table: [
      "radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.22) 0%, transparent 60%)",
      "linear-gradient(180deg, #030205 0%, #070412 40%, #0c051e 70%, #030205 100%)",
    ].join(", "),
  },
  {
    id: "sombra",
    name: "Sombra",
    swatch: "#94a3b8",
    themeColor: "#475569",
    table: [
      "radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.12) 0%, transparent 60%)",
      "linear-gradient(180deg, #020202 0%, #050508 40%, #080810 70%, #020202 100%)",
    ].join(", "),
  },
];

// Cores fixas dos botões de dado (independente de skin)
const DIE_BTN: Record<DieType, { bg: string; border: string; text: string }> = {
  4:  { bg: "#7c2d12", border: "#ea580c", text: "#fed7aa" },
  6:  { bg: "#1e3a5f", border: "#3b82f6", text: "#bfdbfe" },
  8:  { bg: "#14532d", border: "#22c55e", text: "#bbf7d0" },
  10: { bg: "#4a1d96", border: "#a855f7", text: "#e9d5ff" },
  12: { bg: "#881337", border: "#f43f5e", text: "#fecdd3" },
  20: { bg: "#78350f", border: "#d97706", text: "#fef3c7" },
};

const SKIN_STORAGE_KEY = "dice-skin-id";

type Props = {
  open: boolean;
  onClose: () => void;
  preLabel?: string;
  preModifier?: number;
  preModifierBreakdown?: string;
  preCounts?: Partial<Record<4 | 6 | 8 | 10 | 12 | 20, number>>;
  hitEffect?: HitEffectType;
};

// ─── Ícone SVG do dado (usado nos botões) ─────────────────────────────────────

function DieIcon({
  die, fill, stroke, textColor,
}: {
  die: DieType; fill: string; stroke: string; textColor: string;
}) {
  const poly = { fill, stroke, strokeWidth: 3.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const num = (x: number, y: number, size: number) => (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
      fontSize={size} fontWeight="900"
      fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
      fill={textColor} style={{ userSelect: "none", pointerEvents: "none" }}>
      {die}
    </text>
  );
  const detail = (d: string) => (
    <path d={d} stroke={textColor} strokeWidth={1.5} fill="none" opacity={0.2} strokeLinecap="round" />
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

// ─── Seletor de skin ──────────────────────────────────────────────────────────

function SkinPicker({ skins, currentId, onSelect }: {
  skins: DiceSkin[]; currentId: string; onSelect: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-t border-white/[0.06] bg-black/20">
      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 shrink-0 mr-1">Skin</span>
      {skins.map((skin) => {
        const active = skin.id === currentId;
        return (
          <button
            key={skin.id}
            title={skin.name}
            onClick={() => onSelect(skin.id)}
            className="relative shrink-0 rounded-full transition-transform active:scale-90"
            style={{
              width: 26, height: 26,
              background: skin.swatch,
              boxShadow: active ? `0 0 0 2px #0a0a0a, 0 0 0 4px ${skin.swatch}` : "none",
              border: active ? `2px solid ${skin.swatch}` : "2px solid transparent",
            }}
          >
            {active && (
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black"
                style={{ color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}>
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function RollDialog({
  open, onClose, preLabel,
  preModifier = 0, preModifierBreakdown,
  preCounts, hitEffect,
}: Props) {
  const [diceResults, setDiceResults] = useState<DiceResult[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [showSkins, setShowSkins] = useState(false);
  const [playingEffect, setPlayingEffect] = useState(false);
  const hasAutoRolledRef = useRef(false);
  const diceBoxRef = useRef<DiceBox3DHandle>(null);

  const [skinId, setSkinId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(SKIN_STORAGE_KEY) ?? "classico";
    }
    return "classico";
  });

  const currentSkin = SKINS.find((s) => s.id === skinId) ?? SKINS[0];

  const naturalSum = diceResults.reduce((s, d) => s + d.value, 0);
  const finalTotal = naturalSum + preModifier;
  const isCrit   = !isRolling && diceResults.length > 0 && diceResults.some((d) => d.sides === 20 && d.value === 20);
  const isFumble = !isRolling && diceResults.length === 1 && diceResults[0].sides === 20 && diceResults[0].value === 1;

  function handleRollComplete(results: DiceResult[]) {
    setDiceResults(results);
    setIsRolling(false);
  }

  function handleRollStart() {
    setIsRolling(true);
  }

  function addDie(die: DieType) {
    setIsRolling(true);
    diceBoxRef.current?.addDie(die);
  }

  function selectSkin(id: string) {
    setSkinId(id);
    localStorage.setItem(SKIN_STORAGE_KEY, id);
    const skin = SKINS.find((s) => s.id === id) ?? SKINS[0];
    diceBoxRef.current?.updateThemeColor(skin.themeColor);
  }

  function handleClear() {
    setDiceResults([]);
    setIsRolling(false);
    diceBoxRef.current?.clear();
    const random = SKINS[Math.floor(Math.random() * SKINS.length)];
    selectSkin(random.id);
  }

  function requestClose() {
    if (hitEffect && diceResults.length > 0 && !playingEffect) {
      setPlayingEffect(true);
    } else {
      onClose();
    }
  }

  // Reset + auto-roll ao abrir
  useEffect(() => {
    if (!open) {
      diceBoxRef.current?.clear();
      setDiceResults([]);
      setIsRolling(false);
      setPlayingEffect(false);
      setShowSkins(false);
      hasAutoRolledRef.current = false;
      return;
    }

    // Skin aleatória ao abrir
    const random = SKINS[Math.floor(Math.random() * SKINS.length)];
    setSkinId(random.id);
    diceBoxRef.current?.updateThemeColor(random.themeColor);

    if (preCounts && !hasAutoRolledRef.current) {
      hasAutoRolledRef.current = true;
      let delay = 80;
      for (const [dieStr, count] of Object.entries(preCounts)) {
        const die = Number(dieStr) as DieType;
        for (let i = 0; i < (count ?? 0); i++) {
          const d = delay;
          setTimeout(() => diceBoxRef.current?.addDie(die), d);
          delay += 110;
        }
      }
      if (delay > 80) setIsRolling(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Esc para fechar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, diceResults.length, hitEffect, playingEffect]);

  // Sem SSR
  if (typeof document === "undefined") return null;

  // Portal sempre montado para manter DiceBox3D vivo (sem re-inicialização a cada abertura)
  return createPortal(
    <>
      {playingEffect && hitEffect && open && (
        <HitEffect type={hitEffect} onDone={onClose} />
      )}

      <div
        aria-modal={open}
        aria-hidden={!open}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          background: open ? "rgba(0,0,0,0.80)" : "transparent",
          backdropFilter: open ? "blur(6px)" : "none",
          // Não use opacity/visibility para não bloquear o canvas quando escondido
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={open ? requestClose : undefined}
      >
        {/* Modal card */}
        <div
          className="relative w-full rounded-2xl flex flex-col shadow-2xl"
          style={{
            maxWidth: 580,
            maxHeight: "90vh",
            background: currentSkin.table,
            border: "1.5px solid rgba(255,255,255,0.07)",
            boxShadow: "0 32px 96px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04)",
            // Quando fechado: sem interação, mas mantém dimensões para DiceBox3D
            visibility: open ? "visible" : "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabeçalho */}
          <div className="flex items-start justify-between px-5 pt-5 pb-3 shrink-0">
            <div className="min-w-0">
              {preLabel && (
                <p className="font-black text-amber-50 text-lg leading-tight">{preLabel}</p>
              )}
              {preModifier !== 0 && preModifierBreakdown && (
                <p className="text-xs text-stone-400 mt-0.5">
                  {preModifierBreakdown} ={" "}
                  <span className="font-bold text-amber-400">
                    {preModifier >= 0 ? "+" : ""}{preModifier}
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={requestClose}
              className="ml-4 shrink-0 rounded-full p-2 bg-black/30 text-stone-400 hover:text-white hover:bg-black/50 transition"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Canvas 3D — sempre montado */}
          <div
            style={{
              height: 380,
              position: "relative",
              flexShrink: 0,
              overflow: "hidden",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <DiceBox3D
              ref={diceBoxRef}
              onRollStart={handleRollStart}
              onRollComplete={handleRollComplete}
              themeColor={currentSkin.themeColor}
            />
          </div>

          {/* Resultados */}
          <div className="flex-1 flex flex-col items-center justify-center px-5 py-3 min-h-[80px]">
            {!isRolling && diceResults.length === 0 && (
              <p className="text-stone-500 text-sm">Escolha um dado abaixo para rolar</p>
            )}

            {isRolling && diceResults.length === 0 && (
              <p className="text-stone-500 text-sm animate-pulse">Rolando…</p>
            )}

            {diceResults.length > 0 && (
              <>
                {/* Tags dos dados individuais */}
                <div className="flex flex-wrap gap-1.5 justify-center mb-3">
                  {diceResults.map((r, i) => {
                    const c = DIE_BTN[r.sides as DieType] ?? DIE_BTN[20];
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold"
                        style={{
                          background: c.bg + "55",
                          border: `1px solid ${c.border}66`,
                          color: c.text,
                        }}
                      >
                        <span className="opacity-60">d{r.sides}</span>
                        <span>{r.value}</span>
                      </span>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="text-center">
                  {preModifier !== 0 ? (
                    <>
                      <p className="text-[11px] text-stone-500 leading-none mb-0.5">
                        {naturalSum} {preModifier >= 0 ? "+" : ""}{preModifier}
                      </p>
                      <p className="text-5xl font-black text-amber-400 leading-none">{finalTotal}</p>
                    </>
                  ) : (
                    <p className="text-5xl font-black text-amber-400 leading-none">{naturalSum}</p>
                  )}
                </div>

                {/* Crítico / Falha */}
                {(isCrit || isFumble) && (
                  <p className={`mt-2.5 text-sm font-black tracking-widest ${isCrit ? "text-amber-400" : "text-red-400"}`}>
                    {isCrit ? "⚡ ACERTO CRÍTICO!" : "💀 FALHA CRÍTICA!"}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Skin picker (recolhível) */}
          {showSkins && (
            <SkinPicker skins={SKINS} currentId={skinId} onSelect={selectSkin} />
          )}

          {/* Controles inferiores */}
          <div
            className="shrink-0 px-4 pt-3 pb-5 border-t"
            style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.35)" }}
          >
            {/* Botões de dados */}
            <div className="grid grid-cols-6 gap-2 mb-3">
              {DICE_TYPES.map((die) => {
                const c = DIE_BTN[die];
                return (
                  <button
                    key={die}
                    onClick={() => addDie(die)}
                    title={`Rolar 1d${die}`}
                    className="flex items-center justify-center rounded-xl transition active:scale-90 hover:brightness-125 focus-visible:outline-none"
                    style={{
                      aspectRatio: "1",
                      padding: "9px",
                      background: c.bg + "44",
                      border: `2px solid ${c.border}`,
                    }}
                  >
                    <DieIcon die={die} fill={c.bg} stroke={c.border} textColor={c.text} />
                  </button>
                );
              })}
            </div>

            {/* Rodapé */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                disabled={diceResults.length === 0 && !isRolling}
                className="rounded-xl p-2.5 bg-stone-900/80 border border-stone-700 text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Limpar mesa"
              >
                <RotateCcw size={15} />
              </button>

              <button
                onClick={() => setShowSkins((v) => !v)}
                title="Trocar skin dos dados"
                className="rounded-xl p-2.5 bg-stone-900/80 border border-stone-700 text-stone-400 hover:text-white hover:bg-stone-800 transition"
                style={{
                  borderColor: showSkins ? currentSkin.swatch + "88" : undefined,
                  color: showSkins ? currentSkin.swatch : undefined,
                }}
              >
                <Palette size={15} />
              </button>

              <p className="flex-1 text-center text-xs text-stone-500">
                {isRolling
                  ? "Rolando…"
                  : diceResults.length === 0
                  ? "Escolha um dado"
                  : "Clique para adicionar mais"}
              </p>

              <button
                onClick={requestClose}
                className="rounded-xl px-4 py-2.5 bg-stone-800/90 hover:bg-stone-700 text-stone-300 font-bold text-sm transition border border-stone-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
