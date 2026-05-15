import { NextResponse } from "next/server";
import { z } from "zod";
import { usernameToAuthEmail } from "@/lib/auth/username";
import { createAdminClient } from "@/lib/supabase/admin";

const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Use pelo menos 3 caracteres no nome de usuario.")
    .max(32, "Use no maximo 32 caracteres no nome de usuario.")
    .regex(/^[a-zA-Z0-9._-]+$/, "Use apenas letras, numeros, ponto, traco ou underline."),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
  recoveryEmail: z.string().email("Informe um email de recuperacao valido."),
});

export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados invalidos." }, { status: 400 });
  }

  const { username, password, recoveryEmail } = parsed.data;
  const email = usernameToAuthEmail(username);

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: username.trim(),
        recovery_email: recoveryEmail.trim().toLowerCase(),
      },
    });

    if (error) {
      console.error("Supabase signup error:", error.message);
      const normalizedMessage = error.message.toLowerCase();
      const message = normalizedMessage.includes("already") || normalizedMessage.includes("registered")
        ? "Esse nome de usuario ja esta em uso."
        : normalizedMessage.includes("invalid api key") || normalizedMessage.includes("jwt")
          ? "A chave SUPABASE_SERVICE_ROLE_KEY da Vercel esta invalida."
          : normalizedMessage.includes("email")
            ? `Erro no email interno do usuario: ${error.message}`
            : `Nao foi possivel criar a conta agora: ${error.message}`;
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ userId: data.user?.id, email });
  } catch (error) {
    console.error("Signup route error:", error);
    return NextResponse.json(
      { error: "Cadastro sem confirmacao por email exige SUPABASE_SERVICE_ROLE_KEY no servidor." },
      { status: 500 },
    );
  }
}
