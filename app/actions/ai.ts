"use server";

import { classById } from "@/lib/ghanor/classes";
import { originById } from "@/lib/ghanor/origins";
import { raceById } from "@/lib/ghanor/races";

export async function generateBackstory(input: {
  race: string;
  classId: string;
  origin: string;
  concept: string;
  name?: string;
  extraContext?: string;
}): Promise<{ history: string } | { error: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { error: "Chave de API não configurada. Adicione GROQ_API_KEY ao .env.local." };

  const raceName = raceById[input.race as keyof typeof raceById]?.name ?? input.race;
  const className = classById[input.classId as keyof typeof classById]?.name ?? input.classId;
  const originName = originById[input.origin as keyof typeof originById]?.name ?? input.origin;

  const prompt = `Você é um narrador de RPG criando um background para um personagem de "A Lenda de Ghanor", um TTRPG brasileiro de fantasia medieval inspirado em Tormenta20.

Personagem:
- Nome: ${input.name || "Desconhecido"}
- Raça: ${raceName}
- Classe: ${className}
- Antecedente: ${originName}
- Conceito: ${input.concept}
${input.extraContext ? `- Contexto adicional do jogador: ${input.extraContext}` : ""}

Escreva um background de personagem em português brasileiro com exatamente 3 parágrafos curtos e diretos.

O texto deve:
- Ser escrito na terceira pessoa
- Descrever brevemente a origem e infância do personagem
- Explicar como ele/ela tornou-se um(a) aventureiro(a)
- Incluir uma motivação ou evento marcante que define o personagem
- Ter tom épico mas acessível para jogadores iniciantes
- Respeitar as características típicas da raça e classe

Escreva apenas o texto corrido, sem títulos, sem cabeçalhos, sem listas.`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.9,
      }),
    });

    if (!res.ok) {
      return { error: `Erro da API Groq: ${res.status}` };
    }

    const json = await res.json();
    const history = (json.choices?.[0]?.message?.content as string | undefined)?.trim();
    if (!history) return { error: "Resposta vazia da IA." };
    return { history };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao conectar com a IA." };
  }
}
