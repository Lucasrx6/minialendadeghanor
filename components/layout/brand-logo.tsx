import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
};

const sizes = {
  sm: { box: 36, text: "text-sm" },
  md: { box: 48, text: "text-base" },
  lg: { box: 64, text: "text-lg" },
};

export function BrandLogo({ size = "md", showText = true, className }: BrandLogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/icons/icon-192.png"
        alt=""
        width={s.box}
        height={s.box}
        className="rounded-xl shadow-sm ring-1 ring-amber-900/15"
        priority
      />
      {showText && (
        <div className="min-w-0">
          <p className={cn("font-black leading-tight text-stone-950", s.text)}>Forja de Ghanor</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800/80">A Lenda de Ghanor RPG</p>
        </div>
      )}
    </div>
  );
}
