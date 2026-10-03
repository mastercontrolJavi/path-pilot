import { tabs as TITLES } from "../fixtures";
import { mulberry32 } from "../lib/anim";
import { color } from "../tokens";
import { font } from "../fonts";
import type { Layout } from "../components/Frame";

export type TabPlacement = { title: string; x: number; y: number; w: number; rot: number; shade: "sheet" | "fog"; arrive: number };

/** Where "you are here" starts (below the statement), and where the tabs push it. */
export const DOT = {
  landscape: { start: { x: 760, y: 780 }, corner: { x: 170, y: 930 } },
  portrait: { start: { x: 300, y: 1250 }, corner: { x: 110, y: 1610 } },
} as const;

/** The dot lands (0–0.3s), then its label holds for its reading time (1.9s) before the push. */
export const PUSH = { start: 2.2, dur: 1.5 } as const;

/** Forty tabs, deterministic. Arrival accelerates: the gaps shrink toward 2.4s. */
export function placeTabs(layout: Layout): TabPlacement[] {
  const rand = mulberry32(layout === "landscape" ? 7 : 19);
  const W = layout === "landscape" ? 1920 : 1080;
  const H = layout === "landscape" ? 1080 : 1920;
  const cols = layout === "landscape" ? 5 : 3;
  const rows = Math.ceil(TITLES.length / cols);
  const corner = DOT[layout].corner;
  return TITLES.map((title, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const w = 330 + rand() * 130;
    let x = ((c + 0.15 + rand() * 0.7) / cols) * W - w / 2 + (r % 2 ? 40 : -40);
    let y = ((r + 0.2 + rand() * 0.6) / rows) * H - 26;
    // Keep the corner clear for the dot and its label.
    if (x < corner.x + 520 && y > corner.y - 110 && y < corner.y + 70) y = corner.y - 130 - rand() * 60;
    x = Math.max(-80, Math.min(W - w + 80, x));
    y = Math.max(-10, Math.min(H - 40, y));
    return {
      title,
      x,
      y,
      w,
      rot: (rand() * 2 - 1) * 3,
      shade: rand() > 0.45 ? "sheet" : "fog",
      arrive: 0.15 + 2.25 * Math.pow(i / (TITLES.length - 1), 0.62),
    };
  });
}

/** A browser-tab strip: rounded top corners, favicon, title, close mark. */
export function TabStrip({ p, opacity, scale = 1, squash = 1, fontSize = 20 }: { p: TabPlacement; opacity: number; scale?: number; squash?: number; fontSize?: number }) {
  const h = fontSize * 2.5;
  return (
    <div
      style={{
        position: "absolute",
        left: p.x,
        top: p.y,
        width: p.w,
        height: h,
        transform: `rotate(${p.rot}deg) scale(${scale}) scaleY(${squash})`,
        transformOrigin: "center",
        opacity,
        background: p.shade === "sheet" ? color.sheet : color.fog,
        border: `1px solid ${color.contour}`,
        borderBottom: "none",
        borderRadius: `${h * 0.24}px ${h * 0.24}px 0 0`,
        boxShadow: "0 1px 2px rgb(23 33 28 / 0.05)",
        display: "flex",
        alignItems: "center",
        gap: fontSize * 0.6,
        padding: `0 ${fontSize * 0.8}px`,
        fontFamily: font.sans,
        fontSize,
        color: color.inkMuted,
      }}
    >
      <span style={{ width: fontSize * 0.8, height: fontSize * 0.8, borderRadius: 999, background: p.shade === "sheet" ? color.moss : color.contour, flexShrink: 0 }} />
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
      <span style={{ color: color.inkFaint, fontSize: fontSize * 0.9, flexShrink: 0 }}>×</span>
    </div>
  );
}
