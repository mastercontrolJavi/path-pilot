"use client";

import { useEffect, useState } from "react";

/** Seconds left on a cooldown; `start()` (re)starts it. */
export function useCooldown(initial = 0) {
  const [left, setLeft] = useState(initial);
  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);
  return { left, start: (seconds: number) => setLeft(seconds) };
}

export function formatCountdown(seconds: number) {
  return `0:${String(Math.max(0, seconds)).padStart(2, "0")}`;
}
