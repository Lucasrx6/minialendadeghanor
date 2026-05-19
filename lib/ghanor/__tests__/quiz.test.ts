import { describe, it, expect } from "vitest";
import { computeCharacter } from "../quiz-engine";
import type { Answer } from "../quiz-engine";
import type { ClassKey } from "../quiz";

type AnswerCode = "a" | "b" | "c" | "d";

function makeAnswers(map: Record<number, AnswerCode>): Answer[] {
  return Object.entries(map).map(([qId, optionId]) => ({
    questionId: Number(qId),
    optionId,
  }));
}

// Ideal answer paths — each set pushes hard toward one class
const idealAnswers: Record<ClassKey, Record<number, AnswerCode>> = {
  barbaro: {
    1: "a", 2: "a", 3: "c", 4: "d", 5: "a", 6: "a",
    7: "a", 8: "d", 9: "b", 10: "a", 11: "b", 12: "a", 13: "a",
    14: "a", 15: "c", 16: "a", 17: "a", 18: "a",
  },
  bardo: {
    1: "b", 2: "c", 3: "b", 4: "b", 5: "c", 6: "b",
    7: "b", 8: "a", 9: "c", 10: "b", 11: "d", 12: "b", 13: "d",
    14: "b", 15: "d", 16: "a", 17: "c", 18: "c",
  },
  bucaneiro: {
    1: "b", 2: "c", 3: "d", 4: "b", 5: "c", 6: "b",
    7: "b", 8: "a", 9: "b", 10: "d", 11: "d", 12: "c", 13: "d",
    14: "b", 15: "d", 16: "b", 17: "c", 18: "d",
  },
  cacador: {
    1: "c", 2: "b", 3: "c", 4: "d", 5: "c", 6: "b",
    7: "c", 8: "b", 9: "b", 10: "d", 11: "a", 12: "c", 13: "c",
    14: "d", 15: "c", 16: "d", 17: "b", 18: "d",
  },
  cavaleiro: {
    1: "a", 2: "b", 3: "c", 4: "a", 5: "d", 6: "a",
    7: "a", 8: "d", 9: "d", 10: "c", 11: "a", 12: "a", 13: "a",
    14: "a", 15: "c", 16: "a", 17: "a", 18: "a",
  },
  clerigo: {
    1: "c", 2: "b", 3: "b", 4: "a", 5: "d", 6: "c",
    7: "d", 8: "b", 9: "a", 10: "c", 11: "a", 12: "d", 13: "c",
    14: "a", 15: "b", 16: "c", 17: "a", 18: "c",
  },
  druida: {
    1: "c", 2: "b", 3: "c", 4: "d", 5: "c", 6: "c",
    7: "c", 8: "b", 9: "a", 10: "c", 11: "d", 12: "d", 13: "c",
    14: "d", 15: "b", 16: "c", 17: "a", 18: "c",
  },
  ladino: {
    1: "b", 2: "c", 3: "d", 4: "b", 5: "c", 6: "d",
    7: "c", 8: "c", 9: "a", 10: "d", 11: "d", 12: "c", 13: "d",
    14: "b", 15: "d", 16: "b", 17: "b", 18: "d",
  },
  mago: {
    1: "d", 2: "c", 3: "a", 4: "c", 5: "b", 6: "b",
    7: "c", 8: "c", 9: "a", 10: "d", 11: "a", 12: "b", 13: "b",
    14: "c", 15: "a", 16: "b", 17: "b", 18: "b",
  },
  nobre: {
    1: "d", 2: "d", 3: "b", 4: "a", 5: "d", 6: "b",
    7: "d", 8: "a", 9: "c", 10: "c", 11: "c", 12: "b", 13: "d",
    14: "a", 15: "d", 16: "a", 17: "d", 18: "c",
  },
  soldado: {
    1: "a", 2: "b", 3: "c", 4: "a", 5: "a", 6: "a",
    7: "a", 8: "d", 9: "b", 10: "a", 11: "a", 12: "a", 13: "a",
    14: "d", 15: "c", 16: "a", 17: "a", 18: "a",
  },
};

describe("Quiz — cada classe é atingível como resultado #1", () => {
  for (const [className, answerMap] of Object.entries(idealAnswers) as [ClassKey, Record<number, AnswerCode>][]) {
    it(`responder de forma ideal puxa para ${className}`, () => {
      const answers = makeAnswers(answerMap);
      const result = computeCharacter(answers, "humano", {});
      expect(result.suggestedClasses[0]).toBe(className);
    });
  }
});
