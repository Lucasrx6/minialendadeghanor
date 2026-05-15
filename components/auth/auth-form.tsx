"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usernameToAuthEmail } from "@/lib/auth/username";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function submit() {
    setMessage(undefined);
    startTransition(async () => {
      const supabase = createClient();
      const authEmail = usernameToAuthEmail(username);

      if (mode === "signup") {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, recoveryEmail }),
        });
        const json = await response.json();

        if (!response.ok) {
          setMessage(json.error ?? "Nao foi possivel criar a conta.");
          return;
        }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });

      if (error) {
        setMessage(mode === "signup" ? "Conta criada, mas nao consegui entrar automaticamente." : "Usuario ou senha invalidos.");
        return;
      }

      router.push("/characters");
    });
  }

  return (
    <Card className="w-full space-y-5 p-5">
      <SectionTitle>{mode === "signup" ? "Criar conta" : "Entrar"}</SectionTitle>
      <label className="block text-sm font-semibold">
        Nome de usuario
        <Input
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="lucasrx6"
        />
      </label>
      <label className="block text-sm font-semibold">
        Senha
        <Input
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      {mode === "signup" && (
        <label className="block text-sm font-semibold">
          Email de recuperacao
          <Input
            type="email"
            autoComplete="email"
            value={recoveryEmail}
            onChange={(event) => setRecoveryEmail(event.target.value)}
            placeholder="voce@email.com"
          />
          <span className="mt-1 block text-xs font-normal text-stone-600">
            Guardado para uma futura recuperacao de senha quando o SMTP estiver configurado.
          </span>
        </label>
      )}
      <Button
        fullWidth
        size="lg"
        disabled={isPending || !username || !password || (mode === "signup" && !recoveryEmail)}
        onClick={submit}
      >
        {mode === "signup" ? "Cadastrar" : "Entrar"}
      </Button>
      {message && <p className="text-sm font-semibold text-amber-900">{message}</p>}
    </Card>
  );
}
