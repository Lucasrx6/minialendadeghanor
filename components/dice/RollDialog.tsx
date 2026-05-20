"use client";

import { useState, useEffect, useRef } from "react";
import { X, RotateCcw } from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

const DICE_TYPES = [4, 6, 8, 10, 12, 20] as const;
type DieType = (typeof DICE_TYPES)[number];

const COLORS: Record<DieType, { bg: string; border: string; text: string }> = {
  4:  { bg: "#7c2d12", border: "#ea580c", text: "#fed7aa" },
  6:  { bg: "#1e3a5f", border: "#3b82f6", text: "#bfdbfe" },
  8:  { bg: "#14532d", border: "#22c55e", text: "#bbf7d0" },
  10: { bg: "#4a1d96", border: "#a855f7", text: "#e9d5ff" },
  12: { bg: "#881337", border: "#f43f5e", text: "#fecdd3" },
  20: { bg: "#78350f", border: "#d97706", text: "#fef3c7" },
};

type RollEntry = { die: DieType; result: number };

type Props = {
  open: boolean;
  onClose: () => void;
  preLabel?: string;
  preModifier?: number;
  preModifierBreakdown?: string;
  preCounts?: Partial<Record<4 | 6 | 8 | 10 | 12 | 20, number>>;
};

const CONTAINER_ID = "dice-box-scene";

// ─── Ícone SVG do dado ────────────────────────────────────────────────────────

function DieIcon({
  die,
  fill,
  stroke,
  textColor,
  disabled,
}: {
  die: DieType;
  fill: string;
  stroke: string;
  textColor: string;
  disabled: boolean;
}) {
  const detailColor = disabled ? "#4b5563" : textColor;
  const detailOpacity = 0.25;

  // Atributos compartilhados para os polígonos
  const poly = {
    fill,
    stroke,
    strokeWidth: 3.5,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };

  const num = (x: number, y: number, size: number) => (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={size}
      fontWeight="900"
      fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
      fill={textColor}
      style={{ userSelect: "none", pointerEvents: "none" }}
    >
      {die}
    </text>
  );

  const detail = (d: string) => (
    <path d={d} stroke={detailColor} strokeWidth={1.5} fill="none" opacity={detailOpacity} strokeLinecap="round" />
  );

  switch (die) {
    // ── d4: triângulo pontiagudo (tetraedro) ──────────────────────────────────
    case 4: {
      // Inner lines: from each vertex to midpoint of opposite edge (peace-sign rotated)
      // Vertices: A(50,5) B(93,88) C(7,88) — midpoints: AB-mid(71.5,46.5) BC-mid(50,88) CA-mid(28.5,46.5)
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,5 93,88 7,88" {...poly} />
          {detail("M50,5 L50,88 M93,88 L28.5,46.5 M7,88 L71.5,46.5")}
          {num(50, 68, 21)}
        </svg>
      );
    }

    // ── d6: cubo isométrico ───────────────────────────────────────────────────
    case 6: {
      // Top face, left face, right face
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          {/* Top face */}
          <polygon points="50,12 86,32 50,52 14,32" {...poly} />
          {/* Left face */}
          <polygon points="14,32 14,72 50,92 50,52" {...poly} />
          {/* Right face */}
          <polygon points="50,52 86,32 86,72 50,92" {...poly} />
          {num(50, 64, 24)}
        </svg>
      );
    }

    // ── d8: diamante (octaedro) ───────────────────────────────────────────────
    case 8: {
      // Inner X lines (visible ridges of octahedron face)
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,5 95,50 50,95 5,50" {...poly} />
          {detail("M50,5 L50,95 M5,50 L95,50")}
          {num(50, 53, 24)}
        </svg>
      );
    }

    // ── d10: kite (trapezoedro pentagonal) ────────────────────────────────────
    case 10: {
      // Chevron shape — kite wider at top
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,5 90,44 68,93 32,93 10,44" {...poly} />
          {detail("M50,5 L50,93 M10,44 L90,44")}
          {num(50, 58, 19)}
        </svg>
      );
    }

    // ── d12: pentágono (dodecaedro) ───────────────────────────────────────────
    case 12: {
      // Regular pentagon — top vertex, radius≈44, center (50,52)
      // Vertices at angles: -90°, -90°+72°, -90°+144°, -90°+216°, -90°+288°
      // p0=(50, 8) p1=(92,37) p2=(76,88) p3=(24,88) p4=(8,37)
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,8 92,37 76,88 24,88 8,37" {...poly} />
          {/* Lines from each vertex to center (50,52) */}
          {detail("M50,8 L50,52 M92,37 L50,52 M76,88 L50,52 M24,88 L50,52 M8,37 L50,52")}
          {num(50, 55, 20)}
        </svg>
      );
    }

    // ── d20: triângulo equilátero (icosaedro) ─────────────────────────────────
    case 20: {
      // Wider, more equilateral triangle than d4
      // Inner inverted triangle (midpoints) — classic d20 face pattern
      // Vertices: A(50,10) B(90,82) C(10,82) — midpoints: AB(70,46) BC(50,82) CA(30,46)
      return (
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,10 90,82 10,82" {...poly} />
          {/* Inner inverted triangle connecting midpoints */}
          {detail("M70,46 L50,82 L30,46 Z")}
          {num(50, 64, 18)}
        </svg>
      );
    }
  }
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function RollDialog({
  open,
  onClose,
  preLabel,
  preModifier = 0,
  preModifierBreakdown,
  preCounts,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const diceBoxRef = useRef<any>(null);
  const hasRolledRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [results, setResults] = useState<RollEntry[]>([]);
  const [initError, setInitError] = useState<string | null>(null);

  const naturalSum = results.reduce((s, r) => s + r.result, 0);
  const finalTotal = naturalSum + preModifier;

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
      hasRolledRef.current = false;
      return;
    }

    let cancelled = false;

    const run = async () => {
      await new Promise<void>((r) => setTimeout(r, 150));
      if (cancelled || !containerRef.current) return;

      try {
        // Load directly from /public — bypasses webpack to avoid circular-import issues
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mod = await (Function('return import("/dice-box/dice-box.es.js")')() as Promise<any>);
        const DiceBox = mod.default;

        if (cancelled) return;

        const db = new DiceBox({
          container: `#${CONTAINER_ID}`,
          assetPath: "/dice-box/",
          theme: "default",
          offscreen: false,
          gravity: 2,
          mass: 1,
          friction: 0.8,
          restitution: 0.4,
          angularDamping: 0.4,
          linearDamping: 0.4,
          spinForce: 5,
          throwForce: 4,
          startingHeight: 8,
          scale: 6,
          id: "dice-box-canvas-el",
        });

        await db.init();
        if (cancelled) return;

        const canvas = document.getElementById("dice-box-canvas-el") as HTMLCanvasElement | null;
        if (canvas) {
          canvas.style.width = "100%";
          canvas.style.height = "100%";
        }

        db.onRollComplete = (allResults: Array<{ sides: number; value: number }>) => {
          setResults(allResults.map((r) => ({ die: r.sides as DieType, result: r.value })));
          setIsRolling(false);
        };

        diceBoxRef.current = db;
        setReady(true);

        if (preCounts) {
          const notation = (Object.entries(preCounts) as [string, number][])
            .filter(([, n]) => n > 0)
            .map(([die, n]) => `${n}d${die}`)
            .join("+");
          if (notation) {
            hasRolledRef.current = true;
            setIsRolling(true);
            db.roll(notation);
          }
        } else if (preLabel) {
          hasRolledRef.current = true;
          setIsRolling(true);
          db.roll("1d20");
        }
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (open && e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

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
      role="dialog"
      aria-modal="true"
      aria-label="Rolagem de dados"
    >
      {/* ── Canvas 3D ── */}
      <div
        id={CONTAINER_ID}
        ref={containerRef}
        className="flex-1 relative"
        style={{ minHeight: 200 }}
      />

      {/* Cabeçalho flutuante */}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between px-5 pt-5 pointer-events-none z-10">
        <div className="pointer-events-auto">
          {preLabel && (
            <p className="font-black text-amber-50 text-xl drop-shadow-lg">
              Teste de {preLabel}
            </p>
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
          onClick={onClose}
          className="pointer-events-auto rounded-full p-2 bg-stone-900/70 text-stone-400 hover:text-white hover:bg-stone-800 transition"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
      </div>

      {/* ── Painel inferior ── */}
      <div className="bg-stone-950 border-t border-stone-800 px-4 pt-3 pb-safe pb-5 shrink-0">

        {/* Resultados */}
        {results.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {results.map((r, i) => (
              <span
                key={i}
                className="inline-flex flex-col items-center justify-center rounded-lg w-10 h-10 shrink-0 animate-in fade-in zoom-in duration-200"
                style={{ background: COLORS[r.die].bg, border: `1.5px solid ${COLORS[r.die].border}` }}
              >
                <span className="font-black text-sm leading-none" style={{ color: COLORS[r.die].text }}>
                  {r.result}
                </span>
                <span className="text-[9px] opacity-50" style={{ color: COLORS[r.die].text }}>
                  d{r.die}
                </span>
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
              <button
                key={die}
                onClick={() => addDie(die)}
                disabled={disabled}
                title={`Rolar 1d${die}`}
                className="flex items-center justify-center rounded-xl transition active:scale-90 hover:brightness-125 focus-visible:outline-none"
                style={{
                  aspectRatio: "1",
                  padding: "6px",
                  background: disabled ? "#1f2937" : c.bg + "33",
                  border: `2px solid ${disabled ? "#374151" : c.border}`,
                }}
              >
                <DieIcon
                  die={die}
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
          <button
            onClick={handleClear}
            disabled={results.length === 0 && !isRolling}
            className="rounded-xl p-2.5 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Limpar mesa"
            aria-label="Limpar dados"
          >
            <RotateCcw size={16} />
          </button>

          <p className="flex-1 text-center text-xs text-stone-600">
            {initError
              ? `Erro: ${initError}`
              : !ready
              ? "Carregando…"
              : isRolling
              ? "Rolando…"
              : results.length === 0
              ? "Toque em um dado para rolar"
              : "Toque para adicionar mais dados"}
          </p>

          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-sm transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
