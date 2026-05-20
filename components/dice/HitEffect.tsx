"use client";

import { useEffect } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type HitEffectType =
  | "slash" | "arrow"
  | "fire" | "ice" | "lightning"
  | "acid" | "sonic" | "necro" | "holy" | "dark" | "psychic" | "magic";

const DURATION_MS: Record<HitEffectType, number> = {
  slash: 520, arrow: 460, fire: 680, ice: 700,
  lightning: 400, acid: 660, sonic: 700,
  necro: 720, holy: 680, dark: 720, psychic: 700, magic: 680,
};

/** Converte SpellElement para HitEffectType */
export function spellElementToHitEffect(element: string | undefined): HitEffectType {
  const MAP: Record<string, HitEffectType> = {
    fogo: "fire", gelo: "ice", relampago: "lightning",
    acido: "acid", sonoro: "sonic", necro: "necro",
    sagrado: "holy", trevas: "dark", luz: "holy", psiquico: "psychic",
  };
  return element ? (MAP[element] ?? "magic") : "magic";
}

// ─── Keyframes (inlined to avoid global CSS pollution) ────────────────────────

const KEYFRAMES = `
@keyframes hit-slash-move {
  0%   { left: -80%; opacity: 0; }
  12%  { opacity: 1; }
  88%  { opacity: 0.9; }
  100% { left: 80%;  opacity: 0; }
}
@keyframes hit-vignette {
  0%   { opacity: 0; }
  20%  { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes hit-arrow-fly {
  from { transform: translateX(-130%); opacity: 0; }
  8%   { opacity: 1; }
  92%  { opacity: 1; }
  to   { transform: translateX(130%); opacity: 0; }
}
@keyframes hit-radial-expand {
  0%   { transform: scale(0.1); opacity: 0; }
  25%  { opacity: 0.85; }
  100% { transform: scale(4); opacity: 0; }
}
@keyframes hit-ring-expand {
  0%   { transform: scale(0.1); opacity: 0.9; }
  100% { transform: scale(3.5); opacity: 0; }
}
@keyframes hit-flash-white {
  0%, 100% { opacity: 0; }
  15%, 35%  { opacity: 0.95; }
  25%       { opacity: 0.3; }
}
@keyframes hit-bolt-show {
  0%   { opacity: 0; }
  15%  { opacity: 1; }
  65%  { opacity: 0.9; }
  100% { opacity: 0; }
}
@keyframes hit-float-up {
  from { transform: translateY(0); opacity: 0.9; }
  to   { transform: translateY(-80px); opacity: 0; }
}
@keyframes hit-rays-spin {
  from { transform: rotate(0deg) scale(0.2); opacity: 0; }
  20%  { opacity: 1; }
  100% { transform: rotate(30deg) scale(1.8); opacity: 0; }
}
@keyframes hit-drip {
  from { transform: scaleY(0); opacity: 1; transform-origin: top; }
  to   { transform: scaleY(1); opacity: 0.6; transform-origin: top; }
}
@keyframes hit-star-burst {
  0%   { transform: translate(-50%,-50%) scale(0) rotate(0deg); opacity: 0; }
  20%  { opacity: 1; }
  100% { transform: translate(-50%,-50%) scale(2.5) rotate(180deg); opacity: 0; }
}
`;

// ─── Componente principal ─────────────────────────────────────────────────────

export function HitEffect({ type, onDone }: { type: HitEffectType; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, DURATION_MS[type]);
    return () => clearTimeout(t);
  }, [type, onDone]);

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 30 }}
      >
        {type === "slash"     && <SlashEffect />}
        {type === "arrow"     && <ArrowEffect />}
        {type === "fire"      && <GlowEffect color="#ff5500" ring="#ff8800" label="fire" />}
        {type === "ice"       && <IceEffect />}
        {type === "lightning" && <LightningEffect />}
        {type === "acid"      && <GlowEffect color="#44dd00" ring="#22bb00" label="acid" />}
        {type === "sonic"     && <SonicEffect />}
        {type === "necro"     && <GlowEffect color="#7c3aed" ring="#4c1d95" label="necro" dark />}
        {type === "holy"      && <HolyEffect />}
        {type === "dark"      && <GlowEffect color="#1e0040" ring="#4c1d95" label="dark" dark />}
        {type === "psychic"   && <GlowEffect color="#c026d3" ring="#7e22ce" label="psychic" />}
        {type === "magic"     && <GlowEffect color="#8b5cf6" ring="#6d28d9" label="magic" />}
      </div>
    </>
  );
}

// ─── Efeitos individuais ──────────────────────────────────────────────────────

function SlashEffect() {
  const lineBase: React.CSSProperties = {
    position: "absolute",
    width: "200%",
    transformOrigin: "center",
    animation: "hit-slash-move 0.42s ease-out forwards",
  };
  return (
    <>
      {/* Vinheta vermelha */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(180,0,0,0.55) 100%)",
        animation: "hit-vignette 0.52s ease-out forwards",
      }} />
      {/* Corte grosso */}
      <div style={{
        ...lineBase,
        top: "42%", left: "-80%",
        height: 5,
        transform: "rotate(-18deg)",
        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) 35%, rgba(220,38,38,1) 65%, transparent 100%)",
        boxShadow: "0 0 14px 4px rgba(255,40,40,0.9), 0 0 28px 8px rgba(200,0,0,0.5)",
      }} />
      {/* Corte fino (ligeiramente atrasado) */}
      <div style={{
        ...lineBase,
        top: "52%", left: "-80%",
        height: 2.5,
        transform: "rotate(-18deg)",
        background: "linear-gradient(90deg, transparent 0%, rgba(255,200,200,0.8) 40%, rgba(255,100,100,0.9) 60%, transparent 100%)",
        boxShadow: "0 0 8px 2px rgba(255,80,80,0.7)",
        animationDelay: "0.04s",
      }} />
    </>
  );
}

function ArrowEffect() {
  return (
    <div style={{
      position: "absolute",
      top: "45%",
      left: "50%",
      transform: "translateX(-50%)",
      animation: "hit-arrow-fly 0.42s ease-in forwards",
    }}>
      <svg viewBox="0 0 280 40" width={280} height={40} style={{ overflow: "visible" }}>
        {/* Cauda / rastro */}
        <defs>
          <linearGradient id="arrow-trail" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,220,120,0)" />
            <stop offset="100%" stopColor="rgba(255,220,120,0.7)" />
          </linearGradient>
        </defs>
        <line x1={0} y1={20} x2={200} y2={20} stroke="url(#arrow-trail)" strokeWidth={2} />
        {/* Haste */}
        <line x1={60} y1={20} x2={240} y2={20} stroke="#c2955a" strokeWidth={3} />
        {/* Ponta */}
        <polygon points="240,20 210,10 215,20 210,30" fill="#d1d5db" />
        {/* Empenagem */}
        <polygon points="80,20 60,8 65,20"  fill="#ef4444" opacity={0.85} />
        <polygon points="80,20 60,32 65,20" fill="#ef4444" opacity={0.85} />
        <polygon points="90,20 70,10 74,20"  fill="#b91c1c" opacity={0.7} />
        <polygon points="90,20 70,30 74,20"  fill="#b91c1c" opacity={0.7} />
      </svg>
    </div>
  );
}

function IceEffect() {
  return (
    <>
      {/* Flash azul */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, rgba(147,210,255,0.5) 0%, rgba(30,120,200,0.4) 50%, transparent 80%)",
        animation: "hit-vignette 0.7s ease-out forwards",
      }} />
      {/* Cristal central */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        animation: "hit-star-burst 0.7s ease-out forwards",
      }}>
        <svg viewBox="0 0 120 120" width={160} height={160}>
          <g stroke="rgba(180,235,255,0.9)" strokeWidth={2.5} fill="rgba(200,240,255,0.15)">
            {/* Flocos */}
            {[0,30,60,90,120,150].map(a => (
              <line key={a}
                x1={60} y1={60}
                x2={60 + Math.cos(a*Math.PI/180)*50}
                y2={60 + Math.sin(a*Math.PI/180)*50}
                stroke="rgba(180,240,255,0.85)" strokeWidth={2}
              />
            ))}
            {/* Hexágono */}
            <polygon points="60,16 94,38 94,82 60,104 26,82 26,38"
              fill="none" stroke="rgba(150,220,255,0.7)" strokeWidth={1.5} />
          </g>
        </svg>
      </div>
      {/* Anel de expansão */}
      <RingBurst color="rgba(100,200,255,0.5)" delay={0.1} />
      <RingBurst color="rgba(80,180,240,0.3)" delay={0.22} />
    </>
  );
}

function LightningEffect() {
  return (
    <>
      {/* Flash branco */}
      <div style={{
        position: "absolute", inset: 0,
        background: "white",
        animation: "hit-flash-white 0.4s ease-out forwards",
      }} />
      {/* Raio SVG */}
      <div style={{
        position: "absolute", top: 0, left: "50%",
        transform: "translateX(-50%)",
        animation: "hit-bolt-show 0.4s ease-out forwards",
      }}>
        <svg viewBox="0 0 80 200" width={80} height={200}>
          <path
            d="M45,0 L20,90 L40,90 L10,200 L60,85 L38,85 Z"
            fill="#fbbf24"
            stroke="#fef08a"
            strokeWidth={1}
            filter="url(#bolt-glow)"
          />
          <defs>
            <filter id="bolt-glow" x="-50%" y="-20%" width="200%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
        </svg>
      </div>
    </>
  );
}

function HolyEffect() {
  return (
    <>
      {/* Glow dourado central */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 200, height: 200,
        marginTop: -100, marginLeft: -100,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(253,224,71,0.7) 0%, rgba(234,179,8,0.4) 40%, transparent 70%)",
        animation: "hit-radial-expand 0.68s ease-out forwards",
      }} />
      {/* Raios */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        marginTop: -80, marginLeft: -80,
        width: 160, height: 160,
        animation: "hit-rays-spin 0.68s ease-out forwards",
      }}>
        <svg viewBox="0 0 160 160" width={160} height={160}>
          {[0,22.5,45,67.5,90,112.5,135,157.5].map((a, i) => (
            <line key={i}
              x1={80} y1={80}
              x2={80 + Math.cos(a*Math.PI/180)*75}
              y2={80 + Math.sin(a*Math.PI/180)*75}
              stroke={i % 2 === 0 ? "rgba(253,224,71,0.9)" : "rgba(234,179,8,0.6)"}
              strokeWidth={i % 2 === 0 ? 3 : 1.5}
            />
          ))}
        </svg>
      </div>
      <RingBurst color="rgba(253,224,71,0.5)" delay={0.05} />
    </>
  );
}

function SonicEffect() {
  return (
    <>
      <RingBurst color="rgba(200,200,200,0.6)" delay={0} />
      <RingBurst color="rgba(160,160,160,0.45)" delay={0.1} />
      <RingBurst color="rgba(120,120,120,0.3)" delay={0.2} />
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function GlowEffect({ color, ring, dark }: { color: string; ring: string; label: string; dark?: boolean }) {
  return (
    <>
      <div style={{
        position: "absolute", inset: 0,
        background: dark
          ? `radial-gradient(ellipse at center, transparent 20%, ${color}BB 100%)`
          : `radial-gradient(ellipse at center, ${color}55 0%, ${color}88 40%, transparent 75%)`,
        animation: "hit-vignette 0.68s ease-out forwards",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 160, height: 160,
        marginTop: -80, marginLeft: -80,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}BB 0%, ${ring}55 60%, transparent 100%)`,
        animation: "hit-radial-expand 0.68s ease-out forwards",
      }} />
      <RingBurst color={`${ring}88`} delay={0.08} />
    </>
  );
}

function RingBurst({ color, delay }: { color: string; delay: number }) {
  return (
    <div style={{
      position: "absolute", top: "50%", left: "50%",
      width: 120, height: 120,
      marginTop: -60, marginLeft: -60,
      borderRadius: "50%",
      border: `3px solid ${color}`,
      animation: `hit-ring-expand 0.65s ease-out ${delay}s forwards`,
      opacity: 0,
    }} />
  );
}
