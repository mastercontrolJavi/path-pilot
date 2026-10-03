import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { duration } from "@/lib/motion";
import { routePath, waypointFractions, type RoutePoint } from "./route-geometry";

export type { RoutePoint } from "./route-geometry";

/**
 * done        — completed waypoint (moss, forest ring)
 * current     — "you are here" / current step (blaze, forest ring, slow pulse). One per screen.
 * upcoming    — not reached yet (sheet, edge ring)
 * destination — an end point worth reaching (forest)
 */
export type NodeState = "done" | "current" | "upcoming" | "destination";

export type RouteVariant = "hero" | "rail" | "survey" | "map";

const STROKE: Record<RouteVariant, number> = { hero: 2, rail: 1.5, survey: 2, map: 1.5 };
const RADIUS: Record<RouteVariant, number> = { hero: 6, rail: 5, survey: 7, map: 6 };

const NODE_PAINT: Record<NodeState, { fill: string; stroke: string; width: number }> = {
  done: { fill: "var(--color-moss)", stroke: "var(--color-forest)", width: 1.5 },
  current: { fill: "var(--color-blaze)", stroke: "var(--color-forest-deep)", width: 2 },
  upcoming: { fill: "var(--color-sheet)", stroke: "var(--color-edge)", width: 1.5 },
  destination: { fill: "var(--color-forest)", stroke: "var(--color-forest)", width: 1.5 },
};

export function RouteNode({
  x,
  y,
  state,
  r = 6,
  pulse = true,
  revealDelay,
  className,
}: {
  x: number;
  y: number;
  state: NodeState;
  r?: number;
  /** Breathing ring on the current node (off under reduced motion). */
  pulse?: boolean;
  /** Seconds; fades the node in when the drawing line reaches it. */
  revealDelay?: number;
  className?: string;
}) {
  const paint = NODE_PAINT[state];
  return (
    <g
      className={cn(revealDelay !== undefined && "pp-reveal", className)}
      style={revealDelay !== undefined ? ({ "--reveal-delay": `${revealDelay}s` } as CSSProperties) : undefined}
    >
      {state === "current" && pulse && (
        <circle cx={x} cy={y} r={r} fill="none" stroke="var(--color-blaze)" strokeWidth={2} className="pp-pulse" />
      )}
      <circle cx={x} cy={y} r={r} fill={paint.fill} stroke={paint.stroke} strokeWidth={paint.width} />
      {/* Destinations read as a target: forest disc, sheet centre. */}
      {state === "destination" && <circle cx={x} cy={y} r={r * 0.38} fill="var(--color-sheet)" />}
    </g>
  );
}

/**
 * Just the line (and optional dashed track) — for compositions that place
 * several branches and their nodes inside one SVG (hero, terrain map).
 */
export function RouteLine({
  points,
  variant = "rail",
  progress = 1,
  animateOnMount = false,
  track = false,
  className,
  style,
}: {
  points: RoutePoint[];
  variant?: RouteVariant;
  /** 0–1, ignored when `animateOnMount`. */
  progress?: number;
  animateOnMount?: boolean;
  track?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const d = routePath(points);
  const strokeWidth = STROKE[variant];
  const p = Math.min(1, Math.max(0, progress));
  return (
    <>
      {track && (
        <path
          d={d}
          fill="none"
          stroke="var(--color-contour)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="2 6"
        />
      )}
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke="var(--color-forest)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("pp-route-line", animateOnMount && "pp-route-draw", className)}
        style={animateOnMount ? style : { strokeDashoffset: p <= 0 ? 1.001 : 1 - p, ...style }}
      />
    </>
  );
}

export type RouteProps = {
  /** Waypoints in viewBox units. */
  points: RoutePoint[];
  width: number;
  height: number;
  variant?: RouteVariant;
  /** Current waypoint. Earlier ones are done, later ones upcoming. */
  activeIndex?: number;
  /**
   * How much of the line is drawn: `true` (all), `false` (none) or 0–1.
   * Defaults to "up to the active waypoint" when `activeIndex` is set, else fully drawn.
   */
  drawn?: boolean | number;
  /** Draw the line once on first paint (CSS only, no JS). Nodes appear as the line reaches them. */
  animateOnMount?: boolean;
  /** Seconds before the draw starts. */
  delay?: number;
  /** Override node states; return `null` to omit a node. */
  stateOf?: (index: number) => NodeState | null;
  /** Show the full route ahead as a faint dashed track. Defaults on for rail and survey. */
  track?: boolean;
  /** Accessible name. Without it the SVG is decorative (pair it with a text equivalent). */
  label?: string;
  className?: string;
  lineClassName?: string;
  children?: ReactNode;
};

/**
 * The Route — PathPilot's signature element. A single line with waypoint nodes,
 * drawn with `pathLength` + `stroke-dashoffset`. Server-safe (no hooks).
 */
export function Route({
  points,
  width,
  height,
  variant = "rail",
  activeIndex,
  drawn,
  animateOnMount = false,
  delay = 0,
  stateOf,
  track,
  label,
  className,
  lineClassName,
  children,
}: RouteProps) {
  const fractions = waypointFractions(points);
  const showTrack = track ?? (variant === "rail" || variant === "survey");

  const progress =
    drawn === true
      ? 1
      : drawn === false
        ? 0
        : typeof drawn === "number"
          ? Math.min(1, Math.max(0, drawn))
          : activeIndex !== undefined
            ? fractions[Math.min(activeIndex, points.length - 1)]
            : 1;

  const nodeState = (i: number): NodeState | null => {
    if (stateOf) return stateOf(i);
    if (activeIndex === undefined) return "upcoming";
    if (i < activeIndex) return "done";
    if (i === activeIndex) return "current";
    return "upcoming";
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("overflow-visible", className)}
      style={{ "--route-duration": `${duration.route}s`, "--route-delay": `${delay}s` } as CSSProperties}
    >
      <RouteLine
        points={points}
        variant={variant}
        progress={progress}
        animateOnMount={animateOnMount}
        track={showTrack}
        className={lineClassName}
      />
      {points.map((p, i) => {
        const state = nodeState(i);
        if (!state) return null;
        return (
          <RouteNode
            key={i}
            x={p.x}
            y={p.y}
            state={state}
            r={RADIUS[variant]}
            revealDelay={animateOnMount ? delay + fractions[i] * duration.route : undefined}
          />
        );
      })}
      {children}
    </svg>
  );
}
