import { CharacterWizard } from "@/components/wizard/character-wizard";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default function NewCharacterPage() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,#f5c86a_0,#f6ead0_35%,#efe1bd_100%)]">
      <PageContainer compact className="pb-28 lg:max-w-4xl lg:pb-0">
        <PageHeader title="Criação completa" backHref="/" backLabel="Início" />
        <CharacterWizard />
      </PageContainer>
    </main>
  );
}
