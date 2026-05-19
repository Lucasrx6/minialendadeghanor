"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function uploadPortrait(
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  try {
    const characterId = formData.get("characterId");
    const file = formData.get("file");

    if (typeof characterId !== "string" || !(file instanceof File)) {
      return { error: "Dados inválidos." };
    }
    if (!file.type.startsWith("image/")) {
      return { error: "Apenas imagens são aceitas." };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { error: "Imagem muito grande (máx. 5 MB)." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Entre na sua conta para fazer upload." };

    const { data: character } = await supabase
      .from("characters")
      .select("id, user_id")
      .eq("id", characterId)
      .eq("user_id", user.id)
      .single();
    if (!character) return { error: "Personagem não encontrado." };

    const bytes = await file.arrayBuffer();
    const admin = createAdminClient();
    const path = `${user.id}/${characterId}.png`;

    const { error: uploadError } = await admin.storage
      .from("character-portraits")
      .upload(path, bytes, { contentType: "image/jpeg", upsert: true });
    if (uploadError) throw uploadError;

    const { data: urlData } = admin.storage
      .from("character-portraits")
      .getPublicUrl(path);

    await admin
      .from("characters")
      .update({ portrait_url: urlData.publicUrl })
      .eq("id", characterId)
      .eq("user_id", user.id);

    revalidatePath(`/characters/${characterId}`);
    // Return with cache-buster so the browser loads the fresh image immediately
    return { url: `${urlData.publicUrl}?t=${Date.now()}` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao enviar imagem." };
  }
}
