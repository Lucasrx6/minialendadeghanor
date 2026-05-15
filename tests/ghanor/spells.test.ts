import { describe, expect, it } from "vitest";
import { spells } from "@/lib/ghanor/spells";

describe("spells", () => {
  it("seeds first-circle spells for caster MVP flow", () => {
    expect(spells.length).toBeGreaterThanOrEqual(8);
    expect(spells.some((spell) => spell.classes.includes("mago"))).toBe(true);
    expect(spells.some((spell) => spell.classes.includes("clerigo"))).toBe(true);
  });
});
