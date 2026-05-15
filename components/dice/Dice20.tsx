"use client";

import { useEffect, useReducer } from "react";
import type { RollPhase } from "./useDiceRoller";

type Props = {
  phase: RollPhase;
  naturalRoll: number | null;
  size?: number;
};

export function Dice20({ phase, naturalRoll, size = 200 }: Props) {
  const [, forceRender] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    if (phase === "landed") forceRender();
  }, [phase]);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const displayNumber = phase === "landed" && naturalRoll ? naturalRoll : null;
  const isCrit = displayNumber === 20;
  const isFumble = displayNumber === 1;

  const borderColor = isCrit ? "#fbbf24" : isFumble ? "#ef4444" : "#d4a04d";
  const bgGradient = phase === "rolling"
    ? "linear-gradient(135deg, #451a03, #78350f)"
    : isCrit
    ? "linear-gradient(135deg, #78350f, #d97706)"
    : isFumble
    ? "linear-gradient(135deg, #450a0a, #991b1b)"
    : "linear-gradient(135deg, #1c0a00, #451a03)";

  return (
    <div
      className="relative select-none mx-auto"
      style={{ width: size, height: size }}
      aria-live="polite"
      aria-label={
        phase === "rolling" ? "Rolando..." : displayNumber ? `Resultado: ${displayNumber}` : "Dado d20"
      }
    >
      <div
        className="w-full h-full flex items-center justify-center rounded-full"
        style={{
          background: bgGradient,
          border: `3px solid ${borderColor}`,
          boxShadow: phase === "rolling"
            ? `0 0 ${size * 0.12}px rgba(212,160,77,0.7), 0 ${size * 0.05}px ${size * 0.1}px rgba(0,0,0,0.6)`
            : `0 ${size * 0.03}px ${size * 0.08}px rgba(0,0,0,0.5)`,
          animation: phase === "rolling" && !prefersReduced
            ? "dice-spin 1.5s cubic-bezier(0.25,0.46,0.45,0.94) forwards"
            : "none",
          transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
        }}
      >
        {/* Decorative inner ring */}
        <div
          className="absolute rounded-full"
          style={{
            inset: size * 0.08,
            border: `1px solid ${borderColor}40`,
            pointerEvents: "none",
          }}
        />

        {phase === "rolling" ? (
          <span
            className="font-black animate-pulse"
            style={{ color: "#d4a04d", fontSize: size * 0.28, lineHeight: 1 }}
          >
            ?
          </span>
        ) : displayNumber ? (
          <div className="flex flex-col items-center gap-0">
            <span
              className="font-black leading-none"
              style={{
                color: isCrit ? "#fbbf24" : isFumble ? "#fca5a5" : "#f5e9d4",
                fontSize: size * 0.38,
                textShadow: "0 2px 4px rgba(0,0,0,0.9)",
              }}
            >
              {displayNumber}
            </span>
            <span
              className="font-bold uppercase tracking-widest"
              style={{ color: "#b45309", fontSize: size * 0.1 }}
            >
              d20
            </span>
          </div>
        ) : (
          <span
            className="font-black"
            style={{ color: "#78350f", fontSize: size * 0.18 }}
          >
            d20
          </span>
        )}
      </div>

      {/* Shadow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          bottom: -size * 0.04,
          width: size * 0.75,
          height: size * 0.1,
          background: "radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%)",
          animation: phase === "rolling" && !prefersReduced
            ? "dice-shadow 0.4s ease-in-out infinite alternate"
            : "none",
        }}
      />

      <style>{`
        @keyframes dice-spin {
          0%   { transform: rotate(0deg)   scale(1);    }
          15%  { transform: rotate(120deg) scale(1.08); }
          35%  { transform: rotate(300deg) scale(1.12); }
          60%  { transform: rotate(540deg) scale(1.05); }
          80%  { transform: rotate(660deg) scale(1.02); }
          100% { transform: rotate(720deg) scale(1);    }
        }
        @keyframes dice-shadow {
          from { opacity: 0.5; transform: translateX(-50%) scaleX(0.8); }
          to   { opacity: 0.2; transform: translateX(-50%) scaleX(1.1); }
        }
      `}</style>
    </div>
  );
}
