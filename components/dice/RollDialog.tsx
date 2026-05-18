"use client";

import { useState, useCallback, useEffect } from "react";
import { X, RotateCcw, Plus, Minus } from "lucide-react";

// ─── Tipos de dado disponíveis ───────────────────────────────────────────────
const DICE_TYPES = [4, 6, 8, 10, 12, 20] as const;
type DieType = (typeof DICE_TYPES)[number];

type DiceCount = Record<DieType, number>;

const INITIAL: DiceCount = { 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 0 };

type RollEntry = { die: DieType; result: number };

// ─── Animação de roll ────────────────────────────────────────────────────────
const COLORS: Record<DieType, { bg: string; border: string; text: string }> = {
  4:  { bg: "#7c2d12", border: "#ea580c", text: "#fed7aa" },
  6:  { bg: "#1e3a5f", border: "#3b82f6", text: "#bfdbfe" },
  8:  { bg: "#14532d", border: "#22c55e", text: "#bbf7d0" },
  10: { bg: "#4a1d96", border: "#a855f7", text: "#e9d5ff" },
  12: { bg: "#881337", border: "#f43f5e", text: "#fecdd3" },
  20: { bg: "#78350f", border: "#d97706", text: "#fef3c7" },
};

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

type Props = {
  open: boolean;
  onClose: () => void;
  /** Se informado, abre com 1d20 pré-selecionado e esse modificador somado */
  preLabel?: string;
  preModifier?: number;
  preModifierBreakdown?: string;
  /** Pré-configura contagens específicas de dados (ex: { 6: 2 } para 2d6) */
  preCounts?: Partial<Record<4 | 6 | 8 | 10 | 12 | 20, number>>;
};

export function RollDialog({ open, onClose, preLabel, preModifier = 0, preModifierBreakdown, preCounts }: Props) {
  const [counts, setCounts] = useState<DiceCount>(() =>
    preCounts ? { ...INITIAL, ...preCounts } : { ...INITIAL, 20: preLabel ? 1 : 0 },
  );
  const [results, setResults] = useState<RollEntry[] | null>(null);
  const [rolling, setRolling] = useState(false);
  const [animNumbers, setAnimNumbers] = useState<Record<string, number>>({});

  const totalDice = Object.values(counts).reduce((s, n) => s + n, 0);
  const naturalSum = results?.reduce((s, r) => s + r.result, 0) ?? 0;
  const finalTotal = naturalSum + preModifier;

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      setCounts(preCounts ? { ...INITIAL, ...preCounts } : { ...INITIAL, 20: preLabel ? 1 : 0 });
      setResults(null);
      setRolling(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Atalhos de teclado
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === "Escape") onClose();
    if ((e.key === "Enter" || e.key === " ") && !rolling) { e.preventDefault(); handleRoll(); }
    if (e.key === "r" && results) handleRoll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rolling, results]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  function changeCount(die: DieType, delta: number) {
    setCounts((prev) => ({ ...prev, [die]: Math.max(0, Math.min(9, prev[die] + delta)) }));
    setResults(null);
  }

  function handleRoll() {
    if (totalDice === 0 || rolling) return;
    setRolling(true);
    setResults(null);

    // Coleta todos os dados a rolar
    const rolls: RollEntry[] = [];
    for (const [dieStr, count] of Object.entries(counts)) {
      const die = Number(dieStr) as DieType;
      for (let i = 0; i < count; i++) rolls.push({ die, result: 0 });
    }

    // Anima por 800ms trocando números aleatórios
    const interval = setInterval(() => {
      const fake: Record<string, number> = {};
      rolls.forEach((_, i) => { fake[i] = rollDie(rolls[i].die); });
      setAnimNumbers(fake);
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      // Rola valores finais
      const final = rolls.map((r) => ({ die: r.die, result: rollDie(r.die) }));
      setResults(final);
      setAnimNumbers({});
      setRolling(false);
    }, 800);
  }

  function handleClear() {
    setCounts({ ...INITIAL });
    setResults(null);
  }

  if (!open) return null;

  // Dados realmente selecionados (count > 0)
  const activeDice = DICE_TYPES.filter((d) => counts[d] > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Rolagem de dados"
    >
      <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-stone-950 border border-stone-800 shadow-2xl overflow-hidden">

        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-stone-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-4">
          <div>
            <h2 className="text-lg font-black text-amber-50">
              {preLabel ? `Teste de ${preLabel}` : "Rolar Dados"}
            </h2>
            {preModifier !== 0 && preModifierBreakdown && (
              <p className="text-xs text-stone-500 mt-0.5">{preModifierBreakdown} = <span className="text-amber-400 font-bold">{preModifier >= 0 ? "+" : ""}{preModifier}</span></p>
            )}
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-stone-600 hover:text-stone-300 hover:bg-stone-800 transition" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        {/* Seletor de dados */}
        <div className="grid grid-cols-3 gap-2 px-4 pb-4">
          {DICE_TYPES.map((die) => {
            const c = COLORS[die];
            const count = counts[die];
            return (
              <div
                key={die}
                className="rounded-xl overflow-hidden"
                style={{ border: `1.5px solid ${count > 0 ? c.border : "#374151"}` }}
              >
                {/* Die label */}
                <div
                  className="flex items-center justify-center py-2 font-black text-sm"
                  style={{ background: count > 0 ? c.bg : "#1f2937", color: count > 0 ? c.text : "#6b7280" }}
                >
                  d{die}
                </div>
                {/* Counter */}
                <div className="flex items-center justify-between px-1 py-1 bg-stone-900">
                  <button
                    onClick={() => changeCount(die, -1)}
                    disabled={count === 0}
                    className="rounded-lg p-1.5 text-stone-400 hover:text-white hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-black text-sm" style={{ color: count > 0 ? c.text : "#6b7280", minWidth: 16, textAlign: "center" }}>
                    {count}
                  </span>
                  <button
                    onClick={() => changeCount(die, 1)}
                    disabled={count === 9}
                    className="rounded-lg p-1.5 text-stone-400 hover:text-white hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resultado */}
        {(rolling || results) && (
          <div className="mx-4 mb-4 rounded-xl bg-stone-900 border border-stone-800 px-4 py-4">
            {/* Dados individuais */}
            <div className="flex flex-wrap gap-2 justify-center mb-3">
              {rolling
                ? // Animação
                  activeDice.flatMap((die) =>
                    Array.from({ length: counts[die] }).map((_, i) => (
                      <span
                        key={`${die}-${i}`}
                        className="inline-flex items-center justify-center rounded-lg w-10 h-10 font-black text-base animate-pulse"
                        style={{ background: COLORS[die].bg, color: COLORS[die].text, border: `1.5px solid ${COLORS[die].border}` }}
                      >
                        {animNumbers[String(activeDice.indexOf(die) * 10 + i)] ?? "?"}
                      </span>
                    ))
                  )
                : // Resultados finais
                  results?.map((r, i) => (
                    <span
                      key={i}
                      className="inline-flex flex-col items-center justify-center rounded-lg w-10 h-10"
                      style={{ background: COLORS[r.die].bg, border: `1.5px solid ${COLORS[r.die].border}` }}
                    >
                      <span className="font-black text-base leading-none" style={{ color: COLORS[r.die].text }}>
                        {r.result}
                      </span>
                      <span className="text-[9px] opacity-50" style={{ color: COLORS[r.die].text }}>
                        d{r.die}
                      </span>
                    </span>
                  ))
              }
            </div>

            {/* Total */}
            {!rolling && results && (
              <div className="text-center border-t border-stone-800 pt-3">
                {preModifier !== 0 ? (
                  <>
                    <p className="text-xs text-stone-500 mb-0.5">
                      {naturalSum} {preModifier >= 0 ? "+" : ""}{preModifier} (mod.)
                    </p>
                    <p className="text-4xl font-black text-amber-400">{finalTotal}</p>
                  </>
                ) : (
                  <p className="text-4xl font-black text-amber-400">{naturalSum}</p>
                )}
                {results.length === 1 && results[0].die === 20 && (
                  <p className={`text-xs font-bold mt-1 ${results[0].result === 20 ? "text-amber-400" : results[0].result === 1 ? "text-red-400" : "text-stone-500"}`}>
                    {results[0].result === 20 ? "⚡ ACERTO CRÍTICO!" : results[0].result === 1 ? "💀 FALHA CRÍTICA!" : ""}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2 px-4 pb-5">
          <button
            onClick={handleClear}
            className="rounded-xl p-3 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:bg-stone-800 transition"
            aria-label="Limpar"
            title="Limpar"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={handleRoll}
            disabled={totalDice === 0 || rolling}
            className="flex-1 rounded-xl py-3.5 font-black text-base uppercase tracking-widest transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: totalDice > 0 ? "linear-gradient(135deg, #78350f, #b45309)" : "#1f2937",
              color: totalDice > 0 ? "#fef3c7" : "#4b5563",
              boxShadow: totalDice > 0 ? "0 4px 15px rgba(120,53,15,0.4)" : "none",
            }}
          >
            {rolling ? "Rolando…" : totalDice === 0 ? "Selecione dados" : `Rolar ${totalDice > 1 ? totalDice + " dados" : "1 dado"}`}
          </button>
        </div>

        <p className="text-center pb-4 text-xs text-stone-700">Enter para rolar · R para rolar de novo · Esc para fechar</p>
      </div>
    </div>
  );
}
