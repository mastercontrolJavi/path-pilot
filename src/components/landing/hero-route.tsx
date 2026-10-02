import type { CSSProperties } from "react";
import { RouteLine, RouteNode } from "@/components/pp/route";
import { sampleProfile, sampleReport } from "@/lib/fixtures/sample-report";
import { formatMoneyRange, describeMoneyRange } from "@/lib/format";

/*
 * The landing's one orchestrated moment: from "you are here" the Route runs to
 * a fork and branches to three destinations, each label appearing as its line
 * arrives. CSS only (no JavaScript): draw on load, hover/focus a destination to
 * thicken its branch and dim the others (globals.css: .pp-hero-map).
 *
 * Geometry is in a 240×430 box; labels sit in HTML beside each node, positioned
 * by the same coordinates as percentages.
 */
const W = 240;
const H = 430;
// The SVG takes this share of the width; the container height follows from it.
const SVG_SHARE = 0.46;
const ORIGIN = { x: 16, y: 352 };
const FORK = { x: 92, y: 318 };
const DESTINATIONS = [
  { x: 224, y: 56 },
  { x: 224, y: 188 },
  { x: 224, y: 320 },
];

const TRUNK_S = 0.5;
const BRANCH_S = 0.9;
const STAGGER_S = 0.12;

const branch = (d: { x: number; y: number }) => [
  FORK,
  { x: FORK.x + (d.x - FORK.x) * 0.45, y: FORK.y + (d.y - FORK.y) * 0.25 },
  d,
];

const pct = (v: number, total: number) => `${(v / total) * 100}%`;

export function HeroRoute() {
  const paths = sampleReport.career_paths;

  return (
    <div className="pp-hero-map relative w-full" style={{ aspectRatio: 1 / ((SVG_SHARE * H) / W) }}>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden className="absolute inset-y-0 left-0 h-full w-[46%] overflow-visible">
        <RouteLine
          variant="hero"
          animateOnMount
          points={[ORIGIN, { x: 52, y: 346 }, FORK]}
          style={{ "--route-duration": `${TRUNK_S}s` } as CSSProperties}
        />
        {DESTINATIONS.map((d, i) => (
          <g key={i} data-branch={i}>
            <RouteLine
              variant="hero"
              animateOnMount
              points={branch(d)}
              style={{ "--route-duration": `${BRANCH_S}s`, animationDelay: `${TRUNK_S + i * STAGGER_S}s` } as CSSProperties}
            />
            <RouteNode x={d.x} y={d.y} r={7} state="destination" revealDelay={TRUNK_S + BRANCH_S + i * STAGGER_S} />
          </g>
        ))}
        <RouteNode x={ORIGIN.x} y={ORIGIN.y} r={7} state="current" />
      </svg>

      {/* You are here */}
      <div
        className="absolute left-0 w-[46%] pr-2"
        style={{ top: pct(ORIGIN.y + 20, H) }}
      >
        <p className="text-xs text-ink-muted">You are here</p>
        <p className="mt-0.5 text-sm leading-snug font-medium text-ink">
          {sampleProfile.role}, {sampleProfile.years} years
        </p>
      </div>

      {/* Destinations */}
      <ol className="absolute inset-y-0 right-0 left-[calc(46%+1rem)]">
        {paths.map((path, i) => {
          const pay = path.salary_estimate;
          return (
            <li
              key={path.title}
              className="pp-reveal absolute inset-x-0 -translate-y-1/2"
              style={{ top: pct(DESTINATIONS[i].y, H), "--reveal-delay": `${TRUNK_S + BRANCH_S + i * STAGGER_S}s` } as CSSProperties}
            >
              <a
                href="#sample"
                data-dest={i}
                className="group block rounded-[6px] py-1"
              >
                <span className="block font-display text-base leading-snug font-[420] text-ink decoration-forest/40 underline-offset-4 group-hover:underline md:text-lg">
                  {path.title}
                </span>
                <span className="mt-1 flex flex-wrap gap-x-3 font-mono text-xs text-ink-muted md:text-sm">
                  <span>{path.fit_score}% match</span>
                  {pay && (
                    <span>
                      <span aria-hidden>{formatMoneyRange(pay.low, pay.high, pay.currency, pay.period)}</span>
                      <span className="sr-only">{describeMoneyRange(pay.low, pay.high, pay.currency, pay.period)}</span>
                    </span>
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
