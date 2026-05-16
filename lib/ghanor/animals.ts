export type CompanionKind = "animal" | "mercenary" | "class_companion" | "follower" | "custom";
export type CompanionType =
  | "montaria" | "besta_carga" | "perseguidor" | "vigilante"
  | "combatente" | "guardiao" | "fortao" | "assassino" | "atirador"
  | "emissario" | "destruidor" | "artesao" | "magivocador" | "turba" | "outro";
export type PowerLevel = "iniciante" | "veterano" | "mestre";

export type Companion = {
  id: string;
  character_id: string;
  user_id: string;
  name: string;
  species: string | null;
  kind: CompanionKind;
  companion_type: CompanionType | null;
  power_level: PowerLevel;
  acquired_at: string;
  acquired_from: string | null;
  acquired_cost_pc: number | null;
  carry_capacity_spaces: number;
  is_alive: boolean;
  current_hp: number | null;
  max_hp: number | null;
  notes: string | null;
  appearance: string | null;
  hire_cost_per_scene_pc: number | null;
};

type AnimalConfig = {
  species: string;
  defaultName: string;
  companionType: CompanionType;
  carryCapacity: number;
  alforjesBonus: number;
};

export const ANIMAL_CONFIGS: Record<string, AnimalConfig> = {
  cavalo: {
    species: "Cavalo",
    defaultName: "Cavalo",
    companionType: "montaria",
    carryCapacity: 0,
    alforjesBonus: 5,
  },
  cavalo_guerra: {
    species: "Cavalo de guerra",
    defaultName: "Cavalo de guerra",
    companionType: "montaria",
    carryCapacity: 0,
    alforjesBonus: 5,
  },
  mula: {
    species: "Mula",
    defaultName: "Mula",
    companionType: "besta_carga",
    carryCapacity: 5,
    alforjesBonus: 5,
  },
  falcao: {
    species: "Falcão",
    defaultName: "Falcão",
    companionType: "vigilante",
    carryCapacity: 0,
    alforjesBonus: 0,
  },
  cao_caca: {
    species: "Cão de caça",
    defaultName: "Cão",
    companionType: "perseguidor",
    carryCapacity: 0,
    alforjesBonus: 0,
  },
};

export const KIND_LABEL: Record<CompanionKind, string> = {
  animal: "Animal",
  mercenary: "Mercenário",
  class_companion: "Companheiro de Classe",
  follower: "Seguidor",
  custom: "Customizado",
};

export const TYPE_LABEL: Partial<Record<CompanionType, string>> = {
  montaria: "Montaria",
  besta_carga: "Besta de Carga",
  perseguidor: "Perseguidor",
  vigilante: "Vigilante",
  combatente: "Combatente",
  guardiao: "Guardião",
  fortao: "Fortão",
  assassino: "Assassino",
  atirador: "Atirador",
  emissario: "Emissário",
  destruidor: "Destruidor",
  artesao: "Artesão",
  magivocador: "Magivocador",
  turba: "Turba",
  outro: "Outro",
};

export const POWER_LEVEL_LABEL: Record<PowerLevel, string> = {
  iniciante: "Iniciante",
  veterano: "Veterano",
  mestre: "Mestre",
};
