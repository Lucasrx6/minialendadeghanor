"use client";

import { GuidedCreationWizard } from "@/components/wizard/guided/GuidedCreationWizard";
import { PageHeader } from "@/components/layout/page-header";

export default function GuidedCharacterCreationPage() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,#f5c86a_0,#f6ead0_35%,#efe1bd_100%)]">
      <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-safe">
        <PageHeader title="Criação guiada" backHref="/" backLabel="Início" />
        <GuidedCreationWizard />
      </div>
    </main>
  );
}
