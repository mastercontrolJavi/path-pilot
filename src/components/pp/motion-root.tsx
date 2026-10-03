"use client";

import { MotionConfig } from "motion/react";
import { duration, ease } from "@/lib/motion";

/**
 * Wrap each surface that animates with motion (wizard, analysis, results) — not
 * shared layouts, so pages without motion don't pay for its runtime.
 * `reducedMotion="user"` disables transform and layout animations for people who
 * ask for less motion, leaving opacity fades.
 */
export function MotionRoot({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: duration.base, ease: ease.out }}>
      {children}
    </MotionConfig>
  );
}
