import { describe, it, expect } from "vitest";
import { computeCharacter, type Answer } from "../lib/ghanor/quiz-engine";
import { pointBuySpent } from "../lib/ghanor/rules";
import { QUESTIONS } from "../lib/ghanor/quiz";

describe("quiz-engine", () => {
  it("should generate a warrior character", () => {
    // Combat-focused answers
    const answers: Answer[] = [
      { questionId: 1, optionId: "d" }, // str, wis, sobrevivencia, atletismo
      { questionId: 2, optionId: "a" }, // str, con, cavaleiro, soldado, barbaro
      { questionId: 3, optionId: "d" }, // str, dex, soldado, cavaleiro
      { questionId: 4, optionId: "a" }, // con, cha, cavaleiro, nobre, soldado
      { questionId: 5, optionId: "a" }, // str, wis, soldado, barbaro, cavaleiro
      { questionId: 6, optionId: "a" }, // con, wis, cavaleiro, clerigo, barbaro
      { questionId: 7, optionId: "a" }, // str, con, cavaleiro, barbaro, soldado
      { questionId: 8, optionId: "a" }, // str, cha, cavaleiro, barbaro, soldado
      { questionId: 9, optionId: "a" }, // str, con, barbaro, soldado, cavaleiro
      { questionId: 10, optionId: "a" }, // cha, str, barbaro, soldado, nobre
      { questionId: 11, optionId: "c" }, // str, con, barbaro, cavaleiro, soldado
      { questionId: 12, optionId: "a" }, // str, cha, cavaleiro, barbaro, soldado
      { questionId: 13, optionId: "a" }, // str, dex, soldado, cavaleiro, cacador
      { questionId: 14, optionId: "c" }, // str, cha, barbaro, nobre
      { questionId: 15, optionId: "c" }, // str, con, soldado, cavaleiro, barbaro
      { questionId: 16, optionId: "d" }, // int, wis, cavaleiro, soldado, cacador
      { questionId: 17, optionId: "a" }, // con, str, cavaleiro, soldado
      { questionId: 18, optionId: "a" }, // con, str, barbaro, soldado, cavaleiro
    ];

    const char = computeCharacter(answers, "humano", {}, "masc");

    // Point buy should not exceed 10 or be less than 8 generally
    expect(pointBuySpent(char.baseAttributes)).toBeLessThanOrEqual(10);
    expect(pointBuySpent(char.baseAttributes)).toBeGreaterThan(0);

    // Should prioritize STR and CON
    expect(char.baseAttributes.str).toBeGreaterThanOrEqual(2);
    expect(char.baseAttributes.con).toBeGreaterThanOrEqual(2);

    // Classes should be combat focused
    expect(["cavaleiro", "soldado", "barbaro"]).toContain(char.suggestedClasses[0]);
    expect(char.suggestedOrigins.length).toBe(5);

    // Gender parsing check
    expect(char.concept).toContain("Um humano");
  });

  it("should generate a mage character", () => {
    // Magic/Erudite focused answers
    const answers: Answer[] = [
      { questionId: 1, optionId: "c" }, // int, cha
      { questionId: 2, optionId: "b" }, // dex, int
      { questionId: 3, optionId: "c" }, // int, wis, mago
      { questionId: 4, optionId: "b" }, // dex, int, mago
      { questionId: 5, optionId: "b" }, // int, wis, mago
      { questionId: 6, optionId: "c" }, // wis, cha, mago
      { questionId: 7, optionId: "c" }, // wis, int, mago
      { questionId: 8, optionId: "c" }, // cha, wis, nobre
      { questionId: 9, optionId: "d" }, // int, cha, mago
      { questionId: 10, optionId: "d" }, // int, cha, mago
      { questionId: 11, optionId: "a" }, // int, wis, mago
      { questionId: 12, optionId: "b" }, // int, wis, mago
      { questionId: 13, optionId: "b" }, // int, wis, mago
      { questionId: 14, optionId: "b" }, // int, wis
      { questionId: 15, optionId: "a" }, // int, mago
      { questionId: 16, optionId: "c" }, // int, wis, mago
      { questionId: 17, optionId: "b" }, // int, wis, mago
      { questionId: 18, optionId: "c" }, // int, mago
    ];

    const char = computeCharacter(answers, "elfo", {}, "fem");

    // Point buy check
    expect(pointBuySpent(char.baseAttributes)).toBeLessThanOrEqual(10);

    // Prioritize INT
    expect(char.baseAttributes.int).toBeGreaterThanOrEqual(3);

    // Class should be mago
    expect(char.suggestedClasses[0]).toBe("mago");

    // Skills should be correctly assigned including INT bonus
    // Mago starts with misticismo and vontade. 
    // And extra skills due to int.
    expect(char.trainedSkills.length).toBeGreaterThan(2);

    expect(char.concept).toContain("Uma elfa maga");
  });
});
