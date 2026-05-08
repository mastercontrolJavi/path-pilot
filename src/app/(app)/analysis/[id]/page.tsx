import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AnalysisResult } from "@/lib/schemas";
import { AnalysisLoading } from "@/components/analysis/analysis-loading";
import { SummaryHeader } from "@/components/analysis/summary-header";
import { StrengthsSection } from "@/components/analysis/strengths-section";
import { CareerPathsSection } from "@/components/analysis/career-paths-section";
import { AvoidRolesSection } from "@/components/analysis/avoid-roles-section";
import { ActionPlanSection } from "@/components/analysis/action-plan-section";
import { CvRewritesSection } from "@/components/analysis/cv-rewrites-section";
import { ConfidenceNote } from "@/components/analysis/confidence-note";
import { ArrowLeft, XCircle } from "lucide-react";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: analysis, error } = await supabase
    .from("analyses")
    .select("id, status, result, error_message, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !analysis) {
    notFound();
  }

  // Processing state
  if (analysis.status === "processing" || analysis.status === "pending") {
    return <AnalysisLoading analysisId={analysis.id} />;
  }

  // Failed state
  if (analysis.status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-6">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Analysis failed</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {analysis.error_message ||
            "Something went wrong during analysis. Please try again."}
        </p>
        <Link
          href="/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Try again
        </Link>
      </div>
    );
  }

  // Completed state
  const result = analysis.result as AnalysisResult;

  return (
    <div>
      {/* Sticky back link header */}
      <div className="sticky top-14 z-30 -mx-6 px-6 py-3 bg-white/90 backdrop-blur-sm border-b border-border/50 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <span className="text-muted-foreground/30">|</span>
          <span className="text-sm text-muted-foreground">
            {new Date(analysis.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="space-y-8">
        <SummaryHeader summary={result.summary} />
        <StrengthsSection strengths={result.strengths} />
        <CareerPathsSection paths={result.career_paths} />
        <AvoidRolesSection roles={result.avoid_roles} />
        <ActionPlanSection steps={result.action_plan} />
        <CvRewritesSection rewrites={result.cv_rewrites} />
        <ConfidenceNote note={result.confidence_note} />
      </div>
    </div>
  );
}
