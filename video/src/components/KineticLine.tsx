import type { CSSProperties } from "react";
import { prog } from "../lib/anim";
import { ease } from "../tokens";

/**
 * Statement type: words rise 12px and fade in over 0.3s, 0.05s apart (18 and 3
 * frames at 60fps). The line leaves as a whole, never word by word.
 * `lines` breaks the statement explicitly so each layout controls its rag.
 */
export function KineticLine({
  lines,
  t,
  start,
  exit,
  style,
}: {
  lines: string[];
  t: number;
  start: number;
  /** Seconds when the whole line fades out (0.25s). Omit to hold. */
  exit?: number;
  style?: CSSProperties;
}) {
  const out = exit === undefined ? 0 : prog(t, exit, 0.25, ease.inOut);
  let w = 0;
  return (
    <div style={{ ...style, opacity: 1 - out, transform: `translateY(${-8 * out}px)` }}>
      {lines.map((line, li) => (
        <div key={li} style={{ whiteSpace: "nowrap" }}>
          {line.split(" ").map((word, wi) => {
            const p = prog(t, start + w++ * 0.05, 0.3);
            return (
              <span key={wi} style={{ display: "inline-block", opacity: p, transform: `translateY(${12 * (1 - p)}px)` }}>
                {word}
                {wi < line.split(" ").length - 1 ? " " : ""}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
