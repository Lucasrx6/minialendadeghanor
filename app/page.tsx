import Link from "next/link";
import { BookOpen, Shield, Sparkles, Wand2, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { PageContainer } from "@/components/layout/page-container";
import { BrandLogo } from "@/components/layout/brand-logo";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-dvh bg-[radial-gradient(circle_at_top,#f5c86a_0,#f6ead0_35%,#efe1bd_100%)]">
        <PageContainer className="flex min-h-dvh flex-col justify-center gap-8 py-8">
          <BrandLogo size="lg" />
          <div className="space-y-4">
            <h1 className="text-3xl font-black leading-tight text-stone-950 sm:text-4xl">
              Forje seu herói antes que a taverna feche.
            </h1>
            <p className="text-base leading-7 text-stone-800">
              Criador de personagens com regras oficiais, ficha imprimível e retratos por IA.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button fullWidth size="lg">
                Criar conta
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="secondary" fullWidth size="lg">
                Entrar
              </Button>
            </Link>
          </div>
          <Card className="bg-stone-950 p-5 text-amber-50">
            <p className="text-xs text-amber-200">Exemplo de ficha</p>
            <h2 className="mt-1 text-2xl font-black">Brunhilda Fagulha</h2>
            <p className="text-sm text-amber-100">Humana Cavaleira · Escudeira</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["For +3", "Des +1", "Con +2", "Int +0", "Sab +1", "Car +2"].map((item) => (
                <span
                  key={item}
                  className="rounded-lg bg-amber-100 px-2 py-2 text-center text-xs font-bold text-stone-950"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <Shield size={16} /> Defesa 15
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen size={16} /> PV 22
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles size={16} /> PM 3
              </span>
            </div>
          </Card>
        </PageContainer>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,#f5c86a_0,#f6ead0_35%,#efe1bd_100%)]">
      <PageContainer withBottomNav className="flex min-h-dvh flex-col gap-6 py-6">
        <BrandLogo size="md" />
        <div className="space-y-2">
          <h1 className="text-2xl font-black leading-tight text-stone-950">
            Como você quer criar seu aventureiro?
          </h1>
          <p className="text-sm text-stone-700">Escolha o caminho que combina com você.</p>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/characters/new/guided" className="block">
            <Card className="relative min-h-[140px] overflow-hidden border-2 border-amber-900/10 bg-amber-50/90 p-5 transition-all hover:shadow-md hover:border-amber-800/25 hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 ring-1 ring-amber-900/15">
                  <Wand2 size={26} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black text-stone-950">Criação guiada</h2>
                  <p className="mt-1 text-sm leading-relaxed text-stone-700">
                    Responda perguntas e o sistema monta seu herói. Ideal para iniciantes.
                  </p>
                  <p className="mt-3 text-xs font-bold text-amber-800">~5 min</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/characters/new" className="block">
            <Card className="relative min-h-[140px] overflow-hidden border-2 border-stone-800 bg-stone-950 p-5 text-amber-50 transition-all hover:shadow-xl hover:border-stone-700 hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-amber-200 ring-1 ring-amber-200/20">
                  <Swords size={26} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black">Criação completa</h2>
                  <p className="mt-1 text-sm leading-relaxed text-stone-400">
                    Monte cada detalhe da ficha com todas as regras do livro básico.
                  </p>
                  <p className="mt-3 text-xs font-bold text-amber-300">~15 min</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        <Link
          href="/characters"
          className="text-center text-sm font-bold text-amber-900/70 hover:text-amber-900 active:text-amber-900 transition-colors"
        >
          Ver meus personagens →
        </Link>
      </PageContainer>
    </main>
  );
}
