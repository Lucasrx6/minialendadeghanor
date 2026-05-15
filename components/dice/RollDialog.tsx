"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { Dice20 } from "./Dice20";
import { useDiceRoller } from "./useDiceRoller";
import { rollDice, type RollInput, type RollResult } from "@/app/actions/roll";
import { STANDARD_CDS } from "@/lib/ghanor/leveling";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2, XCircle, Swords, Sparkles } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  characterId: string;
  /** Rótulo pré-configurado, ex: "Cura", "Força" */
  label: string;
  /** Modificadores já calculados */
  modifierBase: number;
  modifierTrain: number;
  modifierLevel: number;
  /** Descrição dos componentes para exibir ao usuário */
  modifierBreakdown: string;
  /** CD pré-sugerida, opcional */
  defaultCd?: number;
};

export function RollDialog({
  open,
  onClose,
  characterId,
  label,
  modifierBase,
  modifierTrain,
  modifierLevel,
  modifierBreakdown,
  defaultCd,
}: Props) {
  const { phase, naturalRoll, startRoll, reset } = useDiceRoller(1500);
  const [isPending, startTransition] = useTransition();

  const [cdPreset, setCdPreset] = useState<number | null>(defaultCd ?? 10);
  const [cdCustom, setCdCustom] = useState<string>("");
  const [useCustomCd, setUseCustomCd] = useState(false);
  const [sceneModifier, setSceneModifier] = useState(0);
  const [mode, setMode] = useState<"standard" | "opposed">("standard");
  const [opponentMod, setOpponentMod] = useState(0);
  const [result, setResult] = useState<RollResult | null>(null);

  const effectiveCd = useCustomCd ? (parseInt(cdCustom) || null) : cdPreset;
  const modifierTotal = modifierBase + modifierTrain + modifierLevel + sceneModifier;

  // Reset quando o modal abre
  useEffect(() => {
    if (open) {
      reset();
      setResult(null);
      setCdPreset(defaultCd ?? 10);
      setSceneModifier(0);
      setMode("standard");
    }
  }, [open, reset, defaultCd]);

  // Atalhos de teclado
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if ((e.key === "Enter" || e.key === " ") && phase === "idle" && !isPending) {
        e.preventDefault();
        handleRoll();
      }
      if (e.key === "r" && phase === "landed") {
        handleRoll();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, phase, isPending]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function handleRoll() {
    setResult(null);
    const input: RollInput = {
      characterId,
      label,
      modifierBase,
      modifierTrain,
      modifierLevel,
      modifierScene: sceneModifier,
      cd: effectiveCd,
      mode,
      ...(mode === "opposed" ? { opponent: { modifier: opponentMod } } : {}),
    };

    startTransition(async () => {
      const res = await rollDice(input);
      startRoll(res.naturalRoll);
      // Aguarda a animação terminar antes de mostrar o resultado
      setTimeout(() => setResult(res), 1600);
    });
  }

  if (!open) return null;

  const succeeded =
    result &&
    (result.outcome === "success" ||
      result.outcome === "crit_success" ||
      result.outcome === "opposed_win");
  const failed =
    result &&
    (result.outcome === "failure" ||
      result.outcome === "crit_failure" ||
      result.outcome === "opposed_lose");
  const isCrit = result?.outcome === "crit_success";
  const isFumble = result?.outcome === "crit_failure";

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`Teste de ${label}`}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-stone-950 border border-amber-900/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-stone-800">
          <h2 className="text-xl font-black text-amber-50">Teste de {label}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-stone-500 hover:text-amber-200 hover:bg-stone-800 transition"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Dado */}
          <div className="flex justify-center py-2">
            <Dice20 phase={phase} naturalRoll={naturalRoll} size={180} />
          </div>

          {/* Modificador detalhado */}
          <div className="rounded-lg bg-stone-900 px-4 py-3 text-sm text-stone-400 text-center">
            <span className="text-stone-500">{modifierBreakdown}</span>
            <span className="ml-2 text-amber-200 font-black text-base">
              = {modifierTotal >= 0 ? "+" : ""}{modifierTotal}
            </span>
            {sceneModifier !== 0 && (
              <span className="ml-1 text-stone-400 text-xs">
                + cena {sceneModifier >= 0 ? "+" : ""}{sceneModifier}
              </span>
            )}
          </div>

          {/* Resultado */}
          {result && phase === "landed" && (
            <div
              className={`rounded-xl p-4 text-center border-2 transition-all ${
                isCrit
                  ? "bg-amber-950/30 border-amber-500"
                  : isFumble
                  ? "bg-red-950/30 border-red-500"
                  : succeeded
                  ? "bg-emerald-950/30 border-emerald-600"
                  : failed
                  ? "bg-red-950/30 border-red-700"
                  : "bg-stone-900 border-stone-700"
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                {succeeded ? (
                  <CheckCircle2 size={20} className="text-emerald-400" />
                ) : failed ? (
                  <XCircle size={20} className="text-red-400" />
                ) : null}
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  {mode === "opposed" ? "Teste Oposto" : effectiveCd ? `vs CD ${effectiveCd}` : "Rolagem Livre"}
                </span>
              </div>

              <div className="text-stone-400 text-sm mb-2">
                <span className={`font-black text-2xl ${
                  result.naturalRoll === 20 ? "text-amber-400" :
                  result.naturalRoll === 1 ? "text-red-400" : "text-amber-200"
                }`}>{result.naturalRoll}</span>
                <span className="mx-1">+</span>
                <span className="text-stone-300">{modifierTotal}</span>
                <span className="mx-1">=</span>
                <span className="font-black text-white text-2xl">{result.total}</span>
              </div>

              <div className={`font-black text-2xl ${
                isCrit ? "text-amber-400" :
                isFumble ? "text-red-400" :
                succeeded ? "text-emerald-400" :
                failed ? "text-red-400" : "text-stone-300"
              }`}>
                {isCrit && "⚡ ACERTO CRÍTICO!"}
                {isFumble && "💀 FALHA CRÍTICA!"}
                {!isCrit && !isFumble && succeeded && "✓ SUCESSO"}
                {!isCrit && !isFumble && failed && "✗ FALHA"}
                {result.outcome === "opposed_tie" && "⚖️ EMPATE — Role de novo"}
                {result.outcome === "no_cd" && `Total: ${result.total}`}
              </div>

              {mode === "opposed" && result.opponent && (
                <div className="mt-2 text-xs text-stone-500">
                  Adversário: {result.opponent.naturalRoll} + {opponentMod} = {result.opponent.total}
                </div>
              )}
            </div>
          )}

          {/* Configurações */}
          {phase !== "rolling" && (
            <div className="space-y-3">
              {/* CD */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">
                    Dificuldade (CD)
                  </label>
                  {!useCustomCd ? (
                    <select
                      className="w-full rounded-lg bg-stone-900 border border-stone-700 text-amber-100 text-sm px-3 py-2 focus:outline-none focus:border-amber-600"
                      value={cdPreset ?? ""}
                      onChange={(e) => setCdPreset(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">Sem CD</option>
                      {STANDARD_CDS.map((cd) => (
                        <option key={cd.value} value={cd.value}>{cd.label}</option>
                      ))}
                      <option value="__custom">Personalizada...</option>
                    </select>
                  ) : (
                    <input
                      type="number"
                      min={1} max={99}
                      placeholder="Ex: 18"
                      className="w-full rounded-lg bg-stone-900 border border-stone-700 text-amber-100 text-sm px-3 py-2 focus:outline-none focus:border-amber-600"
                      value={cdCustom}
                      onChange={(e) => setCdCustom(e.target.value)}
                    />
                  )}
                  <button
                    className="text-xs text-amber-800 hover:text-amber-500 mt-1"
                    onClick={() => setUseCustomCd(!useCustomCd)}
                  >
                    {useCustomCd ? "← Usar predefinida" : "CD personalizada"}
                  </button>
                </div>

                {/* Modificador da cena */}
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">
                    Mod. da Cena
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSceneModifier((s) => Math.max(-10, s - 1))}
                      className="w-8 h-9 rounded bg-stone-800 text-amber-200 font-bold hover:bg-stone-700 transition"
                    >−</button>
                    <span className="flex-1 text-center font-bold text-amber-100 text-sm">
                      {sceneModifier >= 0 ? "+" : ""}{sceneModifier}
                    </span>
                    <button
                      onClick={() => setSceneModifier((s) => Math.min(10, s + 1))}
                      className="w-8 h-9 rounded bg-stone-800 text-amber-200 font-bold hover:bg-stone-700 transition"
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Modo */}
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("standard")}
                  className={`flex-1 flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
                    mode === "standard"
                      ? "bg-amber-700 text-amber-50"
                      : "bg-stone-900 text-stone-400 hover:bg-stone-800"
                  }`}
                >
                  Padrão
                </button>
                <button
                  onClick={() => setMode("opposed")}
                  className={`flex-1 flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
                    mode === "opposed"
                      ? "bg-amber-700 text-amber-50"
                      : "bg-stone-900 text-stone-400 hover:bg-stone-800"
                  }`}
                >
                  <Swords size={12} /> Oposto
                </button>
              </div>

              {mode === "opposed" && (
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">
                    Modificador do Adversário
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setOpponentMod((s) => Math.max(-20, s - 1))}
                      className="w-8 h-9 rounded bg-stone-800 text-amber-200 font-bold hover:bg-stone-700 transition"
                    >−</button>
                    <span className="flex-1 text-center font-bold text-amber-100">
                      {opponentMod >= 0 ? "+" : ""}{opponentMod}
                    </span>
                    <button
                      onClick={() => setOpponentMod((s) => Math.min(50, s + 1))}
                      className="w-8 h-9 rounded bg-stone-800 text-amber-200 font-bold hover:bg-stone-700 transition"
                    >+</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          {phase === "landed" ? (
            <>
              <Button variant="secondary" className="flex-1" onClick={() => { reset(); setResult(null); }}>
                Rolar de novo (R)
              </Button>
              <Button variant="ghost" onClick={onClose}>Fechar</Button>
            </>
          ) : (
            <button
              onClick={handleRoll}
              disabled={isPending || phase === "rolling"}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-4 font-black text-lg uppercase tracking-widest transition disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #78350f, #b45309)",
                color: "#fef3c7",
                boxShadow: "0 4px 15px rgba(120,53,15,0.5)",
              }}
            >
              <Sparkles size={20} />
              {phase === "rolling" ? "Rolando..." : "Rolar D20"}
            </button>
          )}
        </div>

        {/* Hint de teclado */}
        <div className="text-center pb-3 text-xs text-stone-700">
          Enter para rolar · Esc para fechar · R para rolar de novo
        </div>
      </div>
    </div>
  );
}
