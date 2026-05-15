import { z } from "zod";
import { attributes } from "@/lib/ghanor/types";

export const characterFormSchema = z.object({
  name: z.string().min(1, "Dê um nome ao personagem."),
  concept: z.string().optional(),
  attrMethod: z.enum(["points", "rolls"]),
  attributes: z.object({
    str: z.number().min(-2).max(5),
    dex: z.number().min(-2).max(5),
    con: z.number().min(-2).max(5),
    int: z.number().min(-2).max(5),
    wis: z.number().min(-2).max(5),
    cha: z.number().min(-2).max(5),
  }),
  race: z.string(),
  class: z.string(),
  origin: z.string(),
  trainedSkills: z.array(z.string()).default([]),
  powers: z.array(z.string()).default([]),
  spells: z.array(z.string()).default([]),
});

export type CharacterFormInput = z.infer<typeof characterFormSchema>;

export function isAttribute(value: string) {
  return attributes.includes(value as (typeof attributes)[number]);
}
