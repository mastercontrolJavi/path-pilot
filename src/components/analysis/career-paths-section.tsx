import type { AnalysisResult } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { Compass, TrendingUp, AlertCircle } from "lucide-react";

type CareerPath = AnalysisResult["career_paths"][number];

function FitScoreRing({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-border/30"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold">{score}</span>
      </div>
    </div>
  );
}

function CareerPathCard({
  path,
  index,
}: {
  path: CareerPath;
  index: number;
}) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-border/50">
      <div className="flex items-start gap-4 mb-4">
        <FitScoreRing score={path.fit_score} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-0.5">
            Path {index + 1}
          </p>
          <h3 className="text-lg font-semibold tracking-tight">
            {path.title}
          </h3>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Why it fits
            </p>
            <p className="text-sm leading-relaxed">{path.why_it_fits}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Compass className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Why it&apos;s realistic
            </p>
            <p className="text-sm leading-relaxed">
              {path.why_it_is_realistic}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Tradeoff
            </p>
            <p className="text-sm leading-relaxed">{path.tradeoff}</p>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Example roles
        </p>
        <div className="flex flex-wrap gap-1.5">
          {path.example_job_titles.map((title) => (
            <Badge
              key={title}
              variant="secondary"
              className="text-xs rounded-lg"
            >
              {title}
            </Badge>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        <span className="font-medium">Best for:</span> {path.best_for}
      </p>
    </div>
  );
}

export function CareerPathsSection({
  paths,
}: {
  paths: AnalysisResult["career_paths"];
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Compass className="w-4 h-4 text-foreground/70" />
        <h2 className="text-lg font-semibold tracking-tight">
          Your 3 career paths
        </h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {paths.map((path, i) => (
          <CareerPathCard key={path.title} path={path} index={i} />
        ))}
      </div>
    </section>
  );
}
