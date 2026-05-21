"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// ─── Barra de progresso ───────────────────────────────────────────────────────

export function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const tickRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const startedRef = useRef(false);
  const prevPathname = useRef(pathname);

  // Detecta clique em links internos para iniciar a barra
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href === pathname) return;
      startedRef.current = true;
      setVisible(true);
      setProgress(28);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  // Avança incrementalmente enquanto navega
  useEffect(() => {
    if (!visible || progress >= 82) return;
    tickRef.current = setTimeout(() => setProgress((p) => Math.min(p + 12, 82)), 280);
    return () => clearTimeout(tickRef.current);
  }, [visible, progress]);

  // Conclui quando o pathname muda (página chegou)
  useEffect(() => {
    if (!startedRef.current || pathname === prevPathname.current) return;
    prevPathname.current = pathname;
    startedRef.current = false;
    setProgress(100);
    const t = setTimeout(() => { setVisible(false); setProgress(0); }, 420);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        height: 3,
        width: `${progress}%`,
        background: "linear-gradient(90deg, #92400e, #d97706, #fbbf24)",
        borderRadius: "0 3px 3px 0",
        boxShadow: "0 0 12px rgba(217,119,6,0.8), 0 0 4px rgba(217,119,6,0.4)",
        transition: progress === 100
          ? "width 0.12s ease-out, opacity 0.35s ease 0.1s"
          : "width 0.32s ease-out",
        opacity: progress === 100 ? 0 : 1,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Wrapper de transição de página ──────────────────────────────────────────

export function PageTransitionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
