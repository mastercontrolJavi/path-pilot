import { persona } from "../fixtures";
import { mix, prog } from "../lib/anim";
import { useT } from "../lib/useT";
import { KineticLine } from "../components/KineticLine";
import { Paper, type Layout } from "../components/Frame";
import { DOT, placeTabs, PUSH, TabStrip } from "../ui/Tabs";
import { color, ease } from "../tokens";
import { displayStyle, font } from "../fonts";

/** Scene 2 — the fog: forty tabs multiply around "you are here" and push it into the corner. */
export function S2Fog({ layout }: { layout: Layout }) {
  const t = useT();
  const L = layout === "landscape";
  const dot = DOT[layout];
  const push = prog(t, PUSH.start, PUSH.dur, ease.inOut);
  const dx = mix(dot.start.x, dot.corner.x, push);
  const dy = mix(dot.start.y, dot.corner.y, push);
  const dim = mix(1, 0.5, prog(t, 1.0, 0.4));
  // Camera: a slow pull back while the frame fills.
  const cam = mix(1.1, 1.0, prog(t, 0, 4, ease.inOut));

  return (
    <Paper>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${cam})` }}>
        {/* Dim the stack as a layer so overlapping tabs still hide each other's text. */}
        <div style={{ position: "absolute", inset: 0, opacity: dim }}>
          {placeTabs(layout).map((p, i) => {
            const a = prog(t, p.arrive, 0.35);
            if (a <= 0) return null;
            // Each tab spawns from the dot and settles in place.
            const placed = { ...p, x: mix(dx - p.w / 2, p.x, a), y: mix(dy - 20, p.y, a) };
            return <TabStrip key={i} p={placed} opacity={Math.min(1, a * 2)} scale={mix(0.6, 1, a)} fontSize={L ? 20 : 24} />;
          })}
        </div>
        <Dot x={dx} y={dy} label={persona.current} size={L ? 22 : 24} />
      </div>
      <KineticLine
        t={t}
        start={1.0}
        lines={fogLines(layout)}
        style={fogStyle(layout)}
      />
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
export function Dot({ x, y, label, size = 22, labelOpacity = 1 }: { x: number; y: number; label?: string; size?: number; labelOpacity?: number }) {
  return (
    <>
      <svg width={size * 2} height={size * 2} style={{ position: "absolute", left: x - size, top: y - size, overflow: "visible" }}>
        <circle cx={size} cy={size} r={size * 0.55} fill={color.blaze} stroke={color.forestDeep} strokeWidth={size * 0.12} />
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
