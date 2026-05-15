import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-amber-900/15 bg-amber-50/80 p-4 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-base font-bold text-stone-950 sm:text-lg">
      {icon}
      {children}
    </h2>
  );
}
