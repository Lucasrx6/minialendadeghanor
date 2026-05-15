import * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-md border border-amber-900/20 bg-white/80 px-3 text-sm text-stone-950 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20",
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
        "min-h-24 w-full rounded-md border border-amber-900/20 bg-white/80 px-3 py-2 text-sm text-stone-950 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20",
        props.className,
      )}
    />
  );
}
