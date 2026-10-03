import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";
import { normalizeAnalysisResult } from "@/lib/schemas";
import { AnalysisFailed, AnalysisWaiting } from "@/components/analysis/analysis-states";
import { ResultsView } from "@/components/results/results-view";

export const metadata: Metadata = { title: "Your route - PathPilot" };

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const supabase = await createClient();
  const { data: analysis, error } = await supabase
    .from("analyses")
    .select("id, status, result, error_message, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !analysis) notFound();

  if (analysis.status === "processing" || analysis.status === "pending") {
    return <AnalysisWaiting analysisId={analysis.id} createdAt={analysis.created_at} />;
  }

  if (analysis.status === "failed" || !analysis.result) {
    return <AnalysisFailed analysisId={analysis.id} />;
  }

  return (
    <ResultsView
      analysisId={analysis.id}
      result={normalizeAnalysisResult(analysis.result)}
      createdAt={analysis.created_at}
    />
  );
}
