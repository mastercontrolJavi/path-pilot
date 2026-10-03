import { color } from "../tokens";
import { routePath, type RoutePoint } from "../lib/route-geometry";

export type NodeState = "done" | "current" | "upcoming" | "destination";

const PAINT: Record<NodeState, { fill: string; stroke: string; width: number }> = {
  done: { fill: color.moss, stroke: color.forest, width: 1.5 },
  current: { fill: color.blaze, stroke: color.forestDeep, width: 2 },
  upcoming: { fill: color.sheet, stroke: color.edge, width: 1.5 },
  destination: { fill: color.forest, stroke: color.forest, width: 1.5 },
};

/** A Route node, scaled by `r`. Destinations read as a target (forest disc, sheet centre). */
export function RouteNode({ x, y, r, state, opacity = 1, scale = 1 }: { x: number; y: number; r: number; state: NodeState; opacity?: number; scale?: number }) {
  const p = PAINT[state];
  const k = r / 6;
  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle r={r} fill={p.fill} stroke={p.stroke} strokeWidth={p.width * k} />
      {state === "destination" && <circle r={r * 0.38} fill={color.sheet} />}
    </g>
  );
}

/** The Route line, drawn to `progress` (0–1) with pathLength + dashoffset. Frame-driven by the caller. */
export function RouteLine({
  points,
  progress = 1,
  width = 2,
  track = false,
  smooth = 1,
}: {
  points: RoutePoint[];
  progress?: number;
  width?: number;
  track?: boolean;
  smooth?: number;
}) {
  const d = routePath(points, smooth);
  const p = Math.min(1, Math.max(0, progress));
  return (
    <>
      {track && <path d={d} fill="none" stroke={color.contour} strokeWidth={width} strokeLinecap="round" strokeDasharray={`${width} ${width * 3}`} />}
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke={color.forest}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 1"
        strokeDashoffset={p <= 0 ? 1.001 : 1 - p}
      />
    </>
  );
}
