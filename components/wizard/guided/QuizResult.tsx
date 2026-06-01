import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { attributeLabels } from "@/lib/ghanor/types";
import { saveGuidedCharacter } from "@/app/characters/actions";
import { classById } from "@/lib/ghanor/classes";
import { originById } from "@/lib/ghanor/origins";
import { getSpellsForClass, isCasterClass, type Spell } from "@/lib/ghanor/spells";
import {
  CLASS_STARTING_POWER,
  getClassPowers,
  getGeneralPowers,
  powerById,
  type Power,
} from "@/lib/ghanor/powers";
import { ARCANE_TRADITIONS } from "@/lib/ghanor/traditions";
import { getMagoTraditionSpells } from "@/lib/ghanor/tradition-spells";
import { Shield, ChevronDown, ChevronRight, Lock } from "lucide-react";
import { BackstoryGenerator } from "@/components/wizard/BackstoryGenerator";
import { cn } from "@/lib/utils";
import type { GeneratedCharacter, Answer, RaceChoices } from "@/lib/ghanor/quiz-engine";
import type { ClassId } from "@/lib/ghanor/types";

interface Props {
  computed: GeneratedCharacter;
  touches: { name: string; age: string; appearance: string; objective: string; gender: string };
  answers: Answer[];
  race: string;
  raceChoices: RaceChoices;
  onRestart: () => void;
}

export function QuizResult({ computed, touches, answers, race, raceChoices, onRestart }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [selectedOriginIndex, setSelectedOriginIndex] = useState(0);
  const [selectedSpells, setSelectedSpells] = useState<string[]>([]);
  const [selectedPower, setSelectedPower] = useState("");
  const [selectedTradition, setSelectedTradition] = useState("erudita");
  const [history, setHistory] = useState("");

  const selectedClass = computed.suggestedClasses[selectedClassIndex] as ClassId;
  const selectedOrigin = computed.suggestedOrigins[selectedOriginIndex];
  const classData = classById[selectedClass as keyof typeof classById];
  const originData = originById[selectedOrigin as keyof typeof originById];

  // Reset spells/powers when class changes
  function switchClass(newIndex: number) {
    setSelectedClassIndex(newIndex);
    setSelectedSpells([]);
    setSelectedPower("");
  }

  // Spell / power data
  const isCaster = isCasterClass(selectedClass);
  const isMagoClass = selectedClass === "mago";
  // Mago: filtra por tradição arcana escolhida (livro pág.57)
  const magoTraditionIds = isMagoClass
    ? new Set(getMagoTraditionSpells(selectedTradition, 1))
    : null;
  const classSpells = isCaster
    ? getSpellsForClass(selectedClass).filter(
        (s) => s.circle === 1 && (magoTraditionIds === null || magoTraditionIds.has(s.id)),
      )
    : [];
  // Mago: 3 (livro pág.57); Clérigo: 3 (livro pág.46); Bardo e Druida: 2 (livro págs.33,49)
  const spellLimit =
    isMagoClass || selectedClass === "clerigo" ? 3 :
    selectedClass === "bardo" || selectedClass === "druida" ? 2 :
    2;
  const classStartingPower = CLASS_STARTING_POWER[selectedClass]
    ? powerById[CLASS_STARTING_POWER[selectedClass]!]
    : undefined;
  const generalPowers = getGeneralPowers();
  // Apenas Bárbaro, Bardo e Ladino têm poder de classe no nível 1 — os demais começam no nível 2.
  const classPowersAvailable = CLASS_STARTING_POWER[selectedClass]
    ? getClassPowers(selectedClass).filter(
        (p) => p.id !== CLASS_STARTING_POWER[selectedClass] && !p.tier && !p.min_class_level,
      )
    : [];

  const handleSave = () => {
    startTransition(async () => {
      try {
        setErrorMsg("");
        const rolls = [
          Math.ceil(Math.random() * 6),
          Math.ceil(Math.random() * 6),
          Math.ceil(Math.random() * 6),
          Math.ceil(Math.random() * 6),
        ];
        const id = await saveGuidedCharacter({
          name: touches.name,
          age: touches.age ? parseInt(touches.age, 10) : undefined,
          appearance: touches.appearance,
          objective: touches.objective,
          race,
          raceChoices,
          origin: selectedOrigin,
          extraOrigin: undefined,
          class: selectedClass,
          tradition: isMagoClass ? selectedTradition : undefined,
          answers,
          computed,
          silverPieces: rolls.reduce((s, r) => s + r, 0),
          spells: selectedSpells,
          powers: selectedPower ? [selectedPower] : [],
          equipment: computed.weapons.map((w) => ({ id: w, name: w, type: "weapon" })),
          history: history.trim() || undefined,
        });
        router.push(`/characters`);
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Erro ao salvar.");
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Hero */}
      <div className="mb-12 space-y-4 text-center">
        <p className="text-sm font-black uppercase tracking-widest text-amber-900/60">
          A Lenda Nasce
        </p>
        <h1 className="font-serif text-4xl font-black leading-tight text-stone-950 md:text-5xl">
          &quot;{computed.concept}&quot;
        </h1>
        <p className="text-xl italic text-stone-700">
          Conheça {touches.name}.
          {touches.appearance ? ` Com ${touches.appearance}.` : ""}
          {touches.objective ? ` Seu maior objetivo é ${touches.objective}.` : ""}
        </p>
      </div>

      {/* Classe + Origem */}
      <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="border-amber-900/20 bg-amber-50/50 p-6 shadow-lg">
          <h3 className="mb-4 text-sm font-bold uppercase text-amber-900/60">Sua Classe</h3>
          <div className="mb-2 flex items-start justify-between">
            <h2 className="text-2xl font-black capitalize text-stone-950">
              {classData?.name || selectedClass}
            </h2>
            {computed.suggestedClasses.length > 1 && (
              <Button
                variant="secondary"
                className="h-8 px-2 py-1 text-xs"
                onClick={() =>
                  switchClass((selectedClassIndex + 1) % computed.suggestedClasses.length)
                }
              >
                Trocar (Top {computed.suggestedClasses.length})
              </Button>
            )}
          </div>
          <p className="h-16 overflow-hidden text-ellipsis text-sm leading-relaxed text-stone-700">
            {classData?.proficiency || "Um aventureiro habilidoso."}
          </p>
        </Card>

        <Card className="border-amber-900/20 bg-amber-50/50 p-6 shadow-lg">
          <h3 className="mb-4 text-sm font-bold uppercase text-amber-900/60">Sua Origem</h3>
          <div className="mb-2 flex items-start justify-between">
            <h2 className="text-2xl font-black capitalize text-stone-950">
              {originData?.name || selectedOrigin}
            </h2>
            {computed.suggestedOrigins.length > 1 && (
              <Button
                variant="secondary"
                className="h-8 px-2 py-1 text-xs"
                onClick={() =>
                  setSelectedOriginIndex(
                    (p) => (p + 1) % Math.min(5, computed.suggestedOrigins.length),
                  )
                }
              >
                Trocar (Top {computed.suggestedOrigins.length})
              </Button>
            )}
          </div>
          <p className="text-sm leading-relaxed text-stone-700">
            {originData?.benefit || "De onde você veio."}
          </p>
        </Card>
      </div>

      {/* Ficha básica */}
      <Card className="relative mb-8 overflow-hidden bg-stone-950 p-6 text-amber-50 shadow-2xl">
        <div className="pointer-events-none absolute right-0 top-0 p-8 opacity-10">
          <Shield size={120} />
        </div>
        <h3 className="relative z-10 mb-6 text-sm font-bold uppercase text-amber-500">
          Ficha Básica
        </h3>
        <div className="relative z-10 mb-8 grid grid-cols-3 gap-3 md:grid-cols-6">
          {Object.entries(computed.baseAttributes).map(([attr, val]) => (
            <div
              key={attr}
              className="rounded-lg border border-stone-800 bg-stone-900 p-3 text-center"
            >
              <span className="block text-xs font-bold uppercase text-stone-500">
                {attributeLabels[attr as keyof typeof attributeLabels]}
              </span>
              <span className="block text-xl font-black text-amber-400">
                {(val as number) >= 0 ? `+${val}` : val}
              </span>
            </div>
          ))}
        </div>
        <div className="relative z-10 grid gap-8 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-bold text-amber-500">Perícias Treinadas</h4>
            <div className="flex flex-wrap gap-2">
              {computed.trainedSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-stone-800 px-2 py-1 text-xs capitalize text-stone-300"
                >
                  {skill.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-bold text-amber-500">Equipamento Padrão</h4>
            <div className="flex flex-wrap gap-2">
              {computed.weapons.map((w) => (
                <span
                  key={w}
                  className="rounded-md border border-amber-900/30 bg-stone-800 px-2 py-1 text-xs capitalize text-amber-200"
                >
                  {w}
                </span>
              ))}
              {computed.armor !== "none" && (
                <span className="rounded-md bg-stone-800 px-2 py-1 text-xs capitalize text-stone-300">
                  {computed.armor.replace(/_/g, " ")}
                </span>
              )}
              {computed.shield !== "none" && (
                <span className="rounded-md bg-stone-800 px-2 py-1 text-xs capitalize text-stone-300">
                  {computed.shield.replace(/_/g, " ")}
                </span>
              )}
              <span className="rounded-md bg-stone-800 px-2 py-1 text-xs text-stone-300">
                4d6 PP
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tradição Arcana — só para Mago */}
      {isMagoClass && (
        <Card className="mb-8 space-y-4 p-6">
          <div>
            <h3 className="text-lg font-black text-stone-950">Tradição Arcana</h3>
            <p className="text-sm text-stone-500">
              Escolha a tradição que define suas magias e seus segredos arcanos.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ARCANE_TRADITIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTradition(t.id)}
                className={cn(
                  "rounded-xl border p-4 text-left transition",
                  selectedTradition === t.id
                    ? "border-purple-600 bg-purple-50"
                    : "border-stone-200 bg-white/70 hover:border-purple-300",
                )}
              >
                <p className="font-black text-stone-950">{t.name}</p>
                <p className="mt-1 text-xs text-stone-600 line-clamp-2">{t.flavor}</p>
              </button>
            ))}
          </div>
          {(() => {
            const t = ARCANE_TRADITIONS.find((t) => t.id === selectedTradition);
            return t ? (
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-xs text-purple-800 space-y-1">
                <p><span className="font-bold">Preço da magia: </span>{t.preco_da_magia}</p>
                <p><span className="font-bold">Segredo básico: </span>{t.segredo_basico}</p>
              </div>
            ) : null;
          })()}
        </Card>
      )}

      {/* Habilidades */}
      <Card className="mb-8 space-y-5 p-6">
        <div>
          <h3 className="text-lg font-black text-stone-950">Habilidades</h3>
          <p className="text-sm text-stone-500">
            Poder de classe concedido automaticamente + 1 poder adicional à sua escolha.
          </p>
        </div>

        {classStartingPower && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-stone-400">
              Poder de classe (automático)
            </p>
            <GuidedPowerCard power={classStartingPower} locked />
          </div>
        )}

        {classPowersAvailable.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-stone-400">
              Poderes de classe (escolha 1)
            </p>
            <div className="space-y-2">
              {classPowersAvailable.map((p) => (
                <GuidedPowerCard
                  key={p.id}
                  power={p}
                  selected={selectedPower === p.id}
                  onSelect={() => setSelectedPower(selectedPower === p.id ? "" : p.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-stone-400">
            Poderes gerais e de combate (escolha 1)
          </p>
          <div className="space-y-2">
            {generalPowers.map((p) => (
              <GuidedPowerCard
                key={p.id}
                power={p}
                selected={selectedPower === p.id}
                onSelect={() =>
                  setSelectedPower(selectedPower === p.id ? "" : p.id)
                }
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Magias (apenas conjuradores) */}
      {isCaster && classSpells.length > 0 && (
        <Card className="mb-8 space-y-4 p-6">
          <div>
            <h3 className="text-lg font-black text-stone-950">Magias conhecidas</h3>
            <p className="text-sm text-stone-500">
              Escolha até {spellLimit} magias de 1º círculo para começar.{" "}
              <span
                className={cn(
                  "font-semibold",
                  selectedSpells.length >= spellLimit ? "text-amber-700" : "",
                )}
              >
                {selectedSpells.length}/{spellLimit}
              </span>
            </p>
          </div>
          <div className="space-y-2">
            {classSpells.map((spell) => (
              <GuidedSpellCard
                key={spell.id}
                spell={spell}
                selected={selectedSpells.includes(spell.id)}
                disabled={
                  !selectedSpells.includes(spell.id) && selectedSpells.length >= spellLimit
                }
                onToggle={() => {
                  setSelectedSpells((prev) =>
                    prev.includes(spell.id)
                      ? prev.filter((id) => id !== spell.id)
                      : prev.length < spellLimit
                        ? [...prev, spell.id]
                        : prev,
                  );
                }}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Backstory Generator */}
      <div className="mb-8">
        <BackstoryGenerator
          race={race}
          classId={selectedClass}
          origin={selectedOrigin}
          concept={computed.concept}
          characterName={touches.name}
          history={history}
          onChange={setHistory}
        />
      </div>

      {/* Save */}
      <div className="flex flex-col items-center gap-4 text-center">
        {errorMsg && <p className="font-bold text-red-600">{errorMsg}</p>}
        <p className="mb-2 text-sm text-stone-500">
          Você pode editar qualquer detalhe a qualquer momento depois de salvar.
        </p>
        <div className="flex w-full flex-wrap justify-center gap-4">
          <Button
            variant="secondary"
            className="px-6 py-3"
            onClick={onRestart}
            disabled={isPending}
          >
            Refazer Questionário
          </Button>
          <Button onClick={handleSave} disabled={isPending} className="px-12 py-3">
            {isPending ? "Salvando..." : "Salvar Personagem"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function GuidedPowerCard({
  power,
  locked,
  selected,
  onSelect,
}: {
  power: Power;
  locked?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={cn(
        "rounded-lg border transition",
        locked
          ? "border-stone-200 bg-stone-50"
          : selected
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
              selected ? "border-amber-700 bg-amber-700" : "border-stone-300",
            )}
            onClick={onSelect}
            aria-pressed={selected}
          >
            {selected && <span className="h-2 w-2 rounded-full bg-white" />}
          </button>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-black text-stone-950">{power.name}</p>
          <p className="text-xs capitalize text-stone-500">{power.activation}</p>
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

function GuidedSpellCard({
  spell,
  selected,
  disabled,
  onToggle,
}: {
  spell: Spell;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={cn(
        "rounded-lg border transition",
        selected ? "border-amber-800 bg-amber-50" : "border-amber-900/10 bg-white/70",
        disabled && "opacity-40",
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <input
          type="checkbox"
          checked={selected}
          disabled={disabled}
          onChange={onToggle}
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
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? "Recolher" : "Expandir"}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
      {expanded && (
        <div className="space-y-1 border-t border-amber-900/10 p-3 pt-2 text-sm text-stone-700">
          <p>
            <strong>Alvo:</strong> {spell.target} · <strong>Duração:</strong> {spell.duration}
          </p>
          <p>{spell.description}</p>
        </div>
      )}
    </div>
  );
}
