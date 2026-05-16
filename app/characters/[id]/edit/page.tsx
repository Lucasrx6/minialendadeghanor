import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EditCharacterForm } from "@/components/character-sheet/edit-character-form";

export default async function EditCharacterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: character, error } = await supabase
    .from("characters")
    .select("id, name, concept, age, appearance, personality, history, objective")
    .eq("id", id)
    .single();

  if (error || !character) notFound();

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,#f5c86a_0,#f6ead0_35%,#efe1bd_100%)]">
      <PageContainer className="pb-20">
        <PageHeader
          title="Editar personagem"
          backHref={`/characters/${id}`}
          backLabel="Voltar à ficha"
        />
        <div className="rounded-2xl border border-stone-200 bg-white/80 p-5 shadow-sm">
          <EditCharacterForm character={character} />
        </div>
      </PageContainer>
    </main>
  );
}
