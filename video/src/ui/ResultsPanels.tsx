import { destinations, formatK, toBuild, youBring } from "../fixtures";
import { prog } from "../lib/anim";
import { color, ease, radius } from "../tokens";
import { displayStyle, font } from "../fonts";

const fade = (p: number, dy = 10) => ({ opacity: p, transform: `translateY(${dy * (1 - p)}px)` });

/** Best-fit panel (20px radius): title, MatchMeter filling to 87%, typical pay range. App scale. */
export function BestFitPanel({ t, start, meterAt, payAt, width = 520 }: { t: number; start: number; meterAt: number; payAt: number; width?: number }) {
  const d = destinations[0];
  const settle = prog(t, start, 0.45);
  const fill = prog(t, meterAt, 0.8, ease.inOut);
  const shown = Math.round(d.fit * fill);
  const pad = (d.high - d.low) * 0.35;
  const [min, max] = [d.low - pad, d.high + pad];
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const draw = prog(t, payAt, 0.6, ease.inOut);
  const ends = prog(t, payAt + 0.3, 0.3);

  return (
    <div style={{ width, borderRadius: radius.feature, border: `1px solid ${color.contour}`, background: color.sheet, padding: 32, fontFamily: font.sans, ...fade(settle, 12) }}>
      <p style={{ margin: 0, fontSize: 14, color: color.inkMuted }}>Best fit</p>
      <h3 style={{ margin: "6px 0 0", color: color.ink, ...displayStyle(34, 420), lineHeight: 1.12 }}>{d.title}</h3>

      {/* MatchMeter: ten segments, never a donut */}
      <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 3, width: 168, height: 10 }}>
          {Array.from({ length: 10 }, (_, i) => {
            const seg = Math.max(0, Math.min(1, (d.fit * fill - i * 10) / 10));
            return (
              <span key={i} style={{ position: "relative", flex: 1, borderRadius: 2, background: color.fog, overflow: "hidden" }}>
                <span style={{ position: "absolute", inset: 0, width: `${seg * 100}%`, background: color.forest }} />
              </span>
            );
          })}
        </div>
        <span style={{ fontFamily: font.mono, fontSize: 18, color: color.ink, fontVariantNumeric: "tabular-nums" }}>{shown}%</span>
        <span style={{ fontSize: 14, color: color.inkMuted }}>match</span>
      </div>

      {/* RangeBar (no median tick: reports don't carry a market median) */}
      <p style={{ margin: "28px 0 0", fontSize: 14, fontWeight: 500, color: color.ink, opacity: prog(t, payAt - 0.2, 0.25) }}>Typical pay</p>
      <div style={{ position: "relative", paddingTop: 26, paddingBottom: 8 }}>
        <div style={{ height: 8, borderRadius: 999, background: color.fog, opacity: prog(t, payAt - 0.2, 0.25) }} />
        <div style={{ position: "absolute", top: 26, height: 8, left: `${pct(d.low)}%`, width: `${pct(d.high) - pct(d.low)}%` }}>
          <div style={{ height: "100%", borderRadius: 999, background: color.forest, transform: `scaleX(${draw})`, transformOrigin: "left center" }} />
        </div>
        {[d.low, d.high].map((v) => (
          <span key={v} style={{ position: "absolute", top: 0, left: `${pct(v)}%`, transform: "translateX(-50%)", fontFamily: font.mono, fontSize: 13, color: color.ink, opacity: ends }}>
            {formatK(v)}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Skill gaps for the best fit: "You bring" chips and "To build" rows with effort. App scale. */
export function SkillGaps({ t, bringAt, buildAt, width = 480 }: { t: number; bringAt: number; buildAt: number; width?: number }) {
  return (
    <div style={{ width, fontFamily: font.sans }}>
      <h3 style={{ margin: 0, color: color.ink, ...displayStyle(22, 420), lineHeight: 1.25, ...fade(prog(t, bringAt, 0.3)) }}>You bring</h3>
      <ul style={{ listStyle: "none", margin: "14px 0 0", padding: 0, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {youBring.map((skill, i) => {
          const p = prog(t, bringAt + 0.1 + i * 0.08, 0.3);
          return (
            <li key={skill} style={{ borderRadius: 999, background: "rgb(169 191 160 / 0.55)", padding: "6px 12px", fontSize: 14, color: color.ink, opacity: p, transform: `translateX(${-14 * (1 - p)}px)` }}>
              {skill}
            </li>
          );
        })}
      </ul>

      <h3 style={{ margin: "36px 0 0", color: color.ink, ...displayStyle(22, 420), lineHeight: 1.25, ...fade(prog(t, buildAt, 0.3)) }}>To build</h3>
      <ol style={{ listStyle: "none", margin: "14px 0 0", padding: 0, borderTop: `1px solid ${color.contour}`, opacity: prog(t, buildAt, 0.3) }}>
        {toBuild.map((gap, i) => {
          const p = prog(t, buildAt + 0.15 + i * 0.3, 0.3);
          return (
            <li key={gap.skill} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 0", borderBottom: `1px solid ${color.contour}`, ...fade(p, 8) }}>
              <span style={{ fontSize: 16, fontWeight: 500, color: color.ink }}>{gap.skill}</span>
              <span style={{ fontSize: 14, color: color.inkMuted }}>{gap.effort}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
