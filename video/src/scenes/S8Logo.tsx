import { statements } from "../fixtures";
import { mix, prog } from "../lib/anim";
import { useT } from "../lib/useT";
import { Logo } from "../components/Logo";
import { Paper, SIZE, type Layout } from "../components/Frame";
import { color, ease } from "../tokens";
import { font } from "../fonts";
import { Panels } from "./S7Destination";

/**
 * Scene 8 — the logo. Hard pull-back: the results shrink to the centre and
 * clear (0–0.7) while the mark's route draws (0.2–1.2). Then the wordmark
 * (1.2), the line (1.8, needs 2.5s) and the URL (2.4). Everything is still
 * from 2.8 to 6.0: a 3.2s final hold.
 */
export function S8Logo({ layout }: { layout: Layout }) {
  const t = useT();
  const L = layout === "landscape";
  const { w, h } = SIZE[layout];
  const back = prog(t, 0, 0.7, ease.inOut);
  const mark = prog(t, 0.2, 1.0, ease.inOut);
  const word = prog(t, 1.2, 0.4);
  const line = prog(t, 1.8, 0.4);
  const url = prog(t, 2.4, 0.4);

  return (
    <Paper>
      {back < 1 && (
        <div style={{ position: "absolute", inset: 0, transform: `scale(${mix(1, 0.08, back)})`, transformOrigin: `${w / 2}px ${h * (L ? 0.42 : 0.4)}px`, opacity: 1 - back }}>
          {/* The final Scene 7 state (t past every animation). */}
          <Panels layout={layout} t={99} />
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: L ? 44 : 56, paddingBottom: L ? 0 : 80 }}>
        <Logo height={L ? 150 : 132} markOpacity={mark} routeProgress={mark} wordOpacity={word} />
        <p
          style={{
            margin: 0,
            fontFamily: font.sans,
            fontSize: L ? 40 : 46,
            fontWeight: 450,
            color: color.ink,
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: L ? 1400 : 860,
            textWrap: "balance",
            opacity: line,
            transform: `translateY(${10 * (1 - line)}px)`,
          }}
        >
          {statements.tagline}
        </p>
        <p style={{ margin: 0, fontFamily: font.mono, fontSize: L ? 28 : 32, color: color.inkMuted, opacity: url }}>{statements.url}</p>
      </div>
    </Paper>
  );
}
