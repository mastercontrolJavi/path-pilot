import { interpolate, useVideoConfig } from "remotion";
import { arcPath, mix, prog, springT } from "../lib/anim";
import { useT } from "../lib/useT";
import { Camera } from "../components/Camera";
import { Cursor } from "../components/Cursor";
import { RouteLine } from "../components/Route";
import { Paper, SIZE, type Layout } from "../components/Frame";
import { CompactPath, CvStep, DragGhost, WizardRail, type UploadState } from "../ui/UploadScreen";
import { ease } from "../tokens";
import { routePoints } from "./S3OneRoute";

/**
 * Scene 4 — the camera follows the Route into the product: it rushes past while
 * the camera settles out of a slight tilt and the CV step's panels spring in
 * (4-frame stagger). The cursor arcs in with maria-reyes-cv.pdf, the zone turns
 * forest, and on the drop (beat, 1.2) the file row's mini Route draws to
 * "Ready" (beat, 1.8). Continue is pressed on the 2.4 beat.
 */
export const DROP = 1.2;
export const READY = 1.8;
export const CONTINUE = 2.4;

const STAGE = {
  landscape: {
    k: 1.6, left: 176, top: 135,
    zone: { x: 1232, y: 580 }, from: { x: 1990, y: 900 }, button: { x: 1650, y: 705 }, rest: { x: 1700, y: 770 },
  },
  portrait: {
    k: 1.55, left: 44, top: 520,
    zone: { x: 540, y: 1030 }, from: { x: 780, y: 1860 }, button: { x: 948, y: 1158 }, rest: { x: 990, y: 1230 },
  },
} as const;

export function S4Upload({ layout }: { layout: Layout }) {
  const t = useT();
  const { fps } = useVideoConfig();
  const L = layout === "landscape";
  const g = STAGE[layout];
  const { w, h } = SIZE[layout];
  const enter = [0, 1, 2, 3].map((i) => springT(t, fps, 0.12 + (i * 4) / 60)) as UploadState["enter"];

  const c = arcPath(t, [
    { t: 0.3, ...g.from },
    { t: DROP, ...g.zone },
    { t: DROP + 0.35, ...g.zone },
    { t: CONTINUE, ...g.button },
    { t: CONTINUE + 0.15, ...g.button },
    { t: 3.0, ...g.rest },
  ]);
  const click = (at: number) => interpolate(t, [at - 0.06, at, at + 0.08], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const s: UploadState = {
    enter,
    dragOver: springT(t, fps, 0.85),
    dropped: t >= DROP,
    line: prog(t, DROP + 0.1, 0.5, ease.inOut),
    ready: prog(t, READY - 0.2, 0.2),
    press: click(CONTINUE),
  };

  // Into the product: the Scene 3 Route rushes past as the camera settles.
  const into = prog(t, 0, 0.4, ease.inOut);
  const settleIn = prog(t, 0, 0.75, ease.inOut);
  const end = routePoints(layout)[2];

  return (
    <Paper>
      <Camera t={t} drift={0.004} origin="50% 42%" shot={{ y: mix(70, 0, settleIn), scale: mix(1.07, 1, settleIn), rx: mix(6, 0, settleIn) }}>
        {into < 1 && (
          <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: 1 - into }}>
            <g transform={`translate(${end.x} ${end.y}) scale(${mix(1, 3, into)}) translate(${-end.x} ${-end.y})`}>
              <RouteLine points={routePoints(layout)} width={L ? 4 : 4.5} />
            </g>
          </svg>
        )}
        <div style={{ position: "absolute", left: g.left, top: g.top, transform: `scale(${g.k})`, transformOrigin: "0 0", display: "flex", flexDirection: L ? "row" : "column", gap: L ? 110 : 40 }}>
          {L ? <WizardRail enter={enter[0]} /> : <div style={{ width: 640 }}><CompactPath enter={enter[0]} /></div>}
          <CvStep s={s} />
        </div>
        {t < DROP && (
          <div style={{ position: "absolute", left: c.x + 22, top: c.y + 30, opacity: prog(t, 0.3, 0.15), transform: `rotate(${mix(-3, 0, prog(t, 0.3, 0.9))}deg)` }}>
            <DragGhost opacity={0.92} />
          </div>
        )}
        <Cursor x={c.x} y={c.y} size={L ? 1.6 : 1.8} press={Math.max(click(DROP), click(CONTINUE))} opacity={prog(t, 0.3, 0.15)} />
      </Camera>
    </Paper>
  );
}
