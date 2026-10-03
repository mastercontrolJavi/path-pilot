import { useVideoConfig } from "remotion";
import { persona } from "../fixtures";
import { mix, prog, springT } from "../lib/anim";
import { useT } from "../lib/useT";
import { Camera } from "../components/Camera";
import { KineticLine } from "../components/KineticLine";
import { Paper, type Layout } from "../components/Frame";
import { DOT, placeTabs, PUSH, TabStrip } from "../ui/Tabs";
import { color, ease } from "../tokens";
import { displayStyle, font } from "../fonts";

/** The film's single overshoot (brief §3): the blaze node landing. */
const LANDING = { damping: 11, stiffness: 170, mass: 0.7 };

/**
 * Scene 2 — the fog. "You are here" lands, then forty tabs multiply around it,
 * faster and faster, and push it into the corner while the camera pulls back.
 */
export function S2Fog({ layout }: { layout: Layout }) {
  const t = useT();
  const { fps } = useVideoConfig();
  const L = layout === "landscape";
  const dot = DOT[layout];
  const push = prog(t, PUSH.start, PUSH.dur, ease.inOut);
  const dx = mix(dot.start.x, dot.corner.x, push);
  const dy = mix(dot.start.y, dot.corner.y, push);
  const dim = mix(1, 0.5, prog(t, 1.0, 0.4));
  const pull = prog(t, 0, 4, ease.inOut);

  return (
    <Paper>
      {/* The pull-back is this scene's camera move; it ends at exactly 1.0 so the cut into Scene 3 doesn't jump. */}
      <Camera t={t} drift={0} shot={{ scale: mix(1.1, 1.0, pull), rx: mix(4, 0, prog(t, 0, 3, ease.inOut)) }} origin={`${dot.start.x}px ${dot.start.y}px`}>
        {/* Dim the stack as a layer so overlapping tabs still hide each other's text. */}
        <div style={{ position: "absolute", inset: 0, opacity: dim }}>
          {placeTabs(layout).map((p, i) => {
            const a = springT(t, fps, p.arrive);
            if (a <= 0.001) return null;
            // Each tab spawns from the dot and settles in place.
            const placed = { ...p, x: mix(dx - p.w / 2, p.x, a), y: mix(dy - 20, p.y, a), rot: p.rot * a };
            return <TabStrip key={i} p={placed} opacity={Math.min(1, a * 2.5)} scale={mix(0.55, 1, a)} fontSize={L ? 20 : 24} />;
          })}
        </div>
        <Dot x={dx} y={dy} label={persona.current} size={L ? 22 : 24} scale={springT(t, fps, 0, LANDING)} labelOpacity={prog(t, 0.1, 0.2)} />
      </Camera>
      <KineticLine t={t} start={1.0} lines={fogLines(layout)} style={fogStyle(layout)} />
    </Paper>
  );
}

/** The Scene 2 statement, shared with Scene 3 (which plays its exit). */
export const fogLines = (layout: Layout) =>
  layout === "landscape" ? ["Changing careers usually", "means forty tabs."] : ["Changing careers", "usually means", "forty tabs."];

export const fogStyle = (layout: Layout): React.CSSProperties => ({
  position: "absolute",
  left: 0,
  right: 0,
  top: layout === "landscape" ? 330 : 720,
  textAlign: "center",
  color: color.ink,
  textShadow: `0 0 18px ${color.paper}, 0 0 36px ${color.paper}`,
  ...displayStyle(layout === "landscape" ? 128 : 104, 420),
});

/** "You are here": blaze node with a forest ring and its Fragment Mono label. */
export function Dot({ x, y, label, size = 22, labelOpacity = 1, scale = 1 }: { x: number; y: number; label?: string; size?: number; labelOpacity?: number; scale?: number }) {
  return (
    <>
      <svg width={size * 2} height={size * 2} style={{ position: "absolute", left: x - size, top: y - size, overflow: "visible" }}>
        <circle cx={size} cy={size} r={size * 0.55 * scale} fill={color.blaze} stroke={color.forestDeep} strokeWidth={size * 0.12 * Math.min(1, scale)} />
      </svg>
      {label && (
        <span
          style={{
            position: "absolute",
            left: x + size,
            top: y - size * 0.62,
            fontFamily: font.mono,
            fontSize: size * 1.05,
            color: color.inkMuted,
            whiteSpace: "nowrap",
            opacity: labelOpacity,
          }}
        >
          {label}
        </span>
      )}
    </>
  );
}
