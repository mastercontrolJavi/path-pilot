import type { AnalysisResult } from "@/lib/schemas";
import { CalendarCheck } from "lucide-react";

export function ActionPlanSection({
  steps,
}: {
  steps: AnalysisResult["action_plan"];
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <CalendarCheck className="w-4 h-4 text-foreground/70" />
        <h2 className="text-lg font-semibold tracking-tight">
          Your 7-day action plan
        </h2>
      </div>
      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.step}
            className="p-4 rounded-2xl bg-white border border-border/50 flex items-start gap-4"
          >
            <div className="w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-primary">
                {step.step}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold mb-0.5">
                Day {step.step}: {step.title}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.details}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
