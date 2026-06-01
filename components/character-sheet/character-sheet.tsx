"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Edit, FileText, Sparkles, Trash2, Heart, Shield, Wind, Ruler, Dices, TrendingUp, X, Package, ScrollText, Store, Wand2, Check, Upload, LayoutGrid, ArrowLeft, MoreHorizontal } from "lucide-react";
import { deleteCharacter } from "@/app/characters/actions";
import { dmEditCharacterStats, dmEditCharacterSkills } from "@/app/actions/dm";
import { uploadPortrait } from "@/app/actions/portrait";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { classById } from "@/lib/ghanor/classes";
import { originById } from "@/lib/ghanor/origins";
import { raceById } from "@/lib/ghanor/races";
import { calculateSkillBonus, getFinalAttributes, getSkillFlatBonuses } from "@/lib/ghanor/rules";
import { skillById, skills as allSkills } from "@/lib/ghanor/skills";
import { formatClassLevels, tierForLevel, TIER_LABELS, TIER_FLAVOR, trainingBonus, type Tier } from "@/lib/ghanor/leveling";
import { RollDialog } from "@/components/dice/RollDialog";
import { ClassIcon, RaceIcon } from "@/components/ui/item-icon";
import { JourneySection } from "@/components/character-sheet/journey-section";
import { InventoryTab } from "@/components/character-sheet/inventory-tab";
import { CompanionsTab } from "@/components/character-sheet/companions-tab";
import { AttacksSection } from "@/components/character-sheet/attacks-section";
import { SpellsSection, type ActiveEffect } from "@/components/character-sheet/spells-section";
import { computeDefenseWithEquipment, getArmorPenaltyForSkill, WORN_LIMIT } from "@/lib/ghanor/inventory";
import { useDmMode } from "@/lib/hooks/use-dm-mode";
import { PortraitConfirmDialog } from "@/components/character-sheet/portrait-confirm-dialog";
import { ArenaBanner } from "@/components/arena/ArenaBanner";
import type { CharacterBuild, Attribute } from "@/lib/ghanor/types";
import type { Companion } from "@/lib/ghanor/animals";

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
  companions = [],
}: {
  character: CharacterRow;
  levelUpHistory?: LevelUpEntry[];
  justLeveledUpTo?: number;
  inventory?: unknown[];
  transactions?: unknown[];
  catalog?: Array<{ slug: string; name: string; category: string; price_pc: number; spaces: number; description: string | null; weapon_damage_dice: string | null; weapon_critical: string | null; armor_defense_bonus: number | null; is_stackable: boolean }>;
  companions?: Companion[];
}) {
  const [activeTab, setActiveTab] = useState<"sheet" | "inventory" | "companions" | "full">("sheet");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDmSaving, startDmSave] = useTransition();
  const [portraitUrl, setPortraitUrl] = useState(character.portrait_url);
  const [portraitMessage, setPortraitMessage] = useState<string>();
  const [showPortraitConfirm, setShowPortraitConfirm] = useState(false);
  const [rollConfig, setRollConfig] = useState<RollConfig | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showToast, setShowToast] = useState(!!justLeveledUpTo);
  const { isActive: isDmMode, toggle: toggleDm, hydrated: dmHydrated } = useDmMode(character.id);
  const [dmPatch, setDmPatch] = useState<DmPatch>({});
  const [dmSaved, setDmSaved] = useState(false);
  const [isDmSkillsSaving, startDmSkillsSave] = useTransition();
  const [dmSkillsDraft, setDmSkillsDraft] = useState<string[] | null>(null);
  const [dmSkillsSaved, setDmSkillsSaved] = useState(false);

  // ── Rastreador de PV / PM ──────────────────────────────────────
  const [hpCurrent, setHpCurrent] = useState(character.hp_max);
  const [mpCurrent, setMpCurrent] = useState(character.mp_max);
  // Incrementado em descanso longo e nova cena para resetar usos de poderes
  const [restKey, setRestKey] = useState(0);
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);

  useEffect(() => {
    try {
      const sh = localStorage.getItem(`ghanor:hp:${character.id}`);
      const sm = localStorage.getItem(`ghanor:mp:${character.id}`);
      const se = localStorage.getItem(`ghanor:effects:${character.id}`);
      if (sh !== null) setHpCurrent(Math.min(Number(sh), character.hp_max));
      if (sm !== null) setMpCurrent(Math.min(Number(sm), character.mp_max));
      if (se) setActiveEffects(JSON.parse(se));
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

  function addEffect(effect: ActiveEffect) {
    setActiveEffects((prev) => {
      const next = [...prev, effect];
      try { localStorage.setItem(`ghanor:effects:${character.id}`, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }
  function removeEffect(id: string) {
    setActiveEffects((prev) => {
      const next = prev.filter((e) => e.id !== id);
      try { localStorage.setItem(`ghanor:effects:${character.id}`, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  function handleRestShort() {
    adjustMp(level * 2);
  }
  function handleRestLong() {
    setHpDirect(character.hp_max);
    setMpDirect(character.mp_max);
    setRestKey((k) => k + 1);
  }
  function handleNewScene() {
    setRestKey((k) => k + 1);
    setActiveEffects([]);
    try { localStorage.removeItem(`ghanor:effects:${character.id}`); } catch { /* ignore */ }
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
  const fightBonus = calculateSkillBonus(build, "luta");
  const aimBonus   = calculateSkillBonus(build, "pontaria");

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
    const hl = Math.floor(level / 2);
    const trainBonus = trained ? trainingBonus(level) : 0;
    const finalAttrs = getFinalAttributes(build);
    const attrMod = finalAttrs[skill.attribute];
    const flatBonus = getSkillFlatBonuses(build)[skillId] ?? 0;
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
    const total = calculateSkillBonus(build, skillId) + penalty;
    const parts: string[] = [`${ATTR_LABELS[skill.attribute]} ${attrMod >= 0 ? "+" : ""}${attrMod}`];
    if (trained) parts.push(`treino +${trainBonus}`);
    parts.push(`nível/2 +${hl}`);
    if (flatBonus !== 0) parts.push(`origem ${flatBonus >= 0 ? "+" : ""}${flatBonus}`);
    if (penalty < 0) parts.push(`armadura ${penalty}`);
    setRollConfig({
      label: skill.name,
      preModifier: total,
      preModifierBreakdown: parts.join(" + "),
    });
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  function resizeImage(file: File, maxDim = 1024): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Falha ao processar imagem.")), "image/jpeg", 0.92);
      };
      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Imagem inválida.")); };
      img.src = objectUrl;
    });
  }

  function handlePortraitFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setPortraitMessage(undefined);
    startTransition(async () => {
      try {
        const resized = await resizeImage(file);
        const fd = new FormData();
        fd.append("characterId", character.id);
        fd.append("file", resized, "portrait.jpg");
        const result = await uploadPortrait(fd);
        if ("error" in result) { setPortraitMessage(result.error); return; }
        setPortraitUrl(result.url);
      } catch (err) {
        setPortraitMessage(err instanceof Error ? err.message : "Erro ao enviar imagem.");
      }
    });
  }

  function generatePortrait() {
    setShowPortraitConfirm(false);
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

  const tabCls = (tab: "sheet" | "inventory" | "companions" | "full") =>
    `flex min-h-8 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
      activeTab === tab
        ? "bg-amber-800 text-amber-50 shadow-sm"
        : "text-stone-600 hover:bg-stone-200/70 active:bg-stone-200"
    }`;

  return (
    <div className="space-y-6 print:bg-white">
      {/* ── Barra superior compacta ── */}
      <div className="flex items-center gap-1.5 rounded-xl bg-stone-100 p-1 print:hidden">
        <button
          onClick={() => router.push("/characters")}
          className="flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-stone-200/70 active:bg-stone-200 transition cursor-pointer"
          title="Voltar para Heróis"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Heróis</span>
        </button>

        <span className="h-4 w-px shrink-0 bg-stone-300" />

        <div className="flex flex-1 gap-0.5 overflow-x-auto min-w-0">
          <button onClick={() => setActiveTab("sheet")} className={tabCls("sheet")}>
            <ScrollText size={14} />
            <span className="hidden sm:inline">Ficha</span>
          </button>
          <button onClick={() => setActiveTab("inventory")} className={tabCls("inventory")}>
            <Package size={14} />
            <span className="hidden sm:inline">Inventário</span>
          </button>
          <button onClick={() => setActiveTab("companions")} className={tabCls("companions")}>
            <span>🐾</span>
            <span className="hidden sm:inline">Parceiros</span>
            {companions.filter(c => c.is_alive).length > 0 && (
              <span className={`rounded-full px-1.5 text-[10px] ${activeTab === "companions" ? "bg-amber-600" : "bg-stone-300 text-stone-600"}`}>
                {companions.filter(c => c.is_alive).length}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab("full")} className={tabCls("full")}>
            <LayoutGrid size={14} />
            <span className="hidden sm:inline">Completa</span>
          </button>
        </div>

        {dmHydrated && (
          <>
            <span className="h-4 w-px shrink-0 bg-stone-300" />
            <button
              onClick={toggleDm}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                isDmMode
                  ? "bg-indigo-700 text-indigo-50"
                  : "text-stone-500 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
              title={isDmMode ? "Desativar Modo Narrador" : "Ativar Modo Narrador"}
            >
              <Wand2 size={12} />
              <span className="hidden sm:inline">Narrador</span>
            </button>
          </>
        )}
      </div>

      <ArenaBanner characterId={character.id} />

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

          {/* Perícias treinadas */}
          <div className="border-t border-indigo-200 pt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Perícias Treinadas</p>
              {dmSkillsSaved && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <Check size={13} /> Salvo
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3">
              {allSkills.map((skill) => {
                const isChecked = (dmSkillsDraft ?? character.trained_skills).includes(skill.id);
                return (
                  <label key={skill.id} className="flex cursor-pointer select-none items-center gap-1.5 rounded px-1 py-0.5 text-xs hover:bg-indigo-100">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const current = dmSkillsDraft ?? character.trained_skills;
                        setDmSkillsDraft(
                          e.target.checked
                            ? [...current, skill.id]
                            : current.filter((s) => s !== skill.id),
                        );
                      }}
                      className="accent-indigo-600"
                    />
                    {skill.name}
                  </label>
                );
              })}
            </div>
            {dmSkillsDraft !== null && (
              <Button
                fullWidth
                disabled={isDmSkillsSaving}
                className="mt-2 bg-indigo-700 hover:bg-indigo-600 active:bg-indigo-800"
                onClick={() =>
                  startDmSkillsSave(async () => {
                    await dmEditCharacterSkills({ characterId: character.id, trainedSkills: dmSkillsDraft });
                    setDmSkillsDraft(null);
                    setDmSkillsSaved(true);
                    setTimeout(() => setDmSkillsSaved(false), 3000);
                  })
                }
              >
                {isDmSkillsSaving ? "Salvando…" : "Salvar perícias"}
              </Button>
            )}
          </div>
        </Card>
      )}


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

      {/* Companions tab */}
      {activeTab === "companions" && (
        <CompanionsTab
          characterId={character.id}
          companions={companions}
          moneyPc={(character as Record<string, unknown>).money_pc as number ?? 0}
          isDmMode={isDmMode}
        />
      )}

      {/* Full sheet tab */}
      {activeTab === "full" && (
        <FullSheetTab
          character={character}
          level={level}
          attrs={attrs}
          hpCurrent={hpCurrent}
          mpCurrent={mpCurrent}
          adjustHp={adjustHp}
          adjustMp={adjustMp}
          setHpDirect={setHpDirect}
          setMpDirect={setMpDirect}
          dynamicDefense={dynamicDefense}
          armorPenalty={armorPenalty}
          defBreakdown={defBreakdown}
          equippedArmor={equippedArmor}
          equippedShield={equippedShield}
          equippedWeapons={equippedWeapons}
          typedInventory={typedInventory}
          portraitUrl={portraitUrl}
          build={build}
          fightBonus={fightBonus}
          aimBonus={aimBonus}
          activeEffects={activeEffects}
          onRemoveEffect={removeEffect}
          restKey={restKey}
          isDmMode={isDmMode}
          openAttrRoll={openAttrRoll}
          openSkillRoll={openSkillRoll}
          onRestShort={handleRestShort}
          onRestLong={handleRestLong}
          onNewScene={handleNewScene}
          classDisplay={classDisplay}
          onAddEffect={addEffect}
          tier={tier}
        />
      )}

      {/* Sheet tab */}
      {activeTab === "sheet" && <>
      {/* Hero card — 2 colunas: retrato | identidade + vitais */}
      <Card className="p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(140px,180px)_minmax(0,1fr)] md:items-start">

          {/* Coluna esquerda: retrato limpo */}
          <div className="mx-auto w-full max-w-[240px] md:mx-0 md:max-w-none">
            <div className="relative aspect-[4/5] max-h-[45vh] overflow-hidden rounded-2xl border border-amber-900/20 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/80 shadow-inner">
              {portraitUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={portraitUrl}
                  alt={`Retrato de ${character.name}`}
                  className="h-full w-full object-contain object-center p-2"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ClassIcon classId={character.class} size={100} className="opacity-70" />
                </div>
              )}
              {isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                  <Sparkles size={32} className="text-amber-300 animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {/* Coluna direita: identidade + vitais */}
          <div className="flex min-w-0 flex-col gap-3">

            {/* Nome + menu opções */}
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-black leading-tight text-stone-950 sm:text-3xl">{character.name}</h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm font-semibold text-stone-600">
                  <span className="flex items-center gap-1">
                    <RaceIcon raceId={character.race} size={13} className="shrink-0 opacity-70" />
                    {raceById[character.race as keyof typeof raceById]?.name}
                  </span>
                  <span className="select-none text-stone-300">·</span>
                  <span className="whitespace-nowrap">{classDisplay}</span>
                  <span className="select-none text-stone-300">·</span>
                  <span className="whitespace-nowrap text-amber-800">Nível {level}</span>
                  <span className="select-none text-stone-300">·</span>
                  <em className="text-stone-500">{TIER_LABELS[tier]}</em>
                </div>
                {character.concept && <p className="mt-2 italic text-amber-900">{character.concept}</p>}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePortraitFileChange} />
              <div className="relative shrink-0 print:hidden">
                <button
                  onClick={() => setShowMenu(v => !v)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-bold text-stone-600 transition hover:bg-stone-100 active:bg-stone-200"
                  title="Opções do personagem"
                >
                  <MoreHorizontal size={16} />
                  <span className="hidden sm:inline">Opções</span>
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full z-20 mt-1 min-w-[210px] overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl">
                      <button disabled={isPending} onClick={() => { setShowPortraitConfirm(true); setShowMenu(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-stone-700 transition hover:bg-stone-50 disabled:opacity-40">
                        <Sparkles size={15} /> Gerar retrato (IA)
                      </button>
                      <button disabled={isPending} onClick={() => { fileInputRef.current?.click(); setShowMenu(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-stone-700 transition hover:bg-stone-50 disabled:opacity-40">
                        <Upload size={15} /> Enviar foto
                      </button>
                      <div className="border-t border-stone-100" />
                      <button onClick={() => { router.push(`/characters/${character.id}/edit`); setShowMenu(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-stone-700 transition hover:bg-stone-50">
                        <Edit size={15} /> Editar personagem
                      </button>
                      <button onClick={() => { router.push(`/characters/${character.id}/levelup`); setShowMenu(false); }} disabled={level >= 20} title={level >= 20 ? "Nível máximo atingido" : ""} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-stone-700 transition hover:bg-stone-50 disabled:opacity-40">
                        <TrendingUp size={15} /> Subir de nível
                      </button>
                      <button onClick={() => { router.push(`/characters/${character.id}/shop`); setShowMenu(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-stone-700 transition hover:bg-stone-50">
                        <Store size={15} /> Loja
                      </button>
                      <button onClick={() => { window.print(); setShowMenu(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-stone-700 transition hover:bg-stone-50">
                        <FileText size={15} /> Exportar PDF
                      </button>
                      <div className="border-t border-stone-100" />
                      <button disabled={isPending} onClick={() => { startTransition(async () => { await deleteCharacter(character.id); router.push("/characters"); }); setShowMenu(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-40">
                        <Trash2 size={15} /> Excluir personagem
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {portraitMessage && <p className="text-sm font-semibold text-red-800">{portraitMessage}</p>}

            {/* PV */}
            <VitalTracker
              label="PV" icon={<Heart size={16} />}
              current={hpCurrent} max={character.hp_max}
              colorClass="bg-red-950 text-red-100 border-red-900"
              barClass="bg-red-500"
              onAdjust={adjustHp} onSetDirect={setHpDirect}
            />

            {/* PM */}
            <VitalTracker
              label="PM" icon={<Sparkles size={16} />}
              current={mpCurrent} max={character.mp_max}
              colorClass="bg-blue-950 text-blue-100 border-blue-900"
              barClass="bg-blue-400"
              onAdjust={adjustMp} onSetDirect={setMpDirect}
            />

            {/* Defesa + Deslocamento + Tamanho */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" title={defBreakdown}>
              <Fact
                label={equippedArmor || equippedShield ? "Defesa ⚙" : "Defesa"}
                value={equippedArmor || equippedShield ? dynamicDefense : character.defense}
                icon={<Shield size={20} />}
                colorClass="bg-slate-900 text-slate-200 border-slate-700"
                valueClass="text-white"
              />
              <div className="col-span-1 sm:col-span-2 flex items-center gap-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5">
                <span className="flex items-center gap-2">
                  <Wind size={15} className="shrink-0 text-emerald-600" />
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Deslocamento</span>
                    <span className="font-black text-stone-800">{character.movement_m}m</span>
                  </span>
                </span>
                <span className="h-8 w-px bg-stone-200" />
                <span className="flex items-center gap-2">
                  <Ruler size={15} className="shrink-0 text-amber-600" />
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">Tamanho</span>
                    <span className="font-black capitalize text-stone-800">{character.size}</span>
                  </span>
                </span>
              </div>
            </div>
            {armorPenalty < 0 && (
              <p className="text-xs text-center text-red-500 font-bold">Pen. {armorPenalty}</p>
            )}
          </div>
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

      {/* Botões de descanso e nova cena */}
      <div className="flex gap-2 print:hidden">
        <button
          onClick={handleRestShort}
          className="flex-1 rounded-lg py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 active:bg-blue-200 transition"
          title={`Descanso Curto: recupera ${level * 2} PM`}
        >
          Desc. Curto (+{level * 2} PM)
        </button>
        <button
          onClick={handleRestLong}
          className="flex-1 rounded-lg py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 active:bg-emerald-200 transition"
          title="Descanso Longo: recupera todos PV, PM e usos de poderes"
        >
          Desc. Longo (total)
        </button>
        <button
          onClick={handleNewScene}
          className="flex-1 rounded-lg py-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 active:bg-amber-200 transition"
          title="Nova Cena: recupera usos de poderes por cena"
        >
          Nova Cena
        </button>
      </div>

      {activeEffects.length > 0 && (
        <ActiveEffectsCard effects={activeEffects} onRemove={removeEffect} />
      )}

      {/* Perícias e Habilidades */}
      <div className="flex flex-col gap-4">
        <Card>
          <SectionTitle>Perícias</SectionTitle>
          {(() => {
            const trainedIds = character.trained_skills ?? [];
            const trainedSet = new Set(trainedIds);
            // Perícias não treinadas que podem ser usadas sem treinamento (livro pág.80)
            const untrainedUsable = allSkills.filter(s => !s.trainedOnly && !trainedSet.has(s.id));
            const penCtx = {
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
            };
            const renderSkillBtn = (skillId: string, key: string, trained: boolean) => {
              const skill = skillById[skillId];
              const bonus = calculateSkillBonus(build, skillId);
              const penalty = getArmorPenaltyForSkill(skillId, armorPenalty, penCtx);
              const total = bonus + penalty;
              return (
                <button
                  key={key}
                  onClick={() => openSkillRoll(skillId)}
                  className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm text-left transition ${trained ? "bg-white/70 hover:bg-amber-50 hover:shadow-sm" : "bg-stone-50/50 hover:bg-stone-100"}`}
                  title={`Rolar teste de ${skill?.name ?? skillId}${penalty < 0 ? ` (penalidade armadura ${penalty})` : ""}${!trained ? " (sem treinamento)" : ""}`}
                >
                  <span className={`${trained ? "font-medium" : "text-stone-400"}`}>
                    {skill?.name ?? skillId}
                  </span>
                  <span className={`flex items-center gap-1 font-bold ${penalty < 0 ? "text-red-600" : trained ? "text-amber-900" : "text-stone-400"}`}>
                    {total >= 0 ? "+" : ""}{total}
                    {penalty < 0 && <span className="text-[10px] text-red-400">(pen.)</span>}
                    <Dices size={12} className="text-amber-400 opacity-0 group-hover:opacity-100 transition" />
                  </span>
                </button>
              );
            };
            return (
              <div className="mt-3 space-y-3">
                {/* Treinadas */}
                {trainedIds.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">Treinadas</p>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {trainedIds.map((id, i) => renderSkillBtn(id, `t-${id}-${i}`, true))}
                    </div>
                  </div>
                )}
                {/* Não treinadas usáveis */}
                {untrainedUsable.length > 0 && (
                  <details>
                    <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-stone-600">
                      Sem treinamento ({untrainedUsable.length})
                    </summary>
                    <div className="mt-1.5 grid gap-1 sm:grid-cols-2">
                      {untrainedUsable.map(s => renderSkillBtn(s.id, `u-${s.id}`, false))}
                    </div>
                  </details>
                )}
              </div>
            );
          })()}
        </Card>

        <Card>
          <SectionTitle>Habilidades e magias</SectionTitle>
          <div className="mt-3 space-y-1">
            {classById[character.class as keyof typeof classById]?.firstLevelAbility && (
              <p className="text-sm">{classById[character.class as keyof typeof classById]?.firstLevelAbility}</p>
            )}
            {character.class === "mago" && (character.class_choices as Record<string, string> | null)?.tradition && (
              <p className="text-sm font-semibold text-purple-700">
                Tradição: {(character.class_choices as Record<string, string>).tradition
                  .replace("abissal", "Abissal")
                  .replace("elemental", "Elemental")
                  .replace("erudita", "Erudita")
                  .replace("onirica", "Onírica")
                  .replace("rustica", "Rústica")}
              </p>
            )}
            {(raceById[character.race as keyof typeof raceById]?.abilities?.length ?? 0) > 0 && (
              <p className="text-sm">{raceById[character.race as keyof typeof raceById]?.abilities.join("; ")}</p>
            )}
          </div>
          {((character.powers?.length ?? 0) > 0 || (character.spells?.length ?? 0) > 0 || isDmMode) && (
            <div className="mt-4">
              <SpellsSection
                spells={character.spells ?? []}
                powers={character.powers ?? []}
                isDmMode={isDmMode}
                characterId={character.id}
                mpCurrent={mpCurrent}
                onUseMp={(amount) => adjustMp(-amount)}
                onAddEffect={addEffect}
                restKey={restKey}
                attrs={{
                  str: character.attr_str,
                  dex: character.attr_dex,
                  con: character.attr_con,
                  int: character.attr_int,
                  wis: character.attr_wis,
                  cha: character.attr_cha,
                }}
              />
            </div>
          )}
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

      {/* Jornada (histórico de evoluções) */}
      {levelUpHistory.length > 0 && (
        <JourneySection history={levelUpHistory} />
      )}

      {/* Dialog de confirmação de retrato */}
      {showPortraitConfirm && (
        <PortraitConfirmDialog
          characterName={character.name}
          race={character.race}
          classId={character.class}
          appearance={(character as Record<string, unknown>).appearance as string | null}
          hasExistingPortrait={!!portraitUrl}
          isPending={isPending}
          onConfirm={generatePortrait}
          onCancel={() => setShowPortraitConfirm(false)}
        />
      )}
      </>}

      {/* FAB de dados — visível em todas as abas */}
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

      {/* Modal de rolagem — visível em todas as abas */}
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
    </div>
  );
}

type FullSheetTabProps = {
  character: CharacterRow;
  level: number;
  attrs: Record<string, number>;
  hpCurrent: number;
  mpCurrent: number;
  adjustHp: (delta: number) => void;
  adjustMp: (delta: number) => void;
  setHpDirect: (val: number) => void;
  setMpDirect: (val: number) => void;
  dynamicDefense: number;
  armorPenalty: number;
  defBreakdown: string;
  equippedArmor: InvRow | undefined;
  equippedShield: InvRow | undefined;
  equippedWeapons: InvRow[];
  typedInventory: InvRow[];
  portraitUrl: string | null;
  build: CharacterBuild;
  fightBonus: number;
  aimBonus: number;
  activeEffects: ActiveEffect[];
  onRemoveEffect: (id: string) => void;
  restKey: number;
  isDmMode: boolean;
  openAttrRoll: (attr: string) => void;
  openSkillRoll: (skillId: string) => void;
  onRestShort: () => void;
  onRestLong: () => void;
  onNewScene: () => void;
  classDisplay: string;
  onAddEffect: (effect: ActiveEffect) => void;
  tier: Tier;
};

function FullSheetTab({
  character, level, attrs, hpCurrent, mpCurrent,
  adjustHp, adjustMp, setHpDirect, setMpDirect,
  dynamicDefense, armorPenalty, defBreakdown,
  equippedArmor, equippedShield, equippedWeapons, typedInventory,
  portraitUrl, build, fightBonus, aimBonus,
  activeEffects, onRemoveEffect, restKey, isDmMode,
  openAttrRoll, openSkillRoll,
  onRestShort, onRestLong, onNewScene,
  classDisplay, onAddEffect, tier,
}: FullSheetTabProps) {
  const classAbility = classById[character.class as keyof typeof classById]?.firstLevelAbility;
  const raceAbilities = raceById[character.race as keyof typeof raceById]?.abilities ?? [];
  const equippedAll = typedInventory.filter(i => (i.location === "equipped" || i.location === "worn") && i.items);
  const carriedItems = typedInventory.filter(i => i.location === "carried" && i.items);

  return (
    <>
      {/* Aviso mobile */}
      <div className="lg:hidden rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        A Ficha Completa é otimizada para desktop. Em telas menores, use a aba <strong>Ficha</strong>.
      </div>

      {/* Layout 3 colunas */}
      <div className="hidden lg:grid lg:grid-cols-[220px_1fr_1fr] gap-3 items-start">

        {/* ── COLUNA ESQUERDA ─────────────────────── */}
        <div className="flex flex-col gap-2.5 overflow-y-auto min-h-0 pr-1 max-h-[calc(100vh-160px)]">

          {/* Retrato */}
          <div
            className="relative shrink-0 overflow-hidden rounded-xl border border-amber-900/20 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/80 shadow-inner"
            style={{ height: 140 }}
          >
            {portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={portraitUrl} alt={character.name} className="h-full w-full object-contain p-1" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ClassIcon classId={character.class} size={64} className="opacity-70" />
              </div>
            )}
          </div>

          {/* Identidade */}
          <div className="shrink-0 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5">
            <p className="font-black text-sm text-stone-900 truncate">{character.name}</p>
            <p className="text-xs text-stone-500 truncate">{classDisplay} · {TIER_LABELS[tier]}</p>
            {character.concept && <p className="text-[11px] italic text-amber-700 truncate">{character.concept}</p>}
          </div>

          {/* PV */}
          <div className="shrink-0">
            <VitalTracker
              label="PV" icon={<Heart size={14} />}
              current={hpCurrent} max={character.hp_max}
              colorClass="bg-red-950 text-red-100 border-red-900"
              barClass="bg-red-500"
              onAdjust={adjustHp} onSetDirect={setHpDirect}
            />
          </div>

          {/* PM */}
          <div className="shrink-0">
            <VitalTracker
              label="PM" icon={<Sparkles size={14} />}
              current={mpCurrent} max={character.mp_max}
              colorClass="bg-blue-950 text-blue-100 border-blue-900"
              barClass="bg-blue-400"
              onAdjust={adjustMp} onSetDirect={setMpDirect}
            />
          </div>

          {/* Defesa + Deslocamento */}
          <div className="shrink-0 grid grid-cols-2 gap-2" title={defBreakdown}>
            <Fact
              label={equippedArmor || equippedShield ? "Defesa ⚙" : "Defesa"}
              value={equippedArmor || equippedShield ? dynamicDefense : character.defense}
              icon={<Shield size={15} />}
              colorClass="bg-slate-900 text-slate-200 border-slate-700"
              valueClass="text-white"
            />
            <Fact
              label="Desl."
              value={`${character.movement_m}m`}
              icon={<Wind size={15} />}
              colorClass="bg-emerald-950 text-emerald-100 border-emerald-900"
              valueClass="text-white"
            />
          </div>
          {armorPenalty < 0 && (
            <p className="shrink-0 -mt-1 text-center text-xs font-bold text-red-500">Pen. armadura {armorPenalty}</p>
          )}

          {/* Atributos */}
          <div className="shrink-0 grid grid-cols-3 gap-1.5">
            {(["str", "dex", "con", "int", "wis", "cha"] as Attribute[]).map((attr) => {
              const val = attrs[attr];
              return (
                <button
                  key={attr}
                  onClick={() => openAttrRoll(attr)}
                  className="group relative rounded-lg border border-amber-900/20 bg-amber-50 p-2 text-center shadow-sm transition hover:border-amber-500 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  title={`Rolar ${ATTR_LABELS[attr]}`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">{ATTR_LABELS[attr].slice(0, 3)}</p>
                  <p className="text-lg font-black text-stone-950">{val >= 0 ? `+${val}` : val}</p>
                  <Dices size={9} className="absolute right-1 top-1 text-amber-400 opacity-0 transition group-hover:opacity-100" />
                </button>
              );
            })}
          </div>

          {/* Botões de descanso */}
          <div className="shrink-0 flex flex-col gap-1">
            <button
              onClick={onRestShort}
              className="rounded-lg border border-blue-200 bg-blue-50 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 active:bg-blue-200"
              title={`Descanso Curto: recupera ${level * 2} PM`}
            >
              Desc. Curto (+{level * 2} PM)
            </button>
            <button
              onClick={onRestLong}
              className="rounded-lg border border-emerald-200 bg-emerald-50 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 active:bg-emerald-200"
            >
              Desc. Longo (total)
            </button>
            <button
              onClick={onNewScene}
              className="rounded-lg border border-amber-200 bg-amber-50 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 active:bg-amber-200"
            >
              Nova Cena
            </button>
          </div>
        </div>

        {/* ── COLUNA CENTRAL ──────────────────────── */}
        <div className="flex flex-col gap-2.5 overflow-y-auto min-h-0 pr-1 max-h-[calc(100vh-160px)]">

          {/* Perícias */}
          <Card>
            <SectionTitle>Perícias</SectionTitle>
            {(() => {
              const trainedIds = character.trained_skills ?? [];
              const trainedSet = new Set(trainedIds);
              const untrainedUsable = allSkills.filter(s => !s.trainedOnly && !trainedSet.has(s.id));
              const penCtx = {
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
              };
              const mkRow = (skillId: string, key: string, trained: boolean) => {
                const skill = skillById[skillId];
                const bonus = calculateSkillBonus(build, skillId);
                const penalty = getArmorPenaltyForSkill(skillId, armorPenalty, penCtx);
                const total = bonus + penalty;
                return (
                  <button
                    key={key}
                    onClick={() => openSkillRoll(skillId)}
                    className={`group flex w-full items-center justify-between rounded px-2 py-1 text-sm transition ${trained ? "hover:bg-amber-50" : "hover:bg-stone-100"}`}
                  >
                    <span className={trained ? "font-medium" : "text-stone-400"}>{skill?.name ?? skillId}</span>
                    <span className={`flex items-center gap-1 font-bold tabular-nums ${penalty < 0 ? "text-red-600" : trained ? "text-amber-900" : "text-stone-400"}`}>
                      {total >= 0 ? "+" : ""}{total}
                      {penalty < 0 && <span className="text-[10px] text-red-400">(pen.)</span>}
                      <Dices size={11} className="opacity-0 transition group-hover:opacity-60" />
                    </span>
                  </button>
                );
              };
              return (
                <div className="mt-2 space-y-2">
                  {/* Treinadas */}
                  {trainedIds.length > 0 && (
                    <div>
                      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">Treinadas</p>
                      <div className="space-y-0.5">
                        {trainedIds.map((id, i) => mkRow(id, `t-${id}-${i}`, true))}
                      </div>
                    </div>
                  )}
                  {/* Não treinadas usáveis */}
                  {untrainedUsable.length > 0 && (
                    <details>
                      <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-stone-600 select-none">
                        Sem treinamento ({untrainedUsable.length})
                      </summary>
                      <div className="mt-1 space-y-0.5">
                        {untrainedUsable.map(s => mkRow(s.id, `u-${s.id}`, false))}
                      </div>
                    </details>
                  )}
                </div>
              );
            })()}
          </Card>

          {/* Habilidades passivas */}
          {(classAbility || raceAbilities.length > 0) && (
            <Card>
              <SectionTitle>Habilidades Passivas</SectionTitle>
              <div className="mt-2 space-y-2 text-sm text-stone-700">
                {classAbility && (
                  <div>
                    <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      {classById[character.class as keyof typeof classById]?.name ?? character.class}
                    </p>
                    <p className="leading-snug">{classAbility}</p>
                    {character.class === "mago" && (character.class_choices as Record<string, string> | null)?.tradition && (
                      <p className="mt-1 font-semibold text-purple-700">
                        Tradição: {(character.class_choices as Record<string, string>).tradition
                          .replace("abissal", "Abissal").replace("elemental", "Elemental")
                          .replace("erudita", "Erudita").replace("onirica", "Onírica").replace("rustica", "Rústica")}
                      </p>
                    )}
                  </div>
                )}
                {raceAbilities.length > 0 && (
                  <div>
                    <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      {raceById[character.race as keyof typeof raceById]?.name ?? character.race}
                    </p>
                    <p className="leading-snug">{raceAbilities.join("; ")}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Efeitos ativos */}
          {activeEffects.length > 0 && (
            <ActiveEffectsCard effects={activeEffects} onRemove={onRemoveEffect} />
          )}

          {/* Itens equipados (compacto) */}
          {equippedAll.length > 0 && (
            <Card>
              <SectionTitle>Equipado</SectionTitle>
              <div className="mt-2 space-y-0.5">
                {equippedAll.map(inv => {
                  const item = inv.items!;
                  const loc = inv.location === "worn" ? "vestido" : "empunhado";
                  return (
                    <div key={inv.id} className="flex items-center justify-between rounded-md bg-white/70 px-2.5 py-1.5 text-sm">
                      <span className="truncate font-medium">{inv.custom_label ?? item.name}</span>
                      <span className="ml-2 shrink-0 rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold capitalize text-stone-500">{loc}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* ── COLUNA DIREITA ───────────────────────── */}
        <div className="flex flex-col gap-2.5 overflow-y-auto min-h-0 pr-1 max-h-[calc(100vh-160px)]">

          {/* Ataques */}
          <Card>
            <SectionTitle>Ataques</SectionTitle>
            <div className="mt-2">
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

          {/* Magias e Poderes */}
          {((character.powers?.length ?? 0) > 0 || (character.spells?.length ?? 0) > 0 || isDmMode) && (
            <Card>
              <SectionTitle>Magias e Poderes</SectionTitle>
              <div className="mt-2">
                <SpellsSection
                  spells={character.spells ?? []}
                  powers={character.powers ?? []}
                  isDmMode={isDmMode}
                  characterId={character.id}
                  mpCurrent={mpCurrent}
                  onUseMp={(amount) => adjustMp(-amount)}
                  onAddEffect={onAddEffect}
                  restKey={restKey}
                  attrs={{
                    str: character.attr_str,
                    dex: character.attr_dex,
                    con: character.attr_con,
                    int: character.attr_int,
                    wis: character.attr_wis,
                    cha: character.attr_cha,
                  }}
                />
              </div>
            </Card>
          )}

          {/* Inventário carregado */}
          {carriedItems.length > 0 && (
            <Card>
              <SectionTitle>Inventário</SectionTitle>
              <div className="mt-2 space-y-0.5">
                {carriedItems.map(inv => {
                  const item = inv.items!;
                  return (
                    <div key={inv.id} className="flex items-center rounded-md bg-white/70 px-2.5 py-1.5 text-sm">
                      <span className="truncate font-medium">{inv.custom_label ?? item.name}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
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
            className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-black hover:bg-white/20 active:scale-95 transition cursor-pointer"
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
            className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-black hover:bg-white/20 active:scale-95 transition cursor-pointer"
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

function ActiveEffectsCard({
  effects,
  onRemove,
}: {
  effects: ActiveEffect[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/60 px-3 py-2.5 print:hidden">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-600 mb-2">Efeitos Ativos</p>
      <div className="flex flex-wrap gap-1.5">
        {effects.map((ef) => (
          <div key={ef.id} className="flex items-center gap-1.5 rounded-lg bg-violet-100 border border-violet-200 px-2.5 py-1 text-xs">
            <span className="font-semibold text-violet-800">{ef.name}</span>
            <span className="text-violet-400 text-[10px]">{ef.duration}</span>
            <button
              onClick={() => onRemove(ef.id)}
              className="text-violet-400 hover:text-violet-700 transition ml-0.5"
              aria-label={`Remover ${ef.name}`}
            >
              <X size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
