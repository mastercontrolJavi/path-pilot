import type { CareerPath } from "@/lib/schemas";

/*
 * Terrain map geometry: x = match %, y = typical pay (midpoint of the range).
 * "You are here" sits at the bottom-left corner; routes run from it to each role.
 * Pure functions so the scales and label spacing are testable.
 */

export const MAP = { w: 720, h: 380, left: 64, right: 40, top: 32, bottom: 56 };

export type Plotted = {
  index: number;
  title: string;
  fit: number;
  mid: number;
  x: number;
  y: number;
  /** Label anchor (may be nudged vertically so labels never overlap). */
  labelY: number;
  labelSide: "left" | "right";
};

export type Terrain = {
  origin: { x: number; y: number };
  points: Plotted[];
  fitDomain: [number, number];
  payDomain: [number, number];
  currency: string;
};

const LABEL_GAP = 46; // viewBox units between label centres
const LABEL_W = 210; // approximate label width in viewBox units

/** Null when the report has no comparable pay (older reports, vague locations, mixed currencies). */
export function layoutTerrain(paths: CareerPath[]): Terrain | null {
  const priced = paths.filter((p) => p.salary_estimate && p.salary_estimate.period === "year");
  if (priced.length < 2 || priced.length !== paths.length) return null;
  const currencies = new Set(priced.map((p) => p.salary_estimate!.currency));
  if (currencies.size !== 1) return null;

  const fits = paths.map((p) => p.fit_score);
  const mids = paths.map((p) => (p.salary_estimate!.low + p.salary_estimate!.high) / 2);
  // Tight around the scores (at least 30 points wide) so close fits still spread out.
  let lo = Math.max(0, Math.min(...fits) - 12);
  let hi = Math.min(100, Math.max(...fits) + 12);
  if (hi - lo < 30) {
    const pad = (30 - (hi - lo)) / 2;
    lo = Math.max(0, lo - pad);
    hi = Math.min(100, hi + pad);
  }
  const fitDomain: [number, number] = [lo, hi];
  const payDomain: [number, number] = [Math.min(...mids) * 0.8, Math.max(...mids) * 1.12];

  const plotW = MAP.w - MAP.left - MAP.right;
  const plotH = MAP.h - MAP.top - MAP.bottom;
  const x = (fit: number) => MAP.left + ((fit - fitDomain[0]) / (fitDomain[1] - fitDomain[0])) * plotW;
  const y = (mid: number) => MAP.top + (1 - (mid - payDomain[0]) / (payDomain[1] - payDomain[0])) * plotH;

  const points: Plotted[] = paths.map((p, index) => {
    const px = x(p.fit_score);
    return {
      index,
      title: p.title,
      fit: p.fit_score,
      mid: mids[index],
      x: px,
      y: y(mids[index]),
      labelY: y(mids[index]),
      // Branches arrive from the left, so the right side is clear unless the label would run off the map.
      labelSide: px + 20 + LABEL_W > MAP.w ? "left" : "right",
    };
  });

  // Push labels apart vertically (top to bottom), keeping them inside the plot.
  const byY = [...points].sort((a, b) => a.labelY - b.labelY);
  for (let i = 1; i < byY.length; i++) {
    if (byY[i].labelY - byY[i - 1].labelY < LABEL_GAP) byY[i].labelY = byY[i - 1].labelY + LABEL_GAP;
  }
  const overflow = byY[byY.length - 1].labelY - (MAP.h - MAP.bottom - 8);
  if (overflow > 0) for (const p of byY) p.labelY -= overflow;

  return {
    origin: { x: MAP.left, y: MAP.h - MAP.bottom },
    points,
    fitDomain,
    payDomain,
    currency: priced[0].salary_estimate!.currency,
  };
}

type Pt = { x: number; y: number };

/** Where the shared trunk from "you are here" splits into one branch per role. */
export function forkPoint(origin: Pt): Pt {
  return { x: origin.x + 48, y: origin.y - 10 };
}

/** The shared trunk: "you are here" to the fork. */
export function trunk(origin: Pt): Pt[] {
  const f = forkPoint(origin);
  return [origin, { x: origin.x + 24, y: origin.y - 3 }, f];
}

/**
 * A branch from the fork: it climbs early (all branches climb over the same
 * stretch, so they fan out without crossing), then runs level into the node
 * from the left, keeping the node's right side clear for its label.
 */
export function routeTo(origin: Pt, p: Pt): Pt[] {
  const f = forkPoint(origin);
  const climbEnd = f.x + Math.min(90, (p.x - f.x) * 0.45);
  return [f, { x: f.x + (climbEnd - f.x) * 0.5, y: (f.y + p.y) / 2 }, { x: climbEnd, y: p.y }, p];
}
