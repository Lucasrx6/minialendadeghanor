"use client";

import { useCallback, useEffect, useState } from "react";

const storageKey = (characterId: string) => `ghanor:dm_mode:${characterId}`;

export function useDmMode(characterId: string) {
  const [isActive, setIsActive] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setIsActive(localStorage.getItem(storageKey(characterId)) === "true");
    } catch {
      setIsActive(false);
    }
    setHydrated(true);
  }, [characterId]);

  const toggle = useCallback(() => {
    setIsActive((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey(characterId), String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [characterId]);

  const setActive = useCallback(
    (value: boolean) => {
      setIsActive(value);
      try {
        localStorage.setItem(storageKey(characterId), String(value));
      } catch {
        /* ignore */
      }
    },
    [characterId],
  );

  return { isActive, toggle, setActive, hydrated };
}
