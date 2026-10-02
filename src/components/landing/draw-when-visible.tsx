"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The hero Route draws once on load. On small screens it starts below the
 * fold, so the drawing would finish unseen: in that case hold it (data-armed,
 * see globals.css) and play it from the start when the map scrolls into view.
 * Without JavaScript, or with reduced motion, nothing is held back.
 */
export function DrawWhenVisible({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;

    el.setAttribute("data-armed", "");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.removeAttribute("data-armed");
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
