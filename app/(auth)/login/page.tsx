import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <AuthForm mode="login" />
      <p className="mt-4 text-center text-sm">
        Ainda não tem conta? <Link className="font-bold text-amber-900" href="/signup">Criar conta</Link>
      </p>
    </main>
  );
}
