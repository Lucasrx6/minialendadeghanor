import { describe, expect, it } from "vitest";
import { skillById, skills } from "@/lib/ghanor/skills";

describe("skills", () => {
  it("maps table 2-1 skills with attributes", () => {
    expect(skills).toHaveLength(27);
    expect(skillById.luta.attribute).toBe("str");
    expect(skillById.ladinagem.trainedOnly).toBe(true);
  });
});
