"use client";

import { useState } from "react";

type Props = {
  id: string;
  name: string;
  iconFallback: React.ReactNode;
  borderColor: string;
};

export function SpellImage({ id, name, iconFallback, borderColor }: Props) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ background: `${borderColor}20`, border: `1.5px solid ${borderColor}50` }}
      >
        {iconFallback}
      </div>
    );
  }

  return (
    <div
      className="w-14 h-14 overflow-hidden rounded-lg"
      style={{ border: `1px solid ${borderColor}40` }}
    >
      <img
        src={`/assets/spells/${id}.jpg`}
        alt={name}
        className="h-full w-full object-cover"
        onError={() => setErrored(true)}
      />
    </div>
  );
}
