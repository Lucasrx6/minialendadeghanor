import { describe, expect, it } from "vitest";
import { classById, classes } from "@/lib/ghanor/classes";

describe("classes", () => {
  it("contains the eleven first-level classes", () => {
    expect(classes).toHaveLength(11);
    expect(classById.mago.hpBase).toBe(8);
    expect(classById.clerigo.mpPerLevel).toBe(5);
  });
});
