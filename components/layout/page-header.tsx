import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  right?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Voltar",
  right,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-4 space-y-2", className)}>
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-bold text-amber-900 active:bg-amber-900/10"
        >
          <ArrowLeft size={18} aria-hidden />
          {backLabel}
        </Link>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-black leading-tight text-stone-950 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-stone-600">{subtitle}</p>}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </header>
  );
}
