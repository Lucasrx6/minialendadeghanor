import { CharacterWizard } from "@/components/wizard/character-wizard";

export default function EditCharacterPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <p className="mb-4 rounded-md border border-amber-900/20 bg-amber-100 p-3 text-sm text-stone-800">
        Edição usa o mesmo wizard do MVP. Ao salvar, cria uma nova versão da ficha.
      </p>
      <CharacterWizard />
    </main>
  );
}
