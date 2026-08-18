import type { AnalysisResult } from "@/lib/schemas";
import { Progress } from "@/components/ui/progress";

type Strength = AnalysisResult["strengths"][number];

function StrengthCard({ strength }: { strength: Strength }) {
  return (
    <div className="p-5 rounded-xl bg-[#f3eee6] border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{strength.name}</h3>
        <span className="font-mono text-xs text-primary">
          {strength.score}/10
        </span>
      </div>
      <Progress value={strength.score * 10} className="h-1.5 mb-4" />
      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">
            Evidence
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {strength.evidence}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">
            Why it matters
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {strength.why_it_matters}
          </p>
        </div>
      </div>
    </div>
  );
}

export function StrengthsSection({
  strengths,
}: {
  strengths: AnalysisResult["strengths"];
}) {
  return (
    <section>
      <div className="mb-8"><p className="font-mono text-xs uppercase tracking-[.18em] text-primary">Evidence in your trail</p><h2 className="mt-3 text-4xl">The strengths that keep showing up</h2></div>
      <div className="grid gap-4 md:grid-cols-3">
        {strengths.map((s) => (
          <StrengthCard key={s.name} strength={s} />
        ))}
      </div>
    </section>
  );
}
