import { describe, expect, it } from "vitest";
import { powerById, powers } from "@/lib/ghanor/powers";

describe("powers", () => {
  it("seeds relevant first-level general and combat powers", () => {
    expect(powers.length).toBeGreaterThan(0);
    expect(powerById.ataque_poderoso.type).toBe("combate");
  });
});
