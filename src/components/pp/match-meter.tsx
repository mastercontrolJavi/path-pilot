import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const SEGMENTS = 10;

/**
 * Match percentage as a short segmented bar (never a donut).
 * With `animate`, segments fill left to right over 0.8s (transform only).
 */
export function MatchMeter({
  value,
  label = "Match",
  animate = false,
  delay = 0,
  showValue = true,
  size = "md",
  valueText,
  className,
}: {
  /** 0–100 */
  value: number;
  label?: string;
  animate?: boolean;
  /** Seconds before filling. */
  delay?: number;
  showValue?: boolean;
  size?: "sm" | "md";
  /** Spoken value, when "N% match" is the wrong reading (e.g. strength scores). */
  valueText?: string;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const step = 0.8 / SEGMENTS;

  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      aria-label={label}
      aria-valuetext={valueText ?? `${v}% ${label.toLowerCase()}`}
      className={cn("flex items-center gap-3", className)}
    >
      <div aria-hidden className={cn("flex gap-[3px]", size === "sm" ? "h-1.5 w-20" : "h-2 w-28")}>
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const fill = Math.max(0, Math.min(1, (v - i * 10) / 10));
          return (
            <span key={i} className="relative flex-1 overflow-hidden rounded-[2px] bg-fog">
              {fill > 0 && (
                <span
                  className={cn("absolute inset-y-0 left-0 bg-forest", animate && "pp-fill")}
                  style={
                    {
                      width: `${fill * 100}%`,
                      "--fill-delay": `${delay + i * step}s`,
                    } as CSSProperties
                  }
                />
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span aria-hidden className={cn("font-mono text-ink", size === "sm" ? "text-sm" : "text-base")}>
          {v}%
        </span>
      )}
    </div>
  );
}
