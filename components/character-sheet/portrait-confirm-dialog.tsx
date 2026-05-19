"use client";

import { Sparkles, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { raceDescriptors, classDescriptors, raceLabels, classLabels } from "@/lib/ghanor/portrait";

interface Props {
  characterName: string;
  race: string;
  classId: string;
  appearance?: string | null;
  hasExistingPortrait: boolean;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PortraitConfirmDialog({
  characterName,
  race,
  classId,
  appearance,
  hasExistingPortrait,
  isPending,
  onConfirm,
  onCancel,
}: Props) {
  const raceText = raceDescriptors[race] ?? race;
  const classText = classDescriptors[classId] ?? classId;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-600" />
            <h2 className="text-base font-black text-stone-950">Gerar retrato com IA</h2>
          </div>
          <button onClick={onCancel} className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-4">
          {hasExistingPortrait && (
            <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-3">
              <ImageIcon size={16} className="mt-0.5 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800">
                <strong>{characterName}</strong> já tem um retrato. Gerar um novo{" "}
                <strong>substituirá a imagem atual</strong> permanentemente.
              </p>
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">
              Prompts que serão enviados
            </p>
            <div className="space-y-2 rounded-lg bg-stone-50 border border-stone-200 px-3 py-3 text-sm">
              <div>
                <span className="font-semibold text-stone-700">{raceLabels[race] ?? race}: </span>
                <span className="text-stone-600 italic">{raceText}</span>
              </div>
              <div>
                <span className="font-semibold text-stone-700">{classLabels[classId] ?? classId}: </span>
                <span className="text-stone-600 italic">{classText}</span>
              </div>
              {appearance && (
                <div>
                  <span className="font-semibold text-stone-700">Aparência: </span>
                  <span className="text-stone-600 italic">{appearance}</span>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-stone-400">
              Gerado por Pollinations AI · limite de 1 geração a cada 8 h
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-stone-100 px-5 py-4">
          <Button variant="secondary" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            <Sparkles size={15} />
            {isPending ? "Gerando…" : "Gerar retrato"}
          </Button>
        </div>
      </div>
    </div>
  );
}
