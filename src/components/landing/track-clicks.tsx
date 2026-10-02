"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

type CtaLocation = "hero" | "final" | "nav";

/**
 * One delegated listener for marketing CTAs, so links stay server-rendered:
 * <a data-track="landing_cta_clicked" data-track-location="hero">.
 */
export function TrackClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-track]");
      if (!el) return;
      if (el.getAttribute("data-track") === "landing_cta_clicked") {
        const location = el.getAttribute("data-track-location") as CtaLocation | null;
        if (location) track("landing_cta_clicked", { location });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
