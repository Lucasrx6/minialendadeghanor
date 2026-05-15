import { describe, expect, it } from "vitest";
import { randomCharacterName, randomNameOptions } from "@/lib/ghanor/names";

describe("names", () => {
  it("generates race-flavored random names", () => {
    expect(randomCharacterName("anao", () => 0)).toBe("Brombarba");
    expect(randomNameOptions("elfo", 3)).toHaveLength(3);
  });
});
