import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { describeMoneyRange, formatMoney } from "@/lib/format";

type RangeBarProps = {
  low: number;
  high: number;
  /** Market median, drawn as a tick inside the range. */
  median?: number;
  /** The user's current pay, if known. */
  current?: number;
  currency?: string;
  period?: "year" | "hour";
  /** Scale shared across several bars so they can be compared. Defaults to a padded range. */
  domain?: [number, number];
  /** Draw the range in on first paint (transform only). */
  animate?: boolean;
  /** Seconds before drawing. */
  delay?: number;
  className?: string;
};

/** Horizontal salary range with optional median tick and current-pay marker. */
export function RangeBar({
  low,
  high,
  median,
  current,
  currency = "USD",
  period = "year",
  domain,
  animate = false,
  delay = 0,
  className,
}: RangeBarProps) {
  const values = [low, high, median, current].filter((v): v is number => typeof v === "number");
  const pad = (high - low) * 0.35 || high * 0.1;
  const [min, max] = domain ?? [Math.min(...values) - pad, Math.max(...values) + pad];
  const pct = (v: number) => `${((v - min) / (max - min || 1)) * 100}%`;
  const width = `${((high - low) / (max - min || 1)) * 100}%`;

  const spoken = [
    `Range ${describeMoneyRange(low, high, currency, period)}`,
    median !== undefined && `market median ${formatMoney(median, currency, period)}`,
    current !== undefined && `your current pay ${formatMoney(current, currency, period)}`,
  ]
    .filter(Boolean)
    .join("; ");

  return (
    <div className={cn("w-full", className)}>
      <p className="sr-only">{spoken}.</p>
      <div aria-hidden className="relative pt-6 pb-7">
        {/* Track */}
        <div className="h-2 rounded-full bg-fog" />
        {/* Range */}
        <div className="absolute top-6 h-2" style={{ left: pct(low), width }}>
          <div
            className={cn("h-full rounded-full bg-forest", animate && "pp-draw-x")}
            style={animate ? ({ "--draw-delay": `${delay}s` } as CSSProperties) : undefined}
          />
        </div>
        {/* Ends */}
        <span className="absolute top-0 -translate-x-1/2 font-mono text-xs text-ink" style={{ left: pct(low) }}>
          {formatMoney(low, currency, period)}
        </span>
        <span className="absolute top-0 -translate-x-1/2 font-mono text-xs text-ink" style={{ left: pct(high) }}>
          {formatMoney(high, currency, period)}
        </span>
        {/* Median tick */}
        {median !== undefined && (
          <span className="absolute top-[18px] flex -translate-x-1/2 flex-col items-center" style={{ left: pct(median) }}>
            <span className="h-5 w-[2px] rounded-full bg-ink" />
            <span className="mt-1 text-xs whitespace-nowrap text-ink-muted">
              Median <span className="font-mono text-ink">{formatMoney(median, currency, period)}</span>
            </span>
          </span>
        )}
        {/* Current pay */}
        {current !== undefined && (
          <span
            className="absolute top-[18px] size-3.5 -translate-x-1/2 rounded-full border-2 border-ink bg-sheet"
            style={{ left: pct(current) }}
          />
        )}
      </div>
      {current !== undefined && (
        <p aria-hidden className="-mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
          <span className="inline-block size-2.5 rounded-full border-2 border-ink bg-sheet" />
          You now <span className="font-mono text-ink">{formatMoney(current, currency, period)}</span>
        </p>
      )}
    </div>
  );
}
