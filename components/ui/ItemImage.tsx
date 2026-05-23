"use client";

import { useState } from "react";

type Props = {
  slug: string;
  name: string;
  iconFallback: React.ReactNode;
  borderColor: string;
};

export function ItemImage({ slug, name, iconFallback, borderColor }: Props) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ background: `${borderColor}20`, border: `1.5px solid ${borderColor}50` }}
      >
        {iconFallback}
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-hidden rounded-lg bg-white"
      style={{ height: 90, border: `1px solid ${borderColor}30` }}
    >
      <img
        src={`/assets/items/${slug}.jpg`}
        alt={name}
        className="h-full w-full object-contain"
        onError={() => setErrored(true)}
      />
    </div>
  );
}
