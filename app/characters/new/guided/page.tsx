"use client";

import { useState } from "react";
import { GuidedCreationWizard } from "@/components/wizard/guided/GuidedCreationWizard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function GuidedCharacterCreationPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <div className="mb-4">
        <Link href="/">
          <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-amber-700">
            <ArrowLeft className="mr-2 h-4 w-4" /> Escolher outro modo de criação
          </Button>
        </Link>
      </div>
      <GuidedCreationWizard />
    </main>
  );
}
