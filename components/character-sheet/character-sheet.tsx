"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit, FileText, Sparkles, Trash2, Heart, Shield, Wind, Ruler, Dices, TrendingUp, X, Package, ScrollText, Store, Wand2, Check } from "lucide-react";
import { deleteCharacter } from "@/app/characters/actions";
import { dmEditCharacterStats } from "@/app/actions/dm";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { classById } from "@/lib/ghanor/classes";
import { originById } from "@/lib/ghanor/origins";
import { raceById } from "@/lib/ghanor/races";
import { calculateSkillBonus } from "@/lib/ghanor/rules";
import { skillById } from "@/lib/ghanor/skills";
import { formatClassLevels, tierForLevel, TIER_LABELS, TIER_FLAVOR, computeSkillRollModifier, type Tier } from "@/lib/ghanor/leveling";
import { RollDialog } from "@/components/dice/RollDialog";
import { ClassIcon } from "@/components/ui/item-icon";
import { JourneySection } from "@/components/character-sheet/journey-section";
import { InventoryTab } from "@/components/character-sheet/inventory-tab";
import { AttacksSection } from "@/components/character-sheet/attacks-section";
import { computeDefenseWithEquipment, getArmorPenaltyForSkill, WORN_LIMIT } from "@/lib/ghanor/inventory";
import { useDmMode } from "@/lib/hooks/use-dm-mode";
import { DmModeBanner } from "@/components/inventory/dm-mode-banner";
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

type DmPatch = {
  attr_str?: number; attr_dex?: number; attr_con?: number;
  attr_int?: number; attr_wis?: number; attr_cha?: number;
  hp_max?: number; mp_max?: number; defense?: number; movement_m?: number;
};

export function CharacterSheet({
  character,
  levelUpHistory = [],
  justLeveledUpTo,
  inventory = [],
  transactions = [],
  catalog = [],
}: {
  character: CharacterRow;
  levelUpHistory?: LevelUpEntry[];
  justLeveledUpTo?: number;
  inventory?: unknown[];
  transactions?: unknown[];
  catalog?: Array<{ slug: string; name: string; category: string; price_pc: number }>;
}) {
  const [activeTab, setActiveTab] = useState<"sheet" | "inventory">("sheet");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDmSaving, startDmSave] = useTransition();
  const [portraitUrl, setPortraitUrl] = useState(character.portrait_url);
  const [portraitMessage, setPortraitMessage] = useState<string>();
  const [rollConfig, setRollConfig] = useState<RollConfig | null>(null);
  const [showToast, setShowToast] = useState(!!justLeveledUpTo);
  const { isActive: isDmMode, toggle: toggleDm, hydrated: dmHydrated } = useDmMode(character.id);
  const [dmPatch, setDmPatch] = useState<DmPatch>({});
  const [dmSaved, setDmSaved] = useState(false);

  // ── Rastreador de PV / PM ──────────────────────────────────────
  const [hpCurrent, setHpCurrent] = useState(character.hp_max);
  const [mpCurrent, setMpCurrent] = useState(character.mp_max);

  useEffect(() => {
    try {
      const sh = localStorage.getItem(`ghanor:hp:${character.id}`);
      const sm = localStorage.getItem(`ghanor:mp:${character.id}`);
      if (sh !== null) setHpCurrent(Math.min(Number(sh), character.hp_max));
      if (sm !== null) setMpCurrent(Math.min(Number(sm), character.mp_max));
    } catch { /* localStorage unavailable */ }
  }, [character.id, character.hp_max, character.mp_max]);

  function adjustHp(delta: number) {
    setHpCurrent(prev => {
      const next = Math.max(0, Math.min(character.hp_max, prev + delta));
      try { localStorage.setItem(`ghanor:hp:${character.id}`, String(next)); } catch { /* ignore */ }
      return next;
    });
  }
  function adjustMp(delta: number) {
    setMpCurrent(prev => {
      const next = Math.max(0, Math.min(character.mp_max, prev + delta));
      try { localStorage.setItem(`ghanor:mp:${character.id}`, String(next)); } catch { /* ignore */ }
      return next;
    });
  }
  function setHpDirect(val: number) {
    const next = Math.max(0, Math.min(character.hp_max, val));
    setHpCurrent(next);
    try { localStorage.setItem(`ghanor:hp:${character.id}`, String(next)); } catch { /* ignore */ }
  }
  function setMpDirect(val: number) {
    const next = Math.max(0, Math.min(character.mp_max, val));
    setMpCurrent(next);
    try { localStorage.setItem(`ghanor:mp:${character.id}`, String(next)); } catch { /* ignore */ }
  }

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
      armor_defense_bonus: number | null; armor_penalty: number | null; armor_category: string | null;
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
      {dmHydrated && <DmModeBanner active={isDmMode} onToggle={toggleDm} />}

      {/* ── Painel de edição do Narrador ── */}
      {isDmMode && (
        <Card className="border-2 border-indigo-200 bg-indigo-50/40 space-y-5 print:hidden">
          <div className="flex items-center gap-2">
            <Wand2 size={15} className="text-indigo-600" />
            <h3 className="text-sm font-black text-indigo-900">Edição do Narrador</h3>
            {dmSaved && (
              <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <Check size={13} /> Salvo
              </span>
            )}
          </div>

          {/* Atributos */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-600">Atributos</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {(["str", "dex", "con", "int", "wis", "cha"] as const).map((attr) => (
                <label key={attr} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    {ATTR_LABELS[attr].slice(0, 3)}
                  </span>
                  <input
                    type="number"
                    value={dmPatch[`attr_${attr}`] ?? attrs[attr]}
                    onChange={(e) =>
                      setDmPatch((p) => ({ ...p, [`attr_${attr}`]: Number(e.target.value) }))
                    }
                    className="w-full rounded-lg border border-indigo-300 bg-white py-1.5 text-center text-lg font-black text-stone-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    min={-5}
                    max={10}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Stats de combate */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-600">Combate</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {([
                { key: "hp_max",     label: "PV Máx",         min: 1,  max: 9999 },
                { key: "mp_max",     label: "PM Máx",         min: 0,  max: 9999 },
                { key: "defense",    label: "Defesa base",    min: 1,  max: 99 },
                { key: "movement_m", label: "Desl. (m)",      min: 0,  max: 99 },
              ] as const).map(({ key, label, min, max }) => (
                <label key={key} className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">{label}</span>
                  <input
                    type="number"
                    value={dmPatch[key] ?? character[key]}
                    onChange={(e) =>
                      setDmPatch((p) => ({ ...p, [key]: Number(e.target.value) }))
                    }
                    className="rounded-lg border border-indigo-300 bg-white py-1.5 text-center text-lg font-black text-stone-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    min={min}
                    max={max}
                  />
                </label>
              ))}
            </div>
          </div>

          <Button
            fullWidth
            disabled={isDmSaving || Object.keys(dmPatch).length === 0}
            className="bg-indigo-700 hover:bg-indigo-600 active:bg-indigo-800"
            onClick={() =>
              startDmSave(async () => {
                await dmEditCharacterStats({ characterId: character.id, ...dmPatch });
                setDmPatch({});
                setDmSaved(true);
                setTimeout(() => setDmSaved(false), 3000);
              })
            }
          >
            {isDmSaving ? "Salvando…" : "Salvar alterações"}
          </Button>
        </Card>
      )}

      {/* Tab nav */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 print:hidden">
        <button
          onClick={() => setActiveTab("sheet")}
          className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition cursor-pointer ${activeTab === "sheet" ? "bg-amber-800 text-amber-50 shadow" : "text-stone-600 hover:bg-stone-200/70 active:bg-stone-200"}`}
        >
          <ScrollText size={18} /> Ficha
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition cursor-pointer ${activeTab === "inventory" ? "bg-amber-800 text-amber-50 shadow" : "text-stone-600 hover:bg-stone-200/70 active:bg-stone-200"}`}
        >
          <Package size={18} /> Inventário
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
          catalog={catalog}
          isDmMode={isDmMode}
        />
      )}

      {/* Sheet tab */}
      {activeTab === "sheet" && <>
      {/* Hero card */}
      <Card className="flex flex-col gap-4 p-4">
        <div className="mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-2xl border border-amber-900/20 bg-stone-900">
          {portraitUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={portraitUrl} alt={`Retrato de ${character.name}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-stone-900">
              <ClassIcon classId={character.class} size={96} className="opacity-70" />
            </div>
          )}
        </div>

        {/* Info principal */}
        <div className="space-y-4 text-center sm:text-left">
          <div>
            <h1 className="text-2xl font-black leading-tight text-stone-950 sm:text-3xl">{character.name}</h1>
            <p className="mt-1 text-sm font-semibold text-stone-600 sm:text-base">
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

          <div className="scroll-chips -mx-1 px-1 print:hidden">
            <Button variant="secondary" className="shrink-0" onClick={() => router.push(`/characters/${character.id}/edit`)}>
              <Edit size={16} /> Editar
            </Button>
            <Button variant="secondary" className="shrink-0" onClick={() => window.print()}>
              <FileText size={16} /> PDF
            </Button>
            <Button variant="secondary" className="shrink-0" disabled={isPending} onClick={generatePortrait}>
              <Sparkles size={16} /> Retrato
            </Button>
            <Button variant="secondary" className="shrink-0" onClick={() => router.push(`/characters/${character.id}/shop`)}>
              <Store size={16} /> Loja
            </Button>
            <Button
              variant="secondary"
              className="shrink-0"
              onClick={() => router.push(`/characters/${character.id}/levelup`)}
              disabled={level >= 20}
              title={level >= 20 ? "Nível máximo atingido" : ""}
            >
              <TrendingUp size={16} /> Nível
            </Button>
            <Button
              variant="danger"
              className="shrink-0"
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <VitalTracker
          label="PV" icon={<Heart size={16} />}
          current={hpCurrent} max={character.hp_max}
          colorClass="bg-red-950 text-red-100 border-red-900"
          barClass="bg-red-500"
          onAdjust={adjustHp} onSetDirect={setHpDirect}
        />
        <VitalTracker
          label="PM" icon={<Sparkles size={16} />}
          current={mpCurrent} max={character.mp_max}
          colorClass="bg-blue-950 text-blue-100 border-blue-900"
          barClass="bg-blue-400"
          onAdjust={adjustMp} onSetDirect={setMpDirect}
        />
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
      <div className="flex flex-col gap-4">
        <Card>
          <SectionTitle>Perícias</SectionTitle>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {(character.trained_skills ?? []).map((skillId) => {
              const skill = skillById[skillId];
              const bonus = calculateSkillBonus(build, skillId);
              const penalty = getArmorPenaltyForSkill(skillId, armorPenalty, {
                characterClass: character.class,
                equippedArmor: equippedArmor?.items ? {
                  armor_defense_bonus: equippedArmor.items.armor_defense_bonus ?? 0,
                  armor_penalty: equippedArmor.items.armor_penalty ?? 0,
                  armor_category: equippedArmor.items.armor_category,
                } : undefined,
                equippedShield: equippedShield?.items ? {
                  armor_defense_bonus: equippedShield.items.armor_defense_bonus ?? 0,
                  armor_penalty: equippedShield.items.armor_penalty ?? 0,
                } : undefined,
              });
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
          {(character.powers?.length ?? 0) > 0 && (
            <div className="mt-2 space-y-1">
              {character.powers.map((p, i) => (
                <p key={i} className="text-sm text-stone-700">• {p}</p>
              ))}
            </div>
          )}
          {(character.spells?.length ?? 0) > 0 && <p className="mt-2 text-sm">Magias: {character.spells.join(", ")}</p>}
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
        className="fixed bottom-5 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-xl print:hidden transition active:scale-95 sm:bottom-6 sm:right-6"
        style={{
          marginBottom: "var(--safe-bottom)",
          background: "linear-gradient(135deg, #78350f, #b45309)",
        }}
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

function VitalTracker({
  label, icon, current, max, colorClass, barClass, onAdjust, onSetDirect,
}: {
  label: string;
  icon: React.ReactNode;
  current: number;
  max: number;
  colorClass: string;
  barClass: string;
  onAdjust: (delta: number) => void;
  onSetDirect: (val: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const pct = max > 0 ? Math.round((current / max) * 100) : 0;

  function commitEdit() {
    const n = parseInt(inputVal, 10);
    if (!isNaN(n)) onSetDirect(n);
    setEditing(false);
  }

  return (
    <Card className={`flex flex-col gap-2 p-3 border shadow-sm ${colorClass}`}>
      {/* Print: static display */}
      <div className="hidden print:flex flex-col items-center justify-center py-2">
        <div className="flex items-center gap-1.5 opacity-80 mb-1">
          {icon}
          <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
        </div>
        <p className="text-3xl font-black">{max}</p>
      </div>

      {/* Screen: interactive tracker */}
      <div className="print:hidden flex flex-col gap-2">
        {/* Label */}
        <div className="flex items-center gap-1.5 opacity-70">
          {icon}
          <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
          <span className="ml-auto text-xs opacity-50">{pct}%</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={() => onAdjust(-5)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-black hover:bg-white/20 active:scale-95 transition cursor-pointer"
            title="-5"
          >−5</button>
          <button
            onClick={() => onAdjust(-1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-lg font-black hover:bg-white/20 active:scale-95 transition cursor-pointer"
            title="-1"
          >−</button>

          {/* Current / Max — tap to edit */}
          <button
            onClick={() => { setInputVal(String(current)); setEditing(true); }}
            className="flex flex-col items-center min-w-0 flex-1 cursor-pointer"
            title="Toque para editar"
          >
            {editing ? (
              <input
                autoFocus
                type="number"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditing(false); }}
                className="w-full rounded-lg bg-white/20 text-center text-xl font-black outline-none focus:ring-2 focus:ring-white/40 py-0.5"
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <>
                <span className="text-2xl font-black leading-none">{current}</span>
                <span className="text-xs opacity-50 leading-none">/{max}</span>
              </>
            )}
          </button>

          <button
            onClick={() => onAdjust(+1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-lg font-black hover:bg-white/20 active:scale-95 transition cursor-pointer"
            title="+1"
          >+</button>
          <button
            onClick={() => onAdjust(+5)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-black hover:bg-white/20 active:scale-95 transition cursor-pointer"
            title="+5"
          >+5</button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
