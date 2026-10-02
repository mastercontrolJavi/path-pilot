"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/*
 * Hydration-safe localStorage state. The server (and first client render) see
 * the fallback; stored values arrive right after hydration. Storage can be
 * unavailable (private mode, blocked site data), so every access is guarded and
 * the hook keeps working in memory-less "fallback" mode.
 */

const EVENT = "pp:local-storage";

// Used when localStorage throws, so changes still last until reload.
const memory = new Map<string, string>();

function read(key: string): string | null {
  if (memory.has(key)) return memory.get(key)!;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  const handler = () => onChange();
  window.addEventListener("storage", handler);
  window.addEventListener(EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(EVENT, handler);
  };
}

export function useLocalStorageState<T>(key: string | null, fallback: T): [T, (next: T) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => (key ? read(key) : null),
    () => null
  );

  const value = useMemo<T>(() => {
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
    // `fallback` is expected to be a stable literal per call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const set = useCallback(
    (next: T) => {
      if (!key) return;
      const serialized = JSON.stringify(next);
      try {
        window.localStorage.setItem(key, serialized);
        memory.delete(key);
      } catch {
        memory.set(key, serialized);
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [key]
  );

  return [value, set];
}
