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
    primary: "bg-amber-700 text-amber-50 shadow-sm hover:bg-amber-600 hover:shadow-md active:bg-amber-800 active:scale-95",
    secondary: "border border-amber-700/30 bg-amber-100 text-stone-950 hover:bg-amber-200 hover:border-amber-700/60 active:bg-amber-200 active:scale-95",
    ghost: "text-stone-800 hover:bg-stone-900/10 active:bg-stone-900/5",
    danger: "bg-red-800 text-red-50 hover:bg-red-700 hover:shadow-md active:bg-red-900 active:scale-95",
  };

  const sizes = {
    default: "min-h-11 px-4 text-sm",
    lg: "min-h-12 px-6 text-base",
    icon: "h-11 w-11 shrink-0 p-0",
  };

  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
