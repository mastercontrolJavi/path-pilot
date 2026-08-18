"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Progressive enhancement for the site's wayfinding motion language. */
export function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.setAttribute("data-visible", "true"));
      return;
    }

    document.documentElement.dataset.motion = "ready";
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute("data-visible", "true");
        observer.unobserve(entry.target);
      }),
      { rootMargin: "0px 0px -12%", threshold: 0.12 },
    );
    revealItems.forEach((item) => observer.observe(item));

    const interactiveItems = Array.from(document.querySelectorAll<HTMLElement>("[data-interactive]"));
    const cleanups = interactiveItems.map((item) => {
      const trackPointer = (event: PointerEvent) => {
        const bounds = item.getBoundingClientRect();
        item.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
        item.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
      };
      item.addEventListener("pointermove", trackPointer);
      return () => item.removeEventListener("pointermove", trackPointer);
    });

    return () => { observer.disconnect(); cleanups.forEach((cleanup) => cleanup()); };
  }, [pathname]);

  return null;
}
