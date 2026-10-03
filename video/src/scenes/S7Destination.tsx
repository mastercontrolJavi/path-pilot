import { statements } from "../fixtures";
import { mix, prog } from "../lib/anim";
import { useT } from "../lib/useT";
import { Caption } from "../components/Caption";
import { Paper, type Layout } from "../components/Frame";
import { MAP_LANDSCAPE, MAP_PORTRAIT, ResultsMap } from "../ui/ResultsMap";
import { BestFitPanel, SkillGaps } from "../ui/ResultsPanels";
import { ease } from "../tokens";

/**
 * Scene 7 — the destination. Local beats every 0.6s.
 *  0.0–0.3  map settles in; trunk draws from "you are here"
 *  0.6/1.2/1.8  one branch per beat (labels land at 1.2, 1.8, 2.4)
 *  3.6      push into the best fit: panel settles
 *  4.0–4.8  match fills to 87% (count stops on the 4.8 beat)
 *  4.8–5.4  typical pay draws
 *  5.4      you bring; 6.0 to build (rows 6.15, 6.45, 6.75), hold to 9.0
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
    map: { M: MAP_LANDSCAPE, k: 1.5, left: 210, top: 60 },
    panel: { k: 1.6, left: 150, top: 200 },
    gaps: { k: 1.6, left: 1062, top: 200 },
    caption: { left: 210, top: 968, size: 28, width: 1500 },
  },
  portrait: {
    map: { M: MAP_PORTRAIT, k: 1.6, left: 60, top: 240 },
    panel: { k: 1.6, left: 60, top: 260 },
    gaps: { k: 1.6, left: 60, top: 860 },
    caption: { left: 60, top: 1540, size: 36, width: 960 },
  },
} as const;

/** Best fit + skill gaps, placed for the layout. Scene 8 reuses it for the pull-back. */
export function Panels({ layout, t }: { layout: Layout; t: number }) {
  const L = layout === "landscape";
  const g = STAGE[layout];
  return (
    <>
      <div style={{ position: "absolute", left: g.panel.left, top: g.panel.top, transform: `scale(${g.panel.k})`, transformOrigin: "0 0" }}>
        <BestFitPanel t={t} start={PUSH} meterAt={METER_AT} payAt={PAY_AT} width={L ? 520 : 600} />
      </div>
      <div style={{ position: "absolute", left: g.gaps.left, top: g.gaps.top, transform: `scale(${g.gaps.k})`, transformOrigin: "0 0" }}>
        <SkillGaps t={t} bringAt={BRING_AT} buildAt={BUILD_AT} width={L ? 480 : 600} />
      </div>
    </>
  );
}

export function S7Destination({ layout }: { layout: Layout }) {
  const t = useT();
  const L = layout === "landscape";
  const g = STAGE[layout];
  const settle = prog(t, 0, 0.3);
  const push = prog(t, PUSH, 0.5, ease.inOut);

  return (
    <Paper>
      {push < 1 && (
        <div style={{ position: "absolute", left: g.map.left, top: g.map.top, transform: `scale(${g.map.k})`, transformOrigin: "0 0" }}>
          {/* The push into the best fit: toward the top destination, fading as the panel takes over. */}
          <div
            style={{
              transform: `scale(${mix(0.97, 1, settle) * mix(1, 1.35, push)})`,
              transformOrigin: L ? "62% 30%" : "64% 22%",
              opacity: settle * (1 - push),
            }}
          >
            <ResultsMap M={g.map.M} t={t} branchStarts={BRANCHES} />
          </div>
        </div>
      )}
      {t >= PUSH && <Panels layout={layout} t={t} />}
      <Caption text={statements.caption7} t={t} start={1.2} size={g.caption.size} style={{ left: g.caption.left, top: g.caption.top, maxWidth: g.caption.width }} />
    </Paper>
  );
}
