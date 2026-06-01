"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LevelUpCelebration } from "@/components/wizard/LevelUpCelebration";
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, ChevronRight,
  Sparkles, TrendingUp, Swords, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveLevelUp, type LevelUpInput } from "@/app/actions/levelup";
import {
  computeLevelUp, tierForLevel, TIER_LABELS, TIER_FLAVOR,
  SPELLCASTERS, SPELL_CIRCLES, canIncreaseAttribute,
  maxSpellCircle, CLASS_LEVEL_ABILITIES, type CharacterForLevelUp, type Tier,
} from "@/lib/ghanor/leveling";
import { getSpellsForClass, isCasterClass, type Spell } from "@/lib/ghanor/spells";
import { getMagoTraditionSpells } from "@/lib/ghanor/tradition-spells";
import { getClassPowers, getGeneralPowers, type Power } from "@/lib/ghanor/powers";
import { classById, classes } from "@/lib/ghanor/classes";
import { cn } from "@/lib/utils";
import type { ClassId, Attribute } from "@/lib/ghanor/types";

const ATTR_LABELS: Record<string, string> = {
  str: "Força", dex: "Destreza", con: "Constituição",
  int: "Inteligência", wis: "Sabedoria", cha: "Carisma",
};

const TIER_ORDER: Record<Tier, number> = {
  iniciante: 1, veterano: 2, campeao: 3, lenda: 4,
};

type Props = {
  character: CharacterForLevelUp & {
    id: string;
    name: string;
    class: string;
    class_levels: Record<string, number>;
    class_choices?: Record<string, string>;
    spells: string[];
    powers: string[];
    levelUpHistory: Array<{ to_level: number; attr_increased: string | null }>;
  };
};

export function LevelUpWizard({ character }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [celebrationLevel, setCelebrationLevel] = useState<number | null>(null);
  const [celebrationTarget, setCelebrationTarget] = useState<string | null>(null);

  const [notes, setNotes] = useState("");
  const [newClassId, setNewClassId] = useState<ClassId>(character.class as ClassId);
  const [isMulticlass, setIsMulticlass] = useState(false);
  const [powerChosen, setPowerChosen] = useState("");
  const [attrIncreased, setAttrIncreased] = useState<Attribute | null>(null);
  const [selectedSpells, setSelectedSpells] = useState<string[]>([]);

  const fromLevel = character.current_level;
  const toLevel = fromLevel + 1;
  const fromTier = tierForLevel(fromLevel);
  const toTier = tierForLevel(toLevel);
  const tierChanged = fromTier !== toTier;

  const classLevels =
    character.class_levels && Object.keys(character.class_levels).length > 0
      ? character.class_levels
      : { [character.class]: 1 };

  const preview = computeLevelUp(character, {
    newClassId,
    isMulticlass,
    attrIncreased: attrIncreased ?? undefined,
  });

  // ── Spell calculations ─────────────────────────────────────────────────────
  const newClassLevel = (classLevels[newClassId] ?? 0) + 1;
  const oldMaxCircle = maxSpellCircle(newClassId, classLevels[newClassId] ?? 0);
  const newMaxCircle = maxSpellCircle(newClassId, newClassLevel);
  const circleJustOpened = newMaxCircle > oldMaxCircle ? newMaxCircle : undefined;

  // Regras de aprendizado de magia por classe (livro págs. 33, 46, 50, 57):
  // Mago e Clérigo: 1 magia por nível (qualquer círculo disponível)
  // Bardo e Druida: 1 magia nos níveis PARES da classe
  const isMago    = newClassId === "mago";
  const isClerigo = newClassId === "clerigo";
  const isBardo   = newClassId === "bardo";
  const isDruida  = newClassId === "druida";
  const canPickSpell =
    isMago ||
    isClerigo ||
    (isBardo  && newClassLevel % 2 === 0) ||
    (isDruida && newClassLevel % 2 === 0);
  const hasSpellStep = canPickSpell && newMaxCircle > 0;

  // Nenhuma classe auto-aprende TODAS as magias de um novo círculo
  const autoGrantedSpells: string[] = [];

  // Para Mago: filtra magias disponíveis pela tradição arcana escolhida
  const magoTradition = isMago ? (character.class_choices?.tradition as string | undefined) : undefined;
  const traditionSpellIds = isMago ? new Set(getMagoTraditionSpells(magoTradition, newMaxCircle)) : null;

  const availableSpells = newMaxCircle > 0
    ? getSpellsForClass(newClassId).filter(
        (s) =>
          s.circle <= newMaxCircle &&
          !character.spells.includes(s.id) &&
          (traditionSpellIds === null || traditionSpellIds.has(s.id)),
      )
    : [];

  // ── Auto class abilities gained at this level ──────────────────────────────
  const autoClassAbilities: string[] =
    CLASS_LEVEL_ABILITIES[newClassId]?.[newClassLevel] ?? [];

  // ── Power calculations ─────────────────────────────────────────────────────
  const classPowers = getClassPowers(newClassId).filter(
    (p) =>
      !character.powers.includes(p.id) &&
      // Filtra por nível mínimo de classe (se definido)
      (!p.min_class_level || newClassLevel >= p.min_class_level),
  );
  const generalPowers = getGeneralPowers().filter(
    (p) => !character.powers.includes(p.id),
  );

  const isAttrChosen = powerChosen === "Aumento de Atributo";
  const attrs: Attribute[] = ["str", "dex", "con", "int", "wis", "cha"];

  function selectPower(id: string) {
    if (powerChosen === id) {
      setPowerChosen("");
      setAttrIncreased(null);
    } else {
      setPowerChosen(id);
      if (id !== "Aumento de Atributo") setAttrIncreased(null);
    }
  }

  function handleConfirm() {
    const allNewSpells = [...new Set([...selectedSpells, ...autoGrantedSpells])];
    const input: LevelUpInput = {
      characterId: character.id,
      newClassId,
      isMulticlass,
      powerChosen: isAttrChosen ? undefined : (powerChosen || undefined),
      attrIncreased: attrIncreased ?? undefined,
      newSpells: allNewSpells,
      notes: notes || undefined,
    };

    startTransition(async () => {
      const result = await saveLevelUp(input);
      if (result.success) {
        setCelebrationLevel(result.newLevel);
        setCelebrationTarget(`/characters/${character.id}?levelup=${result.newLevel}`);
      } else {
        setToast(result.error);
      }
    });
  }

  const onCelebrationDone = useCallback(() => {
    if (celebrationTarget) router.push(celebrationTarget);
  }, [celebrationTarget, router]);

  return (
    <>
    {celebrationLevel !== null && (
      <LevelUpCelebration level={celebrationLevel} onDone={onCelebrationDone} />
    )}
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f5c86a_0,#f6ead0_40%,#efe1bd_100%)] py-10 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
            className="rounded-full p-2 transition hover:bg-amber-200/60"
          >
            <ArrowLeft size={20} className="text-amber-900" />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-800">
              Level Up
            </p>
            <h1 className="text-2xl font-black text-stone-950">{character.name}</h1>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all",
                s < step ? "bg-amber-600" : s === step ? "bg-amber-800" : "bg-stone-300",
              )}
            />
          ))}
        </div>

        {/* ── PASSO 1: Visão geral ────────────────────────────── */}
        {step === 1 && (
          <Card className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-3">
                <TrendingUp size={28} className="text-amber-900" />
              </div>
              <div>
                <p className="text-sm text-stone-600">Evolução</p>
                <h2 className="text-2xl font-black text-stone-950">
                  Nível {fromLevel} → {toLevel}
                </h2>
              </div>
            </div>

            {tierChanged && (
              <div className="rounded-xl bg-amber-900 px-5 py-4 text-amber-50">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest">
                  Novo Patamar!
                </p>
                <p className="text-xl font-black">🌟 {TIER_LABELS[toTier]}</p>
                <p className="mt-1 text-sm text-amber-200">{TIER_FLAVOR[toTier]}</p>
              </div>
            )}

            <blockquote className="border-l-4 border-amber-700 pl-4 text-sm italic text-stone-700">
              "A maior recompensa que um aventureiro pode receber não existe na forma de
              moedas, mas na experiência adquirida ao se vencer perigos letais."
            </blockquote>

            <div>
              <label className="mb-2 block text-sm font-bold text-stone-700">
                O que sua personagem viveu? (opcional)
              </label>
              <textarea
                rows={3}
                placeholder="Nome da aventura, feitos realizados, aprendizados..."
                className="w-full rounded-lg border border-stone-300 bg-white/70 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={() => setStep(2)}>
              Continuar <ArrowRight size={16} />
            </Button>
          </Card>
        )}

        {/* ── PASSO 2: Classe ─────────────────────────────────── */}
        {step === 2 && (
          <Card className="space-y-5">
            <h2 className="text-xl font-black text-stone-950">Classe deste nível</h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setIsMulticlass(false);
                  setNewClassId(character.class as ClassId);
                }}
                className={cn(
                  "rounded-xl border-2 p-4 text-left transition",
                  !isMulticlass
                    ? "border-amber-600 bg-amber-50"
                    : "border-stone-200 bg-white/60 hover:border-amber-300",
                )}
              >
                <p className="font-black text-stone-950">
                  Continuar como{" "}
                  {classById[character.class as keyof typeof classById]?.name}
                </p>
                <p className="mt-1 text-xs text-stone-500">Avança na sua jornada atual</p>
              </button>

              <button
                onClick={() => setIsMulticlass(true)}
                className={cn(
                  "rounded-xl border-2 p-4 text-left transition",
                  isMulticlass
                    ? "border-amber-600 bg-amber-50"
                    : "border-stone-200 bg-white/60 hover:border-amber-300",
                )}
              >
                <div className="mb-1 flex items-center gap-1">
                  <Swords size={14} className="text-amber-700" />
                  <p className="font-black text-stone-950">Multiclassar</p>
                </div>
                <p className="text-xs text-stone-500">Começa 1º nível em outra classe</p>
              </button>
            </div>

            {isMulticlass && (
              <div className="space-y-3">
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  ⚠️ Você ganha as habilidades de 1º nível da nova classe, mas{" "}
                  <strong>não</strong> as perícias treinadas iniciais nem as proficiências
                  dela.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {classes
                    .filter((c) => c.id !== character.class)
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setNewClassId(c.id)}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-left text-sm font-semibold transition",
                          newClassId === c.id
                            ? "border-amber-600 bg-amber-100 text-amber-900"
                            : "border-stone-200 bg-white/60 text-stone-700 hover:border-amber-300",
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)}>
                ← Voltar
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)}>
                Continuar →
              </Button>
            </div>
          </Card>
        )}

        {/* ── PASSO 3: Habilidades ──────────────────────────────── */}
        {step === 3 && (
          <Card className="space-y-5">
            <h2 className="text-xl font-black text-stone-950">
              Habilidades do Nível {toLevel}
            </h2>

            {/* Ganhos automáticos */}
            <div className="space-y-2 rounded-xl bg-stone-950 p-4 text-amber-50">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-400">
                Ganhos automáticos
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Pontos de Vida</span>
                <span className="font-bold text-emerald-400">+{preview.hpGained} PV</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Pontos de Mana</span>
                <span className="font-bold text-blue-400">+{preview.mpGained} PM</span>
              </div>
              {circleJustOpened && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400">Novo círculo de magia</span>
                  <span className="font-bold text-purple-400">
                    {circleJustOpened}º Círculo desbloqueado!
                  </span>
                </div>
              )}
              {autoClassAbilities.length > 0 && (
                <>
                  <div className="my-2 border-t border-stone-700" />
                  <p className="mb-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                    Habilidades de classe ganhas
                  </p>
                  {autoClassAbilities.map((ability) => (
                    <div key={ability} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 text-amber-500">✦</span>
                      <span className="text-amber-100">{ability}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Poder ou Aumento de Atributo */}
            <div>
              <p className="mb-2 text-sm font-bold text-stone-700">
                Poder (opcional — escolha 1)
              </p>

              {/* Aumento de Atributo */}
              <div className="mb-3">
                <button
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition",
                    isAttrChosen
                      ? "border-amber-800 bg-amber-50"
                      : "border-amber-900/10 bg-white/70",
                  )}
                  onClick={() => selectPower("Aumento de Atributo")}
                >
                  <div className="flex items-center gap-2">
                    <RadioDot selected={isAttrChosen} />
                    <span className="font-black text-stone-950">Aumento de Atributo</span>
                    <span className="ml-auto text-xs text-stone-500">passivo</span>
                  </div>
                  <p className="mt-1 pl-6 text-xs text-stone-600">
                    +1 em um atributo (máx. uma vez por patamar por atributo).
                  </p>
                </button>
                {isAttrChosen && (
                  <div className="mt-2 grid grid-cols-3 gap-2 pl-0">
                    {attrs.map((attr) => {
                      const canIncrease = canIncreaseAttribute(
                        attr,
                        fromLevel,
                        character.levelUpHistory,
                      );
                      return (
                        <button
                          key={attr}
                          disabled={!canIncrease}
                          onClick={() => setAttrIncreased(attr)}
                          className={cn(
                            "rounded-lg border px-3 py-2 text-sm font-bold transition",
                            attrIncreased === attr
                              ? "border-amber-600 bg-amber-100 text-amber-900"
                              : canIncrease
                                ? "border-stone-200 bg-white/60 text-stone-700 hover:border-amber-400"
                                : "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 opacity-50",
                          )}
                        >
                          {ATTR_LABELS[attr]}
                        </button>
                      );
                    })}
                  </div>
                )}
                {attrIncreased === "con" && isAttrChosen && (
                  <p className="mt-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    ⚡ Aumentar Constituição recalcula seus PV retroativamente em todos os
                    níveis.
                  </p>
                )}
              </div>

              {/* Poderes de Classe */}
              {classPowers.length > 0 && (
                <div className="mb-3">
                  <p className="mb-2 text-xs font-semibold uppercase text-stone-400">
                    Poderes de {classById[newClassId as keyof typeof classById]?.name}
                  </p>
                  <div className="space-y-2">
                    {classPowers.map((p) => (
                      <PowerCard
                        key={p.id}
                        power={p}
                        selected={powerChosen === p.id}
                        available={!p.tier || TIER_ORDER[p.tier] <= TIER_ORDER[toTier]}
                        currentTier={toTier}
                        onSelect={() => selectPower(p.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Poderes Gerais e de Combate */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-stone-400">
                  Poderes Gerais e de Combate
                </p>
                <div className="space-y-2">
                  {generalPowers.map((p) => (
                    <PowerCard
                      key={p.id}
                      power={p}
                      selected={powerChosen === p.id}
                      available={!p.tier || TIER_ORDER[p.tier] <= TIER_ORDER[toTier]}
                      currentTier={toTier}
                      onSelect={() => selectPower(p.id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>
                ← Voltar
              </Button>
              <Button
                className="flex-1"
                onClick={() => setStep(hasSpellStep ? 4 : 5)}
              >
                Continuar →
              </Button>
            </div>
          </Card>
        )}

        {/* ── PASSO 4: Magias ──────────────────────────────────── */}
        {step === 4 && (
          <Card className="space-y-5">
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-amber-700" />
              <h2 className="text-xl font-black text-stone-950">Magias</h2>
            </div>

            {/* Tradição do Mago */}
            {isMago && character.class_choices?.tradition && (
              <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-800">
                <span className="font-bold">Tradição Arcana: </span>
                {(character.class_choices.tradition as string)
                  .replace("abissal", "Abissal").replace("elemental", "Elemental")
                  .replace("erudita", "Erudita").replace("onirica", "Onírica").replace("rustica", "Rústica")}
                {" "}— suas magias e poderes dependem desta tradição.
              </div>
            )}

            {/* Novo círculo desbloqueado */}
            {circleJustOpened && (
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                <p className="text-sm font-bold text-purple-800">
                  ✨ {circleJustOpened}º círculo desbloqueado — você pode escolher magias deste círculo!
                </p>
              </div>
            )}

            {/* Bardo/Druida: nível ímpar de classe — sem magia nova */}
            {(isBardo || isDruida) && newClassLevel % 2 !== 0 && (
              <p className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
                {isBardo ? "Bardos" : "Druidas"} aprendem uma nova magia apenas nos{" "}
                <strong>níveis pares da classe</strong>. Nenhuma escolha necessária agora.
              </p>
            )}

            {/* Seleção de magia — Mago, Clérigo, Bardo par, Druida par */}
            {canPickSpell && availableSpells.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-bold text-stone-700">
                  {isMago || isClerigo
                    ? "Escolha 1 magia para aprender (qualquer círculo disponível)"
                    : "Escolha 1 nova magia"}
                </p>
                <LevelUpSpellPicker
                  spells={availableSpells}
                  selected={selectedSpells}
                  max={1}
                  onSelect={setSelectedSpells}
                />
              </div>
            )}

            {canPickSpell && availableSpells.length === 0 && (
              <p className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
                Todas as magias disponíveis para esta classe já estão aprendidas.
              </p>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(3)}>
                ← Voltar
              </Button>
              <Button className="flex-1" onClick={() => setStep(5)}>
                Continuar →
              </Button>
            </div>
          </Card>
        )}

        {/* ── PASSO 5: Confirmação ──────────────────────────────── */}
        {step === 5 && (
          <Card className="space-y-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-600" />
              <h2 className="text-xl font-black text-stone-950">Confirmar Evolução</h2>
            </div>

            {/* Antes / Depois */}
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-stone-950 p-4 text-sm">
              <div className="space-y-2">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-stone-500">
                  Antes
                </p>
                <p className="text-stone-400">
                  Nível <span className="font-bold text-white">{fromLevel}</span>
                </p>
                <p className="text-stone-400">
                  PV <span className="font-bold text-red-400">{character.hp_max}</span>
                </p>
                <p className="text-stone-400">
                  PM <span className="font-bold text-blue-400">{character.mp_max}</span>
                </p>
                <p className="text-stone-400">
                  Patamar{" "}
                  <span className="font-bold text-white">{TIER_LABELS[fromTier]}</span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-500">
                  Depois
                </p>
                <p className="text-amber-200">
                  Nível{" "}
                  <span className="text-lg font-black text-amber-400">{toLevel}</span>
                </p>
                <p className="text-stone-400">
                  PV{" "}
                  <span className="font-bold text-emerald-400">{preview.newHpMax}</span>{" "}
                  <span className="text-stone-600">(+{preview.hpGained})</span>
                </p>
                <p className="text-stone-400">
                  PM{" "}
                  <span className="font-bold text-emerald-400">{preview.newMpMax}</span>{" "}
                  <span className="text-stone-600">(+{preview.mpGained})</span>
                </p>
                <p className="text-stone-400">
                  Patamar{" "}
                  <span
                    className={cn("font-bold", tierChanged ? "text-amber-400" : "text-white")}
                  >
                    {TIER_LABELS[toTier]}
                  </span>
                </p>
              </div>
            </div>

            {powerChosen && !isAttrChosen && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
                <Sparkles size={16} className="mt-0.5 shrink-0 text-amber-600" />
                <span>
                  <strong>Novo poder:</strong> {powerChosen}
                </span>
              </div>
            )}

            {isAttrChosen && attrIncreased && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
                <TrendingUp size={16} className="mt-0.5 shrink-0 text-amber-600" />
                <span>
                  <strong>Aumento de Atributo:</strong> {ATTR_LABELS[attrIncreased]} +1
                </span>
              </div>
            )}

            {(selectedSpells.length > 0 || autoGrantedSpells.length > 0) && (
              <div className="flex items-start gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm">
                <BookOpen size={16} className="mt-0.5 shrink-0 text-purple-600" />
                <div>
                  <strong>Novas magias:</strong>
                  <ul className="mt-1 space-y-0.5">
                    {[...selectedSpells, ...autoGrantedSpells].map((id) => {
                      const sp = getSpellsForClass(newClassId).find((s) => s.id === id);
                      return (
                        <li key={id} className="text-purple-700">
                          · {sp?.name ?? id}
                          {autoGrantedSpells.includes(id) && (
                            <span className="ml-1 text-xs text-purple-400">(automático)</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}

            {toast && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {toast}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep(hasSpellStep ? 4 : 3)}
              >
                ← Voltar
              </Button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-base font-black uppercase tracking-widest transition disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #78350f, #b45309)",
                  color: "#fef3c7",
                  boxShadow: "0 4px 15px rgba(120,53,15,0.4)",
                }}
              >
                {isPending ? "Salvando..." : "🎉 Confirmar Evolução!"}
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition",
        selected ? "border-amber-700 bg-amber-700" : "border-stone-300",
      )}
    >
      {selected && <span className="h-2 w-2 rounded-full bg-white" />}
    </span>
  );
}

function PowerCard({
  power,
  selected,
  available,
  currentTier,
  onSelect,
}: {
  power: Power;
  selected: boolean;
  available: boolean;
  currentTier: Tier;
  onSelect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={cn(
        "rounded-lg border transition",
        selected
          ? "border-amber-800 bg-amber-50"
          : available
            ? "border-amber-900/10 bg-white/70"
            : "border-stone-200 bg-stone-50 opacity-50",
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          disabled={!available}
          onClick={onSelect}
          className="shrink-0"
          aria-pressed={selected}
        >
          <RadioDot selected={selected} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-black text-stone-950">{power.name}</p>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="capitalize">{power.activation}</span>
            {power.tier && TIER_ORDER[power.tier] > TIER_ORDER[currentTier] && (
              <span className="text-amber-700">· req. {TIER_LABELS[power.tier]}</span>
            )}
            {power.prerequisite && (
              <span>· req. {power.prerequisite}</span>
            )}
          </div>
        </div>
        <button
          className="shrink-0 text-stone-400"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Recolher" : "Expandir"}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
      {expanded && (
        <p className="border-t border-amber-900/10 p-3 pt-2 text-sm text-stone-700">
          {power.description}
        </p>
      )}
    </div>
  );
}

function LevelUpSpellPicker({
  spells,
  selected,
  max,
  onSelect,
}: {
  spells: Spell[];
  selected: string[];
  max: number;
  onSelect: (ids: string[]) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const grouped = spells.reduce<Record<number, Spell[]>>((acc, spell) => {
    (acc[spell.circle] ??= []).push(spell);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([circle, circleSpells]) => (
          <div key={circle}>
            <p className="mb-2 text-xs font-semibold uppercase text-stone-400">
              {circle}º Círculo
            </p>
            <div className="space-y-2">
              {circleSpells.map((spell) => {
                const isSelected = selected.includes(spell.id);
                const disabled = !isSelected && selected.length >= max;
                const isOpen = expanded === spell.id;
                return (
                  <div
                    key={spell.id}
                    className={cn(
                      "rounded-lg border transition",
                      isSelected
                        ? "border-amber-800 bg-amber-50"
                        : "border-amber-900/10 bg-white/70",
                      disabled && "opacity-40",
                    )}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={disabled}
                        onChange={() => {
                          if (isSelected)
                            onSelect(selected.filter((id) => id !== spell.id));
                          else if (!disabled) onSelect([...selected, spell.id]);
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
                      >
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </div>
                    {isOpen && (
                      <div className="space-y-1 border-t border-amber-900/10 p-3 pt-2 text-sm text-stone-700">
                        <p>
                          <strong>Alvo:</strong> {spell.target} ·{" "}
                          <strong>Duração:</strong> {spell.duration}
                        </p>
                        <p>{spell.description}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
