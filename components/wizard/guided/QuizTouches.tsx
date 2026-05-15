import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getRandomName } from "@/lib/ghanor/names";
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
    setData(prev => ({ ...prev, name: getRandomName(race, prev.gender as any) || "Herói Anônimo" }));
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
          <Label>Gênero</Label>
          <RadioGroup 
            value={data.gender} 
            onValueChange={(v) => setData(p => ({ ...p, gender: v as any }))}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="masc" id="g-masc" />
              <Label htmlFor="g-masc">Masculino</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fem" id="g-fem" />
              <Label htmlFor="g-fem">Feminino</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="neutro" id="g-neu" />
              <Label htmlFor="g-neu">Neutro</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
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
          <Label htmlFor="age">Idade</Label>
          <Input 
            id="age" 
            type="number" 
            value={data.age} 
            onChange={e => setData(p => ({ ...p, age: e.target.value }))} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="appearance">Aparência marcante (Uma frase)</Label>
          <Input 
            id="appearance" 
            value={data.appearance} 
            onChange={e => setData(p => ({ ...p, appearance: e.target.value }))} 
            placeholder="Ex: olhos verdes que parecem brilhar no escuro"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="objective">Objetivo principal (Uma frase)</Label>
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
          <Button type="submit" size="lg">
            Ver Resultado &rarr;
          </Button>
        </div>
      </form>
    </div>
  );
}
