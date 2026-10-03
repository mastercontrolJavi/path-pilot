import { color } from "../tokens";
import { font } from "../fonts";

/** The app's wayfinding mark and wordmark (src/components/ui/logo.tsx), scalable. viewBox 0 0 140 28. */
export function Logo({ height, markOpacity = 1, wordOpacity = 1, routeProgress = 1 }: { height: number; markOpacity?: number; wordOpacity?: number; routeProgress?: number }) {
  return (
    <svg height={height} width={(height * 140) / 28} viewBox="0 0 140 28" fill="none" style={{ overflow: "visible" }}>
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
