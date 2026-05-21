import Link from "next/link";
import { redirect } from "next/navigation";
import { Swords, Users, Crown, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMyArenas } from "@/app/actions/arena";
import { Card, SectionTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ArenaCreateForm } from "@/components/arena/ArenaCreateForm";
import { ArenaJoinForm } from "@/components/arena/ArenaJoinForm";

export const metadata = { title: "Modo Arena — Forja de Ghanor" };

export default async function ArenaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const arenasResult = await getMyArenas();
  const arenas = "arenas" in arenasResult ? arenasResult.arenas : [];

  return (
    <>
      <PageHeader
        title="Modo Arena"
        subtitle="Crie uma sessão como Mestre ou entre em uma arena com o token recebido."
        backHref="/"
      />

      <div className="space-y-4">
        {/* Criar arena */}
        <Card>
          <SectionTitle icon={<Crown size={18} className="text-amber-700" />}>
            Criar sessão como Mestre
          </SectionTitle>
          <p className="mt-1 mb-4 text-sm text-stone-600">
            Gera um token que você compartilha com os jogadores.
          </p>
          <ArenaCreateForm />
        </Card>

        {/* Entrar como jogador */}
        <Card>
          <SectionTitle icon={<Shield size={18} className="text-stone-600" />}>
            Entrar como Jogador
          </SectionTitle>
          <p className="mt-1 mb-4 text-sm text-stone-600">
            Digite o token que o Mestre enviou para você.
          </p>
          <ArenaJoinForm />
        </Card>

        {/* Arenas ativas */}
        {arenas.length > 0 && (
          <Card>
            <SectionTitle icon={<Swords size={18} className="text-amber-800" />}>
              Minhas arenas ativas
            </SectionTitle>
            <div className="mt-3 space-y-2">
              {arenas.map((arena) => (
                <Link
                  key={arena.id}
                  href={`/arena/${arena.token}`}
                  className="flex items-center justify-between rounded-xl border border-amber-900/15 bg-white/70 px-4 py-3 transition hover:border-amber-500 hover:bg-amber-50 active:scale-[0.99]"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-stone-900 truncate">{arena.name}</p>
                    <p className="text-xs text-stone-500 mt-0.5 font-mono tracking-wider">
                      {arena.token}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="flex items-center gap-1 text-xs text-stone-500">
                      <Users size={12} />
                      {arena.participant_count}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        arena.role === "dm"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {arena.role === "dm" ? "Mestre" : "Jogador"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
