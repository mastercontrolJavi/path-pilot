import { persona } from "../fixtures";
import { mix, prog } from "../lib/anim";
import { useT } from "../lib/useT";
import { KineticLine } from "../components/KineticLine";
import { RouteLine } from "../components/Route";
import { ContourField } from "../components/ContourField";
import { Paper, SIZE, type Layout } from "../components/Frame";
import { DOT, placeTabs, TabStrip } from "../ui/Tabs";
import { color, ease } from "../tokens";
import { displayStyle } from "../fonts";
import { Dot, fogLines, fogStyle } from "./S2Fog";

/** The Route's points from the dot, per layout. */
export function routePoints(layout: Layout) {
  const c = DOT[layout].corner;
  return layout === "landscape"
    ? [c, { x: 560, y: 790 }, { x: 980, y: 830 }, { x: 1400, y: 660 }, { x: 2020, y: 600 }]
    : [c, { x: 400, y: 1440 }, { x: 680, y: 1500 }, { x: 930, y: 1260 }, { x: 1180, y: 1170 }];
}

/** Scene 3 — on the beat, every tab collapses into the dot and one line leaves it: the Route. */
export function S3OneRoute({ layout }: { layout: Layout }) {
  const t = useT();
  const L = layout === "landscape";
  const { w, h } = SIZE[layout];
  const c = DOT[layout].corner;
  const collapse = prog(t, 0, 0.35, ease.inOut);
  const draw = prog(t, 0.25, 1.1, ease.inOut);
  const field = prog(t, 0.4, 0.8);

  return (
    <Paper>
      <div style={{ position: "absolute", inset: 0, opacity: field }}>
        <ContourField seed={11} width={w} height={h} opacity={0.07} />
      </div>
      {collapse < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: 0.5 * (1 - collapse) }}>
          {placeTabs(layout).map((p, i) => (
            <TabStrip
              key={i}
              p={{ ...p, x: mix(p.x, c.x - p.w / 2, collapse), y: mix(p.y, c.y - 20, collapse), rot: p.rot * (1 - collapse) }}
              opacity={1}
              scale={mix(1, 0.15, collapse)}
              fontSize={L ? 20 : 24}
            />
          ))}
        </div>
      )}
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <RouteLine points={routePoints(layout)} progress={draw} width={L ? 4 : 4.5} />
      </svg>
      <Dot x={c.x} y={c.y} label={persona.current} size={L ? 22 : 24} labelOpacity={1 - prog(t, 0.2, 0.3)} />
      {/* The previous statement leaves as a whole on the cut. */}
      {t < 0.3 && <KineticLine t={t} start={-10} exit={0} lines={fogLines(layout)} style={fogStyle(layout)} />}
      <KineticLine
        t={t}
        start={0.45}
        lines={L ? ["PathPilot gives you", "one route."] : ["PathPilot gives", "you one route."]}
        style={{ position: "absolute", left: L ? 170 : 110, top: L ? 190 : 430, color: color.ink, ...displayStyle(L ? 128 : 104, 420) }}
      />
    </Paper>
  );
}
