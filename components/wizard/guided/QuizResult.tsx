import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { attributeLabels } from "@/lib/ghanor/types";
import { saveGuidedCharacter } from "@/app/characters/actions";
import { classById } from "@/lib/ghanor/classes";
import { originById } from "@/lib/ghanor/origins";
import { Shield, Sparkles, BookOpen } from "lucide-react";
import type { GeneratedCharacter, Answer, RaceChoices } from "@/lib/ghanor/quiz-engine";

interface Props {
  computed: GeneratedCharacter;
  touches: { name: string; age: string; appearance: string; objective: string; gender: string };
  answers: Answer[];
  race: string;
  raceChoices: RaceChoices;
  onRestart: () => void;
}

export function QuizResult({ computed, touches, answers, race, raceChoices, onRestart }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [selectedOriginIndex, setSelectedOriginIndex] = useState(0);

  const selectedClass = computed.suggestedClasses[selectedClassIndex];
  const selectedOrigin = computed.suggestedOrigins[selectedOriginIndex];
  const classData = classById[selectedClass as any];
  const originData = originById[selectedOrigin];

  const handleSave = () => {
    startTransition(async () => {
      try {
        setErrorMsg("");
        const id = await saveGuidedCharacter({
          name: touches.name,
          age: touches.age ? parseInt(touches.age, 10) : undefined,
          appearance: touches.appearance,
          objective: touches.objective,
          race: race,
          raceChoices: raceChoices,
          origin: selectedOrigin,
          extraOrigin: undefined, // Ignorando extraOrigin de meio_elfo para simplificar aqui (jogador edita depois)
          class: selectedClass,
          answers: answers,
          computed: computed,
          silverPieces: Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1), // 4d6
          spells: [], // Simplificado, ele pode editar na ficha
          equipment: computed.weapons.map(w => ({ id: w, name: w, type: "weapon" }))
        });
        
        router.push(`/characters`);
      } catch (err: any) {
        setErrorMsg(err.message || "Erro ao salvar.");
      }
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <div className="text-center mb-12 space-y-4">
        <p className="text-sm font-black uppercase tracking-widest text-amber-900/60">A Lenda Nasce</p>
        <h1 className="text-4xl md:text-5xl font-black text-stone-950 font-serif leading-tight">
          &quot;{computed.concept}&quot;
        </h1>
        <p className="text-xl text-stone-700 italic">
          Conheça {touches.name}. {touches.appearance ? `Com ${touches.appearance}.` : ""} {touches.objective ? `Seu maior objetivo é ${touches.objective}.` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="p-6 bg-amber-50/50 border-amber-900/20 shadow-lg">
          <h3 className="text-sm font-bold uppercase text-amber-900/60 mb-4">Sua Classe</h3>
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-black text-stone-950 capitalize">{classData?.name || selectedClass}</h2>
            {computed.suggestedClasses.length > 1 && (
              <Button variant="outline" size="sm" onClick={() => setSelectedClassIndex((p) => (p + 1) % computed.suggestedClasses.length)}>
                Trocar (Top {computed.suggestedClasses.length})
              </Button>
            )}
          </div>
          <p className="text-stone-700 leading-relaxed text-sm h-16 overflow-hidden text-ellipsis">
            {classData?.summary || "Um aventureiro habilidoso."}
          </p>
        </Card>

        <Card className="p-6 bg-amber-50/50 border-amber-900/20 shadow-lg">
          <h3 className="text-sm font-bold uppercase text-amber-900/60 mb-4">Sua Origem</h3>
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl font-black text-stone-950 capitalize">{originData?.name || selectedOrigin}</h2>
            {computed.suggestedOrigins.length > 1 && (
              <Button variant="outline" size="sm" onClick={() => setSelectedOriginIndex((p) => (p + 1) % Math.min(5, computed.suggestedOrigins.length))}>
                Trocar (Top {computed.suggestedOrigins.length})
              </Button>
            )}
          </div>
          <p className="text-stone-700 leading-relaxed text-sm">
            {originData?.summary || "De onde você veio."}
          </p>
        </Card>
      </div>

      <Card className="p-6 bg-stone-950 text-amber-50 shadow-2xl mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Shield size={120} />
        </div>
        
        <h3 className="text-sm font-bold uppercase text-amber-500 mb-6 relative z-10">Ficha Básica</h3>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8 relative z-10">
          {Object.entries(computed.baseAttributes).map(([attr, val]) => (
            <div key={attr} className="bg-stone-900 rounded-lg p-3 text-center border border-stone-800">
              <span className="block text-xs font-bold text-stone-500 uppercase">{attributeLabels[attr as any]}</span>
              <span className="block text-xl font-black text-amber-400">{val >= 0 ? `+${val}` : val}</span>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          <div>
            <h4 className="text-sm font-bold text-amber-500 mb-2">Perícias Treinadas</h4>
            <div className="flex flex-wrap gap-2">
              {computed.trainedSkills.map(skill => (
                <span key={skill} className="px-2 py-1 bg-stone-800 text-stone-300 text-xs rounded-md capitalize">
                  {skill.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-500 mb-2">Equipamento Padrão</h4>
            <div className="flex flex-wrap gap-2">
              {computed.weapons.map(w => (
                <span key={w} className="px-2 py-1 bg-stone-800 text-amber-200 border border-amber-900/30 text-xs rounded-md capitalize">
                  {w}
                </span>
              ))}
              {computed.armor !== 'none' && <span className="px-2 py-1 bg-stone-800 text-stone-300 text-xs rounded-md capitalize">{computed.armor.replace(/_/g, ' ')}</span>}
              {computed.shield !== 'none' && <span className="px-2 py-1 bg-stone-800 text-stone-300 text-xs rounded-md capitalize">{computed.shield.replace(/_/g, ' ')}</span>}
              <span className="px-2 py-1 bg-stone-800 text-stone-300 text-xs rounded-md">4d6 PP</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col items-center gap-4 text-center">
        {errorMsg && <p className="text-red-600 font-bold">{errorMsg}</p>}
        <p className="text-sm text-stone-500 mb-2">
          Você pode editar qualquer detalhe a qualquer momento depois de salvar (e gerar seu retrato na ficha).
        </p>
        <div className="flex flex-wrap justify-center gap-4 w-full">
          <Button variant="outline" size="lg" onClick={onRestart} disabled={isPending}>
            Refazer Questionário
          </Button>
          <Button size="lg" onClick={handleSave} disabled={isPending} className="px-12">
            {isPending ? "Salvando..." : "Salvar Personagem"}
          </Button>
        </div>
      </div>
    </div>
  );
}
