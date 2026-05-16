"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCharacter } from "@/app/characters/actions";
import { Button } from "@/components/ui/button";

type Props = {
  character: {
    id: string;
    name: string;
    concept: string | null;
    age: number | null;
    appearance: string | null;
    personality: string | null;
    history: string | null;
    objective: string | null;
  };
};

export function EditCharacterForm({ character }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(character.name);
  const [concept, setConcept] = useState(character.concept ?? "");
  const [age, setAge] = useState(character.age?.toString() ?? "");
  const [appearance, setAppearance] = useState(character.appearance ?? "");
  const [personality, setPersonality] = useState(character.personality ?? "");
  const [history, setHistory] = useState(character.history ?? "");
  const [objective, setObjective] = useState(character.objective ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await updateCharacter(character.id, {
          name,
          concept: concept || undefined,
          age: age ? Number(age) : null,
          appearance: appearance || undefined,
          personality: personality || undefined,
          history: history || undefined,
          objective: objective || undefined,
        });
        router.push(`/characters/${character.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Nome do personagem" required>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          maxLength={100}
          className={inputCls}
        />
      </Field>

      <Field label="Conceito" hint="Uma frase curta que define o personagem">
        <input
          type="text"
          value={concept}
          onChange={e => setConcept(e.target.value)}
          maxLength={200}
          className={inputCls}
        />
      </Field>

      <Field label="Idade">
        <input
          type="number"
          value={age}
          onChange={e => setAge(e.target.value)}
          min={1}
          max={9999}
          className={inputCls}
        />
      </Field>

      <Field label="Aparência">
        <textarea
          value={appearance}
          onChange={e => setAppearance(e.target.value)}
          rows={3}
          maxLength={2000}
          className={inputCls}
        />
      </Field>

      <Field label="Personalidade">
        <textarea
          value={personality}
          onChange={e => setPersonality(e.target.value)}
          rows={3}
          maxLength={2000}
          className={inputCls}
        />
      </Field>

      <Field label="História">
        <textarea
          value={history}
          onChange={e => setHistory(e.target.value)}
          rows={5}
          maxLength={5000}
          className={inputCls}
        />
      </Field>

      <Field label="Objetivo">
        <textarea
          value={objective}
          onChange={e => setObjective(e.target.value)}
          rows={3}
          maxLength={2000}
          className={inputCls}
        />
      </Field>

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(`/characters/${character.id}`)}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isPending} className="flex-1">
          {isPending ? "Salvando…" : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-stone-700">
        {label}
        {required && <span className="ml-0.5 text-amber-700">*</span>}
      </label>
      {hint && <p className="text-xs text-stone-500">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 resize-none";
