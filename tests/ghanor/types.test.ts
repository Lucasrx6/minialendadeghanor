import { describe, expect, it } from "vitest";
import { attributeLabels, attributes } from "@/lib/ghanor/types";

describe("types", () => {
  it("lists the six core attributes", () => {
    expect(attributes).toEqual(["str", "dex", "con", "int", "wis", "cha"]);
    expect(attributeLabels.cha).toBe("Car");
  });
});
