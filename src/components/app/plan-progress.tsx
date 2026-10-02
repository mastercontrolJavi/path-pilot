"use client";

import { useHydrated, useLocalStorageState } from "@/lib/use-local-storage";

const NONE: number[] = [];

/** "2 of 7 days done", read from this browser (where plan check marks are saved). */
export function PlanProgress({ analysisId, total }: { analysisId: string; total: number }) {
  const hydrated = useHydrated();
  const [done] = useLocalStorageState<number[]>(`pp:plan:${analysisId}`, NONE);
  if (!hydrated || total === 0) return null;
  if (done.length === 0) return <span>Plan not started</span>;
  if (done.length >= total) return <span>Plan complete</span>;
  return (
    <span>
      <span className="font-mono text-ink">{done.length}</span> of <span className="font-mono text-ink">{total}</span> days
      done
    </span>
  );
}
