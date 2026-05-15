"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Dices, Save, Sparkles } from "lucide-react";
import { saveCharacter } from "@/app/characters/actions";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { classes } from "@/lib/ghanor/classes";
import { origins } from "@/lib/ghanor/origins";
import { aberrantMutations, races } from "@/lib/ghanor/races";
import {
  calculateDefense,
  calculateHp,
  calculateMp,
  generateAttributeRolls,
  getFinalAttributes,
  getMovement,
  getRequiredClassSkills,
  getSize,
  pointBuySpent,
} from "@/lib/ghanor/rules";
import { skills } from "@/lib/ghanor/skills";
import { attributeLabels, attributes, type Attribute } from "@/lib/ghanor/types";
import { cn } from "@/lib/utils";
import { useWizardStore } from "./store";

const stepTitles = [
  "Conceito",
  "Atributos",
  "Raça",
  "Classe",
  "Origem",
  "Perícias",
  "Magias",
  "Toques finais",
];

const conceptExamples = [
  "Uma cavaleira honrada, mas de cabeça quente",
  "Um mago que deseja estudar dragões",
  "Uma elfa druida que fala com seus animais",
];

export function CharacterWizard() {
  const state = useWizardStore();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const form = useForm({ defaultValues: { name: state.name, concept: state.concept } });

  useEffect(() => {
    const saved = window.localStorage.getItem("ghanor-character-draft");
    if (saved) state.update(JSON.parse(saved));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      window.localStorage.setItem("ghanor-character-draft", JSON.stringify(state));
    }, 1000);
    return () => window.clearTimeout(handle);
  }, [state]);

  const build = useMemo(
    () => ({
      race: state.race,
      class: state.class,
      origin: state.origin,
      extraOrigin: state.extraOrigin,
      baseAttributes: state.baseAttributes,
      raceChoices: state.raceChoices,
      classChoices: state.classChoices,
      armor: state.armor,
      shield: state.shield,
      trainedSkills: [...new Set([...getRequiredClassSkills(state), ...state.trainedSkills])],
    }),
    [state],
  );
  const finalAttrs = getFinalAttributes(build);
  const selectedClass = classes.find((klass) => klass.id === state.class)!;
  const selectedRace = races.find((race) => race.id === state.race)!;
  const selectedOrigin = origins.find((origin) => origin.id === state.origin)!;

  const setAttr = (attr: Attribute, value: number) =>
    state.update({ baseAttributes: { ...state.baseAttributes, [attr]: value } });

  function finalize() {
    setError(undefined);
    startTransition(async () => {
      try {
        const id = await saveCharacter(state);
        window.localStorage.removeItem("ghanor-character-draft");
        router.push(`/characters/${id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível salvar o personagem.");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-amber-800">Passo {state.step}/8</p>
            <h1 className="text-3xl font-black text-stone-950">{stepTitles[state.step - 1]}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={state.step === 1} onClick={() => state.setStep(state.step - 1)}>
              Voltar
            </Button>
            {state.step < 8 ? (
              <Button onClick={() => state.setStep(state.step + 1)}>Avançar</Button>
            ) : (
              <Button onClick={finalize} disabled={isPending}>
                <Save size={16} /> {isPending ? "Salvando..." : "Finalizar e salvar"}
              </Button>
            )}
          </div>
        </div>

        {state.step === 1 && (
          <Card className="space-y-4">
            <SectionTitle>Quem entra na taverna?</SectionTitle>
            <label className="block text-sm font-semibold text-stone-800">
              Nome
              <Input
                {...form.register("name")}
                value={state.name}
                onChange={(event) => state.update({ name: event.target.value })}
                placeholder="Brunhilda, Calian, Rurik..."
              />
            </label>
            <label className="block text-sm font-semibold text-stone-800">
              Conceito em uma frase
              <Textarea
                {...form.register("concept")}
                value={state.concept}
                onChange={(event) => state.update({ concept: event.target.value })}
                placeholder={conceptExamples[state.name.length % conceptExamples.length]}
              />
            </label>
          </Card>
        )}

        {state.step === 2 && (
          <Card className="space-y-4">
            <div className="flex gap-2">
              {(["points", "rolls"] as const).map((method) => (
                <Button
                  key={method}
                  variant={state.attrMethod === method ? "primary" : "secondary"}
                  onClick={() => state.update({ attrMethod: method })}
                >
                  {method === "points" ? "Pontos" : "Rolagens"}
                </Button>
              ))}
            </div>
            {state.attrMethod === "points" ? (
              <p className="text-sm text-stone-700">Pontos usados: {pointBuySpent(state.baseAttributes)}/10.</p>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  const rolled = generateAttributeRolls();
                  const next = { ...state.baseAttributes };
                  attributes.forEach((attr, index) => (next[attr] = rolled[index].modifier));
                  state.update({ baseAttributes: next });
                }}
              >
                <Dices size={16} /> Rolar 6 vezes
              </Button>
            )}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {attributes.map((attr) => (
                <label key={attr} className="rounded-md border border-amber-900/10 bg-white/60 p-3 text-sm font-semibold">
                  {attributeLabels[attr]}
                  <Input
                    type="number"
                    min={state.attrMethod === "points" ? -1 : -2}
                    max={4}
                    value={state.baseAttributes[attr]}
                    onChange={(event) => setAttr(attr, Number(event.target.value))}
                  />
                </label>
              ))}
            </div>
          </Card>
        )}

        {state.step === 3 && (
          <div className="grid gap-3 md:grid-cols-2">
            {races.map((race) => (
              <button
                key={race.id}
                className={cn(
                  "rounded-lg border p-4 text-left transition",
                  state.race === race.id ? "border-amber-800 bg-amber-100" : "border-amber-900/15 bg-amber-50/70",
                )}
                onClick={() => state.update({ race: race.id })}
              >
                <h3 className="font-bold text-stone-950">{race.name}</h3>
                <p className="text-sm text-stone-700">{race.summary}</p>
              </button>
            ))}
            <Card className="md:col-span-2">
              <SectionTitle>Escolhas raciais: {selectedRace.name}</SectionTitle>
              {state.race === "humano" && (
                <ChoiceGrid
                  options={attributes.map((attr) => ({ id: attr, label: attributeLabels[attr] }))}
                  selected={state.raceChoices.attributes}
                  limit={3}
                  onChange={(selected) => state.update({ raceChoices: { ...state.raceChoices, attributes: selected as Attribute[] } })}
                />
              )}
              {state.race === "meio_elfo" && (
                <select
                  className="h-10 rounded-md border border-amber-900/20 bg-white px-3"
                  value={state.raceChoices.extraAttribute ?? "str"}
                  onChange={(event) =>
                    state.update({ raceChoices: { ...state.raceChoices, extraAttribute: event.target.value as Attribute } })
                  }
                >
                  {attributes.map((attr) => (
                    <option key={attr} value={attr}>
                      +1 {attributeLabels[attr]}
                    </option>
                  ))}
                </select>
              )}
              {state.race === "aberrante" && (
                <ChoiceGrid
                  options={aberrantMutations.map((mutation) => ({ id: mutation.id, label: mutation.name }))}
                  selected={state.raceChoices.mutations}
                  limit={4}
                  onChange={(selected) => state.update({ raceChoices: { ...state.raceChoices, mutations: selected } })}
                />
              )}
            </Card>
          </div>
        )}

        {state.step === 4 && (
          <div className="grid gap-3 md:grid-cols-2">
            {classes.map((klass) => (
              <button
                key={klass.id}
                className={cn(
                  "rounded-lg border p-4 text-left transition",
                  state.class === klass.id ? "border-amber-800 bg-amber-100" : "border-amber-900/15 bg-amber-50/70",
                )}
                onClick={() => state.update({ class: klass.id })}
              >
                <h3 className="font-bold text-stone-950">{klass.name}</h3>
                <p className="text-sm text-stone-700">PV {klass.hpBase}+Con, PM {klass.mpPerLevel}/nível.</p>
                <p className="mt-2 text-xs text-stone-600">{klass.firstLevelAbility}</p>
              </button>
            ))}
            <Card className="md:col-span-2">
              <SectionTitle>Escolhas de classe</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Perícia inicial
                  <select
                    className="mt-1 h-10 w-full rounded-md border border-amber-900/20 bg-white px-3"
                    value={state.classChoices.initialSkill ?? "luta"}
                    onChange={(event) => state.update({ classChoices: { ...state.classChoices, initialSkill: event.target.value } })}
                  >
                    <option value="luta">Luta</option>
                    <option value="pontaria">Pontaria</option>
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Texto livre de submecânica
                  <Input
                    value={state.classChoices.note ?? ""}
                    onChange={(event) => state.update({ classChoices: { ...state.classChoices, note: event.target.value } })}
                    placeholder={selectedClass.needsChoice ?? "Escolha opcional"}
                  />
                </label>
              </div>
            </Card>
          </div>
        )}

        {state.step === 5 && (
          <Card className="space-y-4">
            <SectionTitle>Origem</SectionTitle>
            <div className="grid gap-3 md:grid-cols-2">
              {origins.map((origin) => (
                <button
                  key={origin.id}
                  className={cn(
                    "rounded-md border p-3 text-left",
                    state.origin === origin.id ? "border-amber-800 bg-amber-100" : "border-amber-900/15 bg-white/60",
                  )}
                  onClick={() => state.update({ origin: origin.id })}
                >
                  <span className="font-bold">{origin.name}</span>
                  <p className="text-xs text-stone-700">{origin.benefit}</p>
                </button>
              ))}
            </div>
            {state.race === "meio_elfo" && (
              <label className="block text-sm font-semibold">
                Origem adicional (sem itens)
                <select
                  className="mt-1 h-10 w-full rounded-md border border-amber-900/20 bg-white px-3"
                  value={state.extraOrigin ?? ""}
                  onChange={(event) => state.update({ extraOrigin: event.target.value })}
                >
                  <option value="">Escolha...</option>
                  {origins.map((origin) => (
                    <option key={origin.id} value={origin.id}>
                      {origin.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </Card>
        )}

        {state.step === 6 && (
          <Card className="space-y-4">
            <SectionTitle>Perícias treinadas</SectionTitle>
            <p className="text-sm text-stone-700">
              Classe exige {selectedClass.chooseSkills} escolhas. Inteligência positiva concede escolhas extras livres.
            </p>
            <ChoiceGrid
              options={skills.map((skill) => ({ id: skill.id, label: skill.name }))}
              selected={state.trainedSkills}
              limit={selectedClass.chooseSkills + Math.max(finalAttrs.int, 0)}
              onChange={(selected) => state.update({ trainedSkills: selected })}
            />
          </Card>
        )}

        {state.step === 7 && (
          <Card className="space-y-4">
            <SectionTitle>Magias</SectionTitle>
            <p className="text-sm text-stone-700">Disponível para Bardo, Clérigo, Mago e traços como Receptáculo ou Magia Bizarra.</p>
            <Input
              value={state.spells.join(", ")}
              onChange={(event) => state.update({ spells: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
              placeholder="Curar Ferimentos, Luz, Disfarce Ilusório..."
            />
          </Card>
        )}

        {state.step === 8 && (
          <Card className="space-y-4">
            <SectionTitle>Toques finais</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Idade
                <Input type="number" value={state.age ?? ""} onChange={(event) => state.update({ age: Number(event.target.value) })} />
              </label>
              <label className="text-sm font-semibold">
                PP iniciais
                <Input
                  type="number"
                  value={state.silverPieces}
                  onChange={(event) => state.update({ silverPieces: Number(event.target.value) })}
                />
              </label>
              <label className="text-sm font-semibold">
                Armadura
                <select
                  className="mt-1 h-10 w-full rounded-md border border-amber-900/20 bg-white px-3"
                  value={state.armor}
                  onChange={(event) => state.update({ armor: event.target.value as typeof state.armor })}
                >
                  <option value="none">Sem armadura</option>
                  <option value="couro">Couro</option>
                  <option value="couro_batido">Couro batido</option>
                  <option value="gibao_peles">Gibão de peles</option>
                  <option value="brunea">Brunea</option>
                </select>
              </label>
              <label className="text-sm font-semibold">
                Escudo
                <select
                  className="mt-1 h-10 w-full rounded-md border border-amber-900/20 bg-white px-3"
                  value={state.shield}
                  onChange={(event) => state.update({ shield: event.target.value as typeof state.shield })}
                >
                  <option value="none">Nenhum</option>
                  <option value="escudo_leve">Escudo leve</option>
                </select>
              </label>
            </div>
            {(["appearance", "personality", "history", "objective"] as const).map((field) => (
              <label key={field} className="block text-sm font-semibold capitalize">
                {field}
                <Textarea value={state[field]} onChange={(event) => state.update({ [field]: event.target.value })} />
              </label>
            ))}
            <div className="rounded-md border border-amber-900/20 bg-white/60 p-3 text-sm text-stone-700">
              <Sparkles className="mr-2 inline" size={16} />
              O retrato por IA fica disponível na ficha salva, pois o gerador precisa do ID do personagem.
            </div>
            {error && <p className="text-sm font-semibold text-red-800">{error}</p>}
          </Card>
        )}
      </section>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <Card className="space-y-4">
          <SectionTitle>Prévia da ficha</SectionTitle>
          <div>
            <p className="text-xl font-black">{state.name || "Aventureiro sem nome"}</p>
            <p className="text-sm text-stone-700">
              {selectedRace.name} {selectedClass.name} de origem {selectedOrigin.name}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {attributes.map((attr) => (
              <div key={attr} className="rounded-md bg-white/70 p-2 text-center">
                <p className="text-xs font-bold text-stone-600">{attributeLabels[attr]}</p>
                <p className="text-xl font-black">{finalAttrs[attr]}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Stat label="PV" value={calculateHp(build)} />
            <Stat label="PM" value={calculateMp(build)} />
            <Stat label="Defesa" value={calculateDefense(build)} />
            <Stat label="Mov." value={`${getMovement(build)}m`} />
            <Stat label="Tam." value={getSize(build)} />
            <Stat label="Perícias" value={build.trainedSkills.length} />
          </div>
          <p className="text-xs text-stone-600">
            Ferramenta criada por fãs. A Lenda de Ghanor é marca registrada da Jambô Editora.
          </p>
        </Card>
      </aside>
    </div>
  );
}

function ChoiceGrid({
  options,
  selected,
  limit,
  onChange,
}: {
  options: Array<{ id: string; label: string }>;
  selected: string[];
  limit: number;
  onChange: (selected: string[]) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((option) => {
        const checked = selected.includes(option.id);
        return (
          <label key={option.id} className="flex items-center gap-2 rounded-md border border-amber-900/10 bg-white/60 p-2 text-sm">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => {
                if (!checked && selected.length >= limit) return;
                onChange(toggleChoice(selected, option.id));
              }}
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}

function toggleChoice(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-stone-950 px-3 py-2 text-amber-50">
      <p className="text-xs text-amber-200">{label}</p>
      <p className="font-black capitalize">{value}</p>
    </div>
  );
}
