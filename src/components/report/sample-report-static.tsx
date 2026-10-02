import { ChevronDown } from "lucide-react";
import { sampleReport } from "@/lib/fixtures/sample-report";
import { cn } from "@/lib/utils";
import { DestinationSummary } from "./destination-summary";

const TABS = ["Destinations", "Pay", "Skill gaps", "Plan"];

/**
 * Server-rendered first view of the sample report: same layout as the
 * interactive version (Destinations tab, rows collapsed), no JavaScript.
 * Swapped for <SampleReport> when the section approaches the viewport.
 */
export function SampleReportStatic() {
  return (
    <div className="flex flex-col gap-4">
      <div role="presentation" className="relative flex w-full items-center gap-6 border-b border-contour text-ink-muted">
        {TABS.map((label, i) => (
          <span
            key={label}
            className={cn(
              "relative inline-flex h-11 items-center px-0.5 text-sm font-medium whitespace-nowrap",
              i === 0 && "text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-forest"
            )}
          >
            {label}
          </span>
        ))}
      </div>
      <ol className="border-b border-contour">
        {sampleReport.career_paths.map((path, i) => (
          <li key={path.title} className={cn(i > 0 && "border-t border-contour")}>
            <DestinationSummary path={path} rank={i}>
              <span className="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-forest underline decoration-forest/30 underline-offset-4 pointer-coarse:min-h-11">
                Details
                <ChevronDown aria-hidden className="size-4 stroke-[1.5]" />
              </span>
            </DestinationSummary>
          </li>
        ))}
      </ol>
    </div>
  );
}
