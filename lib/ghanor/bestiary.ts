export type EnemyCategory =
  | "humanoide" | "morto_vivo" | "besta" | "aberracao"
  | "elemental" | "gigante" | "dragao" | "construto";

export type EnemyTier = "fraco" | "padrao" | "poderoso" | "chefe";

export type EnemyTemplate = {
  id: string;
  name: string;
  category: EnemyCategory;
  tier: EnemyTier;
  level: number;
  hp: number;
  mp: number;
  defense: number;
  attr_str: number;
  attr_dex: number;
  attr_con: number;
  attr_int: number;
  attr_wis: number;
  attr_cha: number;
  attack_bonus: number;
  damage_dice: string;
  damage_mod: number;
  is_ranged: boolean;
  abilities: string[];
  emoji: string;
};

export const CATEGORY_LABELS: Record<EnemyCategory, string> = {
  humanoide: "Humanoide",
  morto_vivo: "Morto-Vivo",
  besta: "Besta",
  aberracao: "Aberração",
  elemental: "Elemental",
  gigante: "Gigante",
  dragao: "Dragão",
  construto: "Construto",
};

export const ENEMY_TIER_LABELS: Record<EnemyTier, string> = {
  fraco: "Fraco",
  padrao: "Padrão",
  poderoso: "Poderoso",
  chefe: "Chefe",
};

export type CategoryTheme = {
  gradFrom: string;
  gradTo: string;
  border: string;
  badge: string;
  iconClr: string;
};

export const CATEGORY_THEME: Record<EnemyCategory, CategoryTheme> = {
  humanoide: {
    gradFrom: "#1c1007", gradTo: "#3c2810",
    border: "#d97706", badge: "bg-amber-900/50 text-amber-200 border-amber-700/40", iconClr: "#fcd34d",
  },
  morto_vivo: {
    gradFrom: "#0d0a1a", gradTo: "#1e1535",
    border: "#7c3aed", badge: "bg-purple-900/50 text-purple-200 border-purple-700/40", iconClr: "#c4b5fd",
  },
  besta: {
    gradFrom: "#071410", gradTo: "#0f2d1e",
    border: "#16a34a", badge: "bg-emerald-900/50 text-emerald-200 border-emerald-700/40", iconClr: "#6ee7b7",
  },
  aberracao: {
    gradFrom: "#1a0510", gradTo: "#340a1c",
    border: "#e11d48", badge: "bg-rose-900/50 text-rose-200 border-rose-700/40", iconClr: "#fda4af",
  },
  elemental: {
    gradFrom: "#1a0800", gradTo: "#3d1500",
    border: "#ea580c", badge: "bg-orange-900/50 text-orange-200 border-orange-700/40", iconClr: "#fdba74",
  },
  gigante: {
    gradFrom: "#141210", gradTo: "#2a2420",
    border: "#78716c", badge: "bg-stone-800 text-stone-200 border-stone-600", iconClr: "#d6d3d1",
  },
  dragao: {
    gradFrom: "#1a0000", gradTo: "#3d0505",
    border: "#dc2626", badge: "bg-red-900/50 text-red-200 border-red-700/40", iconClr: "#fca5a5",
  },
  construto: {
    gradFrom: "#0e1018", gradTo: "#1a1d2e",
    border: "#4b5563", badge: "bg-zinc-900/50 text-zinc-300 border-zinc-700", iconClr: "#9ca3af",
  },
};

export const STATUS_EFFECTS = [
  { id: "envenenado",   label: "Envenenado",  emoji: "☠️",  cls: "bg-green-900/60 text-green-300 border-green-700/50" },
  { id: "atordoado",   label: "Atordoado",   emoji: "💫",  cls: "bg-yellow-900/60 text-yellow-300 border-yellow-700/50" },
  { id: "amedrontado", label: "Amedrontado", emoji: "😱",  cls: "bg-purple-900/60 text-purple-300 border-purple-700/50" },
  { id: "sangrando",   label: "Sangrando",   emoji: "🩸",  cls: "bg-red-900/60 text-red-300 border-red-700/50" },
  { id: "caido",       label: "Caído",       emoji: "⬇️", cls: "bg-stone-800 text-stone-300 border-stone-600" },
  { id: "imobilizado", label: "Imobilizado", emoji: "⛓️", cls: "bg-blue-900/60 text-blue-300 border-blue-700/50" },
  { id: "cego",        label: "Cego",        emoji: "🚫",  cls: "bg-gray-900/60 text-gray-300 border-gray-700/50" },
  { id: "regenerando", label: "Regenerando", emoji: "💚",  cls: "bg-emerald-900/60 text-emerald-300 border-emerald-700/50" },
] as const;

export const enemies: EnemyTemplate[] = [
  // ─── Humanoides ──────────────────────────────────────────────────────────────
  {
    id: "goblin",
    name: "Goblin",
    category: "humanoide",
    tier: "fraco",
    level: 1,
    hp: 10, mp: 0, defense: 12,
    attr_str: -1, attr_dex: 2, attr_con: 0, attr_int: -1, attr_wis: 0, attr_cha: -1,
    attack_bonus: 3, damage_dice: "1d4", damage_mod: 0, is_ranged: false,
    abilities: ["Fuga Covarde — com PV < 3 pode tentar fugir como ação bônus."],
    emoji: "👺",
  },
  {
    id: "kobold",
    name: "Kobold",
    category: "humanoide",
    tier: "fraco",
    level: 1,
    hp: 8, mp: 0, defense: 13,
    attr_str: -2, attr_dex: 3, attr_con: -1, attr_int: -1, attr_wis: 0, attr_cha: -2,
    attack_bonus: 4, damage_dice: "1d4", damage_mod: -1, is_ranged: true,
    abilities: ["Armadilheiro — armadilhas causam 1d6 de dano extra.", "Caça em Bando — +2 em ataque se 2+ aliados adjacentes ao alvo."],
    emoji: "🦎",
  },
  {
    id: "bandido",
    name: "Bandido",
    category: "humanoide",
    tier: "fraco",
    level: 2,
    hp: 18, mp: 0, defense: 13,
    attr_str: 1, attr_dex: 1, attr_con: 0, attr_int: 0, attr_wis: 0, attr_cha: 0,
    attack_bonus: 4, damage_dice: "1d6", damage_mod: 1, is_ranged: false,
    abilities: ["Emboscada — +1d6 de dano quando ataca de surpresa ou com vantagem."],
    emoji: "🗡️",
  },
  {
    id: "hobgoblin",
    name: "Hobgoblin Guerreiro",
    category: "humanoide",
    tier: "padrao",
    level: 3,
    hp: 28, mp: 0, defense: 15,
    attr_str: 2, attr_dex: 1, attr_con: 1, attr_int: 0, attr_wis: 0, attr_cha: -1,
    attack_bonus: 6, damage_dice: "1d8", damage_mod: 2, is_ranged: false,
    abilities: ["Formação Militar — aliados adjacentes recebem +1 em ataques.", "Disciplinado — imune a medo enquanto o líder estiver vivo."],
    emoji: "👊",
  },
  {
    id: "orco",
    name: "Orco Berserker",
    category: "humanoide",
    tier: "padrao",
    level: 4,
    hp: 38, mp: 0, defense: 13,
    attr_str: 3, attr_dex: 0, attr_con: 2, attr_int: -1, attr_wis: -1, attr_cha: -2,
    attack_bonus: 7, damage_dice: "1d10", damage_mod: 3, is_ranged: false,
    abilities: ["Fúria — quando PV < metade, dano +2.", "Inabalável — pode agir por 1 rodada com 0 PV antes de cair."],
    emoji: "🪓",
  },
  {
    id: "gnoll",
    name: "Gnoll",
    category: "humanoide",
    tier: "padrao",
    level: 4,
    hp: 32, mp: 0, defense: 14,
    attr_str: 2, attr_dex: 1, attr_con: 2, attr_int: -1, attr_wis: 0, attr_cha: -1,
    attack_bonus: 6, damage_dice: "1d8", damage_mod: 2, is_ranged: false,
    abilities: ["Riso Demoníaco — ao derrotar inimigo, aterroriza vizinhos (CD 13 Vontade).", "Mordida do Caos — após derrotar um inimigo, ataca outro adjacente imediatamente."],
    emoji: "🦴",
  },

  // ─── Mortos-Vivos ────────────────────────────────────────────────────────────
  {
    id: "esqueleto",
    name: "Esqueleto",
    category: "morto_vivo",
    tier: "fraco",
    level: 1,
    hp: 9, mp: 0, defense: 12,
    attr_str: 0, attr_dex: 2, attr_con: 0, attr_int: -3, attr_wis: -3, attr_cha: -5,
    attack_bonus: 3, damage_dice: "1d6", damage_mod: 0, is_ranged: false,
    abilities: ["Imune a veneno e sangramento.", "Vulnerável a dano contundente — dano ×2."],
    emoji: "💀",
  },
  {
    id: "zumbi",
    name: "Zumbi",
    category: "morto_vivo",
    tier: "fraco",
    level: 2,
    hp: 22, mp: 0, defense: 10,
    attr_str: 2, attr_dex: -1, attr_con: 2, attr_int: -4, attr_wis: -4, attr_cha: -5,
    attack_bonus: 3, damage_dice: "1d8", damage_mod: 2, is_ranged: false,
    abilities: ["Resistência (1×/enc.) — ao chegar a 0 PV, retorna com 1 PV.", "Lento — não pode usar reações nem correr."],
    emoji: "🧟",
  },
  {
    id: "esqueleto_guerreiro",
    name: "Esqueleto Guerreiro",
    category: "morto_vivo",
    tier: "padrao",
    level: 3,
    hp: 22, mp: 0, defense: 15,
    attr_str: 2, attr_dex: 2, attr_con: 0, attr_int: -3, attr_wis: -3, attr_cha: -5,
    attack_bonus: 6, damage_dice: "1d8", damage_mod: 2, is_ranged: false,
    abilities: ["Imune a veneno, sangramento e medo.", "Vulnerável a dano contundente — dano ×2."],
    emoji: "⚔️",
  },
  {
    id: "sombra",
    name: "Sombra",
    category: "morto_vivo",
    tier: "padrao",
    level: 5,
    hp: 32, mp: 5, defense: 15,
    attr_str: -2, attr_dex: 3, attr_con: 0, attr_int: 0, attr_wis: 1, attr_cha: 1,
    attack_bonus: 7, damage_dice: "1d6", damage_mod: 0, is_ranged: false,
    abilities: ["Incorporal — 50% de chance de ignorar dano físico.", "Drenar Força — alvo perde 1 de Força temporariamente ao ser acertado.", "Vulnerável à luz solar — desvantagem em todos os testes."],
    emoji: "👤",
  },
  {
    id: "vampiro",
    name: "Vampiro",
    category: "morto_vivo",
    tier: "poderoso",
    level: 8,
    hp: 68, mp: 15, defense: 18,
    attr_str: 3, attr_dex: 3, attr_con: 2, attr_int: 2, attr_wis: 2, attr_cha: 4,
    attack_bonus: 11, damage_dice: "1d8", damage_mod: 3, is_ranged: false,
    abilities: ["Drenar Vida — PV causados viram recuperação para o Vampiro.", "Transformação — pode assumir forma de névoa ou morcego.", "Fraqueza à Luz Solar — 5d6 de dano de fogo por rodada.", "Regeneração 5 — recupera 5 PV/rodada (exceto luz solar e água corrente)."],
    emoji: "🧛",
  },
  {
    id: "lich",
    name: "Lich",
    category: "morto_vivo",
    tier: "chefe",
    level: 12,
    hp: 100, mp: 30, defense: 20,
    attr_str: 0, attr_dex: 2, attr_con: 0, attr_int: 6, attr_wis: 4, attr_cha: 3,
    attack_bonus: 12, damage_dice: "3d6", damage_mod: 0, is_ranged: true,
    abilities: ["Phylactery — ressurge em 1d10 dias se o phylactery existir.", "Toque Gelado — CD 18 Fortitude ou paralisia por 1 rodada.", "Conjuração 6° Círculo.", "Aura de Terror — CD 17 Vontade ou amedrontado (6m)."],
    emoji: "🧙",
  },

  // ─── Bestas ──────────────────────────────────────────────────────────────────
  {
    id: "lobo",
    name: "Lobo",
    category: "besta",
    tier: "fraco",
    level: 2,
    hp: 20, mp: 0, defense: 13,
    attr_str: 2, attr_dex: 2, attr_con: 1, attr_int: -3, attr_wis: 1, attr_cha: -2,
    attack_bonus: 5, damage_dice: "1d6", damage_mod: 2, is_ranged: false,
    abilities: ["Derrubada — se acertar por 5+, alvo é derrubado.", "Bando — +2 em ataque quando aliado adjacente ao alvo."],
    emoji: "🐺",
  },
  {
    id: "vibora",
    name: "Víbora Venenosa",
    category: "besta",
    tier: "fraco",
    level: 1,
    hp: 6, mp: 0, defense: 14,
    attr_str: -3, attr_dex: 4, attr_con: 0, attr_int: -4, attr_wis: 1, attr_cha: -3,
    attack_bonus: 5, damage_dice: "1d4", damage_mod: 0, is_ranged: false,
    abilities: ["Veneno — CD 12 Fortitude ou 1d6 de veneno por 2 rodadas."],
    emoji: "🐍",
  },
  {
    id: "aranha",
    name: "Aranha Gigante",
    category: "besta",
    tier: "padrao",
    level: 3,
    hp: 25, mp: 0, defense: 14,
    attr_str: 1, attr_dex: 3, attr_con: 1, attr_int: -4, attr_wis: 1, attr_cha: -4,
    attack_bonus: 6, damage_dice: "1d6", damage_mod: 1, is_ranged: false,
    abilities: ["Teia (9m) — imobiliza alvo, CD 13 Atletismo para escapar.", "Veneno — CD 13 Fortitude ou 1d6 veneno por 3 rodadas."],
    emoji: "🕷️",
  },
  {
    id: "urso",
    name: "Urso Pardo",
    category: "besta",
    tier: "padrao",
    level: 4,
    hp: 42, mp: 0, defense: 13,
    attr_str: 4, attr_dex: 1, attr_con: 3, attr_int: -3, attr_wis: 1, attr_cha: -2,
    attack_bonus: 8, damage_dice: "1d8", damage_mod: 4, is_ranged: false,
    abilities: ["Abraço do Urso — ao acertar 2× na mesma rodada, agarra (1d6+4/rodada).", "Robusto — imune a derrubada e empurrão."],
    emoji: "🐻",
  },
  {
    id: "crocodilo",
    name: "Crocodilo Gigante",
    category: "besta",
    tier: "padrao",
    level: 4,
    hp: 38, mp: 0, defense: 14,
    attr_str: 3, attr_dex: 0, attr_con: 3, attr_int: -4, attr_wis: 0, attr_cha: -4,
    attack_bonus: 7, damage_dice: "1d10", damage_mod: 3, is_ranged: false,
    abilities: ["Mordida Arrastradora — ao acertar, agarra e arrasta para a água.", "Pele Couraçada — redução de dano 2 (físico)."],
    emoji: "🐊",
  },

  // ─── Aberrações ──────────────────────────────────────────────────────────────
  {
    id: "harpia",
    name: "Harpia",
    category: "aberracao",
    tier: "padrao",
    level: 5,
    hp: 38, mp: 3, defense: 14,
    attr_str: 1, attr_dex: 2, attr_con: 1, attr_int: 0, attr_wis: 0, attr_cha: 2,
    attack_bonus: 7, damage_dice: "1d6", damage_mod: 1, is_ranged: false,
    abilities: ["Canto Encantador — CD 15 Vontade ou fascinado por 1 rodada.", "Voo — movimento de voo 15m."],
    emoji: "🦅",
  },
  {
    id: "troll",
    name: "Troll",
    category: "aberracao",
    tier: "poderoso",
    level: 7,
    hp: 65, mp: 0, defense: 15,
    attr_str: 4, attr_dex: 1, attr_con: 4, attr_int: -2, attr_wis: -1, attr_cha: -3,
    attack_bonus: 9, damage_dice: "1d8", damage_mod: 4, is_ranged: false,
    abilities: ["Regeneração 5 — recupera 5 PV/turno (exceto fogo ou ácido).", "Ataque Duplo — garras + mordida no mesmo turno."],
    emoji: "🧌",
  },
  {
    id: "medusa",
    name: "Medusa",
    category: "aberracao",
    tier: "poderoso",
    level: 6,
    hp: 45, mp: 10, defense: 16,
    attr_str: 1, attr_dex: 3, attr_con: 1, attr_int: 2, attr_wis: 2, attr_cha: 2,
    attack_bonus: 8, damage_dice: "1d6", damage_mod: 3, is_ranged: true,
    abilities: ["Olhar Petrificante (reação) — CD 17 Fortitude ou petrificado.", "Cabelo de Serpentes — +2 em ataques, pode atacar 2× por turno."],
    emoji: "👁️",
  },

  // ─── Elementais ──────────────────────────────────────────────────────────────
  {
    id: "elemental_fogo",
    name: "Elemental de Fogo",
    category: "elemental",
    tier: "poderoso",
    level: 6,
    hp: 48, mp: 8, defense: 15,
    attr_str: 2, attr_dex: 3, attr_con: 2, attr_int: 0, attr_wis: 1, attr_cha: 0,
    attack_bonus: 8, damage_dice: "2d6", damage_mod: 0, is_ranged: false,
    abilities: ["Imune a Fogo e Veneno.", "Corpo em Chamas — quem atacar corpo a corpo recebe 1d6 fogo.", "Vulnerável à Água — perde 10 PV/rodada em contato com água."],
    emoji: "🔥",
  },
  {
    id: "elemental_terra",
    name: "Elemental de Terra",
    category: "elemental",
    tier: "poderoso",
    level: 7,
    hp: 68, mp: 0, defense: 17,
    attr_str: 5, attr_dex: -1, attr_con: 4, attr_int: -1, attr_wis: 0, attr_cha: -1,
    attack_bonus: 9, damage_dice: "2d8", damage_mod: 5, is_ranged: false,
    abilities: ["Redução de Dano 3 (físico).", "Tremor de Terra — todos adjacentes, CD 16 Reflexos ou derrubados.", "Imune a relâmpago e veneno."],
    emoji: "🪨",
  },

  // ─── Gigantes ────────────────────────────────────────────────────────────────
  {
    id: "ogro",
    name: "Ogro",
    category: "gigante",
    tier: "poderoso",
    level: 5,
    hp: 52, mp: 0, defense: 13,
    attr_str: 5, attr_dex: -1, attr_con: 3, attr_int: -2, attr_wis: -1, attr_cha: -2,
    attack_bonus: 8, damage_dice: "1d10", damage_mod: 5, is_ranged: false,
    abilities: ["Truculento — pode atacar 2 alvos adjacentes (–2 em cada).", "Porretada — pode empurrar alvo até 3m ao acertar."],
    emoji: "👹",
  },
  {
    id: "gigante_colinas",
    name: "Gigante das Colinas",
    category: "gigante",
    tier: "chefe",
    level: 9,
    hp: 90, mp: 0, defense: 16,
    attr_str: 6, attr_dex: 0, attr_con: 5, attr_int: -1, attr_wis: 0, attr_cha: -1,
    attack_bonus: 12, damage_dice: "2d8", damage_mod: 6, is_ranged: true,
    abilities: ["Arremesso de Rochas (24m) — dano 2d8+6.", "Destruidor — dano dobrado em objetos e estruturas.", "Inabalável — imune a empurrão e derrubada."],
    emoji: "⛰️",
  },

  // ─── Construtos ──────────────────────────────────────────────────────────────
  {
    id: "golem_pedra",
    name: "Golem de Pedra",
    category: "construto",
    tier: "poderoso",
    level: 8,
    hp: 80, mp: 0, defense: 18,
    attr_str: 6, attr_dex: -2, attr_con: 5, attr_int: -3, attr_wis: 0, attr_cha: -5,
    attack_bonus: 10, damage_dice: "2d10", damage_mod: 6, is_ranged: false,
    abilities: ["Imune a magias de 1° a 3° círculo.", "Redução de Dano 5 (não-mágico).", "Lento — sem reações, move apenas 6m por turno."],
    emoji: "🗿",
  },

  // ─── Dragões ─────────────────────────────────────────────────────────────────
  {
    id: "dragao_jovem_fogo",
    name: "Dragão Jovem de Fogo",
    category: "dragao",
    tier: "chefe",
    level: 10,
    hp: 100, mp: 20, defense: 19,
    attr_str: 5, attr_dex: 2, attr_con: 4, attr_int: 2, attr_wis: 2, attr_cha: 3,
    attack_bonus: 13, damage_dice: "2d8", damage_mod: 5, is_ranged: false,
    abilities: ["Sopro de Fogo (cone 9m) — 6d6 fogo, CD 18 Reflexos metade.", "Voo — movimento de voo 18m.", "Imune a Fogo.", "Aterrador — CD 16 Vontade ou amedrontado por 1 rodada."],
    emoji: "🐉",
  },
  {
    id: "dragao_jovem_gelo",
    name: "Dragão Jovem de Gelo",
    category: "dragao",
    tier: "chefe",
    level: 10,
    hp: 95, mp: 20, defense: 18,
    attr_str: 4, attr_dex: 2, attr_con: 4, attr_int: 2, attr_wis: 2, attr_cha: 3,
    attack_bonus: 12, damage_dice: "2d6", damage_mod: 4, is_ranged: false,
    abilities: ["Sopro de Gelo (cone 9m) — 6d6 frio, CD 17 Reflexos metade, alvo fica lento.", "Voo — movimento de voo 18m.", "Imune a Frio.", "Aterrador — CD 15 Vontade ou amedrontado."],
    emoji: "🐲",
  },
  {
    id: "dragao_adulto",
    name: "Dragão Adulto",
    category: "dragao",
    tier: "chefe",
    level: 15,
    hp: 160, mp: 30, defense: 22,
    attr_str: 7, attr_dex: 2, attr_con: 5, attr_int: 4, attr_wis: 3, attr_cha: 4,
    attack_bonus: 16, damage_dice: "3d10", damage_mod: 7, is_ranged: false,
    abilities: ["Sopro (cone 12m) — 9d6 elemental, CD 22 Reflexos metade.", "Ataque Triplo — mordida + 2 garras por turno.", "Aterrador Lendário — CD 20 Vontade ou amedrontado.", "Lendário — 3 ações lendárias por turno.", "Imune ao seu elemento."],
    emoji: "🔱",
  },
];

export const enemyById = Object.fromEntries(enemies.map((e) => [e.id, e])) as Record<string, EnemyTemplate>;
