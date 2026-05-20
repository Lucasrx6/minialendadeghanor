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
      // Wait two frames so the container has rendered and has dimensions
      await new Promise<void>((r) => setTimeout(r, 150));
      if (cancelled || !containerRef.current) return;

      try {
        // Load directly from /public to bypass webpack bundler — dice-box uses
        // circular ES imports that break webpack chunk loading
        // Load directly from /public — bypasses webpack to avoid circular-import issues
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mod = await (Function('return import("/dice-box/dice-box.es.js")')() as Promise<any>);
        const DiceBox = mod.default;

        if (cancelled) return;

        // v1.1+ API: single config object with `container` field
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

        // Force canvas to fill the container after BabylonJS init
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

        // Auto-roll se vier pré-configurado
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

  // Esc para fechar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (open && e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // ── Ações ───────────────────────────────────────────────────────────────────

  function addDie(die: DieType) {
    const db = diceBoxRef.current;
    if (!db || isRolling || !ready) return;
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

  const isCrit = results.length >= 1 && results.some(r => r.die === 20 && r.result === 20);
  const isFumble = results.length === 1 && results[0].die === 20 && results[0].result === 1;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(5,5,10,0.90)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Rolagem de dados"
    >
      {/* ── Canvas 3D — ocupa toda a área acima do painel ── */}
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
              {preModifierBreakdown}{" "}
              ={" "}
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

      {/* ── Painel inferior de controles ── */}
      <div className="bg-stone-950 border-t border-stone-800 px-4 pt-3 pb-safe pb-5 shrink-0">

        {/* Resultados */}
        {results.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {results.map((r, i) => (
              <span
                key={i}
                className="inline-flex flex-col items-center justify-center rounded-lg w-10 h-10 shrink-0 transition-transform animate-in fade-in zoom-in duration-200"
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

            {/* Total */}
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

        {/* Crítico / falha crítica */}
        {!isRolling && results.length > 0 && (isCrit || isFumble) && (
          <p className={`text-xs font-black text-center mb-2 tracking-widest ${isCrit ? "text-amber-400" : "text-red-400"}`}>
            {isCrit ? "⚡ ACERTO CRÍTICO!" : "💀 FALHA CRÍTICA!"}
          </p>
        )}

        {/* Botões de dados */}
        <div className="grid grid-cols-6 gap-1.5 mb-3">
          {DICE_TYPES.map((die) => {
            const c = COLORS[die];
            const disabled = !ready || isRolling || !!initError;
            return (
              <button
                key={die}
                onClick={() => addDie(die)}
                disabled={disabled}
                className="rounded-xl py-3 font-black text-sm transition active:scale-95"
                style={{
                  background: disabled ? "#1f2937" : c.bg,
                  color: disabled ? "#6b7280" : c.text,
                  border: `1.5px solid ${disabled ? "#374151" : c.border}`,
                  opacity: isRolling ? 0.5 : 1,
                }}
                title={`Rolar 1d${die}`}
              >
                d{die}
              </button>
            );
          })}
        </div>

        {/* Rodapé: limpar + status + fechar */}
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
              ? "Clique num dado para rolar"
              : "Clique para adicionar mais dados"}
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
