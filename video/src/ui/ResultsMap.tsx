import { destinations, formatK } from "../fixtures";
import { prog } from "../lib/anim";
import { RouteLine, RouteNode } from "../components/Route";
import { ContourField } from "../components/ContourField";
import { color, ease, radius } from "../tokens";
import { font } from "../fonts";

/*
 * The results terrain map (src/components/results/terrain-map.tsx + terrain.ts):
 * x = match %, y = pay midpoint, routes from "you are here" through a shared
 * trunk to each role. Same scales and branch shapes, with the map size as a
 * parameter so 9:16 gets a taller plot instead of a crop.
 */
export type MapBox = { w: number; h: number; left: number; right: number; top: number; bottom: number; labelW: number };

export const MAP_LANDSCAPE: MapBox = { w: 1000, h: 520, left: 70, right: 40, top: 44, bottom: 60, labelW: 220 };
export const MAP_PORTRAIT: MapBox = { w: 600, h: 700, left: 56, right: 16, top: 56, bottom: 64, labelW: 186 };

type Pt = { x: number; y: number };

function layout(M: MapBox) {
  const fits = destinations.map((d) => d.fit);
  const mids = destinations.map((d) => (d.low + d.high) / 2);
  let lo = Math.max(0, Math.min(...fits) - 12);
  let hi = Math.min(100, Math.max(...fits) + 12);
  if (hi - lo < 30) {
    const pad = (30 - (hi - lo)) / 2;
    lo -= pad;
    hi += pad;
  }
  const pay: [number, number] = [Math.min(...mids) * 0.8, Math.max(...mids) * 1.12];
  const plotW = M.w - M.left - M.right;
  const plotH = M.h - M.top - M.bottom;
  const points = destinations.map((d, i) => {
    const x = M.left + ((d.fit - lo) / (hi - lo)) * plotW;
    const y = M.top + (1 - (mids[i] - pay[0]) / (pay[1] - pay[0])) * plotH;
    return { ...d, x, y, labelY: y, side: x + 20 + M.labelW > M.w ? ("left" as const) : ("right" as const) };
  });
  const byY = [...points].sort((a, b) => a.labelY - b.labelY);
  for (let i = 1; i < byY.length; i++) if (byY[i].labelY - byY[i - 1].labelY < 52) byY[i].labelY = byY[i - 1].labelY + 52;
  return { origin: { x: M.left, y: M.h - M.bottom }, points };
}

const fork = (o: Pt): Pt => ({ x: o.x + 48, y: o.y - 10 });
const trunk = (o: Pt): Pt[] => [o, { x: o.x + 24, y: o.y - 3 }, fork(o)];
function routeTo(o: Pt, p: Pt): Pt[] {
  const f = fork(o);
  const climbEnd = f.x + Math.min(90, (p.x - f.x) * 0.45);
  return [f, { x: f.x + (climbEnd - f.x) * 0.5, y: (f.y + p.y) / 2 }, { x: climbEnd, y: p.y }, p];
}

/** `t` is seconds into the map: trunk first, then a branch per beat; each label lands with its branch. */
export function ResultsMap({ M, t, branchStarts, branchDur = 0.6 }: { M: MapBox; t: number; branchStarts: number[]; branchDur?: number }) {
  const { origin, points } = layout(M);
  const trunkP = prog(t, branchStarts[0] - 0.4, 0.4, ease.inOut);
  return (
    <figure style={{ margin: 0, width: M.w, borderRadius: radius.panel, border: `1px solid ${color.contour}`, background: color.paper, overflow: "hidden", fontFamily: font.sans }}>
      <div style={{ position: "relative", width: M.w, height: M.h }}>
        <ContourField seed={23} width={M.w} height={M.h} />
        <svg width={M.w} height={M.h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <line x1={origin.x} y1={origin.y} x2={M.w - M.right} y2={origin.y} stroke={color.edge} strokeWidth={1} />
          <line x1={origin.x} y1={origin.y} x2={origin.x} y2={M.top} stroke={color.edge} strokeWidth={1} />
          <RouteLine points={trunk(origin)} progress={trunkP} width={1.5} />
          {points.map((p, i) => {
            const b = prog(t, branchStarts[i], branchDur, ease.inOut);
            return (
              <g key={p.title}>
                <RouteLine points={routeTo(origin, p)} progress={b} width={1.5} />
                <RouteNode x={p.x} y={p.y} r={8} state="destination" opacity={prog(t, branchStarts[i] + branchDur - 0.1, 0.15)} />
              </g>
            );
          })}
          <RouteNode x={origin.x} y={origin.y} r={8} state="current" />
        </svg>
        <span style={{ position: "absolute", left: origin.x - 4, top: origin.y + 14, fontSize: 12, color: color.inkMuted }}>You are here</span>
        <span style={{ position: "absolute", right: 16, top: origin.y + 14, fontSize: 12, color: color.inkMuted }}>Better fit →</span>
        <span style={{ position: "absolute", left: 16, top: M.top - 30, fontSize: 12, color: color.inkMuted }}>Higher pay</span>
        {points.map((p, i) => {
          const a = prog(t, branchStarts[i] + branchDur - 0.1, 0.25);
          return (
            <div
              key={p.title}
              style={{
                position: "absolute",
                left: p.x,
                top: p.labelY,
                maxWidth: M.labelW,
                transform: `translate(${p.side === "left" ? "-100%" : "0"}, -50%) translateY(${6 * (1 - a)}px)`,
                padding: p.side === "left" ? "0 20px 0 0" : "0 0 0 20px",
                textAlign: p.side === "left" ? "right" : "left",
                opacity: a,
              }}
            >
              <div style={{ fontSize: 14, lineHeight: 1.35, fontWeight: 500, color: color.ink }}>{p.title}</div>
              <div style={{ display: "flex", gap: 10, fontFamily: font.mono, fontSize: 12, color: color.inkMuted, justifyContent: p.side === "left" ? "flex-end" : "flex-start" }}>
                <span>{p.fit}%</span>
                <span>
                  {formatK(p.low)}–{formatK(p.high)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <figcaption style={{ borderTop: `1px solid ${color.contour}`, background: color.sheet, padding: "10px 16px", fontSize: 12, color: color.inkMuted }}>
        Estimates, not live market data.
      </figcaption>
    </figure>
  );
}
