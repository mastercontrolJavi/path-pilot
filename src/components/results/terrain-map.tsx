"use client";

import type { CSSProperties } from "react";
import type { CareerPath } from "@/lib/schemas";
import { ContourField } from "@/components/pp/contour-field";
import { RouteLine, RouteNode } from "@/components/pp/route";
import { describeMoneyRange, formatMoney, formatMoneyRange } from "@/lib/format";
import { cn } from "@/lib/utils";
import { layoutTerrain, MAP, routeTo, trunk } from "./terrain";

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

/**
 * Destinations on terrain: further right = better fit, higher = higher pay.
 * Routes run from "you are here" to each role. Hover or focus a role (here or
 * in the list below) to bring its route forward. Hidden when pay can't be
 * compared; the list below always carries the same information.
 */
export function TerrainMap({
  paths,
  highlight,
  onHighlight,
  onSelect,
}: {
  paths: CareerPath[];
  highlight: number | null;
  onHighlight: (index: number | null, source: "hover" | "focus") => void;
  onSelect: (index: number) => void;
}) {
  const t = layoutTerrain(paths);
  if (!t) return null;

  return (
    <figure className="relative overflow-hidden rounded-panel border border-contour bg-paper">
      <ContourField seed={23} width={MAP.w} height={MAP.h} className="absolute inset-0 size-full" />
      <div className="relative" style={{ aspectRatio: `${MAP.w} / ${MAP.h}` }}>
        <svg viewBox={`0 0 ${MAP.w} ${MAP.h}`} aria-hidden className="absolute inset-0 size-full overflow-visible">
          {/* Axes */}
          <line x1={t.origin.x} y1={t.origin.y} x2={MAP.w - MAP.right} y2={t.origin.y} stroke="var(--color-edge)" strokeWidth={1} />
          <line x1={t.origin.x} y1={t.origin.y} x2={t.origin.x} y2={MAP.top} stroke="var(--color-edge)" strokeWidth={1} />

          {/* Routes: a shared trunk, then one branch per role */}
          <RouteLine variant="map" points={trunk(t.origin)} />
          {t.points.map((p) => (
            <g
              key={p.index}
              className="transition-opacity duration-[180ms]"
              style={{ opacity: highlight === null || highlight === p.index ? 1 : 0.25 }}
            >
              <RouteLine
                variant="map"
                points={routeTo(t.origin, p)}
                className={cn("transition-[stroke-width] duration-[180ms]", highlight === p.index && "[stroke-width:3]")}
              />
              {Math.abs(p.labelY - p.y) > 4 && (
                <line
                  x1={p.x}
                  y1={p.y}
                  x2={p.x + (p.labelSide === "right" ? 14 : -14)}
                  y2={p.labelY}
                  stroke="var(--color-edge)"
                  strokeWidth={1}
                  className="hidden md:inline"
                />
              )}
              <RouteNode x={p.x} y={p.y} r={8} state="destination" />
            </g>
          ))}
          <RouteNode x={t.origin.x} y={t.origin.y} r={8} state="current" />
        </svg>

        {/* Labels and controls live in HTML so they stay legible at any size. */}
        <p
          className="absolute text-xs text-ink-muted"
          style={{ left: pct(t.origin.x, MAP.w), top: pct(t.origin.y + 14, MAP.h) }}
        >
          You are here
        </p>
        <p className="absolute right-3 text-xs text-ink-muted md:right-4" style={{ top: pct(t.origin.y + 14, MAP.h) }}>
          Better fit →
        </p>
        <p className="absolute left-3 text-xs text-ink-muted md:left-4" style={{ top: pct(MAP.top - 24, MAP.h) }}>
          Higher pay
        </p>

        {t.points.map((p) => {
          const path = paths[p.index];
          const pay = path.salary_estimate!;
          const spoken = `${path.title}: ${path.fit_score}% match, typical pay ${describeMoneyRange(pay.low, pay.high, pay.currency, pay.period)}. Show in the list.`;
          const on = highlight === null || highlight === p.index;
          return (
            <div key={p.index}>
              {/* 44px hit area centred on the node */}
              <button
                type="button"
                aria-label={spoken}
                onMouseEnter={() => onHighlight(p.index, "hover")}
                onMouseLeave={() => onHighlight(null, "hover")}
                onFocus={() => onHighlight(p.index, "focus")}
                onBlur={() => onHighlight(null, "focus")}
                onClick={() => onSelect(p.index)}
                className="absolute size-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full"
                style={{ left: pct(p.x, MAP.w), top: pct(p.y, MAP.h) }}
              />
              {/* Phones: rank number beside the node (rows below are numbered the same). */}
              <span
                aria-hidden
                className="pointer-events-none absolute -translate-y-1/2 font-mono text-xs text-ink md:hidden"
                style={{ left: `calc(${pct(p.x, MAP.w)} + 12px)`, top: pct(p.y, MAP.h) }}
              >
                {p.index + 1}
              </span>
              {/* Wider screens: name, match and pay beside the node. */}
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute hidden max-w-56 -translate-y-1/2 transition-opacity duration-[180ms] md:block",
                  p.labelSide === "left" ? "-translate-x-full pr-5 text-right" : "pl-5"
                )}
                style={{ left: pct(p.x, MAP.w), top: pct(p.labelY, MAP.h), opacity: on ? 1 : 0.4 } as CSSProperties}
              >
                <span className="block text-sm leading-snug font-medium text-ink">{path.title}</span>
                <span className={cn("flex gap-2.5 font-mono text-xs text-ink-muted", p.labelSide === "left" && "justify-end")}>
                  <span>{path.fit_score}%</span>
                  <span>{formatMoneyRange(pay.low, pay.high, pay.currency, pay.period)}</span>
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <figcaption className="border-t border-contour bg-sheet px-4 py-3 text-xs text-ink-muted">
        Pay runs from {formatMoney(t.payDomain[0], t.currency)} at the bottom to{" "}
        {formatMoney(t.payDomain[1], t.currency)} at the top. Estimates, not live market data.
      </figcaption>

      <table className="sr-only">
        <caption>Your destinations by fit and typical pay</caption>
        <thead>
          <tr>
            <th scope="col">Role</th>
            <th scope="col">Match</th>
            <th scope="col">Typical pay</th>
          </tr>
        </thead>
        <tbody>
          {paths.map((path) => (
            <tr key={path.title}>
              <th scope="row">{path.title}</th>
              <td>{path.fit_score}%</td>
              <td>
                {path.salary_estimate
                  ? describeMoneyRange(path.salary_estimate.low, path.salary_estimate.high, path.salary_estimate.currency, path.salary_estimate.period)
                  : "No estimate"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
