import { AbsoluteFill } from "remotion";
import { statements } from "../fixtures";
import { ContourField } from "../components/ContourField";
import { Logo } from "../components/Logo";
import { color } from "../tokens";
import { font } from "../fonts";

export type ThumbnailProps = { variant: "contour" | "plain" | "tagline" };

/**
 * Landscape portfolio thumbnail (16:9). The real lockup, boxed tight to its ink
 * so it centres truly, sitting slightly above the geometric centre (optical).
 * `contour` adds the survey-map texture at 6%; `tagline` adds the film's last line.
 */
export function Thumbnail({ variant }: ThumbnailProps) {
  return (
    <AbsoluteFill style={{ background: color.paper }}>
      {variant === "contour" && <ContourField seed={11} width={1920} height={1080} levels={11} opacity={0.06} />}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 40, gap: 56 }}>
        <Logo height={variant === "tagline" ? 200 : 236} />
        {variant === "tagline" && (
          <p style={{ margin: 0, fontFamily: font.sans, fontSize: 44, fontWeight: 450, color: color.inkMuted, letterSpacing: "-0.005em" }}>{statements.tagline}</p>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
