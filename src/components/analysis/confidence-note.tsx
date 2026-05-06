import { Info } from "lucide-react";

export function ConfidenceNote({ note }: { note: string }) {
  return (
    <div className="p-4 rounded-2xl bg-accent/50 border border-border/30">
      <div className="flex items-start gap-3">
        <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">{note}</p>
      </div>
    </div>
  );
}
