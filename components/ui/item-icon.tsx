"use client";

import { useState } from "react";
import { Package } from "lucide-react";

type Props = {
  slug: string;
  size?: number;
  className?: string;
};

/**
 * Renders the SVG icon for an item slug from /img/equip-*.svg.
 * Tries equip-generic-{slug} first, then equip-arma-{slug}, then falls back to Package icon.
 */
export function ItemIcon({ slug, size = 20, className }: Props) {
  const [attempt, setAttempt] = useState<0 | 1 | 2>(0);

  const srcs = [
    `/img/equip-generic-${slug}.svg`,
    `/img/equip-arma-${slug}.svg`,
  ];

  if (attempt === 2) {
    return <Package size={size} className={className} />;
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

type ClassIconProps = {
  classId: string;
  size?: number;
  className?: string;
};

/**
 * Renders the SVG class icon for a class ID from /img/class-{id}.svg.
 * Falls back to null if the icon doesn't exist.
 */
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
