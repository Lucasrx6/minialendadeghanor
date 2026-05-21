import { redirect } from "next/navigation";
import { Swords } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getArenaByToken } from "@/app/actions/arena";
import { ArenaDashboard } from "@/components/arena/ArenaDashboard";
import { ArenaPlayerView } from "@/components/arena/ArenaPlayerView";
import { ArenaJoinFlow } from "@/components/arena/ArenaJoinFlow";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  return { title: `Arena ${token.toUpperCase()} — Forja de Ghanor` };
}

export default async function ArenaTokenPage({ params }: Props) {
  const { token } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = await getArenaByToken(token);

  if ("error" in result) {
    return (
      <>
        <PageHeader title="Arena não encontrada" backHref="/arena" backLabel="Voltar" />
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center space-y-3">
          <Swords size={32} className="mx-auto text-red-400" />
          <p className="font-bold text-red-800">{result.error}</p>
          <Link href="/arena">
            <Button variant="secondary">Ir para Arena</Button>
          </Link>
        </div>
      </>
    );
  }

  const arena = result;

  // Mestre: renderiza dashboard completo
  if (arena.role === "dm") {
    return (
      <ArenaDashboard arena={arena} />
    );
  }

  // Jogador: renderiza view de participante
  if (arena.role === "participant") {
    const myParticipant = arena.participants.find((p) => p.user_id === user.id);
    return (
      <>
        <PageHeader title={arena.name} subtitle="Você está na arena." backHref="/arena" />
        <ArenaPlayerView arena={arena} myCharacterId={myParticipant?.character_id ?? ""} />
      </>
    );
  }

  // Visitante: fluxo de entrada
  return (
    <>
      <PageHeader title="Entrar na Arena" backHref="/arena" />
      <ArenaJoinFlow token={arena.token} arenaName={arena.name} />
    </>
  );
}
