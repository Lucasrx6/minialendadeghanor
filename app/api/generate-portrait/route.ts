import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const inputSchema = z.object({
  characterId: z.string().uuid(),
  race: z.string(),
  class: z.string(),
  appearance: z.string().optional().nullable(),
  age: z.number().optional().nullable(),
  concept: z.string().optional().nullable(),
});

const raceDescriptors: Record<string, string> = {
  humano: "human",
  anao: "stocky, bearded dwarf with intricate braids",
  elfo: "slender elf with long pointed ears and nature-toned coloring",
  gigante: "massive 3-meter-tall giant with broad shoulders and small eyes, wearing rough furs",
  hobgoblin: "tall hobgoblin with yellowish fur, animalistic snout, and tusks",
  meio_elfo: "half-elf with elegant elven features and human stature",
  aberrante: "uncanny aberrant being mutated by the Devourer's black oil",
};

const classDescriptors: Record<string, string> = {
  barbaro: "wielding a massive axe with a fierce battle stance",
  bardo: "holding a lute and wearing bright traveling clothes",
  bucaneiro: "with a rapier, confident grin, and duelist posture",
  cacador: "carrying a bow and weathered survival gear",
  cavaleiro: "wearing knightly armor and carrying a heraldic shield",
  clerigo: "holding a sacred symbol with solemn devotion",
  druida: "with natural charms, leaves, and an animal companion silhouette",
  ladino: "wearing a hooded cloak with daggers at the belt",
  mago: "holding an arcane staff with glowing runes",
  nobre: "wearing refined court clothes with commanding presence",
  soldado: "in practical armor with a disciplined military stance",
};

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Geração de retrato não configurada neste ambiente." }, { status: 503 });
  }

  const body = inputSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Dados inválidos para gerar o retrato." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Entre na sua conta para gerar retratos." }, { status: 401 });

  const { data: character } = await supabase
    .from("characters")
    .select("id,user_id,portrait_generated_at")
    .eq("id", body.data.characterId)
    .single();

  if (!character || character.user_id !== user.id) {
    return NextResponse.json({ error: "Personagem não encontrado." }, { status: 404 });
  }

  if (character.portrait_generated_at) {
    const last = new Date(character.portrait_generated_at).getTime();
    if (Date.now() - last < 8 * 60 * 60 * 1000) {
      return NextResponse.json({ error: "Limite simples: aguarde algumas horas antes de gerar outro retrato." }, { status: 429 });
    }
  }

  const prompt = [
    `A detailed fantasy portrait of a ${raceDescriptors[body.data.race] ?? "fantasy adventurer"} ${classDescriptors[body.data.class] ?? "adventurer"}.`,
    body.data.appearance,
    body.data.age ? `Aged around ${body.data.age}.` : undefined,
    body.data.concept,
    "Medieval high fantasy setting inspired by classic tabletop RPG art. Painterly style, dramatic lighting, three-quarter view, neutral background.",
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const image = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      quality: "high",
      n: 1,
    });

    const b64 = image.data?.[0]?.b64_json;
    if (!b64) throw new Error("A imagem não retornou dados.");

    const admin = createAdminClient();
    const bytes = Buffer.from(b64, "base64");
    const path = `${user.id}/${body.data.characterId}.png`;
    const { error: uploadError } = await admin.storage
      .from("character-portraits")
      .upload(path, bytes, { contentType: "image/png", upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrl } = admin.storage.from("character-portraits").getPublicUrl(path);
    await admin
      .from("characters")
      .update({
        portrait_url: publicUrl.publicUrl,
        portrait_prompt: prompt,
        portrait_generated_at: new Date().toISOString(),
      })
      .eq("id", body.data.characterId)
      .eq("user_id", user.id);

    return NextResponse.json({ url: publicUrl.publicUrl });
  } catch {
    return NextResponse.json({ error: "Não conseguimos gerar o retrato agora - tente novamente." }, { status: 500 });
  }
}
