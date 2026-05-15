import { Button } from "@/components/ui/button";

interface Props {
  onStart: () => void;
}

export function QuizWelcome({ onStart }: Props) {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 text-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl font-black text-stone-950 md:text-5xl">
        Vamos contar uma pequena história
      </h1>
      <p className="max-w-2xl text-xl leading-relaxed text-stone-800">
        Antes da aventura começar, precisamos saber quem você é. Suas respostas vão moldar seus atributos, sua classe e suas perícias. Não há resposta certa — só seja honesto com o tipo de herói que você quer ser.
      </p>
      <Button className="mt-8 text-lg px-8 py-6" onClick={onStart}>
        Começar a história
      </Button>
    </div>
  );
}
