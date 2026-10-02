import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { describeMoneyRange, formatMoneyRange } from "@/lib/format";

type StatProps = {
  label: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
} & (
  | { value: ReactNode; low?: never; high?: never; currency?: never; period?: never }
  | { value?: never; low: number; high: number; currency?: string; period?: "year" | "hour" }
);

const valueSize = { sm: "text-base", md: "text-xl", lg: "text-2xl" } as const;

/** A data figure (Fragment Mono) with a plain-language label. Supports money ranges. */
export function Stat({ label, size = "md", className, ...rest }: StatProps) {
  const isRange = rest.low !== undefined;
  const display = isRange ? formatMoneyRange(rest.low, rest.high, rest.currency, rest.period) : rest.value;
  const spoken = isRange ? describeMoneyRange(rest.low, rest.high, rest.currency, rest.period) : undefined;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className={cn("font-mono leading-none tracking-tight text-ink", valueSize[size])}>
        {spoken ? (
          <>
            <span aria-hidden>{display}</span>
            <span className="sr-only">{spoken}</span>
          </>
        ) : (
          display
        )}
      </span>
      <span className="text-sm text-ink-muted">{label}</span>
    </div>
  );
}
