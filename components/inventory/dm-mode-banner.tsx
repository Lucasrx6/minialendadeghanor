"use client";

import { Button } from "@/components/ui/button";

type Props = {
  active: boolean;
  onToggle: () => void;
};

export function DmModeBanner({ active, onToggle }: Props) {
  if (!active) {
    return (
      <div className="flex justify-end print:hidden">
        <Button variant="ghost" size="default" onClick={onToggle} className="text-xs text-amber-900">
          🎲 Modo DM
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-600 bg-amber-100 px-4 py-3 text-sm print:hidden">
      <p className="font-semibold text-amber-950">
        🎲 Modo DM ativo — edição irrestrita liberada
      </p>
      <Button variant="secondary" size="default" onClick={onToggle}>
        Desativar
      </Button>
    </div>
  );
}
