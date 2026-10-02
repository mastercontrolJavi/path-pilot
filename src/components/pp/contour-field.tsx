import { cn } from "@/lib/utils";
import { contourLines } from "./contour-geometry";

/*
 * ContourField — a static topographic background, generated deterministically
 * from a seed: smooth value noise plus a few hills, contoured with marching
 * squares (so lines never cross, like a real survey map), then smoothed with
 * quadratic curves. Used in exactly two places: the landing hero and the
 * results terrain map. Never animated, never above 8% opacity.
 */

export function ContourField({
  seed = 11,
  width = 1200,
  height = 800,
  levels = 10,
  opacity = 0.08,
  className,
}: {
  seed?: number;
  width?: number;
  height?: number;
  levels?: number;
  /** Clamped to 0.08. */
  opacity?: number;
  className?: string;
}) {
  const lines = contourLines(seed, width, height, levels);
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none select-none", className)}
      style={{ opacity: Math.min(opacity, 0.08) }}
    >
      <g fill="none" stroke="var(--color-ink)" strokeLinecap="round" strokeLinejoin="round">
        {lines.map((line, i) => (
          <path key={i} d={line.d} strokeWidth={line.index ? 1.5 : 0.9} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}
