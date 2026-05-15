import * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "min-h-12 w-full rounded-xl border border-amber-900/20 bg-white/80 px-4 text-base text-stone-950 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20",
        props.className,
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full rounded-xl border border-amber-900/20 bg-white/80 px-4 py-3 text-base text-stone-950 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20",
        props.className,
      )}
    />
  );
}
