import { describe, it, expect } from "vitest";
import { generateShopInventory, stagePrice, STAGES } from "@/lib/ghanor/shop";

const sampleCatalog = [
  { slug: "foice", category: "arma", price_pc: 40, min_stage: 1 },
  { slug: "montante", category: "arma", price_pc: 5000, min_stage: 4 },
  { slug: "pao", category: "bens_comuns", price_pc: 5, min_stage: 1 },
  { slug: "poção_cura", category: "alquimico_preparado", price_pc: 50, min_stage: 3 },
];

describe("generateShopInventory", () => {
  it("etapa 1 ferreiro inclui foice e exclui montante", () => {
    const stock = generateShopInventory(sampleCatalog, 1, "ferreiro");
    expect(stock.foice).toBeGreaterThan(0);
    expect(stock.montante).toBeUndefined();
    expect(stock.pao).toBeUndefined();
  });

  it("mercador geral na etapa 3 inclui bens comuns", () => {
    const stock = generateShopInventory(sampleCatalog, 3, "geral");
    expect(stock.pao).toBeGreaterThan(0);
  });

  it("modo DM libera todo o catálogo", () => {
    const stock = generateShopInventory(sampleCatalog, 1, "geral", true);
    expect(Object.keys(stock).length).toBe(sampleCatalog.length);
  });
});

describe("stagePrice", () => {
  it("aplica multiplicador da etapa 1", () => {
    expect(stagePrice(100, 1)).toBe(120);
    expect(stagePrice(100, 3)).toBe(100);
  });
});

describe("STAGES", () => {
  it("etapa 5 desbloqueia itens raros", () => {
    expect(STAGES[5].unlocksRareItems).toBe(true);
  });
});
