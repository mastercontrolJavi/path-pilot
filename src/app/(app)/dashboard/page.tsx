import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, Compass, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Processing
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 gap-1">
          <XCircle className="w-3 h-3" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </Badge>
      );
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, status, result, created_at, error_message")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const hasAnalyses = analyses && analyses.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your career analyses
          </p>
        </div>
        <Link
          href="/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New analysis
        </Link>
      </div>

      {!hasAnalyses ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-border/50 flex items-center justify-center mb-6">
            <Compass className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No analyses yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Upload your CV and answer a few questions to get your first
            personalized career analysis.
          </p>
          <Link
            href="/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            Start your first analysis
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analyses.map((analysis) => {
            const summary =
              analysis.status === "completed" && analysis.result?.summary
                ? analysis.result.summary.slice(0, 120) +
                  (analysis.result.summary.length > 120 ? "..." : "")
                : analysis.status === "failed"
                  ? analysis.error_message || "Analysis failed"
                  : "Analysis in progress...";

            return (
              <Link
                key={analysis.id}
                href={`/analysis/${analysis.id}`}
                className="group block p-5 rounded-2xl bg-white border border-border/50 hover:border-border hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(analysis.created_at)}
                  </span>
                  <StatusBadge status={analysis.status} />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {summary}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
