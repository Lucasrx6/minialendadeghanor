"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Início", icon: Home, match: (p: string) => p === "/" },
  { href: "/characters", label: "Heróis", icon: Users, match: (p: string) => p === "/characters" },
  { href: "/characters/new/guided", label: "Criar", icon: PlusCircle, match: (p: string) => p.includes("/new") },
] as const;

/** Only show on top-level app screens — wizards and fichas use their own chrome */
function shouldShowNav(pathname: string) {
  if (pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/auth")) {
    return false;
  }
  if (pathname === "/" || pathname === "/characters") return true;
  if (pathname.startsWith("/characters/new")) return true;
  return false;
}

export function BottomNav() {
  const pathname = usePathname();

  if (!shouldShowNav(pathname)) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-amber-900/15 bg-amber-50/95 backdrop-blur-md print:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex h-[var(--bottom-nav-height)] max-w-2xl items-stretch justify-around px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 text-xs font-bold transition active:scale-95 cursor-pointer",
                active ? "text-amber-900" : "text-stone-500 hover:text-stone-700",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition",
                  active ? "bg-amber-800 text-amber-50 shadow-md" : "bg-transparent group-hover:bg-stone-100",
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
