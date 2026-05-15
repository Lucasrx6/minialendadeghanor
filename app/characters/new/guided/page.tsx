"use client";

import { useState } from "react";
import { GuidedCreationWizard } from "@/components/wizard/guided/GuidedCreationWizard";

export default function GuidedCharacterCreationPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <GuidedCreationWizard />
    </main>
  );
}
