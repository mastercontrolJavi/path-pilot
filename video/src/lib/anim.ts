import { interpolate } from "remotion";
import { ease } from "../tokens";

/** 0→1 between `start` and `start + dur` seconds, eased (entrances by default). */
export function prog(t: number, start: number, dur: number, easing = ease.out): number {
  return interpolate(t, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
}

export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

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
