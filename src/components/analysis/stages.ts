/*
 * Analysis stages. /api/analyze doesn't stream, so only two moments are real:
 * the CV upload finishing (stage 0 -> 1) and the response arriving (final).
 * In between, stages advance on a deliberately slow curve that holds on the
 * last stage, so the route never claims to be done before it is.
 */

export const STAGES = [
  "Sending your CV",
  "Reading your experience",
  "Finding what transfers",
  "Matching roles",
  "Estimating pay",
  "Building your plan",
] as const;

/** Seconds after the analysis request starts when each later stage begins. */
const CURVE = [0, 6, 14, 24, 36];

/**
 * Current stage index. `analysisSeconds` is null until the CV is sent.
 * Never returns past the last stage: completion is a separate, real signal.
 */
export function stageAt(analysisSeconds: number | null): number {
  if (analysisSeconds === null) return 0;
  let stage = 1;
  for (let i = 1; i < CURVE.length; i++) if (analysisSeconds >= CURVE[i]) stage = i + 1;
  return Math.min(stage, STAGES.length - 1);
}

/** The calm line shown during long waits (no percentages, no countdowns). */
export function waitMessage(totalSeconds: number): string | null {
  if (totalSeconds >= 90) return "Taking longer than usual. It's still working, and can take up to five minutes.";
  if (totalSeconds >= 30) return "Still working. Detailed reports can take a minute or two.";
  return null;
}

/** Analyses still "processing" after this long have stopped (the function limit is 300s). */
export const STALE_AFTER_MS = 5 * 60 * 1000;
