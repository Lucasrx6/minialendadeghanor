import { describe, expect, it } from "vitest";
import { aberrantMutations, raceById, races } from "@/lib/ghanor/races";

describe("races", () => {
  it("contains the seven playable races and aberrant mutations", () => {
    expect(races).toHaveLength(7);
    expect(raceById.gigante.size).toBe("grande");
    expect(aberrantMutations).toHaveLength(10);
  });
});
