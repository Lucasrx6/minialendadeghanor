import { describe, expect, it } from "vitest";
import { classes } from "@/lib/ghanor/classes";
import { races } from "@/lib/ghanor/races";
import {
  calculateDefense,
  calculateHp,
  calculateMp,
  calculateSkillBonus,
  getFinalAttributes,
  getMovement,
  rollTotalToAttribute,
} from "@/lib/ghanor/rules";
import type { CharacterBuild } from "@/lib/ghanor/types";

const base = {
  str: 1,
  dex: 1,
  con: 1,
  int: 1,
  wis: 1,
  cha: 1,
};

function build(patch: Partial<CharacterBuild>): CharacterBuild {
  return {
    race: "humano",
    class: "barbaro",
    origin: "acolito",
    baseAttributes: base,
    raceChoices: { attributes: ["str", "dex", "con"], mutations: [] },
    classChoices: { initialSkill: "luta" },
    trainedSkills: ["luta"],
    ...patch,
  };
}

describe("rules", () => {
  it("converts roll totals according to the attribute table", () => {
    expect(rollTotalToAttribute(7)).toBe(-2);
    expect(rollTotalToAttribute(12)).toBe(1);
    expect(rollTotalToAttribute(18)).toBe(4);
  });

  it("covers one attribute example for every race", () => {
    for (const race of races) {
      const result = getFinalAttributes(
        build({
          race: race.id,
          raceChoices:
            race.id === "humano"
              ? { attributes: ["str", "dex", "con"], mutations: [] }
              : race.id === "meio_elfo"
                ? { attributes: [], extraAttribute: "str", mutations: [] }
                : race.id === "aberrante"
                  ? { attributes: [], mutations: ["musculoso", "resistente", "veloz", "ascetico"] }
                  : { attributes: [], mutations: [] },
        }),
      );
      expect(Object.values(result).every((value) => Number.isFinite(value))).toBe(true);
    }
  });

  it("covers hp/mp examples for every class", () => {
    for (const klass of classes) {
      const character = build({ class: klass.id });
      expect(calculateHp(character)).toBeGreaterThan(0);
      expect(calculateMp(character)).toBeGreaterThan(0);
    }
  });

  it("calculates defense, movement and trained skill bonus", () => {
    const character = build({ armor: "couro", shield: "escudo_leve" });
    expect(calculateDefense(character)).toBe(15);
    expect(getMovement(character)).toBe(9);
    expect(calculateSkillBonus(character, "luta")).toBe(4);
  });
});
