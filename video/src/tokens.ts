import { Easing } from "remotion";

/** Mirrors the app's @theme tokens (src/app/globals.css). No raw hex outside this file. */
export const color = {
  paper: "#f3f4ef",
  sheet: "#fbfbf8",
  contour: "#d5dace",
  fog: "#e8ebe3",
  edge: "#7f8980",
  ink: "#17211c",
  inkMuted: "#55615a",
  inkFaint: "#5f6a63",
  forest: "#1f4d3a",
  forestDeep: "#153729",
  moss: "#a9bfa0",
  blaze: "#e2a92b",
  success: "#2f6b4a",
} as const;

export const radius = { control: 8, panel: 14, feature: 20 } as const;

export const shadowFloat = "0 1px 2px rgb(23 33 28 / 0.06), 0 8px 24px -8px rgb(23 33 28 / 0.14)";

export const ease = {
  out: Easing.bezier(0.22, 1, 0.36, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
};

/** UI settling: no overshoot. */
export const settle = { damping: 200 } as const;
