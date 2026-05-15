import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "default" | "lg" | "icon";
  fullWidth?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "default",
  fullWidth,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-amber-700 text-amber-50 shadow-sm active:bg-amber-800",
    secondary: "border border-amber-700/30 bg-amber-100 text-stone-950 active:bg-amber-200",
    ghost: "text-stone-800 active:bg-stone-900/5",
    danger: "bg-red-800 text-red-50 active:bg-red-900",
  };

  const sizes = {
    default: "min-h-11 px-4 text-sm",
    lg: "min-h-12 px-6 text-base",
    icon: "h-11 w-11 shrink-0 p-0",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
