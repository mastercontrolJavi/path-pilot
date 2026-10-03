import { useReducedMotion as useMotionReducedMotion } from "motion/react";
import type { Transition, Variants } from "motion/react";

/**
 * Motion tokens. Mirrored as CSS variables in globals.css
 * (`--ease-out-soft`, `--ease-route`) for CSS-only animation.
 *
 * Principles: one orchestrated moment per page; animate only transform,
 * opacity, stroke-dashoffset and clip-path; reduced motion gets calm fades.
 */
export const ease = {
  out: [0.22, 1, 0.36, 1], // default for entrances
  inOut: [0.65, 0, 0.35, 1], // route drawing, page transitions
} as const;

export const duration = {
  instant: 0.12, // press feedback
  fast: 0.18, // hovers, toggles
  base: 0.28, // wizard step transitions, panels
  slow: 0.52, // section reveals that are earned
  route: 1.4, // the Route drawing
} as const;

export const spring = { type: "spring", stiffness: 420, damping: 34, mass: 0.8 } as const;

/** Transition used everywhere when the user prefers reduced motion. */
export const reducedTransition: Transition = { duration: duration.instant, ease: "linear" };

/**
 * SSR-safe reduced-motion preference (client components only). Returns `false`
 * until the client knows otherwise; CSS media queries cover the first paint.
 * App surfaces are also wrapped in <MotionRoot>, which sets
 * `reducedMotion="user"` so transform/layout animations drop to fades.
 */
export function useReducedMotion(): boolean {
  return useMotionReducedMotion() ?? false;
}

/**
 * Step transition: outgoing moves −24px and fades, incoming arrives from +24px.
 * `custom` is the direction: 1 = forward, −1 = back.
 */
export function stepVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      enter: { opacity: 0 },
      center: { opacity: 1, transition: reducedTransition },
      exit: { opacity: 0, transition: reducedTransition },
    };
  }
  return {
    enter: (dir: number) => ({ opacity: 0, x: 24 * dir }),
    center: { opacity: 1, x: 0, transition: { duration: duration.base, ease: ease.out } },
    exit: (dir: number) => ({
      opacity: 0,
      x: -24 * dir,
      transition: { duration: duration.base, ease: ease.out },
    }),
  };
}

/** 180ms crossfade between app-flow pages (View Transitions are experimental in Next 16). */
export function crossfade(reduced: boolean): Transition {
  return reduced ? reducedTransition : { duration: duration.fast, ease: ease.inOut };
}
