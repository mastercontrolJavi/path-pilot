import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { color } from "../tokens";

export type Layout = "landscape" | "portrait";

export const SIZE = {
  landscape: { w: 1920, h: 1080 },
  portrait: { w: 1080, h: 1920 },
} as const;

/** 9:16 safe area: text and key UI stay inside 1080×1500 (top 200 and bottom 220 clear). */
export const SAFE = { top: 200, bottom: 1700 };

export function Paper({ children }: { children: ReactNode }) {
  return <AbsoluteFill style={{ background: color.paper, overflow: "hidden" }}>{children}</AbsoluteFill>;
}
