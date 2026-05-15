import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-amber-700 text-amber-50 shadow-sm hover:bg-amber-800",
    secondary: "border border-amber-700/30 bg-amber-100 text-stone-950 hover:bg-amber-200",
    ghost: "text-stone-800 hover:bg-stone-900/5",
    danger: "bg-red-800 text-red-50 hover:bg-red-900",
  };

  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
