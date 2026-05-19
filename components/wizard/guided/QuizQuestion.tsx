import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Question } from "@/lib/ghanor/quiz";
import { ACT_LABELS } from "@/lib/ghanor/quiz";

interface Props {
  question: Question;
  total: number;
  index: number;
  onAnswer: (optionId: "a" | "b" | "c" | "d" | "skip") => void;
  onBack: () => void;
}

export function QuizQuestion({ question, total, index, onAnswer, onBack }: Props) {
  return (
    <div className="w-full max-w-3xl mx-auto py-8 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="mb-8 flex items-center justify-between">
        <span className="text-sm font-bold uppercase tracking-widest text-amber-900/60">
          Ato {question.act} — {ACT_LABELS[question.act]}
        </span>
        <span className="text-sm font-bold text-stone-500">
          {index + 1} / {total}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1 w-full bg-stone-200 mb-12 rounded-full overflow-hidden">
        <div 
          className="h-full bg-amber-600 transition-all duration-500 ease-out" 
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <div className="mb-12">
        <p className="text-2xl italic leading-relaxed text-stone-800 font-serif">
          &quot;{question.scene}&quot;
        </p>
        <p className="mt-6 text-xl font-bold text-stone-950">
          {question.prompt}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {question.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onAnswer(opt.id)}
            className="group w-full text-left"
            aria-label={opt.label}
          >
            <Card className="p-6 transition-all duration-150 hover:bg-amber-50 hover:border-amber-500/50 hover:shadow-md hover:-translate-y-0.5 border-2 border-stone-200/50">
              <span className="text-lg font-medium text-stone-900 group-hover:text-amber-950 transition-colors">
                {opt.label}
              </span>
            </Card>
          </button>
        ))}
      </div>

      <div className="mt-12 flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          &larr; Voltar
        </Button>
        <Button variant="ghost" onClick={() => onAnswer("skip")} className="text-stone-400 hover:text-stone-600">
          Pular
        </Button>
      </div>
    </div>
  );
}
