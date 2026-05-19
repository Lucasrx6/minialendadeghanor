import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { buildPortraitPrompt } from "@/lib/ghanor/portrait";

const inputSchema = z.object({
  characterId: z.string().uuid(),
  race: z.string(),
  class: z.string(),
  appearance: z.string().optional().nullable(),
  age: z.number().optional().nullable(),
  concept: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Geração de retrato não configurada neste ambiente. Adicione GEMINI_API_KEY ao .env.local." },
      { status: 503 }
    );
  }

  const body = inputSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Dados inválidos para gerar o retrato." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Entre na sua conta para gerar retratos." }, { status: 401 });

  const { data: character } = await supabase
    .from("characters")
    .select("id, user_id, portrait_generated_at")
    .eq("id", body.data.characterId)
    .single();

  if (!character || character.user_id !== user.id) {
    return NextResponse.json({ error: "Personagem não encontrado." }, { status: 404 });
  }

  if (character.portrait_generated_at) {
    const last = new Date(character.portrait_generated_at).getTime();
    if (Date.now() - last < 8 * 60 * 60 * 1000) {
      return NextResponse.json(
        { error: "Aguarde algumas horas antes de gerar outro retrato." },
        { status: 429 }
      );
    }
  }

  const prompt = buildPortraitPrompt({
    race: body.data.race,
    classId: body.data.class,
    appearance: body.data.appearance,
    age: body.data.age,
    concept: body.data.concept,
  });

  try {
    // Imagen 3 via Google AI — free tier via AI Studio key
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.json().catch(() => ({}));
      const msg = (errBody as { error?: { message?: string } }).error?.message ?? "Erro na API Gemini.";
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const geminiData = await geminiRes.json() as {
      predictions?: Array<{ bytesBase64Encoded?: string; mimeType?: string }>;
    };

    const b64 = geminiData.predictions?.[0]?.bytesBase64Encoded;
    const mimeType = geminiData.predictions?.[0]?.mimeType ?? "image/png";

    if (!b64) throw new Error("A imagem não retornou dados da API.");

    const admin = createAdminClient();
    const bytes = Buffer.from(b64, "base64");
    const path = `${user.id}/${body.data.characterId}.png`;

    const { error: uploadError } = await admin.storage
      .from("character-portraits")
      .upload(path, bytes, { contentType: mimeType, upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = admin.storage.from("character-portraits").getPublicUrl(path);

    await admin
      .from("characters")
      .update({
        portrait_url: urlData.publicUrl,
        portrait_prompt: prompt,
        portrait_generated_at: new Date().toISOString(),
      })
      .eq("id", body.data.characterId)
      .eq("user_id", user.id);

    return NextResponse.json({ url: `${urlData.publicUrl}?t=${Date.now()}` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido.";
    return NextResponse.json({ error: `Não conseguimos gerar o retrato: ${msg}` }, { status: 500 });
  }
}
