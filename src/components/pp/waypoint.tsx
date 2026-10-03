import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { RouteNode, type NodeState } from "./route";

/** A single Route node as an inline icon (HTML contexts: rails, logs, empty states). */
export function NodeDot({
  state,
  size = 18,
  pulse = true,
  className,
}: {
  state: NodeState;
  size?: number;
  pulse?: boolean;
  className?: string;
}) {
  const c = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
      className={cn("shrink-0 overflow-visible", className)}
    >
      <RouteNode x={c} y={c} r={c * 0.62} state={state} pulse={pulse} />
    </svg>
  );
}

/** Vertical list of waypoints joined by the Route line. */
export function WaypointList({ className, ...props }: ComponentProps<"ol">) {
  return <ol className={cn("relative flex flex-col", className)} {...props} />;
}

const stateLabel: Record<NodeState, string> = {
  done: "completed",
  current: "current",
  upcoming: "not started",
  destination: "destination",
};

/**
 * Node + label pair. The connector below the node is forest once the waypoint
 * is done, contour (route ahead) otherwise. Pass `onSelect` to make it a button.
 */
export function Waypoint({
  state,
  label,
  meta,
  children,
  last = false,
  onSelect,
  className,
}: {
  state: NodeState;
  label: ReactNode;
  /** Small secondary line (e.g. a date). */
  meta?: ReactNode;
  /** Extra content under the label (e.g. an answer chip). */
  children?: ReactNode;
  /** The last waypoint has no connector below it. */
  last?: boolean;
  onSelect?: () => void;
  className?: string;
}) {
  const body = (
    <>
      <span className="relative z-10 mt-[3px] grid size-[18px] place-items-center">
        <NodeDot state={state} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5 pb-5">
        <span
          className={cn(
            "text-sm leading-snug transition-colors duration-[180ms]",
            state === "current" ? "font-medium text-ink" : state === "upcoming" ? "text-ink-muted" : "text-ink",
            onSelect && "group-hover/wp:text-forest"
          )}
        >
          {label}
          <span className="sr-only">, {stateLabel[state]}</span>
        </span>
        {meta && <span className="font-mono text-xs text-ink-faint">{meta}</span>}
        {children}
      </span>
    </>
  );

  return (
    <li
      className={cn("relative", className)}
      aria-current={state === "current" ? "step" : undefined}
    >
      {!last && (
        <span
          aria-hidden
          className={cn(
            "absolute top-[24px] bottom-[2px] left-[8.25px] w-[1.5px] rounded-full",
            state === "done" ? "bg-forest" : "bg-contour"
          )}
        />
      )}
      {onSelect ? (
        <button
          type="button"
          onClick={onSelect}
          className="group/wp flex w-full cursor-pointer gap-3 rounded-control text-left"
        >
          {body}
        </button>
      ) : (
        <div className="flex gap-3">{body}</div>
      )}
    </li>
  );
}
