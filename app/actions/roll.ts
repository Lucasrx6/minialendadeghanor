"use server";

import { randomInt } from "node:crypto";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const RollInputSchema = z.object({
  characterId: z.string().uuid(),
  label: z.string().min(1).max(80),
  modifierBase: z.number().int().min(-20).max(20),
  modifierTrain: z.number().int().min(0).max(10),
  modifierLevel: z.number().int().min(0).max(10),
  modifierScene: z.number().int().min(-10).max(10).default(0),
  cd: z.number().int().min(1).max(99).nullable(),
  mode: z.enum(["standard", "opposed", "aided"]).default("standard"),
  opponent: z.object({ modifier: z.number().int().min(-20).max(50) }).optional(),
  helpers: z.array(z.object({ modifier: z.number().int().min(-20).max(50) })).optional(),
});

export type RollInput = z.infer<typeof RollInputSchema>;

export type RollResult = {
  naturalRoll: number;
  total: number;
  modifierTotal: number;
  outcome: string;
  opponent?: { naturalRoll: number; total: number };
  helpers?: Array<{ naturalRoll: number; total: number; passed: boolean; bonus: number }>;
  helpBonus?: number;
  error?: string;
};

// ─── Server action ────────────────────────────────────────────────────────────

export async function rollDice(raw: RollInput): Promise<RollResult> {
  const parsed = RollInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { naturalRoll: 0, total: 0, modifierTotal: 0, outcome: "no_cd", error: "Dados inválidos." };
  }
  const input = parsed.data;

  // Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { naturalRoll: 0, total: 0, modifierTotal: 0, outcome: "no_cd", error: "Não autenticado." };

  // Verifica posse do personagem
  const { data: character } = await supabase
    .from("characters")
    .select("id, user_id")
    .eq("id", input.characterId)
    .eq("user_id", user.id)
    .single();

  if (!character) return { naturalRoll: 0, total: 0, modifierTotal: 0, outcome: "no_cd", error: "Personagem não encontrado." };

  // Rola o dado (crypto.randomInt é melhor que Math.random para RNG)
  const naturalRoll = randomInt(1, 21); // 1..20 inclusive
  const modifierTotal = input.modifierBase + input.modifierTrain + input.modifierLevel + input.modifierScene;
  const total = naturalRoll + modifierTotal;

  let outcome: string;
  let opponentResult: { naturalRoll: number; total: number } | undefined;
  let helperResults: Array<{ naturalRoll: number; total: number; passed: boolean; bonus: number }> | undefined;
  let helpBonus = 0;
  const metadata: Record<string, unknown> = {};

  // 20 e 1 natural são sempre críticos (independente de CD)
  const isCritSuccess = naturalRoll === 20;
  const isCritFail = naturalRoll === 1;

  if (input.mode === "opposed" && input.opponent) {
    // Modo oposto: rola adversário
    const oppRoll = randomInt(1, 21);
    const oppTotal = oppRoll + input.opponent.modifier;
    opponentResult = { naturalRoll: oppRoll, total: oppTotal };

    if (isCritSuccess) outcome = "crit_success";
    else if (isCritFail) outcome = "crit_failure";
    else if (total > oppTotal) outcome = "opposed_win";
    else if (total < oppTotal) outcome = "opposed_lose";
    else {
      // Empate: maior modificador vence
      if (modifierTotal > input.opponent.modifier) outcome = "opposed_win";
      else if (modifierTotal < input.opponent.modifier) outcome = "opposed_lose";
      else outcome = "opposed_tie"; // empate total: rolar de novo (sinaliza ao cliente)
    }

    metadata.opponent_modifier = input.opponent.modifier;
    metadata.opponent_roll = oppRoll;
    metadata.opponent_total = oppTotal;

  } else if (input.mode === "aided" && input.helpers && input.helpers.length > 0) {
    // Modo com ajuda: cada ajudante rola contra CD 10
    helperResults = input.helpers.map((h) => {
      const hRoll = randomInt(1, 21);
      const hTotal = hRoll + h.modifier;
      const passed = hTotal >= 10;
      // +1 base + 1 extra a cada 10 pontos acima da CD
      const bonus = passed ? 1 + Math.floor((hTotal - 10) / 10) : 0;
      return { naturalRoll: hRoll, total: hTotal, passed, bonus };
    });
    helpBonus = helperResults.reduce((sum, h) => sum + h.bonus, 0);
    const adjustedTotal = total + helpBonus;

    if (isCritSuccess) outcome = "crit_success";
    else if (isCritFail) outcome = "crit_failure";
    else if (!input.cd) outcome = "no_cd";
    else outcome = adjustedTotal >= input.cd ? "success" : "failure";

    metadata.helpers = helperResults;
    metadata.help_bonus = helpBonus;

  } else {
    // Modo padrão
    if (isCritSuccess) outcome = "crit_success";
    else if (isCritFail) outcome = "crit_failure";
    else if (!input.cd) outcome = "no_cd";
    else outcome = total >= input.cd ? "success" : "failure";
  }

  // Persiste no Supabase
  const admin = createAdminClient();
  await admin.from("rolls").insert({
    character_id: input.characterId,
    user_id: user.id,
    label: input.label,
    modifier_base: input.modifierBase,
    modifier_train: input.modifierTrain,
    modifier_level: input.modifierLevel,
    modifier_scene: input.modifierScene,
    modifier_total: modifierTotal,
    cd: input.cd,
    natural_roll: naturalRoll,
    total: naturalRoll + modifierTotal, // persistir sem helpBonus (helpBonus vai em metadata)
    outcome,
    mode: input.mode,
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
  });

  return {
    naturalRoll,
    total,
    modifierTotal,
    outcome,
    opponent: opponentResult,
    helpers: helperResults,
    helpBonus,
  };
}
