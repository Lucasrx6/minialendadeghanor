import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onStart: () => void;
}

export function QuizWelcome({ onStart }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 ring-1 ring-amber-900/15">
        <BookOpen size={32} />
      </span>
      <h1 className="text-2xl font-black leading-tight text-stone-950 sm:text-3xl">
        Vamos contar uma pequena história sobre você
      </h1>
      <p className="text-base leading-relaxed text-stone-700">
        As próximas 18 perguntas são sobre como você funciona no dia a dia — seu jeito, suas escolhas, seu temperamento. Não tem resposta certa nem errada. No fim, vamos sugerir qual classe de A Lenda de Ghanor combina mais com a pessoa que você é.
      </p>
      <Button fullWidth size="lg" className="mt-2" onClick={onStart}>
        Começar
      </Button>
    </div>
  );
}
