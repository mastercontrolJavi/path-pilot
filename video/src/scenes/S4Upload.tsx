import { interpolate } from "remotion";
import { mix, prog } from "../lib/anim";
import { useT } from "../lib/useT";
import { Cursor } from "../components/Cursor";
import { RouteLine } from "../components/Route";
import { Paper, SIZE, type Layout } from "../components/Frame";
import { CompactPath, CvStep, DragGhost, WizardRail, type UploadState } from "../ui/UploadScreen";
import { ease } from "../tokens";
import { routePoints } from "./S3OneRoute";

/**
 * Scene 4 — the camera follows the Route in while the CV step assembles; the
 * cursor drags maria-reyes-cv.pdf in, the zone turns forest, and on the drop
 * (beat, 1.2) the file row's mini Route draws to "Ready" (beat, 1.8). Continue
 * is pressed on the 2.4 beat. The step's own heading carries the caption.
 */
export const DROP = 1.2;
export const READY = 1.8;
export const CONTINUE = 2.4;

const STAGE = {
  landscape: {
    k: 1.6, left: 176, top: 135,
    zone: { x: 1232, y: 580 }, from: { x: 1990, y: 900 }, button: { x: 1650, y: 705 }, rest: { x: 1700, y: 760 },
  },
  portrait: {
    k: 1.55, left: 44, top: 520,
    zone: { x: 540, y: 1030 }, from: { x: 780, y: 1860 }, button: { x: 948, y: 1158 }, rest: { x: 990, y: 1220 },
  },
} as const;

/** Piecewise eased path through waypoints at given times. */
function along(t: number, keys: { t: number; x: number; y: number }[]) {
  let p = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (t <= a.t) return { x: a.x, y: a.y };
    if (t < b.t) {
      const k = prog(t, a.t, b.t - a.t, ease.inOut);
      return { x: mix(a.x, b.x, k), y: mix(a.y, b.y, k) };
    }
    p = b;
  }
  return { x: p.x, y: p.y };
}

export function S4Upload({ layout }: { layout: Layout }) {
  const t = useT();
  const L = layout === "landscape";
  const g = STAGE[layout];
  const { w, h } = SIZE[layout];
  const stagger = 4 / 60;
  const enter = [0, 1, 2, 3].map((i) => prog(t, 0.15 + i * stagger, 0.4)) as UploadState["enter"];

  const c = along(t, [
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
    dragOver: prog(t, 0.85, 0.18),
    dropped: t >= DROP,
    line: prog(t, DROP + 0.1, 0.5, ease.inOut),
    ready: prog(t, READY - 0.2, 0.2),
    press: click(CONTINUE),
  };

  // Camera: the Route from Scene 3 rushes past as we move into the product.
  const into = prog(t, 0, 0.4, ease.inOut);
  const end = routePoints(layout)[2];

  return (
    <Paper>
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
        <div style={{ position: "absolute", left: c.x + 22, top: c.y + 30, opacity: prog(t, 0.3, 0.15) }}>
          <DragGhost opacity={0.92} />
        </div>
      )}
      <Cursor x={c.x} y={c.y} size={L ? 1.6 : 1.8} press={Math.max(click(DROP), click(CONTINUE))} opacity={prog(t, 0.3, 0.15)} />
    </Paper>
  );
}
