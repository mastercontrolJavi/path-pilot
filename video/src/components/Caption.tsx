import type { CSSProperties } from "react";
import { prog } from "../lib/anim";
import { color } from "../tokens";
import { font } from "../fonts";

/** Small product caption (General Sans, ink-muted). Fades in and holds; fades as a whole. */
export function Caption({ text, t, start, exit, size = 28, style }: { text: string; t: number; start: number; exit?: number; size?: number; style?: CSSProperties }) {
  const p = prog(t, start, 0.3) * (exit === undefined ? 1 : 1 - prog(t, exit, 0.25));
  return (
    <p
      style={{
        position: "absolute",
        margin: 0,
        fontFamily: font.sans,
        fontSize: size,
        fontWeight: 450,
        lineHeight: 1.35,
        color: color.inkMuted,
        opacity: p,
        transform: `translateY(${8 * (1 - p)}px)`,
        ...style,
      }}
    >
      {text}
    </p>
  );
}
