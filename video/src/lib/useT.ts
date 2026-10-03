import { useCurrentFrame, useVideoConfig } from "remotion";

/** Seconds since the start of the current Sequence (frame-driven, so it renders identically at 30 or 60fps). */
export function useT(): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
}
