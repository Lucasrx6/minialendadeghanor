import { CharacterWizard } from "@/components/wizard/character-wizard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewCharacterPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="mb-4">
        <Link href="/">
          <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-amber-700">
            <ArrowLeft className="mr-2 h-4 w-4" /> Escolher outro modo de criação
          </Button>
        </Link>
      </div>
      <CharacterWizard />
    </main>
  );
}
