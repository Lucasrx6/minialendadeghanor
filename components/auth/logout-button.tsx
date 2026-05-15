"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logout } from "@/app/auth/actions";
import { useTransition } from "react";

export function LogoutButton({ variant = "ghost", className = "" }: { variant?: "primary" | "secondary" | "ghost" | "danger", className?: string }) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      logout();
    });
  };

  return (
    <Button 
      variant={variant} 
      onClick={handleLogout} 
      disabled={isPending}
      className={className}
      aria-label="Sair"
    >
      <LogOut size={16} /> 
      <span className="hidden sm:inline">Sair</span>
    </Button>
  );
}
