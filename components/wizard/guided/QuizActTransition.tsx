"use client";

import { useEffect } from "react";

interface Props {
  toAct: 2 | 3;
  onDone: () => void;
}

const TRANSITION_TEXT: Record<2 | 3, string> = {
  2: "Agora vamos falar de outras pessoas...",
  3: "Última parte. Vamos falar do que importa pra você.",
};

export function QuizActTransition({ toAct, onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center animate-in fade-in duration-500">
      <p className="text-center text-xl font-semibold italic leading-relaxed text-stone-700 max-w-sm">
        {TRANSITION_TEXT[toAct]}
      </p>
    </div>
  );
}
