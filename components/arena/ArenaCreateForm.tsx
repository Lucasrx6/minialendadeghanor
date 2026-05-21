"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createArena } from "@/app/actions/arena";

export function ArenaCreateForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createArena({ name });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push(`/arena/${result.token}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="arena-name" className="block text-sm font-bold text-stone-700 mb-1">
          Nome da sessão
        </label>
        <input
          id="arena-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: A Taverna do Dragão Bêbado"
          maxLength={80}
          required
          className="w-full rounded-xl border border-amber-900/20 bg-white px-4 py-3 text-base text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>
      {error && <p className="text-sm font-semibold text-red-700">{error}</p>}
      <Button
        type="submit"
        fullWidth
        size="lg"
        disabled={isPending || !name.trim()}
        className="bg-amber-800 hover:bg-amber-700"
      >
        <Swords size={18} />
        {isPending ? "Criando arena…" : "Criar Arena"}
      </Button>
    </form>
  );
}
