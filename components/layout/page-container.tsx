import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  /** Reserve space for bottom navigation bar */
  withBottomNav?: boolean;
  /** Tighter padding for full-bleed flows (wizards) */
  compact?: boolean;
};

export function PageContainer({
  children,
  className,
  withBottomNav = false,
  compact = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-2xl md:max-w-4xl lg:max-w-screen-xl",
        compact ? "px-4 py-3 lg:px-8" : "px-5 py-4 lg:px-8",
        "pt-safe",
        withBottomNav ? "pb-nav" : "pb-safe",
        className,
      )}
    >
      {children}
    </div>
  );
}
