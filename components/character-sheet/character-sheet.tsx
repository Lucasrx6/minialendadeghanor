"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit, FileText, Sparkles, Trash2 } from "lucide-react";
import { deleteCharacter } from "@/app/characters/actions";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { classById } from "@/lib/ghanor/classes";
import { originById } from "@/lib/ghanor/origins";
import { raceById } from "@/lib/ghanor/races";
import { calculateSkillBonus } from "@/lib/ghanor/rules";
import { skillById } from "@/lib/ghanor/skills";
import type { CharacterBuild } from "@/lib/ghanor/types";

type CharacterRow = {
  id: string;
  name: string;
  concept: string | null;
  race: string;
  class: string;
  origin: string;
  origin_choices: { extraOrigin?: string } | null;
  race_choices: CharacterBuild["raceChoices"] | null;
  class_choices: CharacterBuild["classChoices"] | null;
  attr_str: number;
  attr_dex: number;
  attr_con: number;
  attr_int: number;
  attr_wis: number;
  attr_cha: number;
  hp_max: number;
  mp_max: number;
  defense: number;
  movement_m: number;
  size: string;
  trained_skills: string[];
  powers: string[];
  spells: string[];
  equipment: Array<{ name: string; qty: number; source: string }>;
  silver_pieces: number;
  age: number | null;
  appearance: string | null;
  personality: string | null;
  history: string | null;
  objective: string | null;
  portrait_url: string | null;
};

export function CharacterSheet({ character }: { character: CharacterRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [portraitUrl, setPortraitUrl] = useState(character.portrait_url);
  const [portraitMessage, setPortraitMessage] = useState<string>();
  const build: CharacterBuild = {
    race: character.race as CharacterBuild["race"],
    class: character.class as CharacterBuild["class"],
    origin: character.origin,
    extraOrigin: character.origin_choices?.extraOrigin,
    baseAttributes: {
      str: character.attr_str,
      dex: character.attr_dex,
      con: character.attr_con,
      int: character.attr_int,
      wis: character.attr_wis,
      cha: character.attr_cha,
    },
    raceChoices: character.race_choices ?? undefined,
    classChoices: character.class_choices ?? undefined,
    trainedSkills: character.trained_skills,
  };

  function generatePortrait() {
    setPortraitMessage(undefined);
    startTransition(async () => {
      const response = await fetch("/api/generate-portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: character.id,
          race: character.race,
          class: character.class,
          appearance: character.appearance,
          age: character.age,
          concept: character.concept,
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        setPortraitMessage(json.error ?? "Não conseguimos gerar o retrato agora.");
        return;
      }
      setPortraitUrl(json.url);
    });
  }

  return (
    <div className="space-y-6 print:bg-white">
      <Card className="grid gap-5 md:grid-cols-[220px_1fr]">
        <div className="aspect-square overflow-hidden rounded-lg border border-amber-900/20 bg-stone-900">
          {portraitUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={portraitUrl} alt={`Retrato de ${character.name}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-amber-50">Retrato aguardando magia</div>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-black text-stone-950">{character.name}</h1>
            <p className="text-stone-700">
              {raceById[character.race as keyof typeof raceById]?.name} {classById[character.class as keyof typeof classById]?.name} -
              {originById[character.origin]?.name}
            </p>
            {character.concept && <p className="mt-2 italic text-amber-900">{character.concept}</p>}
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button variant="secondary" onClick={() => router.push(`/characters/${character.id}/edit`)}>
              <Edit size={16} /> Editar
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              <FileText size={16} /> Exportar PDF
            </Button>
            <Button variant="secondary" disabled={isPending} onClick={generatePortrait}>
              <Sparkles size={16} /> Gerar retrato
            </Button>
            <Button
              variant="danger"
              disabled={isPending}
              onClick={() => startTransition(async () => {
                await deleteCharacter(character.id);
                router.push("/characters");
              })}
            >
              <Trash2 size={16} /> Excluir
            </Button>
          </div>
          {portraitMessage && <p className="text-sm font-semibold text-red-800">{portraitMessage}</p>}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-6">
        {[
          ["For", character.attr_str],
          ["Des", character.attr_dex],
          ["Con", character.attr_con],
          ["Int", character.attr_int],
          ["Sab", character.attr_wis],
          ["Car", character.attr_cha],
        ].map(([label, value]) => (
          <Card key={label} className="text-center">
            <p className="text-xs font-bold text-stone-600">{label}</p>
            <p className="text-3xl font-black">{value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Fact label="PV" value={character.hp_max} />
        <Fact label="PM" value={character.mp_max} />
        <Fact label="Defesa" value={character.defense} />
        <Fact label="Deslocamento" value={`${character.movement_m}m`} />
        <Fact label="Tamanho" value={character.size} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle>Perícias</SectionTitle>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {character.trained_skills.map((skill) => (
              <p key={skill} className="rounded-md bg-white/70 px-3 py-2 text-sm">
                {skillById[skill]?.name ?? skill}: <strong>+{calculateSkillBonus(build, skill)}</strong>
              </p>
            ))}
          </div>
        </Card>
        <Card>
          <SectionTitle>Habilidades e magias</SectionTitle>
          <p className="mt-3 text-sm">{classById[character.class as keyof typeof classById]?.firstLevelAbility}</p>
          <p className="mt-2 text-sm">{raceById[character.race as keyof typeof raceById]?.abilities.join("; ")}</p>
          {character.spells.length > 0 && <p className="mt-2 text-sm">Magias: {character.spells.join(", ")}</p>}
        </Card>
      </div>

      <Card>
        <SectionTitle>Equipamento</SectionTitle>
        <p className="mt-3 text-sm">{character.equipment?.map((item) => `${item.qty}x ${item.name}`).join(", ") || "Starter kit pendente."}</p>
        <p className="mt-2 text-sm font-semibold">{character.silver_pieces} PP</p>
      </Card>

      <Card>
        <SectionTitle>Descrição</SectionTitle>
        <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
          <p><strong>Aparência:</strong> {character.appearance}</p>
          <p><strong>Personalidade:</strong> {character.personality}</p>
          <p><strong>Histórico:</strong> {character.history}</p>
          <p><strong>Objetivo:</strong> {character.objective}</p>
        </div>
      </Card>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="bg-stone-950 text-amber-50">
      <p className="text-xs text-amber-200">{label}</p>
      <p className="text-2xl font-black capitalize">{value}</p>
    </Card>
  );
}
