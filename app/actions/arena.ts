"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateHp, calculateMp, calculateDefense } from "@/lib/ghanor/rules";
import type { CharacterBuild, RaceId, ClassId } from "@/lib/ghanor/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  return user;
}

function generateToken(): string {
  const { randomInt } = require("crypto") as typeof import("crypto");
  return String(randomInt(100, 1000));
}

async function assertDm(arenaId: string, userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("arenas")
    .select("id, name, is_active")
    .eq("id", arenaId)
    .eq("dm_user_id", userId)
    .single();
  if (!data) throw new Error("Arena não encontrada ou sem permissão.");
  return data;
}

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type ArenaRow = {
  id: string;
  token: string;
  name: string;
  dm_user_id: string;
  is_active: boolean;
  created_at: string;
  participant_count?: number;
  role?: "dm" | "participant" | "none";
};

export type ArenaCharacter = {
  id: string;
  name: string;
  race: string;
  class: string;
  current_level: number;
  hp_max: number;
  mp_max: number;
  defense: number;
  portrait_url: string | null;
  attr_str: number;
  attr_dex: number;
  attr_con: number;
  attr_int: number;
  attr_wis: number;
  attr_cha: number;
  money_pc: number;
  trained_skills: string[];
};

export type ArenaParticipant = {
  id: string;
  arena_id: string;
  character_id: string;
  user_id: string;
  hp_current: number;
  mp_current: number;
  joined_at: string;
  character: ArenaCharacter;
};

export type ArenaWithParticipants = ArenaRow & {
  participants: ArenaParticipant[];
  role: "dm" | "participant" | "none";
};

// ─── createArena ───────────────────────────────────────────────────────────────

export async function createArena(
  input: { name: string }
): Promise<{ arenaId: string; token: string } | { error: string }> {
  try {
    const user = await getAuthUser();
    const admin = createAdminClient();

    const name = input.name.trim();
    if (!name) return { error: "Nome da arena é obrigatório." };
    if (name.length > 80) return { error: "Nome muito longo (máx 80 chars)." };

    // Gera token único (tenta até 5 vezes em caso de colisão improvável)
    let token = "";
    for (let i = 0; i < 5; i++) {
      const candidate = generateToken();
      const { data: existing } = await admin
        .from("arenas")
        .select("id")
        .eq("token", candidate)
        .maybeSingle();
      if (!existing) { token = candidate; break; }
    }
    if (!token) return { error: "Não foi possível gerar token. Tente novamente." };

    const { data, error } = await admin
      .from("arenas")
      .insert({ token, name, dm_user_id: user.id })
      .select("id, token")
      .single();

    if (error) return { error: error.message };
    return { arenaId: data.id, token: data.token };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao criar arena." };
  }
}

// ─── getMyArenas ──────────────────────────────────────────────────────────────

export async function getMyArenas(): Promise<{ arenas: ArenaRow[] } | { error: string }> {
  try {
    const user = await getAuthUser();
    const admin = createAdminClient();

    // Arenas onde é DM
    const { data: dmArenas } = await admin
      .from("arenas")
      .select("id, token, name, dm_user_id, is_active, created_at")
      .eq("dm_user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    // Arenas onde é participante
    const { data: participations } = await admin
      .from("arena_participants")
      .select("arena_id")
      .eq("user_id", user.id);

    const participantArenaIds = (participations ?? []).map((p) => p.arena_id);

    let playerArenas: ArenaRow[] = [];
    if (participantArenaIds.length > 0) {
      const { data } = await admin
        .from("arenas")
        .select("id, token, name, dm_user_id, is_active, created_at")
        .in("id", participantArenaIds)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      playerArenas = data ?? [];
    }

    // Conta participantes por arena
    const allIds = [
      ...(dmArenas ?? []).map((a) => a.id),
      ...playerArenas.map((a) => a.id),
    ];

    const counts: Record<string, number> = {};
    if (allIds.length > 0) {
      const { data: countData } = await admin
        .from("arena_participants")
        .select("arena_id")
        .in("arena_id", allIds);
      (countData ?? []).forEach((r) => {
        counts[r.arena_id] = (counts[r.arena_id] ?? 0) + 1;
      });
    }

    const dmSet = new Set((dmArenas ?? []).map((a) => a.id));

    const arenas: ArenaRow[] = [
      ...(dmArenas ?? []).map((a) => ({
        ...a,
        participant_count: counts[a.id] ?? 0,
        role: "dm" as const,
      })),
      ...playerArenas
        .filter((a) => !dmSet.has(a.id)) // evita duplicatas
        .map((a) => ({
          ...a,
          participant_count: counts[a.id] ?? 0,
          role: "participant" as const,
        })),
    ];

    return { arenas };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao buscar arenas." };
  }
}

// ─── getArenaByToken ──────────────────────────────────────────────────────────

export async function getArenaByToken(
  token: string
): Promise<ArenaWithParticipants | { error: string }> {
  try {
    const user = await getAuthUser();
    const admin = createAdminClient();

    const { data: arena } = await admin
      .from("arenas")
      .select("id, token, name, dm_user_id, is_active, created_at")
      .eq("token", token.toUpperCase())
      .maybeSingle();

    if (!arena) return { error: "Arena não encontrada." };
    if (!arena.is_active) return { error: "Esta arena foi encerrada." };

    // Busca participantes com dados do personagem
    const { data: rawParticipants } = await admin
      .from("arena_participants")
      .select(`
        id, arena_id, character_id, user_id, hp_current, mp_current, joined_at,
        characters (
          id, name, race, class, current_level,
          hp_max, mp_max, defense, portrait_url, money_pc, trained_skills,
          attr_str, attr_dex, attr_con, attr_int, attr_wis, attr_cha
        )
      `)
      .eq("arena_id", arena.id)
      .order("joined_at", { ascending: true });

    const participants: ArenaParticipant[] = (rawParticipants ?? []).map((p) => ({
      id: p.id,
      arena_id: p.arena_id,
      character_id: p.character_id,
      user_id: p.user_id,
      hp_current: p.hp_current,
      mp_current: p.mp_current,
      joined_at: p.joined_at,
      character: p.characters as unknown as ArenaCharacter,
    }));

    const isDm = arena.dm_user_id === user.id;
    const isParticipant = participants.some((p) => p.user_id === user.id);
    const role: "dm" | "participant" | "none" = isDm
      ? "dm"
      : isParticipant
      ? "participant"
      : "none";

    return {
      id: arena.id,
      token: arena.token,
      name: arena.name,
      dm_user_id: arena.dm_user_id,
      is_active: arena.is_active,
      created_at: arena.created_at,
      participants,
      role,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao buscar arena." };
  }
}

// ─── joinArena ────────────────────────────────────────────────────────────────

export async function joinArena(
  input: { token: string; characterId: string }
): Promise<{ ok: true } | { error: string }> {
  try {
    const user = await getAuthUser();
    const admin = createAdminClient();

    // Busca arena
    const { data: arena } = await admin
      .from("arenas")
      .select("id, is_active")
      .eq("token", input.token.toUpperCase())
      .maybeSingle();

    if (!arena || !arena.is_active) return { error: "Arena não encontrada ou encerrada." };

    // Verifica que o personagem pertence ao usuário
    const { data: character } = await admin
      .from("characters")
      .select("id, hp_max, mp_max")
      .eq("id", input.characterId)
      .eq("user_id", user.id)
      .single();

    if (!character) return { error: "Personagem não encontrado." };

    // Verifica se já está na arena com outro personagem
    const { data: existing } = await admin
      .from("arena_participants")
      .select("id, character_id")
      .eq("arena_id", arena.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      if (existing.character_id === input.characterId) return { ok: true };
      return { error: "Você já está nesta arena com outro personagem." };
    }

    const { error } = await admin.from("arena_participants").insert({
      arena_id: arena.id,
      character_id: input.characterId,
      user_id: user.id,
      hp_current: character.hp_max,
      mp_current: character.mp_max,
    });

    if (error) return { error: error.message };
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao entrar na arena." };
  }
}

// ─── leaveArena ───────────────────────────────────────────────────────────────

export async function leaveArena(
  input: { arenaId: string; characterId: string }
): Promise<{ ok: true } | { error: string }> {
  try {
    const user = await getAuthUser();
    const admin = createAdminClient();

    const { error } = await admin
      .from("arena_participants")
      .delete()
      .eq("arena_id", input.arenaId)
      .eq("character_id", input.characterId)
      .eq("user_id", user.id);

    if (error) return { error: error.message };
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao sair da arena." };
  }
}

// ─── closeArena ───────────────────────────────────────────────────────────────

export async function closeArena(
  arenaId: string
): Promise<{ ok: true } | { error: string }> {
  try {
    const user = await getAuthUser();
    const admin = createAdminClient();

    await assertDm(arenaId, user.id);

    const { error } = await admin
      .from("arenas")
      .update({ is_active: false })
      .eq("id", arenaId);

    if (error) return { error: error.message };
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao encerrar arena." };
  }
}

// ─── dmAdjustHp ───────────────────────────────────────────────────────────────

export async function dmAdjustHp(input: {
  arenaId: string;
  characterId: string;
  delta: number;
}): Promise<{ ok: true; newHp: number } | { error: string }> {
  try {
    const user = await getAuthUser();
    const admin = createAdminClient();

    await assertDm(input.arenaId, user.id);

    const { data: participant } = await admin
      .from("arena_participants")
      .select("id, hp_current, characters (hp_max)")
      .eq("arena_id", input.arenaId)
      .eq("character_id", input.characterId)
      .single();

    if (!participant) return { error: "Participante não encontrado." };

    const hpMax = (participant.characters as unknown as { hp_max: number })?.hp_max ?? 999;
    const newHp = Math.max(0, Math.min(hpMax, participant.hp_current + input.delta));

    const { error } = await admin
      .from("arena_participants")
      .update({ hp_current: newHp })
      .eq("id", participant.id);

    if (error) return { error: error.message };
    return { ok: true, newHp };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao ajustar PV." };
  }
}

// ─── dmSetHp ──────────────────────────────────────────────────────────────────

export async function dmSetHp(input: {
  arenaId: string;
  characterId: string;
  hp: number;
}): Promise<{ ok: true; newHp: number } | { error: string }> {
  try {
    const user = await getAuthUser();
    const admin = createAdminClient();

    await assertDm(input.arenaId, user.id);

    const { data: participant } = await admin
      .from("arena_participants")
      .select("id, characters (hp_max)")
      .eq("arena_id", input.arenaId)
      .eq("character_id", input.characterId)
      .single();

    if (!participant) return { error: "Participante não encontrado." };

    const hpMax = (participant.characters as unknown as { hp_max: number })?.hp_max ?? 999;
    const newHp = Math.max(0, Math.min(hpMax, input.hp));

    const { error } = await admin
      .from("arena_participants")
      .update({ hp_current: newHp })
      .eq("id", participant.id);

    if (error) return { error: error.message };
    return { ok: true, newHp };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao definir PV." };
  }
}

// ─── dmAdjustMp ───────────────────────────────────────────────────────────────

export async function dmAdjustMp(input: {
  arenaId: string;
  characterId: string;
  delta: number;
}): Promise<{ ok: true; newMp: number } | { error: string }> {
  try {
    const user = await getAuthUser();
    const admin = createAdminClient();

    await assertDm(input.arenaId, user.id);

    const { data: participant } = await admin
      .from("arena_participants")
      .select("id, mp_current, characters (mp_max)")
      .eq("arena_id", input.arenaId)
      .eq("character_id", input.characterId)
      .single();

    if (!participant) return { error: "Participante não encontrado." };

    const mpMax = (participant.characters as unknown as { mp_max: number })?.mp_max ?? 999;
    const newMp = Math.max(0, Math.min(mpMax, participant.mp_current + input.delta));

    const { error } = await admin
      .from("arena_participants")
      .update({ mp_current: newMp })
      .eq("id", participant.id);

    if (error) return { error: error.message };
    return { ok: true, newMp };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao ajustar PM." };
  }
}

// ─── dmSetMp ──────────────────────────────────────────────────────────────────

export async function dmSetMp(input: {
  arenaId: string;
  characterId: string;
  mp: number;
}): Promise<{ ok: true; newMp: number } | { error: string }> {
  try {
    const user = await getAuthUser();
    const admin = createAdminClient();

    await assertDm(input.arenaId, user.id);

    const { data: participant } = await admin
      .from("arena_participants")
      .select("id, characters (mp_max)")
      .eq("arena_id", input.arenaId)
      .eq("character_id", input.characterId)
      .single();

    if (!participant) return { error: "Participante não encontrado." };

    const mpMax = (participant.characters as unknown as { mp_max: number })?.mp_max ?? 999;
    const newMp = Math.max(0, Math.min(mpMax, input.mp));

    const { error } = await admin
      .from("arena_participants")
      .update({ mp_current: newMp })
      .eq("id", participant.id);

    if (error) return { error: error.message };
    return { ok: true, newMp };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao definir PM." };
  }
}

// ─── dmAdjustMoney ────────────────────────────────────────────────────────────
// O DM pode dar ou cobrar dinheiro de qualquer personagem na arena

export async function dmAdjustMoney(input: {
  arenaId: string;
  characterId: string;
  amountPc: number; // positivo = dar, negativo = cobrar
  reason: string;
}): Promise<{ ok: true; newBalancePc: number } | { error: string }> {
  try {
    const user = await getAuthUser();
    const admin = createAdminClient();

    await assertDm(input.arenaId, user.id);

    // Verifica que o personagem está nesta arena
    const { data: participant } = await admin
      .from("arena_participants")
      .select("id, user_id")
      .eq("arena_id", input.arenaId)
      .eq("character_id", input.characterId)
      .single();

    if (!participant) return { error: "Participante não encontrado nesta arena." };

    const { data: character } = await admin
      .from("characters")
      .select("id, money_pc")
      .eq("id", input.characterId)
      .single();

    if (!character) return { error: "Personagem não encontrado." };

    const newBalance = character.money_pc + input.amountPc;
    if (newBalance < 0) return { error: "Saldo insuficiente." };

    await admin
      .from("characters")
      .update({ money_pc: newBalance })
      .eq("id", input.characterId);

    await admin.from("money_transactions").insert({
      character_id: input.characterId,
      user_id: participant.user_id,
      amount_pc: input.amountPc,
      reason: input.reason || (input.amountPc >= 0 ? "Dado pelo Mestre (Arena)" : "Cobrado pelo Mestre (Arena)"),
      balance_after_pc: newBalance,
    });

    revalidatePath(`/characters/${input.characterId}`);
    return { ok: true, newBalancePc: newBalance };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao ajustar dinheiro." };
  }
}

// ─── getArenaParticipation ────────────────────────────────────────────────────
// Retorna arena ativa de um personagem (para banner na ficha)

export async function getArenaParticipation(
  characterId: string
): Promise<{ arenaToken: string; arenaName: string; arenaId: string } | null> {
  try {
    const user = await getAuthUser();
    const admin = createAdminClient();

    const { data } = await admin
      .from("arena_participants")
      .select("arena_id, arenas (id, token, name, is_active)")
      .eq("character_id", characterId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!data) return null;
    const arena = data.arenas as unknown as { id: string; token: string; name: string; is_active: boolean } | null;
    if (!arena?.is_active) return null;

    return { arenaToken: arena.token, arenaName: arena.name, arenaId: arena.id };
  } catch {
    return null;
  }
}

// ─── removeParticipantByDm ────────────────────────────────────────────────────

export async function removeParticipantByDm(input: {
  arenaId: string;
  characterId: string;
}): Promise<{ ok: true } | { error: string }> {
  try {
    const user = await getAuthUser();
    const admin = createAdminClient();

    await assertDm(input.arenaId, user.id);

    const { error } = await admin
      .from("arena_participants")
      .delete()
      .eq("arena_id", input.arenaId)
      .eq("character_id", input.characterId);

    if (error) return { error: error.message };
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao remover participante." };
  }
}

// ─── dmAddNpcToArena ──────────────────────────────────────────────────────────

const NPC_NAMES = [
  "Aldric", "Brenno", "Calvar", "Dravos", "Erkan",
  "Fenris", "Gorak", "Harald", "Irvan", "Jorath",
  "Aera",   "Brinda", "Cynia",  "Dreva",  "Elara",
  "Fayla",  "Gruna",  "Hira",   "Isolde", "Janya",
  "Mord",   "Sveld",  "Taruk",  "Ulfen",  "Varyn",
];

const NPC_RACES: RaceId[] = [
  "humano", "humano", "humano",
  "anao", "elfo", "gigante", "hobgoblin", "meio_elfo",
];

const NPC_CLASSES: ClassId[] = [
  "barbaro", "soldado", "ladino", "cacador", "cavaleiro",
  "clerigo", "druida", "mago", "bardo", "bucaneiro", "nobre",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateNpcData() {
  const name = `${pick(NPC_NAMES)} (NPC)`;
  const race = pick(NPC_RACES);
  const klass = pick(NPC_CLASSES);
  const level = Math.floor(Math.random() * 5) + 1;

  // Distribui 6 valores [-1, 0, 0, 1, 1, 2] aleatoriamente nos atributos
  const pool = [-1, 0, 0, 1, 1, 2].sort(() => Math.random() - 0.5);
  const baseAttributes = {
    str: pool[0], dex: pool[1], con: pool[2],
    int: pool[3], wis: pool[4], cha: pool[5],
  };

  const build: CharacterBuild = {
    race,
    class: klass,
    origin: "campones",
    level,
    baseAttributes,
    raceChoices: {},
  };

  const hp = Math.max(1, calculateHp(build));
  const mp = Math.max(0, calculateMp(build));
  const defense = calculateDefense(build);

  return { name, race, class: klass, level, baseAttributes, hp, mp, defense };
}

export async function dmAddNpcToArena(
  arenaId: string
): Promise<{ ok: true } | { error: string }> {
  try {
    const user = await getAuthUser();
    await assertDm(arenaId, user.id);

    const admin = createAdminClient();
    const npc = generateNpcData();

    const { data: char, error: charErr } = await admin
      .from("characters")
      .insert({
        user_id: user.id,
        name: npc.name,
        attr_method: "points",
        attr_str: npc.baseAttributes.str,
        attr_dex: npc.baseAttributes.dex,
        attr_con: npc.baseAttributes.con,
        attr_int: npc.baseAttributes.int,
        attr_wis: npc.baseAttributes.wis,
        attr_cha: npc.baseAttributes.cha,
        race: npc.race,
        class: npc.class,
        origin: "campones",
        current_level: npc.level,
        class_levels: { [npc.class]: npc.level },
        hp_max: npc.hp,
        mp_max: npc.mp,
        defense: npc.defense,
      })
      .select("id")
      .single();

    if (charErr || !char) return { error: "Erro ao criar personagem NPC." };

    const { error: partErr } = await admin
      .from("arena_participants")
      .insert({
        arena_id: arenaId,
        character_id: char.id,
        user_id: user.id,
        hp_current: npc.hp,
        mp_current: npc.mp,
      });

    if (partErr) return { error: partErr.message };
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ─── searchArenaItems ─────────────────────────────────────────────────────────

export type CatalogItem = {
  slug: string;
  name: string;
  category: string;
  price_pc: number;
  spaces: number;
};

export async function searchArenaItems(
  query: string
): Promise<CatalogItem[]> {
  if (query.trim().length < 2) return [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("items")
      .select("slug, name, category, price_pc, spaces")
      .eq("is_purchasable", true)
      .ilike("name", `%${query.trim()}%`)
      .order("name")
      .limit(30);
    return data ?? [];
  } catch {
    return [];
  }
}

// ─── dmAddCustomItem ──────────────────────────────────────────────────────────

export async function dmAddCustomItem(input: {
  arenaId: string;
  characterId: string;
  name: string;
  spaces: number;
  notes?: string;
}): Promise<{ ok: true } | { error: string }> {
  try {
    const user = await getAuthUser();
    await assertDm(input.arenaId, user.id);

    const admin = createAdminClient();

    const { data: char } = await admin
      .from("characters")
      .select("user_id")
      .eq("id", input.characterId)
      .single();

    if (!char) return { error: "Personagem não encontrado." };

    const { error } = await admin
      .from("character_inventory")
      .insert({
        character_id: input.characterId,
        user_id: char.user_id,
        item_id: null,
        custom_name: input.name.trim(),
        quantity: 1,
        location: "carried",
        spaces: undefined,
        notes: input.notes?.trim() || null,
        acquired_from: "dm_manual",
      });

    if (error) return { error: error.message };
    revalidatePath(`/characters/${input.characterId}`);
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}

// ─── dmAdjustAttribute ────────────────────────────────────────────────────────

const ATTR_COLUMNS: Record<string, string> = {
  str: "attr_str", dex: "attr_dex", con: "attr_con",
  int: "attr_int", wis: "attr_wis", cha: "attr_cha",
};

export async function dmAdjustAttribute(input: {
  arenaId: string;
  characterId: string;
  attr: "str" | "dex" | "con" | "int" | "wis" | "cha";
  delta: number;
}): Promise<{ ok: true; newValue: number } | { error: string }> {
  try {
    const user = await getAuthUser();
    await assertDm(input.arenaId, user.id);

    const col = ATTR_COLUMNS[input.attr];
    const admin = createAdminClient();

    const { data: char } = await admin
      .from("characters")
      .select(`id, ${col}`)
      .eq("id", input.characterId)
      .single();

    if (!char) return { error: "Personagem não encontrado." };

    const current = (char as unknown as Record<string, number>)[col] ?? 0;
    const newValue = Math.max(-5, Math.min(10, current + input.delta));

    const { error } = await admin
      .from("characters")
      .update({ [col]: newValue })
      .eq("id", input.characterId);

    if (error) return { error: error.message };
    revalidatePath(`/characters/${input.characterId}`);
    return { ok: true, newValue };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro desconhecido." };
  }
}
