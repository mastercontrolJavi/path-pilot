import type { AnalysisResult } from "@/lib/schemas";

export function ActionPlanSection({
  steps,
}: {
  steps: AnalysisResult["action_plan"];
}) {
  return (
    <section>
      <p className="font-mono text-xs uppercase tracking-[.18em] text-primary">Seven waypoints</p><h2 className="mb-8 mt-3 text-4xl">Your route for the next seven days</h2>
      <div className="relative space-y-0 border-l border-primary/25 ml-4">
        {steps.map((step) => (
          <div
            key={step.step}
            className="relative flex items-start gap-5 pb-9 pl-9 last:pb-0"
          >
            <div className="absolute -left-4 top-0 grid size-8 place-items-center rounded-full border border-primary bg-[#faf7f2]">
              <span className="font-mono text-[10px] text-primary">
                {String(step.step).padStart(2,"0")}
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
