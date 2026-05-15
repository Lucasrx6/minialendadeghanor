"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function submit(kind: "password" | "magic") {
    setMessage(undefined);
    startTransition(async () => {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } =
        kind === "magic"
          ? await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
          : mode === "signup"
            ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } })
            : await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (kind === "magic" || mode === "signup") {
        setMessage("Confira seu email para continuar.");
      } else {
        router.push("/characters");
      }
    });
  }

  return (
    <Card className="mx-auto max-w-md space-y-4">
      <SectionTitle>{mode === "signup" ? "Criar conta" : "Entrar"}</SectionTitle>
      <label className="block text-sm font-semibold">
        Email
        <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="block text-sm font-semibold">
        Senha
        <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button disabled={isPending} onClick={() => submit("password")}>
          {mode === "signup" ? "Cadastrar" : "Entrar"}
        </Button>
        <Button type="button" variant="secondary" disabled={isPending || !email} onClick={() => submit("magic")}>
          Magic link
        </Button>
      </div>
      {message && <p className="text-sm font-semibold text-amber-900">{message}</p>}
    </Card>
  );
}
