"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, TrendingUp, Swords, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveLevelUp, type LevelUpInput } from "@/app/actions/levelup";
import {
  computeLevelUp, tierForLevel, TIER_LABELS, TIER_FLAVOR,
  HP_PER_LEVEL, MP_PER_LEVEL, SPELLCASTERS, opensNewSpellCircle,
  SPELL_CIRCLES, canIncreaseAttribute,
  type CharacterForLevelUp,
} from "@/lib/ghanor/leveling";
import { classById, classes } from "@/lib/ghanor/classes";
import type { ClassId, Attribute } from "@/lib/ghanor/types";

// ─── Poderes pré-cadastrados por classe (amostra) ────────────────────────────
const CLASS_POWERS: Partial<Record<ClassId, string[]>> = {
  barbaro:   ["Aumento de Atributo", "Ataque Poderoso", "Investida", "Fúria Maior", "Pele de Pedra"],
  bardo:     ["Aumento de Atributo", "Inspiração Maior", "Canto de Batalha", "Magia de Bardo"],
  bucaneiro: ["Aumento de Atributo", "Esquiva Maior", "Duelo", "Ataque Rápido"],
  cacador:   ["Aumento de Atributo", "Inimigo Predileto Extra", "Companheiro Animal", "Tiro Preciso"],
  cavaleiro: ["Aumento de Atributo", "Juramento Maior", "Aura Sagrada", "Golpe Divino"],
  clerigo:   ["Aumento de Atributo", "Canalizar Energia", "Milagre", "Bênção Maior"],
  druida:    ["Aumento de Atributo", "Forma Natural", "Chamado da Natureza", "Vínculo Animal"],
  ladino:    ["Aumento de Atributo", "Ataque Furtivo Aprimorado", "Evasão", "Ladinagem Maior"],
  mago:      ["Aumento de Atributo", "Magia Potente", "Tradição Avançada", "Familiar"],
  nobre:     ["Aumento de Atributo", "Presença Maior", "Contatos", "Riqueza"],
  soldado:   ["Aumento de Atributo", "Treinamento Avançado", "Manobra de Combate", "Resistência"],
};

const ATTR_LABELS: Record<string, string> = {
  str: "Força", dex: "Destreza", con: "Constituição",
  int: "Inteligência", wis: "Sabedoria", cha: "Carisma",
};

type Props = {
  character: CharacterForLevelUp & {
    id: string;
    name: string;
    class: string;
    class_levels: Record<string, number>;
    levelUpHistory: Array<{ to_level: number; attr_increased: string | null }>;
  };
};

export function LevelUpWizard({ character }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  // Wizard state
  const [notes, setNotes] = useState("");
  const [newClassId, setNewClassId] = useState<ClassId>(character.class as ClassId);
  const [isMulticlass, setIsMulticlass] = useState(false);
  const [powerChosen, setPowerChosen] = useState("");
  const [customPower, setCustomPower] = useState("");
  const [attrIncreased, setAttrIncreased] = useState<Attribute | null>(null);
  const [newSpells, setNewSpells] = useState<string>("");

  const fromLevel = character.current_level;
  const toLevel = fromLevel + 1;
  const fromTier = tierForLevel(fromLevel);
  const toTier = tierForLevel(toLevel);
  const tierChanged = fromTier !== toTier;

  const classLevels = character.class_levels && Object.keys(character.class_levels).length > 0
    ? character.class_levels
    : { [character.class]: 1 };

  // Pré-computa o resultado para o resumo
  const preview = computeLevelUp(character, {
    newClassId,
    isMulticlass,
    attrIncreased: attrIncreased ?? undefined,
  });

  const classLevelInNewClass = (classLevels[newClassId] ?? 0) + 1;
  const newCircle = opensNewSpellCircle(newClassId, classLevelInNewClass)
    ? SPELL_CIRCLES[newClassId][classLevelInNewClass]
    : undefined;

  const isSpellcaster = SPELLCASTERS.includes(newClassId);
  const effectivePower = powerChosen === "__custom" ? customPower : powerChosen;
  const isAttrPowerSelected = powerChosen === "Aumento de Atributo";

  const attrs: Attribute[] = ["str", "dex", "con", "int", "wis", "cha"];

  function handleConfirm() {
    const input: LevelUpInput = {
      characterId: character.id,
      newClassId,
      isMulticlass,
      powerChosen: effectivePower || undefined,
      attrIncreased: attrIncreased ?? undefined,
      newSpells: newSpells.split(",").map((s) => s.trim()).filter(Boolean),
      notes: notes || undefined,
    };

    startTransition(async () => {
      const result = await saveLevelUp(input);
      if (result.success) {
        router.push(`/characters/${character.id}?levelup=${result.newLevel}`);
      } else {
        setToast(result.error);
      }
    });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f5c86a_0,#f6ead0_40%,#efe1bd_100%)] py-10 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : router.back()}
            className="rounded-full p-2 hover:bg-amber-200/60 transition"
          >
            <ArrowLeft size={20} className="text-amber-900" />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-800">Level Up</p>
            <h1 className="text-2xl font-black text-stone-950">{character.name}</h1>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex gap-2">
          {[1,2,3,4,5].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                s < step ? "bg-amber-600" : s === step ? "bg-amber-800" : "bg-stone-300"
              }`}
            />
          ))}
        </div>

        {/* ── PASSO 1: Visão geral ─────────────────────────────── */}
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
                <p className="text-xs font-bold uppercase tracking-widest mb-1">Novo Patamar!</p>
                <p className="text-xl font-black">🌟 {TIER_LABELS[toTier]}</p>
                <p className="text-amber-200 text-sm mt-1">{TIER_FLAVOR[toTier]}</p>
              </div>
            )}

            <blockquote className="border-l-4 border-amber-700 pl-4 italic text-stone-700 text-sm">
              "A maior recompensa que um aventureiro pode receber não existe na forma de moedas, mas na experiência adquirida ao se vencer perigos letais."
            </blockquote>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">
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

        {/* ── PASSO 2: Classe ──────────────────────────────────── */}
        {step === 2 && (
          <Card className="space-y-5">
            <h2 className="text-xl font-black text-stone-950">Classe deste nível</h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setIsMulticlass(false); setNewClassId(character.class as ClassId); }}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  !isMulticlass
                    ? "border-amber-600 bg-amber-50"
                    : "border-stone-200 bg-white/60 hover:border-amber-300"
                }`}
              >
                <p className="font-black text-stone-950">
                  Continuar como {classById[character.class as keyof typeof classById]?.name}
                </p>
                <p className="text-xs text-stone-500 mt-1">Avança na sua jornada atual</p>
              </button>

              <button
                onClick={() => setIsMulticlass(true)}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  isMulticlass
                    ? "border-amber-600 bg-amber-50"
                    : "border-stone-200 bg-white/60 hover:border-amber-300"
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <Swords size={14} className="text-amber-700" />
                  <p className="font-black text-stone-950">Multiclassar</p>
                </div>
                <p className="text-xs text-stone-500">Começa 1º nível em outra classe</p>
              </button>
            </div>

            {isMulticlass && (
              <div className="space-y-3">
                <p className="text-xs text-amber-800 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                  ⚠️ Você ganha as habilidades de 1º nível da nova classe, mas <strong>não</strong> as perícias treinadas iniciais nem as proficiências dela.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {classes
                    .filter((c) => c.id !== character.class)
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setNewClassId(c.id)}
                        className={`rounded-lg border px-3 py-2 text-sm text-left transition font-semibold ${
                          newClassId === c.id
                            ? "border-amber-600 bg-amber-100 text-amber-900"
                            : "border-stone-200 bg-white/60 text-stone-700 hover:border-amber-300"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)}>← Voltar</Button>
              <Button className="flex-1" onClick={() => setStep(3)}>Continuar →</Button>
            </div>
          </Card>
        )}

        {/* ── PASSO 3: Habilidades ─────────────────────────────── */}
        {step === 3 && (
          <Card className="space-y-5">
            <h2 className="text-xl font-black text-stone-950">Habilidades do Nível {toLevel}</h2>

            {/* Ganhos automáticos */}
            <div className="rounded-xl bg-stone-950 p-4 text-amber-50 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">Ganhos automáticos</p>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Pontos de Vida</span>
                <span className="font-bold text-emerald-400">+{preview.hpGained} PV</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Pontos de Mana</span>
                <span className="font-bold text-blue-400">+{preview.mpGained} PM</span>
              </div>
              {newCircle && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400">Novo círculo de magia</span>
                  <span className="font-bold text-purple-400">{newCircle}º Círculo</span>
                </div>
              )}
            </div>

            {/* Poder de classe */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">
                Poder de {classById[newClassId as keyof typeof classById]?.name} (se houver)
              </label>
              <select
                className="w-full rounded-lg border border-stone-300 bg-white/70 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={powerChosen}
                onChange={(e) => { setPowerChosen(e.target.value); setAttrIncreased(null); }}
              >
                <option value="">— Nenhum poder neste nível —</option>
                {(CLASS_POWERS[newClassId] ?? []).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="__custom">Outro (digitar)</option>
              </select>

              {powerChosen === "__custom" && (
                <input
                  type="text"
                  placeholder="Nome do poder (consulte o livro)"
                  className="mt-2 w-full rounded-lg border border-stone-300 bg-white/70 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={customPower}
                  onChange={(e) => setCustomPower(e.target.value)}
                />
              )}
            </div>

            {/* Aumento de Atributo */}
            {isAttrPowerSelected && (
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">
                  Qual atributo aumentar? (+1)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {attrs.map((attr) => {
                    const canIncrease = canIncreaseAttribute(attr, fromLevel, character.levelUpHistory);
                    return (
                      <button
                        key={attr}
                        disabled={!canIncrease}
                        onClick={() => setAttrIncreased(attr)}
                        title={!canIncrease ? "Já usado neste patamar" : ""}
                        className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                          attrIncreased === attr
                            ? "border-amber-600 bg-amber-100 text-amber-900"
                            : canIncrease
                            ? "border-stone-200 bg-white/60 text-stone-700 hover:border-amber-400"
                            : "border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed opacity-50"
                        }`}
                      >
                        {ATTR_LABELS[attr]}
                      </button>
                    );
                  })}
                </div>
                {attrIncreased === "con" && (
                  <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded px-3 py-2 border border-amber-200">
                    ⚡ Aumentar Constituição recalcula seus PV retroativamente em todos os níveis.
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>← Voltar</Button>
              <Button
                className="flex-1"
                onClick={() => setStep(isSpellcaster ? 4 : 5)}
              >
                Continuar →
              </Button>
            </div>
          </Card>
        )}

        {/* ── PASSO 4: Magias (apenas conjuradores) ─────────────── */}
        {step === 4 && (
          <Card className="space-y-5">
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-amber-700" />
              <h2 className="text-xl font-black text-stone-950">Magias Aprendidas</h2>
            </div>

            <p className="text-sm text-stone-600">
              {newClassId === "bardo" && toLevel % 2 !== 0
                ? "Bardos aprendem uma magia nova apenas nos níveis pares."
                : newClassId === "clerigo"
                ? "Clérigos recebem as magias do seu santo automaticamente ao ganhar acesso a novos círculos."
                : "Adicione as magias aprendidas neste nível (separe por vírgula)."}
            </p>

            {(newClassId !== "bardo" || toLevel % 2 === 0) && newClassId !== "clerigo" && (
              <input
                type="text"
                placeholder="Ex: Bola de Fogo, Armadura Arcana"
                className="w-full rounded-lg border border-stone-300 bg-white/70 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={newSpells}
                onChange={(e) => setNewSpells(e.target.value)}
              />
            )}

            {newCircle && (
              <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3">
                <p className="text-sm font-bold text-purple-800">
                  ✨ Você agora pode lançar magias de {newCircle}º círculo!
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(3)}>← Voltar</Button>
              <Button className="flex-1" onClick={() => setStep(5)}>Continuar →</Button>
            </div>
          </Card>
        )}

        {/* ── PASSO 5: Confirmação ─────────────────────────────── */}
        {step === 5 && (
          <Card className="space-y-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-600" />
              <h2 className="text-xl font-black text-stone-950">Confirmar Evolução</h2>
            </div>

            {/* Antes / Depois */}
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-stone-950 p-4 text-sm">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">Antes</p>
                <p className="text-stone-400">Nível <span className="text-white font-bold">{fromLevel}</span></p>
                <p className="text-stone-400">PV <span className="text-red-400 font-bold">{character.hp_max}</span></p>
                <p className="text-stone-400">PM <span className="text-blue-400 font-bold">{character.mp_max}</span></p>
                <p className="text-stone-400">Patamar <span className="text-white font-bold">{TIER_LABELS[fromTier]}</span></p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3">Depois</p>
                <p className="text-amber-200">Nível <span className="text-amber-400 font-black text-lg">{toLevel}</span></p>
                <p className="text-stone-400">PV <span className="text-emerald-400 font-bold">{preview.newHpMax}</span> <span className="text-stone-600">(+{preview.hpGained})</span></p>
                <p className="text-stone-400">PM <span className="text-emerald-400 font-bold">{preview.newMpMax}</span> <span className="text-stone-600">(+{preview.mpGained})</span></p>
                <p className="text-stone-400">Patamar <span className={`font-bold ${tierChanged ? "text-amber-400" : "text-white"}`}>{TIER_LABELS[toTier]}</span></p>
              </div>
            </div>

            {effectivePower && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm">
                <Sparkles size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <span><strong>Novo poder:</strong> {effectivePower}</span>
              </div>
            )}

            {attrIncreased && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm">
                <TrendingUp size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <span><strong>Atributo:</strong> {ATTR_LABELS[attrIncreased]} +1</span>
              </div>
            )}

            {newSpells && (
              <div className="flex items-start gap-2 rounded-lg bg-purple-50 border border-purple-200 px-3 py-2 text-sm">
                <BookOpen size={16} className="text-purple-600 mt-0.5 shrink-0" />
                <span><strong>Nova(s) magia(s):</strong> {newSpells}</span>
              </div>
            )}

            {toast && (
              <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2 border border-red-200">{toast}</p>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(isSpellcaster ? 4 : 3)}>← Voltar</Button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-4 font-black text-base uppercase tracking-widest transition disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #78350f, #b45309)", color: "#fef3c7", boxShadow: "0 4px 15px rgba(120,53,15,0.4)" }}
              >
                {isPending ? "Salvando..." : "🎉 Confirmar Evolução!"}
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
