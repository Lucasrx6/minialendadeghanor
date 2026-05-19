import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { buildPortraitPrompt } from "@/lib/ghanor/portrait";

const POLLINATIONS_URL = "https://image.pollinations.ai/prompt";

const inputSchema = z.object({
  characterId: z.string().uuid(),
  race: z.string(),
  class: z.string(),
  appearance: z.string().optional().nullable(),
  age: z.number().optional().nullable(),
  concept: z.string().optional().nullable(),
});

export async function POST(request: Request) {
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
    // Pollinations AI — gratuito, sem API key, modelos FLUX
    const encodedPrompt = encodeURIComponent(prompt);
    const imageRes = await fetch(
      `${POLLINATIONS_URL}/${encodedPrompt}?width=512&height=768&nologo=true&model=flux`,
      { signal: AbortSignal.timeout(90_000) }
    );

    if (!imageRes.ok) {
      throw new Error(`Pollinations retornou status ${imageRes.status}.`);
    }

    const imageBuffer = await imageRes.arrayBuffer();
    const bytes = Buffer.from(imageBuffer);
    const mimeType = "image/jpeg";

    if (bytes.length < 1000) throw new Error("A imagem retornada está vazia.");

    const admin = createAdminClient();
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
