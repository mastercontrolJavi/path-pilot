import { color } from "../tokens";
import { font } from "../fonts";

let canvas: HTMLCanvasElement | null = null;

/**
 * Right edge of the wordmark's ink, in logo units. The app's artwork is 140
 * units wide but "Pilot" ends near 119, so a centred 140-unit box sits about
 * 10 units left of centre. Measured from the loaded font (fonts.ts blocks
 * rendering until General Sans is ready); 120 if canvas isn't available.
 */
function wordmarkRight(): number {
  if (typeof document === "undefined") return 120;
  canvas ??= document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 120;
  ctx.font = `300 14px ${font.sans}`;
  const ink = ctx.measureText("Pilot").actualBoundingBoxRight;
  return 86 + ink - 0.4 * 4; // letter-spacing −0.4 between the 5 glyphs
}

/** The app's wayfinding mark and wordmark (src/components/ui/logo.tsx), scalable, boxed tight to its ink so it centres truly. */
export function Logo({ height, markOpacity = 1, wordOpacity = 1, routeProgress = 1 }: { height: number; markOpacity?: number; wordOpacity?: number; routeProgress?: number }) {
  const right = wordmarkRight();
  return (
    <svg height={height} width={(height * right) / 28} viewBox={`0 0 ${right} 28`} fill="none" style={{ overflow: "visible" }}>
      <g color={color.ink} opacity={markOpacity}>
        <line x1="0" y1="14" x2="44" y2="14" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
        <path
          d="M 2,14 C 4,10 8,7 11,7 C 14,7 17,21 20,21 C 23,21 26,9 29,9 C 32,9 35,16 38,16 C 40,15.5 42,14 46,14"
          stroke="currentColor"
          strokeWidth="0.7"
          opacity="0.2"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - routeProgress}
        />
        <circle cx="2" cy="14" r="1.6" fill="currentColor" />
        <circle cx="11" cy="7" r="1.2" fill="currentColor" />
        <circle cx="20" cy="21" r="1.2" fill="currentColor" />
        <circle cx="29" cy="9" r="1.2" fill="currentColor" />
        <circle cx="38" cy="16" r="1.4" fill="currentColor" />
        <circle cx="46" cy="14" r="3.2" fill={color.forest} />
        <circle cx="46" cy="14" r="5" fill="none" stroke={color.forest} strokeWidth="0.5" opacity="0.35" />
      </g>
      <g opacity={wordOpacity} fill={color.ink} style={{ fontFamily: font.sans }}>
        <text x="56" y="19" fontSize="14" fontWeight="600" letterSpacing="-0.4">
          Path
        </text>
        <text x="86" y="19" fontSize="14" fontWeight="300" letterSpacing="-0.4">
          Pilot
        </text>
      </g>
    </svg>
  );
}
