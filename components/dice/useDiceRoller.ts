"use client";

import { useState, useCallback, useRef } from "react";

export type RollPhase = "idle" | "rolling" | "landed";

export type DiceRollerState = {
  phase: RollPhase;
  naturalRoll: number | null;
  /** Girar o dado programaticamente */
  startRoll: (result: number) => void;
  reset: () => void;
};

/**
 * Hook que controla o ciclo de vida da animação do dado:
 * idle → rolling (1.5s) → landed
 *
 * O result é recebido de fora (vem do servidor) antes da animação terminar,
 * assim o dado "pousa" sempre na face correta.
 */
export function useDiceRoller(animDurationMs = 1500): DiceRollerState {
  const [phase, setPhase] = useState<RollPhase>("idle");
  const [naturalRoll, setNaturalRoll] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startRoll = useCallback(
    (result: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase("rolling");
      setNaturalRoll(result);
      timerRef.current = setTimeout(() => {
        setPhase("landed");
      }, animDurationMs);
    },
    [animDurationMs]
  );

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("idle");
    setNaturalRoll(null);
  }, []);

  return { phase, naturalRoll, startRoll, reset };
}
