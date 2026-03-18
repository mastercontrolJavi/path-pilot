import { Sparkles } from "lucide-react";

export function SummaryHeader({ summary }: { summary: string }) {
  return (
    <div className="p-6 md:p-8 rounded-2xl bg-white border border-border/50">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Your career snapshot
          </h2>
          <p className="text-base leading-relaxed">{summary}</p>
        </div>
      </div>
    </div>
  );
}
