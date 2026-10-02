"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export type NavSection = { id: string; label: string };

/**
 * Sticky section nav with scroll-spy. Desktop: a vertical list beside the
 * report. Phones: a horizontal scroller under the app header. Also reports
 * results_section_viewed once per section.
 */
export function SectionNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length || typeof IntersectionObserver === "undefined") return;

    const spy = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );
    const seen = new Set<string>();
    const viewed = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !seen.has(e.target.id)) {
            seen.add(e.target.id);
            track("results_section_viewed", { section: e.target.id });
          }
        }
      },
      { threshold: 0.25 }
    );
    els.forEach((el) => {
      spy.observe(el);
      viewed.observe(el);
    });
    return () => {
      spy.disconnect();
      viewed.disconnect();
    };
  }, [sections]);

  const link = (s: NavSection, vertical: boolean) => (
    <a
      key={s.id}
      href={`#${s.id}`}
      aria-current={active === s.id ? "location" : undefined}
      className={cn(
        "relative shrink-0 rounded-control text-sm transition-colors duration-[180ms] hover:text-ink",
        active === s.id ? "font-medium text-ink" : "text-ink-muted",
        vertical
          ? "flex min-h-9 items-center pl-4 before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:transition-colors aria-[current=location]:before:bg-forest"
          : "inline-flex min-h-11 items-center px-1 after:absolute after:inset-x-1 after:bottom-1 after:h-0.5 after:rounded-full aria-[current=location]:after:bg-forest"
      )}
    >
      {s.label}
    </a>
  );

  return (
    <>
      <nav aria-label="Report sections" className="sticky top-24 hidden border-l border-contour lg:block print:hidden">
        <div className="flex flex-col gap-0.5">{sections.map((s) => link(s, true))}</div>
      </nav>
      <nav
        aria-label="Report sections"
        className="sticky top-14 z-30 -mx-6 overflow-x-auto border-b border-contour bg-paper px-5 lg:hidden print:hidden"
      >
        <div className="flex gap-5">{sections.map((s) => link(s, false))}</div>
      </nav>
    </>
  );
}
