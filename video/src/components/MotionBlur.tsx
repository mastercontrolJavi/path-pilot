import type { ReactNode } from "react";
import { AbsoluteFill, Freeze, useCurrentFrame } from "remotion";
import { color } from "../tokens";

/**
 * Camera motion blur (8 samples, 180° shutter) that keeps the paper colour.
 * @remotion/motion-blur sums 1/n-opacity layers with plus-lighter, which
 * shifted paper (243,244,239) to grey (240,240,240) and would flash on the two
 * blurred moves. This averages instead: sample k is drawn over the previous
 * ones at opacity 1/(k+1), which gives every sample equal weight.
 * Samples are centred on the frame and never reach before the Sequence start.
 */
export function MotionBlur({ children, samples = 8, shutterAngle = 180 }: { children: ReactNode; samples?: number; shutterAngle?: number }) {
  const frame = useCurrentFrame();
  const shutter = shutterAngle / 360;
  return (
    <AbsoluteFill style={{ background: color.paper }}>
      {Array.from({ length: samples }, (_, k) => {
        const offset = shutter * (k / (samples - 1) - 0.5);
        return (
          <AbsoluteFill key={k} style={{ opacity: 1 / (k + 1) }}>
            <Freeze frame={Math.max(0, frame + offset)}>{children}</Freeze>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
}
