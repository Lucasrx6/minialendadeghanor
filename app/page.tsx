import Link from "next/link";
import { BookOpen, Shield, Sparkles, Wand2, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f5c86a_0,#f6ead0_32%,#efe1bd_100%)] flex flex-col relative">
      <div className="absolute top-4 right-6 flex items-center gap-4">
        <span className="text-sm font-semibold text-amber-900/60 hidden sm:inline-block">{user.email}</span>
        <LogoutButton variant="ghost" className="text-amber-900 hover:bg-amber-900/10" />
      </div>
      <section className="mx-auto flex w-full flex-1 max-w-5xl flex-col items-center justify-center gap-12 px-6 py-12">
        <div className="space-y-4 text-center mt-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-900">
            A Lenda de Ghanor RPG
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-stone-950 md:text-6xl">
            Escolha como você quer dar vida ao seu aventureiro
          </h1>
        </div>

        <div className="grid w-full gap-6 md:grid-cols-2">
          <Link href="/characters/new/guided" className="group block h-full">
            <Card className="relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden border-2 border-amber-900/10 bg-amber-50/80 p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-900/20">
              <div className="space-y-4 relative z-10">
                <div className="inline-flex rounded-full bg-amber-100 p-3 text-amber-900 ring-1 ring-amber-900/20 group-hover:bg-amber-900 group-hover:text-amber-50 transition-colors">
                  <Wand2 size={32} />
                </div>
                <h2 className="text-3xl font-black text-stone-950">Crie seu Personagem</h2>
                <p className="text-lg leading-relaxed text-stone-800">
                  Responda algumas perguntas e o sistema monta seu herói. Ideal para iniciantes.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-amber-900/10 pt-6 relative z-10">
                <span className="text-sm font-bold text-amber-900/60 flex items-center gap-1">
                  ⏱ ~5 minutos
                </span>
                <span className="font-bold text-amber-900 group-hover:text-amber-600 transition-colors flex items-center gap-2">
                  Começar <span>&rarr;</span>
                </span>
              </div>
              <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl group-hover:bg-amber-400/20 transition-colors" />
            </Card>
          </Link>

          <Link href="/characters/new" className="group block h-full">
            <Card className="relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden border-2 border-stone-950/10 bg-stone-950 p-8 text-amber-50 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-500 hover:shadow-2xl hover:shadow-stone-900/50">
              <div className="space-y-4 relative z-10">
                <div className="inline-flex rounded-full bg-stone-900 p-3 text-amber-200 ring-1 ring-amber-200/20 group-hover:bg-amber-200 group-hover:text-stone-950 transition-colors">
                  <Swords size={32} />
                </div>
                <h2 className="text-3xl font-black">Criação Complexa</h2>
                <p className="text-lg leading-relaxed text-stone-400">
                  Monte cada detalhe da ficha você mesmo, do zero, com todas as regras do livro básico.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-stone-800 pt-6 relative z-10">
                <span className="text-sm font-bold text-stone-500 flex items-center gap-1">
                  ⏱ ~15 minutos
                </span>
                <span className="font-bold text-amber-200 group-hover:text-amber-400 transition-colors flex items-center gap-2">
                  Começar <span>&rarr;</span>
                </span>
              </div>
              <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-stone-800/30 blur-3xl group-hover:bg-amber-900/20 transition-colors" />
            </Card>
          </Link>
        </div>
      </section>

      <footer className="py-6 text-center">
        <Link href="/characters" className="text-sm font-bold text-amber-900/60 hover:text-amber-900 transition-colors">
          Meus personagens &rarr;
        </Link>
      </footer>
    </main>
  );
}
