"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/*
 * Hydration-safe localStorage state. The server (and first client render) see
 * the fallback; stored values arrive right after hydration. Storage can be
 * unavailable (private mode, blocked site data), so every access is guarded and
 * values fall back to memory for the rest of the visit.
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

function parse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

type Update<T> = T | ((prev: T) => T);

export function useLocalStorageState<T>(key: string | null, fallback: T): [T, (next: Update<T>) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => (key ? read(key) : null),
    () => null
  );

  // `fallback` is expected to be a stable value per call site.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo<T>(() => parse(raw, fallback), [raw]);

  const set = useCallback(
    (next: Update<T>) => {
      if (!key) return;
      // Functional updates read the latest stored value, never a stale render.
      const prev = parse(read(key), fallback);
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      const serialized = JSON.stringify(resolved);
      try {
        window.localStorage.setItem(key, serialized);
        memory.delete(key);
      } catch {
        memory.set(key, serialized);
      }
      window.dispatchEvent(new Event(EVENT));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return [value, set];
}

/** Remove a stored value without re-rendering subscribers (e.g. right before navigating away). */
export function clearLocalStorageState(key: string) {
  memory.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing stored, nothing to clear.
  }
}

const noop = () => () => {};

/** False during SSR and hydration, true after: for UI that depends on client-only state. */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  );
}
