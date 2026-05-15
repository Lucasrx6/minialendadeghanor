import Link from "next/link";
import { BookOpen, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f5c86a_0,#f6ead0_32%,#efe1bd_100%)]">
      <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-900">A Lenda de Ghanor RPG</p>
          <h1 className="max-w-3xl text-5xl font-black leading-tight text-stone-950 md:text-7xl">
            Forje seu herói antes que a taverna feche.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-stone-800">
            Um criador de personagens de 1º nível com regras, cálculo automático, ficha imprimível e retratos por IA.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup">
              <Button>Criar conta</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary">Entrar</Button>
            </Link>
          </div>
        </div>
        <Card className="bg-stone-950 p-6 text-amber-50 shadow-2xl">
          <div className="space-y-5">
            <div>
              <p className="text-sm text-amber-200">Exemplo de ficha</p>
              <h2 className="text-3xl font-black">Brunhilda Fagulha</h2>
              <p className="text-amber-100">Humana Cavaleira - Escudeira</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["For +3", "Des +1", "Con +2", "Int +0", "Sab +1", "Car +2"].map((item) => (
                <span key={item} className="rounded-md bg-amber-100 px-3 py-2 text-center text-sm font-bold text-stone-950">
                  {item}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <span><Shield className="inline" size={16} /> Defesa 15</span>
              <span><BookOpen className="inline" size={16} /> PV 22</span>
              <span><Sparkles className="inline" size={16} /> PM 3</span>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
