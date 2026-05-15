"use client";

import { useEffect, useMemo, useState, useTransition, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
  Axe,
  Church,
  Crown,
  Dices,
  Drum,
  Eye,
  KeyRound,
  PawPrint,
  Sailboat,
  Save,
  Shield,
  Sparkles,
  Swords,
  WandSparkles,
} from "lucide-react";
import { saveCharacter } from "@/app/characters/actions";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { classes } from "@/lib/ghanor/classes";
import { getSpellsForClass, spells } from "@/lib/ghanor/spells";
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
import { attributeLabels, attributes, type Attribute, type ClassId } from "@/lib/ghanor/types";
import { cn } from "@/lib/utils";
import { useWizardStore } from "./store";

const stepTitles = [
  "O chamado",
  "A forja da alma",
  "Sangue e lenda",
  "O caminho",
  "Antes da aventura",
  "Talentos na estrada",
  "Palavras de poder",
  "O primeiro amanhecer",
];

const stepCopy = [
  "Toda saga começa antes da primeira espada sair da bainha. Há um nome sussurrado em tavernas, escrito em dívidas antigas ou lembrado por quem sobreviveu ao impossível.",
  "Em Ghanor, atributos não são números soltos: são cicatrizes, vícios, treino, sorte e teimosia. Distribua sua força interior sem ultrapassar os limites de um herói iniciante.",
  "Seu povo moldou sua visão de mundo antes mesmo da primeira escolha consciente. Sangue, cultura e estranheza deixam marcas reais na ficha.",
  "Classe é a resposta para a pergunta: quando o perigo sorri, o que você faz? Canta, reza, caça, comanda, engana ou avança?",
  "A origem é o que veio antes da lenda. Ela explica o que você sabe, o que carrega e por que ainda não desistiu.",
  "Perícias são as ferramentas invisíveis do aventureiro. Elas dizem como você resolve problemas quando a espada não é a resposta.",
  "Magia é promessa, risco e linguagem antiga. Se seu caminho permite conjuração, escolha os primeiros nomes que seu personagem sabe chamar.",
  "Agora faltam as últimas marcas: equipamento, idade, aparência, personalidade e o motivo pelo qual esse personagem segue adiante.",
];

const attributeStories: Record<Attribute, { label: string; help: string }> = {
  str: { label: "Força", help: "erguer portões, partir escudos, vencer na brutalidade." },
  dex: { label: "Destreza", help: "mãos rápidas, passos leves, mira e reflexo." },
  con: { label: "Constituição", help: "aguentar veneno, frio, pancada e noites ruins." },
  int: { label: "Inteligência", help: "memória, estudo, tática e perícias extras." },
  wis: { label: "Sabedoria", help: "instinto, fé, percepção e vontade." },
  cha: { label: "Carisma", help: "presença, encanto, ameaça e força de personalidade." },
};

const classIcons: Record<ClassId, ComponentType<{ size?: number; className?: string }>> = {
  barbaro: Axe,
  bardo: Drum,
  bucaneiro: Sailboat,
  cacador: Eye,
  cavaleiro: Shield,
  clerigo: Church,
  druida: PawPrint,
  ladino: KeyRound,
  mago: WandSparkles,
  nobre: Crown,
  soldado: Swords,
};

export function CharacterWizard() {
  const state = useWizardStore();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [nameOptions, setNameOptions] = useState<string[]>([]);
  const [originQuery, setOriginQuery] = useState("");

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
  const remainingPoints = 10 - pointBuySpent(state.baseAttributes);
  const classSpellOptions = getSpellsForClass(state.class);
  const spellOptions = classSpellOptions.length > 0 ? classSpellOptions : spells;
  const canUseMagic =
    ["bardo", "clerigo", "mago"].includes(state.class) ||
    state.origin === "receptaculo" ||
    state.raceChoices.mutations.includes("magia_bizarra");

  function setAttr(attr: Attribute, value: number) {
    const min = state.attrMethod === "points" ? -1 : -2;
    const nextValue = Math.max(min, Math.min(4, value));
    const next = { ...state.baseAttributes, [attr]: nextValue };
    if (state.attrMethod === "points" && pointBuySpent(next) > 10) return;
    state.update({ baseAttributes: next });
  }

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

  async function rollNames() {
    const response = await fetch(`/api/random-name?race=${state.race}`);
    const json = await response.json();
    setNameOptions(json.names ?? []);
  }

  return (
    <div className="flex flex-col gap-5 pb-28 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:pb-6">
      <section className="space-y-4">
        <div className="rounded-b-3xl border border-amber-900/15 bg-stone-950 px-4 py-5 text-amber-50 shadow-xl md:rounded-3xl md:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-amber-300">Passo {state.step} de 8</p>
              <h1 className="text-2xl font-black md:text-4xl">{stepTitles[state.step - 1]}</h1>
            </div>
            <Sparkles className="hidden text-amber-300 sm:block" />
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-amber-100 md:text-base">{stepCopy[state.step - 1]}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-amber-100/20">
            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${(state.step / 8) * 100}%` }} />
          </div>
        </div>

        {state.step === 1 && (
          <Card className="space-y-5">
            <SectionTitle>O nome que a estrada vai lembrar</SectionTitle>
            <p className="text-sm leading-6 text-stone-700">
              Talvez seu personagem tenha escolhido o próprio nome. Talvez tenha herdado um sobrenome pesado. Talvez seja conhecido
              por um apelido que começou como piada e terminou como profecia.
            </p>
            <label className="block text-sm font-semibold text-stone-800">
              Nome do personagem
              <div className="mt-2 flex gap-2">
                <Input
                  value={state.name}
                  onChange={(event) => state.update({ name: event.target.value })}
                  placeholder="Brunhilda, Calian, Rurik..."
                />
                <Button type="button" variant="secondary" onClick={rollNames} title="Sortear nomes">
                  <Dices size={16} />
                </Button>
              </div>
            </label>
            {nameOptions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {nameOptions.map((name) => (
                  <button
                    key={name}
                    className="rounded-full border border-amber-900/20 bg-white/70 px-3 py-2 text-sm font-semibold text-stone-800"
                    onClick={() => state.update({ name })}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
            <label className="block text-sm font-semibold text-stone-800">
              Conceito em uma frase
              <Textarea
                value={state.concept}
                onChange={(event) => state.update({ concept: event.target.value })}
                placeholder="Uma cavaleira honrada, mas de cabeça quente."
              />
            </label>
          </Card>
        )}

        {state.step === 2 && (
          <Card className="space-y-5">
            <SectionTitle>Distribua os instintos do herói</SectionTitle>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant={state.attrMethod === "points" ? "primary" : "secondary"}
                onClick={() => state.update({ attrMethod: "points" })}
              >
                Construir com 10 pontos
              </Button>
              <Button
                variant={state.attrMethod === "rolls" ? "primary" : "secondary"}
                onClick={() => state.update({ attrMethod: "rolls" })}
              >
                Deixar os dados cantarem
              </Button>
            </div>
            {state.attrMethod === "points" ? (
              <div className={cn("rounded-lg p-3 text-sm font-semibold", remainingPoints < 0 ? "bg-red-100 text-red-900" : "bg-amber-100 text-stone-900")}>
                Você ainda tem {remainingPoints} ponto(s). O app bloqueia aumentos que passem do limite oficial.
              </div>
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
                <Dices size={16} /> Rolar seis destinos
              </Button>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {attributes.map((attr) => (
                <div key={attr} className="rounded-lg border border-amber-900/10 bg-white/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-stone-950">{attributeStories[attr].label}</p>
                      <p className="text-xs leading-5 text-stone-600">{attributeStories[attr].help}</p>
                    </div>
                    <span className="rounded-md bg-stone-950 px-3 py-1 text-lg font-black text-amber-50">
                      {state.baseAttributes[attr]}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-[44px_1fr_44px] items-center gap-2">
                    <Button variant="secondary" onClick={() => setAttr(attr, state.baseAttributes[attr] - 1)}>-</Button>
                    <input
                      aria-label={attributeStories[attr].label}
                      type="range"
                      min={state.attrMethod === "points" ? -1 : -2}
                      max={4}
                      value={state.baseAttributes[attr]}
                      onChange={(event) => setAttr(attr, Number(event.target.value))}
                      className="w-full accent-amber-700"
                    />
                    <Button variant="secondary" onClick={() => setAttr(attr, state.baseAttributes[attr] + 1)}>+</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {state.step === 3 && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {races.map((race) => (
                <button
                  key={race.id}
                  className={cn(
                    "rounded-lg border p-4 text-left transition",
                    state.race === race.id ? "border-amber-800 bg-amber-100 shadow-md" : "border-amber-900/15 bg-amber-50/70",
                  )}
                  onClick={() => state.update({ race: race.id })}
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-stone-950 text-lg font-black text-amber-300">
                    {race.name.slice(0, 1)}
                  </div>
                  <h3 className="font-black text-stone-950">{race.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-stone-700">{race.summary}</p>
                </button>
              ))}
            </div>
            <Card>
              <SectionTitle>Heranças de {selectedRace.name}</SectionTitle>
              <p className="mb-3 text-sm text-stone-700">{selectedRace.abilities.join(" ")}</p>
              {state.race === "humano" && (
                <ChoiceGrid
                  options={attributes.map((attr) => ({ id: attr, label: `+1 ${attributeLabels[attr]}` }))}
                  selected={state.raceChoices.attributes}
                  limit={3}
                  onChange={(selected) => state.update({ raceChoices: { ...state.raceChoices, attributes: selected as Attribute[] } })}
                />
              )}
              {state.race === "meio_elfo" && (
                <SelectLine
                  label="Atributo que recebeu a mistura das duas linhagens"
                  value={state.raceChoices.extraAttribute ?? "str"}
                  onChange={(value) =>
                    state.update({ raceChoices: { ...state.raceChoices, extraAttribute: value as Attribute } })
                  }
                  options={attributes.map((attr) => ({ id: attr, label: `+1 ${attributeLabels[attr]}` }))}
                />
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
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {classes.map((klass) => {
                const Icon = classIcons[klass.id];
                return (
                  <button
                    key={klass.id}
                    className={cn(
                      "rounded-lg border p-4 text-left transition",
                      state.class === klass.id ? "border-amber-800 bg-amber-100 shadow-md" : "border-amber-900/15 bg-amber-50/70",
                    )}
                    onClick={() => state.update({ class: klass.id })}
                  >
                    <Icon className="mb-3 text-amber-800" size={30} />
                    <h3 className="font-black text-stone-950">{klass.name}</h3>
                    <p className="text-sm text-stone-700">PV {klass.hpBase}+Con, PM {klass.mpPerLevel}/nível.</p>
                    <p className="mt-2 text-xs leading-5 text-stone-600">{klass.firstLevelAbility}</p>
                  </button>
                );
              })}
            </div>
            <Card className="space-y-3">
              <SectionTitle>O primeiro juramento do caminho</SectionTitle>
              <p className="text-sm text-stone-700">{selectedClass.needsChoice ?? "Esta classe não exige uma escolha extra para o MVP."}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectLine
                  label="Perícia inicial marcial"
                  value={state.classChoices.initialSkill ?? "luta"}
                  onChange={(value) => state.update({ classChoices: { ...state.classChoices, initialSkill: value } })}
                  options={[
                    { id: "luta", label: "Luta" },
                    { id: "pontaria", label: "Pontaria" },
                  ]}
                />
                <label className="text-sm font-semibold">
                  Detalhe livre da classe
                  <Input
                    value={state.classChoices.note ?? ""}
                    onChange={(event) => state.update({ classChoices: { ...state.classChoices, note: event.target.value } })}
                    placeholder="Santo, juramento, tradição, inimigo..."
                  />
                </label>
              </div>
            </Card>
          </div>
        )}

        {state.step === 5 && (
          <Card className="space-y-4">
            <SectionTitle>O passado que ainda pesa</SectionTitle>
            <Input
              value={originQuery}
              onChange={(event) => setOriginQuery(event.target.value)}
              placeholder="Filtrar por nome, item ou perícia..."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {origins
                .filter((origin) => `${origin.name} ${origin.benefit} ${origin.items.join(" ")}`.toLowerCase().includes(originQuery.toLowerCase()))
                .map((origin) => (
                  <button
                    key={origin.id}
                    className={cn(
                      "rounded-md border p-3 text-left",
                      state.origin === origin.id ? "border-amber-800 bg-amber-100" : "border-amber-900/15 bg-white/60",
                    )}
                    onClick={() => state.update({ origin: origin.id })}
                  >
                    <span className="font-black">{origin.name}</span>
                    <p className="mt-1 text-xs leading-5 text-stone-700">{origin.benefit}</p>
                    <p className="mt-2 text-xs text-stone-500">Itens: {origin.items.join(", ")}</p>
                  </button>
                ))}
            </div>
            {state.race === "meio_elfo" && (
              <SelectLine
                label="Origem adicional de meio-elfo (sem itens)"
                value={state.extraOrigin ?? ""}
                onChange={(value) => state.update({ extraOrigin: value })}
                options={[{ id: "", label: "Escolha..." }, ...origins.map((origin) => ({ id: origin.id, label: origin.name }))]}
              />
            )}
          </Card>
        )}

        {state.step === 6 && (
          <Card className="space-y-4">
            <SectionTitle>O que você sabe fazer sob pressão</SectionTitle>
            <p className="text-sm leading-6 text-stone-700">
              Sua classe já concede algumas perícias. Aqui você escolhe as demais: {selectedClass.chooseSkills} pela classe e
              {Math.max(finalAttrs.int, 0) > 0 ? ` ${Math.max(finalAttrs.int, 0)} extra(s) pela Inteligência.` : " nenhuma extra por Inteligência no momento."}
            </p>
            <ChoiceGrid
              options={skills.map((skill) => ({ id: skill.id, label: `${skill.name} (${attributeLabels[skill.attribute]})` }))}
              selected={state.trainedSkills}
              limit={selectedClass.chooseSkills + Math.max(finalAttrs.int, 0)}
              onChange={(selected) => state.update({ trainedSkills: selected })}
            />
          </Card>
        )}

        {state.step === 7 && (
          <Card className="space-y-4">
            <SectionTitle>Escolha suas primeiras magias</SectionTitle>
            {!canUseMagic ? (
              <p className="text-sm leading-6 text-stone-700">
                Seu personagem ainda não tem uma fonte de magia. Se escolher uma origem ou mutação que conceda magia, esta etapa ganha opções.
              </p>
            ) : (
              <>
                <p className="text-sm leading-6 text-stone-700">
                  Estas são magias de 1º círculo disponíveis para o caminho escolhido. Use a busca do navegador se quiser achar uma magia pelo nome.
                </p>
                <ChoiceGrid
                  options={spellOptions.map((spell) => ({ id: spell.name, label: `${spell.name} - ${spell.tags.join("/")}` }))}
                  selected={state.spells}
                  limit={8}
                  onChange={(selected) => state.update({ spells: selected })}
                />
                <label className="block text-sm font-semibold">
                  Magia personalizada, se o mestre permitir
                  <Input
                    placeholder="Digite e pressione vírgula para separar"
                    onChange={(event) => {
                      const extras = event.target.value.split(",").map((item) => item.trim()).filter(Boolean);
                      state.update({ spells: [...new Set([...state.spells, ...extras])] });
                    }}
                  />
                </label>
              </>
            )}
          </Card>
        )}

        {state.step === 8 && (
          <Card className="space-y-4">
            <SectionTitle>Antes de abrir a porta</SectionTitle>
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
              <SelectLine
                label="Armadura"
                value={state.armor}
                onChange={(value) => state.update({ armor: value as typeof state.armor })}
                options={[
                  { id: "none", label: "Sem armadura" },
                  { id: "couro", label: "Couro" },
                  { id: "couro_batido", label: "Couro batido" },
                  { id: "gibao_peles", label: "Gibão de peles" },
                  { id: "brunea", label: "Brunea" },
                ]}
              />
              <SelectLine
                label="Escudo"
                value={state.shield}
                onChange={(value) => state.update({ shield: value as typeof state.shield })}
                options={[
                  { id: "none", label: "Nenhum" },
                  { id: "escudo_leve", label: "Escudo leve" },
                ]}
              />
            </div>
            {[
              ["appearance", "Aparência"],
              ["personality", "Personalidade"],
              ["history", "Histórico"],
              ["objective", "Objetivo"],
            ].map(([field, label]) => (
              <label key={field} className="block text-sm font-semibold">
                {label}
                <Textarea value={state[field as "appearance"]} onChange={(event) => state.update({ [field]: event.target.value })} />
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

      <div
        className="fixed inset-x-0 bottom-0 z-20 border-t border-amber-900/20 bg-amber-50/95 p-3 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(0.75rem, var(--safe-bottom))" }}
      >
        <div className="mx-auto grid max-w-lg grid-cols-2 gap-2">
          <Button variant="secondary" disabled={state.step === 1} onClick={() => state.setStep(state.step - 1)}>
            Voltar
          </Button>
          {state.step < 8 ? (
            <Button onClick={() => state.setStep(state.step + 1)}>Avançar</Button>
          ) : (
            <Button onClick={finalize} disabled={isPending}>
              <Save size={16} /> Salvar
            </Button>
          )}
        </div>
      </div>

      <div className="hidden justify-end gap-2 md:flex lg:col-span-2">
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
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const checked = selected.includes(option.id);
        const disabled = !checked && selected.length >= limit;
        return (
          <label
            key={option.id}
            className={cn(
              "flex min-h-12 items-center gap-2 rounded-md border border-amber-900/10 bg-white/70 p-3 text-sm font-semibold",
              disabled && "opacity-45",
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={() => onChange(toggleChoice(selected, option.id))}
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}

function SelectLine({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ id: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <select
        className="mt-1 h-11 w-full rounded-md border border-amber-900/20 bg-white px-3 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
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
