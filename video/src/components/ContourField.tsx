import { contourLines } from "../lib/contour-geometry";
import { color } from "../tokens";

/** Static topographic background (same generator as the app). Never above 8% opacity. */
export function ContourField({ seed = 11, width, height, levels = 10, opacity = 0.08, strokeScale = 1 }: { seed?: number; width: number; height: number; levels?: number; opacity?: number; strokeScale?: number }) {
  const lines = contourLines(seed, width, height, levels);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ position: "absolute", inset: 0, opacity: Math.min(opacity, 0.08) }}>
      <g fill="none" stroke={color.ink} strokeLinecap="round" strokeLinejoin="round">
        {lines.map((l, i) => (
          <path key={i} d={l.d} strokeWidth={(l.index ? 1.5 : 0.9) * strokeScale} />
        ))}
      </g>
    </svg>
  );
}
