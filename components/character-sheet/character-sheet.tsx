"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit, FileText, Sparkles, Trash2, User, Heart, Shield, Wind, Ruler, Dices, TrendingUp, X, Package } from "lucide-react";
import { deleteCharacter } from "@/app/characters/actions";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { classById } from "@/lib/ghanor/classes";
import { originById } from "@/lib/ghanor/origins";
import { raceById } from "@/lib/ghanor/races";
import { calculateSkillBonus } from "@/lib/ghanor/rules";
import { skillById } from "@/lib/ghanor/skills";
import { formatClassLevels, tierForLevel, TIER_LABELS, TIER_FLAVOR, computeSkillRollModifier, type Tier } from "@/lib/ghanor/leveling";
import { RollDialog } from "@/components/dice/RollDialog";
import { JourneySection } from "@/components/character-sheet/journey-section";
import { InventoryTab } from "@/components/character-sheet/inventory-tab";
import { AttacksSection } from "@/components/character-sheet/attacks-section";
import { computeDefenseWithEquipment, getArmorPenaltyForSkill } from "@/lib/ghanor/inventory";
import type { CharacterBuild, Attribute } from "@/lib/ghanor/types";

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
  current_level?: number;
  class_levels?: Record<string, number>;
};

type LevelUpEntry = {
  id: string;
  from_level: number;
  to_level: number;
  class_taken: string;
  is_multiclass: boolean;
  hp_gained: number;
  mp_gained: number;
  power_chosen: string | null;
  new_spells: string[];
  attr_increased: string | null;
  notes: string | null;
  created_at: string;
};

type RollConfig = {
  label: string;
  preModifier: number;
  preModifierBreakdown?: string;
};

const ATTR_LABELS: Record<string, string> = {
  str: "Força", dex: "Destreza", con: "Constituição",
  int: "Inteligência", wis: "Sabedoria", cha: "Carisma",
};

export function CharacterSheet({
  character,
  levelUpHistory = [],
  justLeveledUpTo,
  inventory = [],
  transactions = [],
}: {
  character: CharacterRow;
  levelUpHistory?: LevelUpEntry[];
  justLeveledUpTo?: number;
  inventory?: unknown[];
  transactions?: unknown[];
}) {
  const [activeTab, setActiveTab] = useState<"sheet" | "inventory">("sheet");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [portraitUrl, setPortraitUrl] = useState(character.portrait_url);
  const [portraitMessage, setPortraitMessage] = useState<string>();
  const [rollConfig, setRollConfig] = useState<RollConfig | null>(null);
  const [showToast, setShowToast] = useState(!!justLeveledUpTo);

  // Auto-dismiss toast after 6s
  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 6000);
    return () => clearTimeout(t);
  }, [showToast]);

  const toastTier = justLeveledUpTo ? tierForLevel(justLeveledUpTo) : null;
  const prevTier = justLeveledUpTo ? tierForLevel(justLeveledUpTo - 1) : null;
  const tierJustChanged = toastTier && prevTier && toastTier !== prevTier;

  const level = character.current_level ?? 1;
  const tier = tierForLevel(level);
  const halfLevel = Math.floor(level / 2);

  const attrs: Record<string, number> = {
    str: character.attr_str, dex: character.attr_dex, con: character.attr_con,
    int: character.attr_int, wis: character.attr_wis, cha: character.attr_cha,
  };

  // ── Itens equipados extraídos do inventário ──────────────────
  type InvRow = {
    id: string;
    location: string;
    improvements: number;
    is_arcanium: boolean;
    custom_label: string | null;
    items: {
      slug: string; name: string; category: string;
      armor_defense_bonus: number | null; armor_penalty: number | null;
      weapon_damage_dice: string | null; weapon_critical: string | null;
      weapon_range: string | null; weapon_damage_type: string | null;
      weapon_proficiency: "simples" | "marcial" | "exotica" | null;
      weapon_grip: string | null; weapon_abilities: string[];
    } | null;
  };
  const typedInventory = (inventory as InvRow[]);
  const equippedItems = typedInventory.filter(i => i.location === "equipped" || i.location === "worn");
  const equippedArmor = equippedItems.find(i => i.items?.category === "armadura");
  const equippedShield = equippedItems.find(i => i.items?.category === "escudo");
  const equippedWeapons = equippedItems.filter(i => i.items?.category === "arma");

  const { total: dynamicDefense, armorPenalty, breakdown: defBreakdown } = computeDefenseWithEquipment(
    attrs.dex,
    equippedArmor?.items ? { armor_defense_bonus: equippedArmor.items.armor_defense_bonus ?? 0, armor_penalty: equippedArmor.items.armor_penalty ?? 0 } : undefined,
    equippedShield?.items ? { armor_defense_bonus: equippedShield.items.armor_defense_bonus ?? 0, armor_penalty: equippedShield.items.armor_penalty ?? 0 } : undefined,
  );

  // Bônus de Luta e Pontaria são calculados após a declaração de `build` abaixo

  const build: CharacterBuild = {
    race: character.race as CharacterBuild["race"],
    class: character.class as CharacterBuild["class"],
    origin: character.origin,
    extraOrigin: character.origin_choices?.extraOrigin,
    baseAttributes: {
      str: character.attr_str, dex: character.attr_dex, con: character.attr_con,
      int: character.attr_int, wis: character.attr_wis, cha: character.attr_cha,
    },
    raceChoices: character.race_choices ?? undefined,
    classChoices: character.class_choices ?? undefined,
    trainedSkills: character.trained_skills,
    level,
  };

  // Bônus de Luta e Pontaria (agora que `build` está disponível)
  const fightBonus = character.trained_skills.includes("luta") ? calculateSkillBonus(build, "luta") : 0;
  const aimBonus   = character.trained_skills.includes("pontaria") ? calculateSkillBonus(build, "pontaria") : 0;

  function openAttrRoll(attr: string) {
    const attrMod = attrs[attr];
    const mod = attrMod + halfLevel;
    setRollConfig({
      label: ATTR_LABELS[attr] ?? attr,
      preModifier: mod,
      preModifierBreakdown: `${ATTR_LABELS[attr]} ${attrMod >= 0 ? "+" : ""}${attrMod} + nível/2 +${halfLevel}`,
    });
  }

  function openSkillRoll(skillId: string) {
    const skill = skillById[skillId];
    if (!skill) return;
    const trained = character.trained_skills.includes(skillId);
    const { total, attrMod, trainBonus, halfLevel: hl } = computeSkillRollModifier({ level, attrMod: attrs[skill.attribute], trained });
    setRollConfig({
      label: skill.name,
      preModifier: total,
      preModifierBreakdown: `${ATTR_LABELS[skill.attribute]} ${attrMod >= 0 ? "+" : ""}${attrMod}${trained ? ` + treino +${trainBonus}` : ""} + nível/2 +${hl}`,
    });
  }

  function generatePortrait() {
    setPortraitMessage(undefined);
    startTransition(async () => {
      const response = await fetch("/api/generate-portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: character.id, race: character.race, class: character.class,
          appearance: character.appearance, age: character.age, concept: character.concept,
        }),
      });
      const json = await response.json();
      if (!response.ok) { setPortraitMessage(json.error ?? "Não conseguimos gerar o retrato agora."); return; }
      setPortraitUrl(json.url);
    });
  }

  const classDisplay = character.class_levels && Object.keys(character.class_levels).length > 0
    ? formatClassLevels(character.class_levels)
    : `${classById[character.class as keyof typeof classById]?.name ?? character.class} ${level}`;

  return (
    <div className="space-y-6 print:bg-white">
      {/* Tab nav */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 print:hidden">
        <button
          onClick={() => setActiveTab("sheet")}
          className={`flex-1 text-sm font-bold py-2.5 rounded-lg transition ${activeTab === "sheet" ? "bg-amber-800 text-amber-50 shadow" : "text-stone-600 hover:bg-stone-200"}`}
        >
          📜 Ficha
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex-1 text-sm font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 ${activeTab === "inventory" ? "bg-amber-800 text-amber-50 shadow" : "text-stone-600 hover:bg-stone-200"}`}
        >
          <Package size={16} /> Inventário
        </button>
      </div>

      {/* Inventory tab */}
      {activeTab === "inventory" && (
        <InventoryTab
          characterId={character.id}
          strMod={character.attr_str}
          level={level}
          moneyPc={(character as Record<string, unknown>).money_pc as number ?? 0}
          inventory={inventory as Parameters<typeof InventoryTab>[0]["inventory"]}
          transactions={transactions as Parameters<typeof InventoryTab>[0]["transactions"]}
          characterClass={character.class}
        />
      )}

      {/* Sheet tab */}
      {activeTab === "sheet" && <>
      {/* Hero card */}
      <Card className="grid gap-5 md:grid-cols-[220px_1fr]">
        {/* Retrato */}
        <div className="aspect-square overflow-hidden rounded-lg border border-amber-900/20 bg-stone-900">
          {portraitUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={portraitUrl} alt={`Retrato de ${character.name}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-stone-900 text-stone-700">
              <User size={96} className="opacity-50" />
            </div>
          )}
        </div>

        {/* Info principal */}
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-black text-stone-950">{character.name}</h1>
            <p className="text-stone-600 font-semibold mt-1">
              {raceById[character.race as keyof typeof raceById]?.name}
              {" · "}
              {classDisplay}
              {" · "}
              <span className="text-amber-800">Nível {level}</span>
              {" · "}
              <em className="text-stone-500">{TIER_LABELS[tier]}</em>
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
              variant="secondary"
              onClick={() => router.push(`/characters/${character.id}/levelup`)}
              disabled={level >= 20}
              title={level >= 20 ? "Nível máximo atingido" : ""}
            >
              <TrendingUp size={16} /> Subir de Nível
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

      {/* Atributos */}
      <div className="grid gap-3 grid-cols-3 md:grid-cols-6">
        {(["str", "dex", "con", "int", "wis", "cha"] as Attribute[]).map((attr) => {
          const val = attrs[attr];
          return (
            <button
              key={attr}
              onClick={() => openAttrRoll(attr)}
              className="group relative rounded-xl border border-amber-900/20 bg-amber-50 p-3 text-center shadow-sm transition hover:border-amber-500 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              title={`Rolar teste de ${ATTR_LABELS[attr]}`}
            >
              <p className="text-xs font-bold text-stone-600 uppercase tracking-wider">{ATTR_LABELS[attr].slice(0, 3)}</p>
              <p className="text-3xl font-black text-stone-950">{val >= 0 ? `+${val}` : val}</p>
              <Dices size={12} className="absolute top-2 right-2 text-amber-400 opacity-0 group-hover:opacity-100 transition" />
            </button>
          );
        })}
      </div>

      {/* Stats de combate */}
      <div className="grid gap-4 md:grid-cols-5">
        <Fact label="PV" value={character.hp_max} icon={<Heart size={20} />} colorClass="bg-red-950/20 text-red-700 border-red-900/20" valueClass="text-red-700" />
        <Fact label="PM" value={character.mp_max} icon={<Sparkles size={20} />} colorClass="bg-blue-950/20 text-blue-700 border-blue-900/20" valueClass="text-blue-700" />
        <div title={defBreakdown}>
          <Fact
            label={equippedArmor || equippedShield ? "Defesa ⚙" : "Defesa"}
            value={equippedArmor || equippedShield ? dynamicDefense : character.defense}
            icon={<Shield size={20} />}
            colorClass="bg-slate-900 text-slate-200 border-slate-700"
            valueClass="text-white"
          />
          {armorPenalty < 0 && (
            <p className="text-xs text-center text-red-500 mt-1 font-bold">Pen. {armorPenalty}</p>
          )}
        </div>
        <Fact label="Deslocamento" value={`${character.movement_m}m`} icon={<Wind size={20} />} colorClass="bg-emerald-950/20 text-emerald-700 border-emerald-900/20" valueClass="text-emerald-700" />
        <Fact label="Tamanho" value={character.size} icon={<Ruler size={20} />} colorClass="bg-amber-950/20 text-amber-900 border-amber-900/20" valueClass="text-amber-900" />
      </div>

      {/* Perícias e Habilidades */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle>Perícias</SectionTitle>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {character.trained_skills.map((skillId) => {
              const skill = skillById[skillId];
              const bonus = calculateSkillBonus(build, skillId);
              const penalty = getArmorPenaltyForSkill(skillId, armorPenalty);
              const total = bonus + penalty;
              return (
                <button
                  key={skillId}
                  onClick={() => openSkillRoll(skillId)}
                  className="group flex items-center justify-between rounded-md bg-white/70 px-3 py-2 text-sm text-left transition hover:bg-amber-50 hover:shadow-sm"
                  title={`Rolar teste de ${skill?.name ?? skillId}${penalty < 0 ? ` (penalidade armadura ${penalty})` : ""}`}
                >
                  <span className="font-medium">{skill?.name ?? skillId}</span>
                  <span className={`flex items-center gap-1 font-bold ${penalty < 0 ? "text-red-600" : "text-amber-900"}`}>
                    {total >= 0 ? "+" : ""}{total}
                    {penalty < 0 && <span className="text-[10px] text-red-400">(pen.)</span>}
                    <Dices size={12} className="text-amber-400 opacity-0 group-hover:opacity-100 transition" />
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <SectionTitle>Habilidades e magias</SectionTitle>
          <p className="mt-3 text-sm">{classById[character.class as keyof typeof classById]?.firstLevelAbility}</p>
          <p className="mt-2 text-sm">{raceById[character.race as keyof typeof raceById]?.abilities.join("; ")}</p>
          {character.powers?.length > 0 && (
            <div className="mt-2 space-y-1">
              {character.powers.map((p, i) => (
                <p key={i} className="text-sm text-stone-700">• {p}</p>
              ))}
            </div>
          )}
          {character.spells.length > 0 && <p className="mt-2 text-sm">Magias: {character.spells.join(", ")}</p>}
        </Card>
      </div>

      {/* Ataques */}
      <Card>
        <SectionTitle>Ataques</SectionTitle>
        <div className="mt-3">
          <AttacksSection
            weapons={equippedWeapons.map(w => ({
              inventoryId: w.id,
              item: w.items as Parameters<typeof AttacksSection>[0]["weapons"][0]["item"],
              improvements: w.improvements,
              is_arcanium: w.is_arcanium,
              custom_label: w.custom_label,
            }))}
            strMod={attrs.str}
            dexMod={attrs.dex}
            level={level}
            characterClass={character.class}
            fightBonus={fightBonus}
            aimBonus={aimBonus}
          />
        </div>
      </Card>

      {/* Descrição */}
      <Card>
        <SectionTitle>Descrição</SectionTitle>
        <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
          {character.appearance && <p><strong>Aparência:</strong> {character.appearance}</p>}
          {character.personality && <p><strong>Personalidade:</strong> {character.personality}</p>}
          {character.history && <p><strong>Histórico:</strong> {character.history}</p>}
          {character.objective && <p><strong>Objetivo:</strong> {character.objective}</p>}
        </div>
      </Card>

      {/* FAB de dados */}
      <button
        onClick={() => setRollConfig({ label: "", preModifier: 0 })}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-xl print:hidden transition hover:scale-110"
        style={{ background: "linear-gradient(135deg, #78350f, #b45309)" }}
        title="Rolar dado"
        aria-label="Abrir rolagem de dado"
      >
        <Dices size={24} className="text-amber-50" />
      </button>

      {/* Jornada (histórico de evoluções) */}
      {levelUpHistory.length > 0 && (
        <JourneySection history={levelUpHistory} />
      )}

      {/* Modal de rolagem */}
      {rollConfig && (
        <RollDialog
          open={!!rollConfig}
          onClose={() => setRollConfig(null)}
          preLabel={rollConfig.label || undefined}
          preModifier={rollConfig.preModifier}
          preModifierBreakdown={rollConfig.preModifierBreakdown}
        />
      )}

      {/* Toast de level up */}
      {showToast && justLeveledUpTo && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl px-6 py-4 shadow-2xl text-amber-50 animate-in slide-in-from-bottom-4"
          style={{ background: "linear-gradient(135deg, #78350f, #b45309)", minWidth: 280 }}
        >
          <div className="flex-1">
            <p className="font-black text-lg">
              {tierJustChanged ? "🌟" : "🎉"} Subiu para o nível {justLeveledUpTo}!
            </p>
            {tierJustChanged && toastTier && (
              <p className="text-amber-200 text-sm mt-0.5">
                {TIER_LABELS[toastTier as Tier]} — {TIER_FLAVOR[toastTier as Tier]}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="rounded-full p-1 hover:bg-amber-900/40 transition"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>
      )}
      </>}
    </div>
  );
}

function Fact({
  label, value, icon,
  colorClass = "bg-stone-950 text-amber-50 border-stone-800",
  valueClass = "text-amber-50",
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  colorClass?: string;
  valueClass?: string;
}) {
  return (
    <Card className={`flex flex-col items-center justify-center p-4 border shadow-sm ${colorClass}`}>
      <div className="flex items-center gap-1.5 opacity-80 mb-1">
        {icon}
        <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-3xl font-black capitalize ${valueClass}`}>{value}</p>
    </Card>
  );
}
