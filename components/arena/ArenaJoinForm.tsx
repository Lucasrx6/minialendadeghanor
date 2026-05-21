"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ArenaJoinForm() {
  const [token, setToken] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = token.trim().toUpperCase();
    if (!clean) return;
    router.push(`/arena/${clean}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="arena-token" className="block text-sm font-bold text-stone-700 mb-1">
          Token da arena
        </label>
        <input
          id="arena-token"
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value.toUpperCase())}
          placeholder="Ex: GHANOR42"
          maxLength={8}
          required
          className="w-full rounded-xl border border-amber-900/20 bg-white px-4 py-3 text-center text-xl font-black tracking-[0.35em] uppercase text-stone-900 placeholder-stone-400 placeholder:text-base placeholder:tracking-normal placeholder:font-normal focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>
      <Button
        type="submit"
        fullWidth
        size="lg"
        variant="secondary"
        disabled={token.trim().length < 4}
      >
        <LogIn size={18} />
        Entrar na Arena
      </Button>
    </form>
  );
}
