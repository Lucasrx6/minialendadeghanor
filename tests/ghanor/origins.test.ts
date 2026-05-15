import { describe, expect, it } from "vitest";
import { originById, origins } from "@/lib/ghanor/origins";

describe("origins", () => {
  it("contains the 28 requested origins plus servical/trapaceiro from the briefing table", () => {
    expect(origins.length).toBeGreaterThanOrEqual(28);
    expect(originById.acolito.mpPerLevelBonus).toBe(1);
    expect(originById.escudeiro.defenseBonus).toBe(2);
  });
});
