import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { races, aberrantMutations } from "@/lib/ghanor/races";
import { attributes, attributeLabels, type RaceId, type Attribute } from "@/lib/ghanor/types";
import type { RaceChoices } from "@/lib/ghanor/quiz-engine";

interface Props {
  initialRace: RaceId | null;
  initialChoices: RaceChoices;
  onNext: (race: RaceId, choices: RaceChoices) => void;
}

export function QuizRaceSelect({ initialRace, initialChoices, onNext }: Props) {
  const [selectedRace, setSelectedRace] = useState<RaceId | null>(initialRace);
  const [humanoAttrs, setHumanoAttrs] = useState<Attribute[]>(initialChoices.attributes ?? []);
  const [meioElfoAttr, setMeioElfoAttr] = useState<Attribute | null>(initialChoices.extraAttribute ?? null);
  const [aberranteMutations, setAberranteMutations] = useState<string[]>(initialChoices.mutations ?? []);

  const handleRaceClick = (raceId: RaceId) => {
    setSelectedRace(raceId);
    if (raceId !== "humano") setHumanoAttrs([]);
    if (raceId !== "meio_elfo") setMeioElfoAttr(null);
    if (raceId !== "aberrante") setAberranteMutations([]);
  };

  const handleRandom = () => {
    const randomRace = races[Math.floor(Math.random() * races.length)].id;
    setSelectedRace(randomRace);
    
    // Auto-select choices if random
    if (randomRace === "humano") {
      const shuffled = [...attributes].sort(() => 0.5 - Math.random());
      setHumanoAttrs(shuffled.slice(0, 3));
    } else if (randomRace === "meio_elfo") {
      const others = attributes.filter(a => a !== "cha");
      setMeioElfoAttr(others[Math.floor(Math.random() * others.length)]);
    } else if (randomRace === "aberrante") {
      const shuffled = [...aberrantMutations].sort(() => 0.5 - Math.random());
      setAberranteMutations(shuffled.slice(0, 4).map(m => m.id));
    }
  };

  const isValid = () => {
    if (!selectedRace) return false;
    if (selectedRace === "humano" && humanoAttrs.length !== 3) return false;
    if (selectedRace === "meio_elfo" && !meioElfoAttr) return false;
    if (selectedRace === "aberrante" && aberranteMutations.length !== 4) return false;
    return true;
  };

  const handleSubmit = () => {
    if (!isValid() || !selectedRace) return;
    onNext(selectedRace, {
      attributes: selectedRace === "humano" ? humanoAttrs : undefined,
      extraAttribute: selectedRace === "meio_elfo" ? meioElfoAttr! : undefined,
      mutations: selectedRace === "aberrante" ? aberranteMutations : undefined,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center space-y-4">
        <h2 className="text-3xl font-black text-stone-950">Escolha sua Raça</h2>
        <p className="text-stone-800">
          Quem é você? Selecione sua linhagem.
        </p>
        <Button variant="secondary" onClick={handleRandom} className="mt-2 text-amber-900 border-amber-900/20 hover:bg-amber-100">
          Escolher Aleatório
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {races.map((race) => (
          <Card 
            key={race.id} 
            className={`p-4 cursor-pointer transition-all border-2 ${selectedRace === race.id ? 'border-amber-600 bg-amber-50 shadow-md ring-1 ring-amber-600' : 'border-stone-200 hover:border-amber-400 hover:bg-stone-50'}`}
            onClick={() => handleRaceClick(race.id)}
          >
            <h3 className="text-xl font-bold text-stone-950 mb-2">{race.name}</h3>
            <p className="text-sm text-stone-600 mb-4 h-10">{race.summary}</p>
            <div className="text-xs font-semibold text-amber-900/80">
              Modificadores: {Object.entries(race.modifiers).map(([attr, val]) => `${val > 0 ? '+' : ''}${val} ${attributeLabels[attr as Attribute]}`).join(', ') || 'Nenhum'}
            </div>
          </Card>
        ))}
      </div>

      {/* Opções extras */}
      {selectedRace === "humano" && (
        <div className="mb-8 p-6 bg-stone-100 rounded-lg border border-stone-200">
          <h4 className="font-bold mb-4">Escolha 3 atributos para receber +1:</h4>
          <div className="flex flex-wrap gap-2">
            {attributes.map(attr => (
              <Button
                key={attr}
                variant={humanoAttrs.includes(attr) ? "primary" : "secondary"}
                className="px-3 py-1 h-8 text-xs"
                onClick={() => {
                  if (humanoAttrs.includes(attr)) setHumanoAttrs(humanoAttrs.filter(a => a !== attr));
                  else if (humanoAttrs.length < 3) setHumanoAttrs([...humanoAttrs, attr]);
                }}
              >
                {attributeLabels[attr]}
              </Button>
            ))}
          </div>
        </div>
      )}

      {selectedRace === "meio_elfo" && (
        <div className="mb-8 p-6 bg-stone-100 rounded-lg border border-stone-200">
          <h4 className="font-bold mb-4">Escolha 1 atributo extra para receber +1:</h4>
          <div className="flex flex-wrap gap-2">
            {attributes.filter(a => a !== "cha").map(attr => (
              <Button
                key={attr}
                variant={meioElfoAttr === attr ? "primary" : "secondary"}
                className="px-3 py-1 h-8 text-xs"
                onClick={() => setMeioElfoAttr(attr)}
              >
                {attributeLabels[attr]}
              </Button>
            ))}
          </div>
        </div>
      )}

      {selectedRace === "aberrante" && (
        <div className="mb-8 p-6 bg-stone-100 rounded-lg border border-stone-200">
          <h4 className="font-bold mb-4">Escolha 4 mutações:</h4>
          <div className="flex flex-wrap gap-2">
            {aberrantMutations.map(mut => (
              <Button
                key={mut.id}
                variant={aberranteMutations.includes(mut.id) ? "primary" : "secondary"}
                className="px-3 py-1 h-8 text-xs"
                onClick={() => {
                  if (aberranteMutations.includes(mut.id)) setAberranteMutations(aberranteMutations.filter(m => m !== mut.id));
                  else if (aberranteMutations.length < 4) setAberranteMutations([...aberranteMutations, mut.id]);
                }}
              >
                {mut.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end border-t border-stone-200 pt-6">
        <Button className="px-6 py-3" disabled={!isValid()} onClick={handleSubmit}>
          Confirmar e Começar o Questionário &rarr;
        </Button>
      </div>
    </div>
  );
}
