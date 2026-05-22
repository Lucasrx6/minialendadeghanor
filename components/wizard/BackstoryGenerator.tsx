"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { generateBackstory } from "@/app/actions/ai";
import { classById } from "@/lib/ghanor/classes";
import { originById } from "@/lib/ghanor/origins";
import { raceById } from "@/lib/ghanor/races";

type Props = {
  race: string;
  classId: string;
  origin: string;
  concept: string;
  characterName?: string;
  history: string;
  onChange: (history: string) => void;
};

export function BackstoryGenerator({ race, classId, origin, concept, characterName, history, onChange }: Props) {
  const [extraContext, setExtraContext] = useState("");
  const [showExtra, setShowExtra] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const [regenCount, setRegenCount] = useState(0);
  const REGEN_LIMIT = 2;

  const raceName = raceById[race as keyof typeof raceById]?.name ?? race;
  const className = classById[classId as keyof typeof classById]?.name ?? classId;
  const originName = originById[origin as keyof typeof originById]?.name ?? origin;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    const result = await generateBackstory({
      race,
      classId,
      origin,
      concept,
      name: characterName,
      extraContext: extraContext.trim() || undefined,
    });
    setLoading(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      onChange(result.history);
      if (generated) setRegenCount((n) => n + 1);
      setGenerated(true);
    }
  }

  return (
    <div className="rounded-2xl border border-amber-900/20 bg-amber-50/40 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Sparkles size={16} />
        </div>
        <div>
          <p className="font-black text-stone-950">Sugestão de História com IA</p>
          <p className="text-sm text-stone-500">
            Gere um background baseado no seu personagem. Você pode editar o resultado livremente.
          </p>
        </div>
      </div>

      {/* Character summary chips */}
      <div className="flex flex-wrap gap-1.5 text-[11px]">
        <span className="rounded-full bg-stone-200 px-2.5 py-1 font-bold text-stone-700">{raceName}</span>
        <span className="rounded-full bg-amber-200 px-2.5 py-1 font-bold text-amber-800">{className}</span>
        <span className="rounded-full bg-stone-200 px-2.5 py-1 font-bold text-stone-700">{originName}</span>
        <span className="rounded-full bg-stone-100 px-2.5 py-1 italic text-stone-500">&quot;{concept}&quot;</span>
      </div>

      {/* Optional extra context */}
      <div>
        <button
          type="button"
          onClick={() => setShowExtra(!showExtra)}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition"
        >
          {showExtra ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          Adicionar contexto extra (opcional)
        </button>
        {showExtra && (
          <textarea
            value={extraContext}
            onChange={(e) => setExtraContext(e.target.value)}
            placeholder="Ex: ele perdeu a família quando criança, é introvertido, busca vingança..."
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/20"
          />
        )}
      </div>

      {/* Generate button */}
      {!generated ? (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 py-2.5 text-sm font-black text-amber-50 transition hover:bg-amber-600 disabled:opacity-60"
        >
          {loading ? (
            <>
              <RefreshCw size={15} className="animate-spin" />
              Gerando história...
            </>
          ) : (
            <>
              <Sparkles size={15} />
              Gerar Sugestão de História
            </>
          )}
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || regenCount >= REGEN_LIMIT}
            className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-amber-700 transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            {loading ? "Regenerando..." : "Regerar"}
          </button>
          <span className="text-[11px] text-stone-400">
            {regenCount >= REGEN_LIMIT
              ? "Limite de regerações atingido"
              : `${regenCount}/${REGEN_LIMIT} regerações usadas`}
          </span>
        </div>
      )}

      {error && (
        <p className="text-xs font-bold text-red-600">{error}</p>
      )}

      {/* Editable result */}
      {history && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
            História {generated ? "gerada" : ""}— edite à vontade
          </p>
          <textarea
            value={history}
            onChange={(e) => onChange(e.target.value)}
            rows={8}
            className="w-full resize-none rounded-xl border border-amber-900/20 bg-white px-3 py-2.5 text-sm leading-relaxed text-stone-800 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/20"
          />
        </div>
      )}

      {!history && !loading && (
        <p className="text-center text-xs text-stone-400">
          Você também pode escrever sua própria história abaixo ou pular esta etapa.
        </p>
      )}

      {/* Manual input when no generated content */}
      {!history && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Escrever manualmente
          </p>
          <textarea
            value={history}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Conte a história do seu personagem..."
            rows={5}
            className="w-full resize-none rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-stone-800 placeholder-stone-400 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/20"
          />
        </div>
      )}
    </div>
  );
}
