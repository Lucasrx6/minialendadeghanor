import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignupPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <AuthForm mode="signup" />
      <p className="mt-4 text-center text-sm">
        Já tem conta? <Link className="font-bold text-amber-900" href="/login">Entrar</Link>
      </p>
    </main>
  );
}
