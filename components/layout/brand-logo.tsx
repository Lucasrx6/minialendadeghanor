import { Swords } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
};

const sizes = {
  sm: { box: 32, icon: 16, text: "text-sm" },
  md: { box: 44, icon: 22, text: "text-base" },
  lg: { box: 60, icon: 30, text: "text-lg" },
};

export function BrandLogo({ size = "md", showText = true, className }: BrandLogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        style={{ width: s.box, height: s.box }}
        className="flex shrink-0 items-center justify-center rounded-xl bg-amber-900 shadow-md ring-1 ring-amber-700/40"
      >
        <Swords size={s.icon} className="text-amber-100" />
      </div>
      {showText && (
        <div className="min-w-0">
          <p className={cn("font-black leading-tight text-stone-950", s.text)}>A Lenda de Ghanor</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800/80">Forja de Personagens</p>
        </div>
      )}
    </div>
  );
}
