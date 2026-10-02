import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics";
import type { RunOutcome } from "./analysis-run";

/**
 * "Try again" without re-entering anything: re-send the CV text and answers
 * already saved on the analysis row (readable by its owner through RLS) to the
 * same /api/analyze endpoint. Creates a new analysis; the old one stays.
 */
export async function retryAnalysis(analysisId: string): Promise<RunOutcome> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("analyses")
      .select("cv_text, questionnaire")
      .eq("id", analysisId)
      .single();
    if (error || !data) {
      // supabase-js reports an unreachable server as an error object, not a throw.
      return { ok: false, kind: /fetch|network/i.test(error?.message ?? "") ? "network" : "server" };
    }

    track("analysis_started");
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvText: data.cv_text, questionnaire: data.questionnaire }),
    });
    const body = (await response.json().catch(() => ({}))) as { analysisId?: string };
    if (response.status === 401) return { ok: false, kind: "session" };
    if (response.status === 504) return { ok: false, kind: "timeout" };
    if (!response.ok || !body.analysisId) return { ok: false, kind: "server" };
    return { ok: true, analysisId: body.analysisId };
  } catch {
    return { ok: false, kind: "network" };
  }
}
