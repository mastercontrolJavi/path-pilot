import type { AnalysisResult } from "@/lib/schemas";
import { PenLine, ArrowRight } from "lucide-react";

export function CvRewritesSection({
  rewrites,
}: {
  rewrites: AnalysisResult["cv_rewrites"];
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <PenLine className="w-4 h-4 text-foreground/70" />
        <h2 className="text-lg font-semibold tracking-tight">
          CV improvements
        </h2>
      </div>
      <div className="space-y-4">
        {rewrites.map((rewrite, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-border/50"
          >
            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-start mb-3">
              <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                <p className="text-xs font-medium text-red-600 mb-1">Before</p>
                <p className="text-sm text-red-800 leading-relaxed">
                  {rewrite.before}
                </p>
              </div>
              <div className="hidden md:flex items-center justify-center pt-4">
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                <p className="text-xs font-medium text-green-600 mb-1">
                  After
                </p>
                <p className="text-sm text-green-800 leading-relaxed">
                  {rewrite.after}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Why it&apos;s better:</span>{" "}
              {rewrite.why_better}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
