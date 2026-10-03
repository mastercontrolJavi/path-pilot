import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";
import { normalizeAnalysisResult } from "@/lib/schemas";
import { JourneyLog, type JourneyEntry } from "@/components/app/journey-log";
import { STALE_AFTER_MS } from "@/components/analysis/stages";

export const metadata: Metadata = { title: "Your journey - PathPilot" };

function toEntry(a: { id: string; status: string; result: unknown; created_at: string }, now: number): JourneyEntry {
  if (a.status === "completed" && a.result) {
    const result = normalizeAnalysisResult(a.result);
    const best = result.career_paths[0];
    return { id: a.id, createdAt: a.created_at, kind: "ready", title: best.title, fit: best.fit_score, steps: result.action_plan.length };
  }
  // Still "processing" after the function limit means it stopped (same rule as the analysis page).
  const stale = now - new Date(a.created_at).getTime() > STALE_AFTER_MS;
  if ((a.status === "processing" || a.status === "pending") && !stale) {
    return { id: a.id, createdAt: a.created_at, kind: "building", title: "Building your route", fit: null, steps: 0 };
  }
  return { id: a.id, createdAt: a.created_at, kind: "stopped", title: "This route didn't finish", fit: null, steps: 0 };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("analyses")
    .select("id, status, result, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line react-hooks/purity -- request-time snapshot for "has this stalled?"
  const now = Date.now();
  return <JourneyLog entries={(data ?? []).map((a) => toEntry(a, now))} />;
}
