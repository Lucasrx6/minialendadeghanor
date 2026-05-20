import { useRef, useCallback } from "react";

export function useTilt(maxDeg = 8) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(500px) rotateX(${-y * maxDeg * 2}deg) rotateY(${x * maxDeg * 2}deg) scale3d(1.04,1.04,1.04)`;
      el.style.boxShadow = `${x * -8}px ${y * -8}px 20px rgba(0,0,0,0.4)`;
    },
    [maxDeg],
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(500px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    el.style.boxShadow = "";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
