"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  alpha: number;
  color: string;
  size: number;
  rotation: number;
  rotSpeed: number;
  shape: 0 | 1 | 2;
};

const COLORS = [
  "#fbbf24", "#f59e0b", "#d97706", "#10b981",
  "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
];

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const inner = r * 0.4;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const dist = i % 2 === 0 ? r : inner;
    if (i === 0) ctx.moveTo(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist);
    else ctx.lineTo(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist);
  }
  ctx.closePath();
}

export function LevelUpCelebration({ level, onDone }: { level: number; onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];

    function burst(ox: number, oy: number, count: number) {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const speed = 4 + Math.random() * 12;
        particles.push({
          x: ox, y: oy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 6,
          alpha: 1,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: 5 + Math.random() * 10,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.25,
          shape: Math.floor(Math.random() * 3) as 0 | 1 | 2,
        });
      }
    }

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    burst(cx, cy, 70);
    const t1 = setTimeout(() => burst(cx * 0.25, cy * 0.6, 35), 160);
    const t2 = setTimeout(() => burst(cx * 1.75, cy * 0.6, 35), 320);
    const t3 = setTimeout(() => burst(cx * 0.5, cy * 0.25, 25), 500);
    const t4 = setTimeout(() => burst(cx * 1.5, cy * 0.25, 25), 660);
    const t5 = setTimeout(() => burst(cx, cy * 0.15, 40), 850);

    let animId: number;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28;
        p.vx *= 0.985;
        p.alpha -= 0.012;
        p.rotation += p.rotSpeed;
        if (p.alpha <= 0) { particles.splice(i, 1); continue; }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 0) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 1) {
          drawStar(ctx, 0, 0, p.size / 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx.restore();
      }
      if (particles.length > 0) animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(t1); clearTimeout(t2);
      clearTimeout(t3); clearTimeout(t4); clearTimeout(t5);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "rgba(5,3,1,0.82)", pointerEvents: "none" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 text-center select-none">
        <p
          className="text-8xl mb-3"
          style={{ animation: "bounce 0.6s ease infinite alternate" }}
        >
          🎉
        </p>
        <h1
          className="text-6xl font-black tracking-tight"
          style={{
            color: "#fbbf24",
            textShadow: "0 0 30px rgba(251,191,36,0.9), 0 0 60px rgba(251,191,36,0.5)",
            animation: "pulse 0.8s ease infinite alternate",
          }}
        >
          NÍVEL {level}!
        </h1>
        <p className="text-xl font-bold text-amber-200 mt-3 opacity-90">
          Evolução confirmada!
        </p>
      </div>
    </div>
  );
}
