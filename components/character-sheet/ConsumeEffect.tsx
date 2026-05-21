"use client";

import { useEffect } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ConsumeType = "food" | "potion" | "alchemical" | "poison" | "ammo" | "generic";

export function getConsumeType(category: string): ConsumeType {
  if (category === "bens_comuns") return "food";
  if (category === "alquimia_mistica") return "potion";
  if (category === "alquimico_preparado") return "alchemical";
  if (category === "alquimico_veneno") return "poison";
  if (category === "municao") return "ammo";
  return "generic";
}

const DURATION: Record<ConsumeType, number> = {
  food: 1600, potion: 1800, alchemical: 1500, poison: 1700, ammo: 700, generic: 1400,
};

const CONFIG: Record<ConsumeType, {
  overlay: string;
  glow: string;
  particleColor: string;
  label: string;
  emoji: string;
}> = {
  food: {
    overlay:       "rgba(20,10,2,0.72)",
    glow:          "radial-gradient(circle, rgba(251,191,36,0.55) 0%, rgba(217,119,6,0.3) 40%, transparent 70%)",
    particleColor: "#fbbf24",
    label:         "Consumido!",
    emoji:         "🍖",
  },
  potion: {
    overlay:       "rgba(5,2,18,0.78)",
    glow:          "radial-gradient(circle, rgba(192,132,252,0.7) 0%, rgba(139,92,246,0.4) 40%, transparent 70%)",
    particleColor: "#c084fc",
    label:         "Poção bebida!",
    emoji:         "✨",
  },
  alchemical: {
    overlay:       "rgba(2,12,18,0.74)",
    glow:          "radial-gradient(circle, rgba(6,182,212,0.6) 0%, rgba(8,145,178,0.35) 40%, transparent 70%)",
    particleColor: "#22d3ee",
    label:         "Item usado!",
    emoji:         "⚗️",
  },
  poison: {
    overlay:       "rgba(2,10,4,0.8)",
    glow:          "radial-gradient(circle, rgba(74,222,128,0.45) 0%, rgba(22,101,52,0.4) 40%, transparent 70%)",
    particleColor: "#4ade80",
    label:         "Veneno aplicado!",
    emoji:         "☠️",
  },
  ammo: {
    overlay:       "rgba(8,6,2,0.6)",
    glow:          "radial-gradient(circle, rgba(202,138,4,0.5) 0%, transparent 60%)",
    particleColor: "#fde047",
    label:         "Usado!",
    emoji:         "🏹",
  },
  generic: {
    overlay:       "rgba(5,5,5,0.7)",
    glow:          "radial-gradient(circle, rgba(120,113,108,0.5) 0%, transparent 65%)",
    particleColor: "#d6d3d1",
    label:         "Consumido!",
    emoji:         "✦",
  },
};

// ─── Keyframes ────────────────────────────────────────────────────────────────

const KEYFRAMES = `
@keyframes consume-fade-in {
  from { opacity: 0; } to { opacity: 1; }
}
@keyframes consume-fade-out {
  0%   { opacity: 1; }
  70%  { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes consume-glow-pulse {
  0%   { transform: translate(-50%,-50%) scale(0.4); opacity: 0; }
  30%  { opacity: 1; }
  70%  { transform: translate(-50%,-50%) scale(1.8); opacity: 0.8; }
  100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0; }
}
@keyframes consume-emoji-pop {
  0%   { transform: translate(-50%,-50%) scale(0); opacity: 0; }
  20%  { transform: translate(-50%,-50%) scale(1.3); opacity: 1; }
  50%  { transform: translate(-50%,-50%) scale(1.0); opacity: 1; }
  80%  { transform: translate(-50%,-50%) scale(1.0); opacity: 0.9; }
  100% { transform: translate(-50%,-50%) scale(1.2); opacity: 0; }
}
@keyframes consume-text-rise {
  0%   { transform: translateY(20px); opacity: 0; }
  20%  { transform: translateY(0);    opacity: 1; }
  70%  { transform: translateY(-8px); opacity: 1; }
  100% { transform: translateY(-20px); opacity: 0; }
}
@keyframes consume-particle-float {
  0%   { transform: translateY(0) scale(1);   opacity: 0.9; }
  100% { transform: translateY(-180px) scale(0); opacity: 0; }
}
@keyframes consume-ring-expand {
  0%   { transform: translate(-50%,-50%) scale(0.1); opacity: 0.8; }
  100% { transform: translate(-50%,-50%) scale(2.5); opacity: 0; }
}
`;

// ─── Partículas ───────────────────────────────────────────────────────────────

const PARTICLE_OFFSETS = [
  { x: -60, delay: 0.0, size: 8 },
  { x:  60, delay: 0.1, size: 6 },
  { x: -30, delay: 0.15, size: 5 },
  { x:  30, delay: 0.05, size: 7 },
  { x: -80, delay: 0.2, size: 5 },
  { x:  80, delay: 0.12, size: 6 },
  { x:   0, delay: 0.08, size: 9 },
  { x: -50, delay: 0.25, size: 4 },
  { x:  50, delay: 0.18, size: 5 },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export function ConsumeEffect({
  type,
  itemName,
  onDone,
}: {
  type: ConsumeType;
  itemName: string;
  onDone: () => void;
}) {
  const cfg = CONFIG[type];
  const dur = DURATION[type];

  useEffect(() => {
    const t = setTimeout(onDone, dur);
    return () => clearTimeout(t);
  }, [dur, onDone]);

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
        style={{
          background: cfg.overlay,
          animation: `consume-fade-out ${dur}ms ease-out forwards`,
        }}
      >
        {/* Glow central */}
        <div
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: 320, height: 320,
            marginTop: -160, marginLeft: -160,
            borderRadius: "50%",
            background: cfg.glow,
            animation: `consume-glow-pulse ${dur * 0.75}ms ease-out forwards`,
          }}
        />

        {/* Anel expansível */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          width: 200, height: 200,
          borderRadius: "50%",
          border: `3px solid ${cfg.particleColor}60`,
          animation: `consume-ring-expand ${dur * 0.6}ms ease-out 0.1s forwards`,
          opacity: 0,
        }} />
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          width: 200, height: 200,
          borderRadius: "50%",
          border: `2px solid ${cfg.particleColor}40`,
          animation: `consume-ring-expand ${dur * 0.6}ms ease-out 0.25s forwards`,
          opacity: 0,
        }} />

        {/* Emoji grande */}
        <div
          style={{
            position: "absolute",
            top: "46%", left: "50%",
            fontSize: 72,
            lineHeight: 1,
            animation: `consume-emoji-pop ${dur * 0.85}ms ease-out forwards`,
          }}
        >
          {cfg.emoji}
        </div>

        {/* Partículas flutuantes */}
        {PARTICLE_OFFSETS.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: `calc(50% + ${p.x}px)`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: cfg.particleColor,
              boxShadow: `0 0 6px ${cfg.particleColor}`,
              animation: `consume-particle-float ${dur * 0.7}ms ease-out ${p.delay}s forwards`,
              opacity: 0,
            }}
          />
        ))}

        {/* Texto: nome do item */}
        <div
          style={{
            position: "absolute",
            top: "calc(50% + 65px)",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          <p
            style={{
              color: cfg.particleColor,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.05em",
              opacity: 0.85,
              animation: `consume-text-rise ${dur * 0.85}ms ease-out 0.1s forwards`,
              marginBottom: 6,
            }}
          >
            {itemName}
          </p>
          <p
            style={{
              color: "#fff",
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textShadow: `0 0 16px ${cfg.particleColor}`,
              animation: `consume-text-rise ${dur * 0.85}ms ease-out 0.2s forwards`,
            }}
          >
            {cfg.label}
          </p>
        </div>
      </div>
    </>
  );
}
