"use client";

import { useState } from "react";
import {
  Sword, Shield, Shirt, FlaskConical, Sparkles, Wrench,
  Backpack, Target, Eye, Skull, Atom, PawPrint, Anchor,
  Handshake, ShoppingBag, Crown, Package,
  User, Mountain, Leaf, TrendingUp, ShieldAlert, Star,
} from "lucide-react";

// ─── Categoria → ícone Lucide ─────────────────────────────────────────────────

type LucideIcon = React.ComponentType<{ size?: number; className?: string }>;

const CATEGORY_ICON: Record<string, LucideIcon> = {
  arma:                  Sword,
  armadura:              Shield,
  escudo:                Shield,
  municao:               Target,
  equipamento_aventura:  Backpack,
  ferramenta:            Wrench,
  vestuario:             Shirt,
  esoterico:             Eye,
  alquimico_preparado:   FlaskConical,
  alquimico_catalisador: Atom,
  alquimico_veneno:      Skull,
  alquimia_mistica:      Sparkles,
  animal:                PawPrint,
  veiculo:               Anchor,
  servico:               Handshake,
  bens_comuns:           ShoppingBag,
  item_magico:           Crown,
};

// ─── Raça → ícone Lucide ──────────────────────────────────────────────────────

const RACE_ICON: Record<string, LucideIcon> = {
  humano:     User,
  anao:       Mountain,
  elfo:       Leaf,
  gigante:    TrendingUp,
  hobgoblin:  ShieldAlert,
  meio_elfo:  Star,
  aberrante:  Atom,
};

// ─── ItemIcon ─────────────────────────────────────────────────────────────────

type Props = {
  slug: string;
  category?: string;
  size?: number;
  className?: string;
};

export function ItemIcon({ slug, category, size = 20, className }: Props) {
  const [attempt, setAttempt] = useState<0 | 1 | 2>(0);

  const srcs = [
    `/img/equip-generic-${slug}.svg`,
    `/img/equip-arma-${slug}.svg`,
  ];

  if (attempt === 2) {
    const CategoryIcon = (category && CATEGORY_ICON[category]) ? CATEGORY_ICON[category] : Package;
    return <CategoryIcon size={size} className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={srcs[attempt]}
      alt=""
      width={size}
      height={size}
      className={className}
      onError={() => setAttempt((a) => (a + 1) as 0 | 1 | 2)}
    />
  );
}

// ─── ClassIcon ────────────────────────────────────────────────────────────────

type ClassIconProps = {
  classId: string;
  size?: number;
  className?: string;
};

export function ClassIcon({ classId, size = 32, className }: ClassIconProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/img/class-${classId}.svg`}
      alt=""
      width={size}
      height={size}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

// ─── RaceIcon ─────────────────────────────────────────────────────────────────

type RaceIconProps = {
  raceId: string;
  size?: number;
  className?: string;
};

export function RaceIcon({ raceId, size = 16, className }: RaceIconProps) {
  const Icon = RACE_ICON[raceId] ?? User;
  return <Icon size={size} className={className} />;
}
