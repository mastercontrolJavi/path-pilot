import Link from "next/link";
import { normalizeAnalysisResult } from "@/lib/schemas";
import { sampleReport } from "@/lib/fixtures/sample-report";
import { ResultsView } from "@/components/results/results-view";
import { AnalysisFailed } from "@/components/analysis/analysis-states";
import { FakeDoor } from "@/components/results/fake-door";

export const metadata = { title: "Results preview - PathPilot" };

// A pre-v2 report: no pay, no skills per destination.
const legacy = normalizeAnalysisResult({
  ...sampleReport,
  career_paths: sampleReport.career_paths.map(
    ({ title, fit_score, why_it_fits, why_it_is_realistic, example_job_titles, best_for, tradeoff }) => ({
      title,
      fit_score,
      why_it_fits,
      why_it_is_realistic,
      example_job_titles,
      best_for,
      tradeoff,
    })
  ),
});

const views = [
  ["", "Report"],
  ["legacy", "Older report (no pay or skills)"],
  ["failed", "Failed analysis"],
] as const;

/** Internal: the real results components with the sample report (local and preview deploys only). */
export default async function ResultsPreviewPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view = "" } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <nav aria-label="Preview" className="mb-10 flex flex-wrap gap-x-5 gap-y-2 rounded-panel border border-contour bg-sheet px-4 py-3 text-sm">
        {views.map(([key, label]) => (
          <Link
            key={key}
            href={key ? `/design/results?view=${key}` : "/design/results"}
            aria-current={view === key ? "page" : undefined}
            className="rounded-control text-ink-muted underline-offset-4 hover:text-ink aria-[current=page]:font-medium aria-[current=page]:text-ink aria-[current=page]:underline"
          >
            {label}
          </Link>
        ))}
      </nav>

      {view === "failed" ? (
        <AnalysisFailed analysisId="design-preview" />
      ) : (
        <ResultsView
          analysisId={view === "legacy" ? "design-legacy" : "design-sample"}
          result={view === "legacy" ? legacy : sampleReport}
          createdAt="2026-10-02T09:30:00.000Z"
          feedback={false}
        />
      )}

      {view === "" && (
        <section aria-labelledby="fake-door-title" className="mt-16 border-t border-contour pt-10">
          <h2 id="fake-door-title" className="text-sm text-ink-muted">
            Fake door (off in the product; shown here for review)
          </h2>
          <FakeDoor enabled />
        </section>
      )}
    </div>
  );
}
