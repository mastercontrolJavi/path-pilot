import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";

export type Shot = { x?: number; y?: number; scale?: number; rx?: number; ry?: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * The one camera (brief §3): perspective 2400px, translate and scale, at most
 * 6° rotateX / 4° rotateY, and a constant slow drift (0.5% scale per second by
 * default) so no frame is frozen. `background` sits deeper and moves at 30%
 * of the camera (parallax). Tilt is only applied while it's non-zero, so
 * resting frames stay 2D and text rasterizes crisply.
 */
export function Camera({
  t,
  shot = {},
  origin = "50% 50%",
  drift = 0.005,
  background,
  children,
}: {
  t: number;
  shot?: Shot;
  origin?: string;
  drift?: number;
  background?: ReactNode;
  children: ReactNode;
}) {
  const s = (shot.scale ?? 1) * (1 + drift * t);
  const x = shot.x ?? 0;
  const y = shot.y ?? 0;
  const rx = clamp(shot.rx ?? 0, -6, 6);
  const ry = clamp(shot.ry ?? 0, -4, 4);
  const tilt = Math.abs(rx) > 0.01 || Math.abs(ry) > 0.01 ? ` rotateX(${rx}deg) rotateY(${ry}deg)` : "";
  return (
    <AbsoluteFill style={{ perspective: 2400, perspectiveOrigin: origin }}>
      {background && (
        <AbsoluteFill style={{ transformOrigin: origin, transform: `translate(${x * 0.3}px, ${y * 0.3}px) scale(${1 + (s - 1) * 0.3})` }}>
          {background}
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ transformOrigin: origin, transform: `translate(${x}px, ${y}px) scale(${s})${tilt}` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
}
