import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { randomCharacterName } from "@/lib/ghanor/names";
import type { RaceId } from "@/lib/ghanor/types";

interface Props {
  race: RaceId;
  initialTouches: {
    name: string;
    age: string;
    appearance: string;
    objective: string;
    gender: "masc" | "fem" | "neutro";
  };
  onSubmit: (data: any) => void;
  onBack: () => void;
}

export function QuizTouches({ race, initialTouches, onSubmit, onBack }: Props) {
  const [data, setData] = useState({
    name: initialTouches.name,
    age: initialTouches.age || String(Math.floor(Math.random() * 6) + 16),
    appearance: initialTouches.appearance,
    objective: initialTouches.objective,
    gender: initialTouches.gender,
  });

  const handleRandomName = () => {
    setData(prev => ({ ...prev, name: randomCharacterName(race) || "Herói Anônimo" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center space-y-4">
        <h2 className="text-3xl font-black text-stone-950">Toques Finais</h2>
        <p className="text-stone-800">
          Quase lá. Dê um rosto e um nome para a sua lenda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-amber-50/50 p-8 rounded-xl border border-amber-900/10 shadow-sm">
        
        <div className="space-y-3">
          <label className="text-sm font-medium leading-none">Gênero</label>
          <div className="flex gap-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="gender" value="masc" checked={data.gender === "masc"} onChange={(e) => setData(p => ({ ...p, gender: e.target.value as any }))} className="text-amber-600 focus:ring-amber-500 w-4 h-4" />
              <span className="text-sm">Masculino</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="gender" value="fem" checked={data.gender === "fem"} onChange={(e) => setData(p => ({ ...p, gender: e.target.value as any }))} className="text-amber-600 focus:ring-amber-500 w-4 h-4" />
              <span className="text-sm">Feminino</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="gender" value="neutro" checked={data.gender === "neutro"} onChange={(e) => setData(p => ({ ...p, gender: e.target.value as any }))} className="text-amber-600 focus:ring-amber-500 w-4 h-4" />
              <span className="text-sm">Neutro</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium leading-none">Nome</label>
          <div className="flex gap-2">
            <Input 
              id="name" 
              value={data.name} 
              onChange={e => setData(p => ({ ...p, name: e.target.value }))} 
              placeholder="Ex: Ruff"
              required
            />
            <Button type="button" variant="secondary" onClick={handleRandomName}>
              Sortear
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="age" className="text-sm font-medium leading-none">Idade</label>
          <Input 
            id="age" 
            type="number" 
            value={data.age} 
            onChange={e => setData(p => ({ ...p, age: e.target.value }))} 
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="appearance" className="text-sm font-medium leading-none">Aparência marcante (Uma frase)</label>
          <Input 
            id="appearance" 
            value={data.appearance} 
            onChange={e => setData(p => ({ ...p, appearance: e.target.value }))} 
            placeholder="Ex: olhos verdes que parecem brilhar no escuro"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="objective" className="text-sm font-medium leading-none">Objetivo principal (Uma frase)</label>
          <Input 
            id="objective" 
            value={data.objective} 
            onChange={e => setData(p => ({ ...p, objective: e.target.value }))} 
            placeholder="Ex: vingar a vila massacrada por hobgoblins"
          />
        </div>

        <div className="mt-12 flex justify-between pt-6 border-t border-stone-200">

          <Button type="button" variant="ghost" onClick={onBack}>
            &larr; Voltar
          </Button>
          <Button type="submit">
            Ver Resultado &rarr;
          </Button>
        </div>
      </form>
    </div>
  );
}
