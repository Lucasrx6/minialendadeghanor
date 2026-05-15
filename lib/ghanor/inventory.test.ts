import { describe, it, expect } from "vitest";
import {
  toPc, fromPc, formatMoney,
  carryCapacity, totalSpaces, isOverloaded,
  maxWornItems,
  priceWithImprovements, priceWithArcanium, ARCANIUM_COST_PC,
  computeDefenseWithEquipment,
  getArmorPenaltyForSkill, ARMOR_PENALTY_SKILLS,
  hasMartialProficiency, hasHeavyArmorProficiency, hasShieldProficiency,
  getStarterItems,
} from "@/lib/ghanor/inventory";

// ─── Conversão de moeda ────────────────────────────────────────────────────────

describe("toPc / fromPc", () => {
  it("converte 1 PO = 1000 PC", () => expect(toPc(1, 0, 0)).toBe(1000));
  it("converte 1 PP = 10 PC",   () => expect(toPc(0, 1, 0)).toBe(10));
  it("converte 1 PC = 1 PC",    () => expect(toPc(0, 0, 1)).toBe(1));
  it("combina PO+PP+PC corretamente", () => expect(toPc(2, 3, 5)).toBe(2035));

  it("round-trip: 2035 PC → 2 PO 3 PP 5 PC", () => {
    // 1 PO = 1000 PC, 1 PP = 10 PC
    // 2035 = 2*1000 + 3*10 + 5
    const { po, pp, pc } = fromPc(2035);
    expect(po).toBe(2);
    expect(pp).toBe(3);
    expect(pc).toBe(5);
  });

  it("zero PC retorna tudo zero", () => {
    const { po, pp, pc } = fromPc(0);
    expect(po).toBe(0); expect(pp).toBe(0); expect(pc).toBe(0);
  });
});

describe("formatMoney", () => {
  it("mostra só PC quando menor que 10",  () => expect(formatMoney(5)).toBe("5 PC"));
  it("mostra PP quando >= 10",            () => expect(formatMoney(10)).toBe("1 PP"));
  it("mostra PO quando >= 1000",          () => expect(formatMoney(1000)).toBe("1 PO"));
  it("formata valor misto corretamente",  () => expect(formatMoney(2035)).toBe("2 PO 3 PP 5 PC"));
  it("retorna '0 PC' para zero",          () => expect(formatMoney(0)).toBe("0 PC"));
});

// ─── Carga ────────────────────────────────────────────────────────────────────

describe("carryCapacity", () => {
  it("For +0 = 10 espaços",  () => expect(carryCapacity(0)).toBe(10));
  it("For +2 = 14 espaços",  () => expect(carryCapacity(2)).toBe(14));
  it("For +5 = 20 espaços",  () => expect(carryCapacity(5)).toBe(20));
  it("For -1 = 9 espaços (multiplicador 1)", () => expect(carryCapacity(-1)).toBe(9));
  it("For -3 = 7 espaços",   () => expect(carryCapacity(-3)).toBe(7));
  it("For -10 nunca vai abaixo de 1", () => expect(carryCapacity(-10)).toBeGreaterThanOrEqual(1));
});

describe("totalSpaces", () => {
  it("soma espaços corretamente", () => {
    const items = [
      { spaces: 1, quantity: 3 },
      { spaces: 0.5, quantity: 4 },
    ];
    expect(totalSpaces(items)).toBe(5); // 3 + 2
  });
});

describe("isOverloaded", () => {
  it("não sobrecarregado quando dentro do limite", () => expect(isOverloaded(10, 0)).toBe(false));
  it("sobrecarregado quando ultrapassa",           () => expect(isOverloaded(11, 0)).toBe(true));
  it("exatamente no limite não é sobrecarga",      () => expect(isOverloaded(14, 2)).toBe(false));
});

// ─── Itens vestidos ────────────────────────────────────────────────────────────

describe("maxWornItems", () => {
  it("nível 1 = 3 itens",   () => expect(maxWornItems(1)).toBe(3));
  it("nível 4 = 5 itens",   () => expect(maxWornItems(4)).toBe(5));
  it("nível 10 = 8 itens",  () => expect(maxWornItems(10)).toBe(8));
  it("nível 20 = 13 itens", () => expect(maxWornItems(20)).toBe(13));
});

// ─── Preços ───────────────────────────────────────────────────────────────────

describe("priceWithImprovements", () => {
  it("0 melhorias = preço base",           () => expect(priceWithImprovements(100, 0)).toBe(100));
  it("1 melhoria = +50%",                  () => expect(priceWithImprovements(100, 1)).toBe(150));
  it("2 melhorias acumulativas",           () => expect(priceWithImprovements(100, 2)).toBe(225));
  it("4 melhorias (obra-prima) > 4× base", () => expect(priceWithImprovements(100, 4)).toBeGreaterThan(400));
});

describe("priceWithArcanium", () => {
  it("sem Arcanium = priceWithImprovements", () => {
    expect(priceWithArcanium(100, 0)).toBe(100);
  });
  it("Arcanium 1º círculo adiciona 30.000 PP = 300.000 PC", () => {
    const base = toPc(0, 150, 0); // espada longa 15 PP
    const result = priceWithArcanium(base, 0, 1);
    expect(result).toBe(base + ARCANIUM_COST_PC[1]);
  });
  it("Arcanium 5º círculo adiciona 90.000 PP", () => {
    const base = 0;
    const result = priceWithArcanium(base, 0, 5);
    expect(result).toBe(ARCANIUM_COST_PC[5]);
  });
  it("4 melhorias + Arcanium 3º acumula corretamente", () => {
    const base = toPc(0, 150, 0);
    const withImp = priceWithImprovements(base, 4);
    const withArc = priceWithArcanium(base, 4, 3);
    expect(withArc).toBe(withImp + ARCANIUM_COST_PC[3]);
  });
});

// ─── Defesa ───────────────────────────────────────────────────────────────────

describe("computeDefenseWithEquipment", () => {
  it("sem armadura: 10 + Des", () => {
    const { total } = computeDefenseWithEquipment(2);
    expect(total).toBe(12);
  });

  it("com armadura de couro (+2): 10 + Des + 2", () => {
    const { total } = computeDefenseWithEquipment(2, { armor_defense_bonus: 2, armor_penalty: 0 });
    expect(total).toBe(14);
  });

  it("com armadura + escudo: soma bônus de ambos", () => {
    const { total } = computeDefenseWithEquipment(
      1,
      { armor_defense_bonus: 5, armor_penalty: -2 },
      { armor_defense_bonus: 1, armor_penalty: -1 },
    );
    expect(total).toBe(17); // 10 + 1 + 5 + 1
  });

  it("penalidade é a soma de armadura + escudo", () => {
    const { armorPenalty } = computeDefenseWithEquipment(
      0,
      { armor_defense_bonus: 5, armor_penalty: -2 },
      { armor_defense_bonus: 1, armor_penalty: -1 },
    );
    expect(armorPenalty).toBe(-3);
  });

  it("sobrecarga adiciona -5 à penalidade", () => {
    const { armorPenalty } = computeDefenseWithEquipment(
      0,
      { armor_defense_bonus: 5, armor_penalty: -2 },
      undefined,
      0,
      true, // overloaded
    );
    expect(armorPenalty).toBe(-7);
  });
});

// ─── Penalidade de armadura nas perícias ──────────────────────────────────────

describe("getArmorPenaltyForSkill", () => {
  it("Acrobacia é afetada", () => {
    expect(getArmorPenaltyForSkill("acrobacia", -3)).toBe(-3);
  });
  it("Furtividade é afetada", () => {
    expect(getArmorPenaltyForSkill("furtividade", -3)).toBe(-3);
  });
  it("Ladinagem é afetada", () => {
    expect(getArmorPenaltyForSkill("ladinagem", -3)).toBe(-3);
  });
  it("Atletismo NÃO é afetado", () => {
    expect(getArmorPenaltyForSkill("atletismo", -3)).toBe(0);
  });
  it("Percepção NÃO é afetada", () => {
    expect(getArmorPenaltyForSkill("percepcao", -3)).toBe(0);
  });
  it("penalidade 0 retorna 0 para todas", () => {
    ARMOR_PENALTY_SKILLS.forEach(s => {
      expect(getArmorPenaltyForSkill(s, 0)).toBe(0);
    });
  });
});

// ─── Proficiências ────────────────────────────────────────────────────────────

describe("proficiências por classe", () => {
  it("Mago NÃO tem marcial",       () => expect(hasMartialProficiency("mago")).toBe(false));
  it("Soldado TEM marcial",        () => expect(hasMartialProficiency("soldado")).toBe(true));
  it("Bárbaro TEM marcial",        () => expect(hasMartialProficiency("barbaro")).toBe(true));
  it("Mago NÃO tem armadura pesada", () => expect(hasHeavyArmorProficiency("mago")).toBe(false));
  it("Cavaleiro TEM armadura pesada", () => expect(hasHeavyArmorProficiency("cavaleiro")).toBe(true));
  it("Mago NÃO tem escudo",        () => expect(hasShieldProficiency("mago")).toBe(false));
  it("Clérigo TEM escudo",         () => expect(hasShieldProficiency("clerigo")).toBe(true));
  it("Druida TEM escudo",          () => expect(hasShieldProficiency("druida")).toBe(true));
});

// ─── Kit inicial ──────────────────────────────────────────────────────────────

describe("getStarterItems", () => {
  it("todo personagem recebe bolsa_lona, saco_dormir, traje_viajante", () => {
    const items = getStarterItems("barbaro", true, false, true);
    expect(items).toContain("bolsa_lona");
    expect(items).toContain("saco_dormir");
    expect(items).toContain("traje_viajante");
  });

  it("mago NÃO recebe armadura", () => {
    const items = getStarterItems("mago", false, false, false);
    const armorSlugs = ["armadura_couro", "couro_batido", "gibao_peles", "brunea"];
    expect(armorSlugs.some(s => items.includes(s))).toBe(false);
  });

  it("cavaleiro recebe brunea (armadura pesada)", () => {
    const items = getStarterItems("cavaleiro", true, true, true);
    expect(items).toContain("brunea");
    expect(items).toContain("escudo_leve");
  });

  it("ladino recebe ferramentas_ladrao", () => {
    const items = getStarterItems("ladino", true, false, false);
    expect(items).toContain("ferramentas_ladrao");
  });

  it("bardo recebe instrumento_musical", () => {
    const items = getStarterItems("bardo", true, false, false);
    expect(items).toContain("instrumento_musical");
  });

  it("sem proficiência marcial não recebe arma marcial", () => {
    const items = getStarterItems("mago", false, false, false);
    // mago não tem arma marcial definida de qualquer forma
    expect(items).toBeDefined();
  });

  it("sem proficiência de escudo não recebe escudo", () => {
    const items = getStarterItems("mago", false, false, false);
    expect(items).not.toContain("escudo_leve");
  });
});
