import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-amber-900/15 bg-amber-50/75 p-4 shadow-sm", className)}
      {...props}
    />
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold text-stone-950">{children}</h2>;
}
