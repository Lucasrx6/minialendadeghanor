"use client";

import { Wand2, X } from "lucide-react";

type Props = {
  active: boolean;
  onToggle: () => void;
};

export function DmModeBanner({ active, onToggle }: Props) {
  if (!active) {
    return (
      <div className="flex justify-end print:hidden">
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-500 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
          title="Ativar Modo Narrador para edições livres"
        >
          <Wand2 size={12} />
          Narrador
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 print:hidden"
      style={{ background: "linear-gradient(135deg, #312e81, #4338ca)" }}
    >
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-300 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-200" />
        </span>
        <div>
          <p className="text-sm font-black text-indigo-50 leading-tight">Modo Narrador</p>
          <p className="text-xs text-indigo-300">Edições livres ativas — atributos, itens e dinheiro</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 rounded-lg border border-indigo-500/60 px-3 py-1.5 text-xs font-bold text-indigo-200 transition hover:bg-indigo-500/30 cursor-pointer shrink-0"
      >
        <X size={12} /> Sair
      </button>
    </div>
  );
}
