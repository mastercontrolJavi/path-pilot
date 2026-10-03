import { interpolate, spring, type SpringConfig } from "remotion";
import { ease, settle } from "../tokens";

/** 0→1 between `start` and `start + dur` seconds, eased (entrances by default). */
export function prog(t: number, start: number, dur: number, easing = ease.out): number {
  return interpolate(t, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
}

export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** A spring in seconds (frame-rate independent). Defaults to UI settling: damping 200, no overshoot. */
export function springT(t: number, fps: number, delay = 0, config: Partial<SpringConfig> = settle): number {
  return spring({ frame: Math.max(0, (t - delay) * fps), fps, config });
}

/** Holds between keyframes, eased in and out (camera and Route moves). */
export function keys(t: number, k: { t: number; v: number }[], easing = ease.inOut): number {
  if (t <= k[0].t) return k[0].v;
  for (let i = 1; i < k.length; i++) {
    if (t < k[i].t) return mix(k[i - 1].v, k[i].v, prog(t, k[i - 1].t, k[i].t - k[i - 1].t, easing));
  }
  return k[k.length - 1].v;
}

/**
 * Cursor path: eased quadratic arcs between waypoints (never straight lines).
 * Each segment bows sideways by `bend` of its length, alternating direction.
 */
export function arcPath(t: number, pts: { t: number; x: number; y: number }[], bend = 0.16): { x: number; y: number } {
  if (t <= pts[0].t) return { x: pts[0].x, y: pts[0].y };
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (t < b.t) {
      const k = prog(t, a.t, b.t - a.t, ease.inOut);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const sign = i % 2 ? 1 : -1;
      const c = { x: (a.x + b.x) / 2 - dy * bend * sign, y: (a.y + b.y) / 2 + dx * bend * sign };
      const u = 1 - k;
      return { x: u * u * a.x + 2 * u * k * c.x + k * k * b.x, y: u * u * a.y + 2 * u * k * c.y + k * k * b.y };
    }
  }
  const last = pts[pts.length - 1];
  return { x: last.x, y: last.y };
}

/** Deterministic PRNG (same as the app's contour generator). */
export function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Readability rule (brief §0.6): minimum on-screen hold for a line, in seconds. */
export const minHold = (text: string) => 0.4 + 0.3 * text.trim().split(/\s+/).length;
