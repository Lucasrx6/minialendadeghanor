import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { PageContainer } from "@/components/layout/page-container";
import { BrandLogo } from "@/components/layout/brand-logo";

export default function SignupPage() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,#f5c86a_0,#f6ead0_35%,#efe1bd_100%)]">
      <PageContainer className="flex min-h-dvh flex-col justify-center py-8">
        <BrandLogo size="md" className="mb-6" />
        <AuthForm mode="signup" />
        <p className="mt-6 text-center text-sm">
          Já tem conta?{" "}
          <Link className="font-bold text-amber-900" href="/login">
            Entrar
          </Link>
        </p>
      </PageContainer>
    </main>
  );
}
