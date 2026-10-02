/**
 * Geometry for the Route: a smooth curve through waypoints
 * (Catmull–Rom converted to cubic Béziers) plus arc-length fractions so a
 * partially drawn Route can stop exactly on a waypoint.
 */

export type RoutePoint = { x: number; y: number };

type Segment = [RoutePoint, RoutePoint, RoutePoint, RoutePoint]; // p0, c1, c2, p1

const r = (n: number) => Math.round(n * 10) / 10;

function segments(points: RoutePoint[], tension: number): Segment[] {
  const out: Segment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const k = tension / 6;
    out.push([
      p1,
      { x: p1.x + (p2.x - p0.x) * k, y: p1.y + (p2.y - p0.y) * k },
      { x: p2.x - (p3.x - p1.x) * k, y: p2.y - (p3.y - p1.y) * k },
      p2,
    ]);
  }
  return out;
}

/** SVG path data for a smooth curve through `points`. */
export function routePath(points: RoutePoint[], tension = 1): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M${r(points[0].x)} ${r(points[0].y)}`;
  const segs = segments(points, tension);
  let d = `M${r(points[0].x)} ${r(points[0].y)}`;
  for (const [, c1, c2, p] of segs) {
    d += `C${r(c1.x)} ${r(c1.y)} ${r(c2.x)} ${r(c2.y)} ${r(p.x)} ${r(p.y)}`;
  }
  return d;
}

function bezierAt([p0, c1, c2, p1]: Segment, t: number): RoutePoint {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p1.x,
    y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p1.y,
  };
}

/**
 * Fraction (0–1) of the total route length at each waypoint.
 * `fractions[0]` is 0 and the last is 1.
 */
export function waypointFractions(points: RoutePoint[], tension = 1): number[] {
  if (points.length < 2) return points.map(() => 1);
  const lengths = segments(points, tension).map((seg) => {
    let len = 0;
    let prev = seg[0];
    for (let s = 1; s <= 24; s++) {
      const p = bezierAt(seg, s / 24);
      len += Math.hypot(p.x - prev.x, p.y - prev.y);
      prev = p;
    }
    return len;
  });
  const total = lengths.reduce((a, b) => a + b, 0) || 1;
  const fractions = [0];
  let acc = 0;
  for (const l of lengths) {
    acc += l;
    fractions.push(acc / total);
  }
  return fractions;
}
