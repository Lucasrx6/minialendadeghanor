"use client";

import { useEffect, useMemo, useState, useTransition, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
  Axe,
  Check,
  ChevronDown,
  ChevronRight,
  Church,
  Crown,
  Dices,
  Drum,
  Eye,
  Flame,
  Heart,
  KeyRound,
  Lock,
  PawPrint,
  Sailboat,
  Save,
  Shield,
  Sparkles,
  Swords,
  WandSparkles,
  Wrench,
  Zap,
  Star,
} from "lucide-react";
import { saveCharacter } from "@/app/characters/actions";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { classes } from "@/lib/ghanor/classes";
import { ARCANE_TRADITIONS } from "@/lib/ghanor/traditions";
import { getSpellsForClass, type Spell, type SpellEffectType } from "@/lib/ghanor/spells";
import { getGeneralPowers, getClassPowers, powerById, CLASS_STARTING_POWER, type Power } from "@/lib/ghanor/powers";
import { origins } from "@/lib/ghanor/origins";
import { aberrantMutations, races } from "@/lib/ghanor/races";
import {
  calculateDefense,
  calculateHp,
  calculateMp,
  collectOriginSkills,
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
import { useWizardStore, type WizardState } from "./store";

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

const WIZARD_ARMOR_DEFAULTS: Record<string, { armor: WizardState["armor"]; shield: WizardState["shield"] }> = {
  barbaro:   { armor: "gibao_peles",  shield: "escudo_leve" },
  bardo:     { armor: "couro",        shield: "none" },
  bucaneiro: { armor: "couro_batido", shield: "none" },
  cacador:   { armor: "couro_batido", shield: "escudo_leve" },
  cavaleiro: { armor: "brunea",       shield: "escudo_leve" },
  clerigo:   { armor: "brunea",       shield: "escudo_leve" },
  // Druida: não pode usar metal → sem brunea (livro pág.49)
  druida:    { armor: "couro",        shield: "escudo_leve" },
  ladino:    { armor: "couro_batido", shield: "none" },
  // Mago: nenhuma proficiência de armadura (livro pág.57)
  mago:      { armor: "none",         shield: "none" },
  // Nobre: armaduras pesadas (livro pág.61)
  nobre:     { armor: "brunea",       shield: "escudo_leve" },
  soldado:   { armor: "brunea",       shield: "escudo_leve" },
};

// Armaduras disponíveis por classe (respeitando proficiências do livro)
const CLASS_ARMOR_OPTIONS: Record<string, WizardState["armor"][]> = {
  barbaro:   ["none", "couro", "couro_batido", "gibao_peles", "brunea"],
  bardo:     ["none", "couro", "couro_batido", "gibao_peles"],
  bucaneiro: ["none", "couro", "couro_batido", "gibao_peles"],
  cacador:   ["none", "couro", "couro_batido", "gibao_peles", "brunea"],
  cavaleiro: ["none", "couro", "couro_batido", "gibao_peles", "brunea"],
  clerigo:   ["none", "couro", "couro_batido", "gibao_peles", "brunea"],
  // Druida: sem metal — couro e gibão de peles são não-metálicos
  druida:    ["none", "couro", "gibao_peles"],
  ladino:    ["none", "couro", "couro_batido", "gibao_peles"],
  // Mago: sem armadura
  mago:      ["none"],
  nobre:     ["none", "couro", "couro_batido", "gibao_peles", "brunea"],
  soldado:   ["none", "couro", "couro_batido", "gibao_peles", "brunea"],
};

export function CharacterWizard() {
  const state = useWizardStore();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [nameOptions, setNameOptions] = useState<string[]>([]);
  const [originQuery, setOriginQuery] = useState("");
  const [draftPhase, setDraftPhase] = useState<"checking" | "prompt" | "ready">("checking");
  const [savedDraft, setSavedDraft] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("ghanor-character-draft");
    if (!raw) { setDraftPhase("ready"); return; }
    try {
      const draft = JSON.parse(raw) as Record<string, unknown>;
      const hasProgress = ((draft.step as number) ?? 1) > 1 || !!((draft.name as string) ?? "").trim();
      if (hasProgress) { setSavedDraft(draft); setDraftPhase("prompt"); }
      else setDraftPhase("ready");
    } catch { setDraftPhase("ready"); }
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
      trainedSkills: [...new Set([...getRequiredClassSkills(state), ...collectOriginSkills(state), ...state.trainedSkills])],
    }),
    [state],
  );

  const finalAttrs = getFinalAttributes(build);
  const selectedClass = classes.find((klass) => klass.id === state.class)!;
  const selectedRace = races.find((race) => race.id === state.race)!;
  const selectedOrigin = origins.find((origin) => origin.id === state.origin)!;
  const autoGrantedSkills = [...new Set([...getRequiredClassSkills(state), ...collectOriginSkills(state)])];
  const skillChoiceLimit = selectedClass.chooseSkills + Math.max(finalAttrs.int, 0);
  const userChosenSkills = state.trainedSkills.filter((s) => !autoGrantedSkills.includes(s));
  const remainingPoints = 10 - pointBuySpent(state.baseAttributes);
  const circle1Spells = getSpellsForClass(state.class).filter((s) => s.circle === 1);
  const canUseMagic =
    ["bardo", "clerigo", "druida", "mago"].includes(state.class) ||
    state.origin === "receptaculo" ||
    state.raceChoices.mutations.includes("magia_bizarra");
  // Mago: 3 magias (livro pág.57); Clérigo: 3 (livro pág.46); Bardo e Druida: 2 (livro págs.33,49)
  const spellLimit =
    state.class === "mago" || state.class === "clerigo" ? 3 :
    state.class === "bardo" || state.class === "druida" ? 2 :
    2;
  const classStartingPower = CLASS_STARTING_POWER[state.class]
    ? powerById[CLASS_STARTING_POWER[state.class]!]
    : undefined;
  const generalPowers = getGeneralPowers();
  const classPowersForPick = getClassPowers(state.class as ClassId).filter(
    (p) => p.id !== CLASS_STARTING_POWER[state.class],
  );

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

  function continueDraft() {
    if (savedDraft) state.update(savedDraft as Partial<WizardState>);
    setDraftPhase("ready");
  }

  function startFresh() {
    window.localStorage.removeItem("ghanor-character-draft");
    setDraftPhase("ready");
  }

  async function rollNames() {
    const response = await fetch(`/api/random-name?race=${state.race}`);
    const json = await response.json();
    setNameOptions(json.names ?? []);
  }

  if (draftPhase === "checking") return null;

  if (draftPhase === "prompt" && savedDraft) {
    const draftName = (savedDraft.name as string) || "";
    const draftStep = (savedDraft.step as number) ?? 1;
    return (
      <Card className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
          <Save className="text-amber-800" size={28} />
        </div>
        <div>
          <h2 className="text-xl font-black text-stone-950">Rascunho encontrado</h2>
          <p className="mt-2 text-sm text-stone-600">
            {draftName
              ? <><strong>{draftName}</strong> — passo {draftStep} de 8</>
              : <>Personagem sem nome — chegou até o passo {draftStep} de 8</>
            }
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={continueDraft}>Continuar de onde parei</Button>
          <Button variant="secondary" onClick={startFresh}>Começar do zero</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-28 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8 lg:pb-6">
      <section className="min-w-0 space-y-4">
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
                    onClick={() => {
                      const defaults = WIZARD_ARMOR_DEFAULTS[klass.id];
                      state.update({ class: klass.id, ...(defaults ?? {}) });
                    }}
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
              {selectedClass.needsChoice ? (
                <p className="text-sm text-stone-700">{selectedClass.needsChoice}</p>
              ) : (
                <p className="text-sm text-stone-500 italic">Esta classe não exige escolhas extras no 1º nível.</p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {["bucaneiro", "cacador", "soldado"].includes(state.class) && (
                  <SelectLine
                    label="Perícia de combate inicial"
                    value={state.classChoices.initialSkill ?? "luta"}
                    onChange={(value) => state.update({ classChoices: { ...state.classChoices, initialSkill: value } })}
                    options={[
                      { id: "luta", label: "Luta" },
                      { id: "pontaria", label: "Pontaria" },
                    ]}
                  />
                )}
                {state.class === "nobre" && (
                  <SelectLine
                    label="Perícia social inicial"
                    value={state.classChoices.socialSkill ?? "diplomacia"}
                    onChange={(value) => state.update({ classChoices: { ...state.classChoices, socialSkill: value } })}
                    options={[
                      { id: "diplomacia", label: "Diplomacia" },
                      { id: "intimidacao", label: "Intimidação" },
                    ]}
                  />
                )}
                {state.class === "mago" && (
                  <div className="col-span-full space-y-2">
                    <SelectLine
                      label="Tradição Arcana"
                      value={state.classChoices.tradition ?? "erudita"}
                      onChange={(value) => state.update({ classChoices: { ...state.classChoices, tradition: value } })}
                      options={ARCANE_TRADITIONS.map((t) => ({ id: t.id, label: t.name }))}
                    />
                    {(() => {
                      const chosen = ARCANE_TRADITIONS.find(
                        (t) => t.id === (state.classChoices.tradition ?? "erudita"),
                      );
                      return chosen ? (
                        <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-xs text-purple-800 space-y-1">
                          <p className="font-bold">{chosen.name}</p>
                          <p className="italic text-purple-600">{chosen.flavor}</p>
                          <p><span className="font-semibold">Preço da magia: </span>{chosen.preco_da_magia}</p>
                          <p><span className="font-semibold">Segredo básico: </span>{chosen.segredo_basico}</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
                <label className="text-sm font-semibold">
                  Detalhe livre da classe
                  <Input
                    value={state.classChoices.note ?? ""}
                    onChange={(event) => state.update({ classChoices: { ...state.classChoices, note: event.target.value } })}
                    placeholder="Santo, juramento, inimigo predileto..."
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

            {/* Automatic skills panel */}
            {autoGrantedSkills.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-700">
                  Perícias automáticas ({autoGrantedSkills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {autoGrantedSkills.map((skillId) => {
                    const sk = skills.find((s) => s.id === skillId);
                    return sk ? (
                      <span
                        key={skillId}
                        className="inline-flex items-center gap-1 rounded-full bg-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-900"
                      >
                        <Check size={10} /> {sk.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <p className="text-sm leading-6 text-stone-700">
              Escolha mais <strong>{skillChoiceLimit}</strong> perícia(s) à escolha
              {Math.max(finalAttrs.int, 0) > 0
                ? ` (${selectedClass.chooseSkills} pela classe + ${Math.max(finalAttrs.int, 0)} pela Inteligência)`
                : ` (${selectedClass.chooseSkills} pela classe)`}.{" "}
              <span className={userChosenSkills.length >= skillChoiceLimit ? "font-bold text-amber-700" : "text-stone-500"}>
                {userChosenSkills.length}/{skillChoiceLimit} escolhidas.
              </span>
            </p>

            <ChoiceGrid
              options={skills
                .filter((s) => !autoGrantedSkills.includes(s.id))
                .map((s) => ({ id: s.id, label: `${s.name} (${attributeLabels[s.attribute]})` }))}
              selected={userChosenSkills}
              limit={skillChoiceLimit}
              onChange={(selected) => state.update({ trainedSkills: selected })}
            />
          </Card>
        )}

        {state.step === 7 && (
          <div className="space-y-5">
            {/* Magias — só para conjuradores */}
            {canUseMagic && circle1Spells.length > 0 && (
              <SpellPickerSection
                spells={circle1Spells}
                selected={state.spells}
                limit={spellLimit}
                onChange={(ids) => state.update({ spells: ids })}
              />
            )}
            {!canUseMagic && (
              <Card className="space-y-3">
                <SectionTitle>Palavras de poder</SectionTitle>
                <p className="text-sm text-stone-600">
                  Seu personagem ainda não tem uma fonte de magia. Se escolher uma origem ou mutação que conceda magia, esta etapa ganha opções.
                </p>
              </Card>
            )}

            {/* Poderes */}
            <PowerPickerSection
              classStartingPower={classStartingPower}
              generalPowers={generalPowers}
              classPowers={classPowersForPick}
              selected={state.powers}
              onChange={(ids) => state.update({ powers: ids })}
            />
          </div>
        )}

        {state.step === 8 && (
          <Card className="space-y-4">
            <SectionTitle>Antes de abrir a porta</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Idade (mín. 18)
                <Input
                  type="number"
                  min={18}
                  placeholder="18"
                  value={state.age ?? ""}
                  onChange={(event) => state.update({ age: Number(event.target.value) || undefined })}
                  onBlur={() => { if ((state.age ?? 0) < 18) state.update({ age: 18 }); }}
                />
              </label>
              <div className="flex items-center rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <strong className="mr-1">Dinheiro inicial:</strong> 4d6 PP rolados automaticamente.
              </div>
              <SelectLine
                label="Armadura"
                value={state.armor}
                onChange={(value) => state.update({ armor: value as typeof state.armor })}
                options={(CLASS_ARMOR_OPTIONS[state.class] ?? ["none", "couro", "couro_batido", "gibao_peles", "brunea"]).map((id) => ({
                  id,
                  label: id === "none" ? "Sem armadura" : id === "couro" ? "Couro" : id === "couro_batido" ? "Couro batido" : id === "gibao_peles" ? "Gibão de peles" : "Brunea",
                }))}
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

const SPELL_EFFECT_LABELS: Partial<Record<SpellEffectType, string>> = {
  dano: "Dano",
  cura: "Cura",
  buff: "Reforço",
  debuff: "Enfraquecimento",
  utilidade: "Utilidade",
  controle: "Controle",
  "invocação": "Invocação",
};

function SpellPickerSection({
  spells,
  selected,
  limit,
  onChange,
}: {
  spells: Spell[];
  selected: string[];
  limit: number;
  onChange: (ids: string[]) => void;
}) {
  const [filter, setFilter] = useState<SpellEffectType | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const effectTypes = [...new Set(spells.map((s) => s.effect_type))];
  const filtered = filter === "all" ? spells : spells.filter((s) => s.effect_type === filter);

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle>Magias conhecidas</SectionTitle>
        <span className={cn("text-sm font-semibold", selected.length >= limit ? "text-amber-700" : "text-stone-500")}>
          {selected.length}/{limit}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition", filter === "all" ? "border-amber-800 bg-amber-800 text-white" : "border-amber-900/20 bg-white/70 text-stone-700")}
          onClick={() => setFilter("all")}
        >
          Todos
        </button>
        {effectTypes.map((type) => (
          <button
            key={type}
            className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition", filter === type ? "border-amber-800 bg-amber-800 text-white" : "border-amber-900/20 bg-white/70 text-stone-700")}
            onClick={() => setFilter(type as SpellEffectType)}
          >
            {SPELL_EFFECT_LABELS[type as SpellEffectType] ?? type}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((spell) => {
          const isSelected = selected.includes(spell.id);
          const disabled = !isSelected && selected.length >= limit;
          const isOpen = expanded === spell.id;
          return (
            <div
              key={spell.id}
              className={cn(
                "rounded-lg border transition",
                isSelected ? "border-amber-800 bg-amber-50" : "border-amber-900/10 bg-white/70",
                disabled && "opacity-40",
              )}
            >
              <div className="flex items-center gap-3 p-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={disabled}
                  onChange={() => {
                    if (isSelected) onChange(selected.filter((id) => id !== spell.id));
                    else if (!disabled) onChange([...selected, spell.id]);
                  }}
                  className="h-4 w-4 shrink-0 accent-amber-700"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-black text-stone-950">{spell.name}</p>
                  <p className="text-xs text-stone-500">
                    {spell.mp_cost} PM · {spell.casting_time} · {spell.range}
                  </p>
                </div>
                <button
                  className="shrink-0 text-stone-400"
                  onClick={() => setExpanded(isOpen ? null : spell.id)}
                  aria-label={isOpen ? "Recolher" : "Expandir"}
                >
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
              {isOpen && (
                <div className="space-y-1 border-t border-amber-900/10 p-3 pt-2 text-sm text-stone-700">
                  <p><strong>Alvo:</strong> {spell.target} · <strong>Duração:</strong> {spell.duration}</p>
                  <p>{spell.description}</p>
                  {spell.amplify && spell.amplify.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-semibold uppercase text-stone-400">Amplificações</p>
                      {spell.amplify.map((amp, i) => (
                        <p key={i} className="text-xs text-stone-600">+{amp.extra_mp} PM: {amp.effect}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function PowerPickerSection({
  classStartingPower,
  classPowers,
  generalPowers,
  selected,
  onChange,
}: {
  classStartingPower: Power | undefined;
  classPowers: Power[];
  generalPowers: Power[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  function togglePower(id: string) {
    // Permite apenas 1 seleção — deseleciona se clicar no mesmo
    onChange(selected.includes(id) ? [] : [id]);
  }

  function renderPowerCard(power: Power, locked?: boolean) {
    const isSelected = selected.includes(power.id);
    const isOpen = expanded === power.id;
    return (
      <div
        key={power.id}
        className={cn(
          "rounded-lg border transition",
          locked
            ? "border-stone-200 bg-stone-50"
            : isSelected
              ? "border-amber-800 bg-amber-50"
              : "border-amber-900/10 bg-white/70",
        )}
      >
        <div className="flex items-center gap-3 p-3">
          {locked ? (
            <Lock size={14} className="shrink-0 text-stone-400" />
          ) : (
            <button
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition",
                isSelected ? "border-amber-700 bg-amber-700" : "border-stone-300",
              )}
              onClick={() => togglePower(power.id)}
              aria-pressed={isSelected}
            >
              {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-black text-stone-950">{power.name}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
              <span className="capitalize">{power.activation}</span>
              {power.prerequisite && (
                <span className="text-amber-700">· req. {power.prerequisite}</span>
              )}
            </div>
          </div>
          <button
            className="shrink-0 text-stone-400"
            onClick={() => setExpanded(isOpen ? null : power.id)}
            aria-label={isOpen ? "Recolher" : "Expandir"}
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
        {isOpen && (
          <p className="border-t border-amber-900/10 p-3 pt-2 text-sm text-stone-700">
            {power.description}
          </p>
        )}
      </div>
    );
  }

  return (
    <Card className="space-y-4">
      <SectionTitle>Habilidades</SectionTitle>
      <p className="text-xs text-stone-500">Escolha 1 poder (de classe ou geral) para começar.</p>

      {classStartingPower && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-stone-400">Poder de classe (automático)</p>
          {renderPowerCard(classStartingPower, true)}
        </div>
      )}

      {classPowers.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-stone-400">
            Poderes de classe (escolha 1)
          </p>
          <div className="space-y-2">
            {classPowers.filter((p) => !p.tier).map((power) => renderPowerCard(power))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-stone-400">Poderes gerais e de combate (escolha 1)</p>
        <div className="space-y-2">
          {generalPowers.map((power) => renderPowerCard(power))}
        </div>
      </div>
    </Card>
  );
}
