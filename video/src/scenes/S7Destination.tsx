import { useVideoConfig } from "remotion";
import { statements } from "../fixtures";
import { keys, mix, prog, springT } from "../lib/anim";
import { useT } from "../lib/useT";
import { Camera } from "../components/Camera";
import { Caption } from "../components/Caption";
import { Paper, type Layout } from "../components/Frame";
import { MAP_LANDSCAPE, MAP_PORTRAIT, ResultsMap } from "../ui/ResultsMap";
import { BestFitPanel, SkillGaps } from "../ui/ResultsPanels";
import { ease } from "../tokens";

/**
 * Scene 7 — the destination. Local beats every 0.6s.
 *  0.0–0.8  camera settles out of a tilt; the map springs in; trunk draws
 *  0.6/1.2/1.8  one branch per beat (labels land at 1.2, 1.8, 2.4)
 *  3.6      push into the best fit: the camera dives at the top destination
 *           as the map gives way to the best-fit panel
 *  4.0–4.8  match fills to 87% (count stops on the 4.8 beat)
 *  4.8–5.4  typical pay draws
 *  5.4      you bring; 6.0 to build (rows 6.15, 6.45, 6.75), hold to 9.0
 * The camera leans toward each part as it lands, then settles on the whole.
 * Caption from 1.2 to the end (needs ≥3.7s).
 */
export const BRANCHES = [0.6, 1.2, 1.8];
export const PUSH = 3.6;
export const METER_AT = 4.0;
export const PAY_AT = 4.8;
export const BRING_AT = 5.4;
export const BUILD_AT = 6.0;

const STAGE = {
  landscape: {
    map: { M: MAP_LANDSCAPE, k: 1.5, left: 210, top: 60, dive: "62% 30%" },
    panel: { k: 1.6, left: 150, top: 200 },
    gaps: { k: 1.6, left: 1062, top: 200 },
    caption: { left: 210, top: 968, size: 28, width: 1500 },
    lean: { axis: "x" as const, panel: 70, gaps: -70 },
  },
  portrait: {
    map: { M: MAP_PORTRAIT, k: 1.6, left: 60, top: 240, dive: "64% 22%" },
    panel: { k: 1.6, left: 60, top: 260 },
    gaps: { k: 1.6, left: 60, top: 860 },
    caption: { left: 60, top: 1540, size: 36, width: 960 },
    lean: { axis: "y" as const, panel: 60, gaps: -60 },
  },
} as const;

/** Best fit + skill gaps, placed for the layout. Scene 8 reuses it for the pull-back. */
export function Panels({ layout, t, arrive = 1 }: { layout: Layout; t: number; arrive?: number }) {
  const L = layout === "landscape";
  const g = STAGE[layout];
  // Arriving from the dive: slightly larger, settling to rest.
  const k = mix(1.06, 1, arrive);
  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${k})`, transformOrigin: L ? "30% 30%" : "50% 20%" }}>
      <div style={{ position: "absolute", left: g.panel.left, top: g.panel.top, transform: `scale(${g.panel.k})`, transformOrigin: "0 0" }}>
        <BestFitPanel t={t} start={PUSH} meterAt={METER_AT} payAt={PAY_AT} width={L ? 520 : 600} />
      </div>
      <div style={{ position: "absolute", left: g.gaps.left, top: g.gaps.top, transform: `scale(${g.gaps.k})`, transformOrigin: "0 0" }}>
        <SkillGaps t={t} bringAt={BRING_AT} buildAt={BUILD_AT} width={L ? 480 : 600} />
      </div>
    </div>
  );
}

export function S7Destination({ layout }: { layout: Layout }) {
  const t = useT();
  const { fps } = useVideoConfig();
  const g = STAGE[layout];
  const settleIn = prog(t, 0, 0.8, ease.inOut);
  const mapIn = springT(t, fps, 0);
  const dive = prog(t, PUSH, 0.5, ease.inOut);

  // Camera leans toward the part that is landing, then settles on the whole.
  const lean = keys(t, [
    { t: PUSH, v: 0 },
    { t: PUSH + 0.6, v: g.lean.panel },
    { t: BRING_AT - 0.2, v: g.lean.panel },
    { t: BRING_AT + 0.8, v: g.lean.gaps },
    { t: 7.4, v: g.lean.gaps },
    { t: 8.6, v: 0 },
  ]);
  const zoom = keys(t, [
    { t: 0, v: 1.04 },
    { t: 0.8, v: 1 },
    { t: PUSH, v: 1 },
    { t: PUSH + 0.6, v: 1.035 },
    { t: 7.4, v: 1.035 },
    { t: 8.6, v: 1 },
  ]);
  const shot = {
    x: g.lean.axis === "x" ? lean : 0,
    y: g.lean.axis === "y" ? lean : 0,
    scale: zoom,
    rx: mix(5, 0, settleIn),
  };

  return (
    <Paper>
      <Camera t={t} drift={0.003} shot={shot}>
        {dive < 1 && (
          <div style={{ position: "absolute", left: g.map.left, top: g.map.top, transform: `scale(${g.map.k})`, transformOrigin: "0 0" }}>
            <div style={{ transform: `scale(${mix(0.97, 1, mapIn) * mix(1, 1.4, dive)})`, transformOrigin: g.map.dive, opacity: Math.min(1, mapIn * 1.4) * (1 - prog(t, PUSH, 0.28)) }}>
              <ResultsMap M={g.map.M} t={t} branchStarts={BRANCHES} />
            </div>
          </div>
        )}
        {t >= PUSH && <Panels layout={layout} t={t} arrive={springT(t, fps, PUSH)} />}
      </Camera>
      <Caption text={statements.caption7} t={t} start={1.2} size={g.caption.size} style={{ left: g.caption.left, top: g.caption.top, maxWidth: g.caption.width }} />
    </Paper>
  );
}
