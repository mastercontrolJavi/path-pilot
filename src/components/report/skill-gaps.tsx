"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import type { CareerPath } from "@/lib/schemas";
import { RadioGroup, RadioGroupChip } from "@/components/ui/radio-group";
import { duration, ease } from "@/lib/motion";

const EFFORT: Record<CareerPath["skills_to_build"][number]["effort"], string> = {
  days: "A few days",
  weeks: "A few weeks",
  months: "A few months",
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const move = { duration: duration.base, ease: ease.out };

/**
 * What you bring vs what to build, for one destination at a time (best fit
 * first). Skills shared between destinations keep their identity, so switching
 * moves them rather than redrawing them.
 */
export function SkillGaps({ paths, idPrefix = "gaps" }: { paths: CareerPath[]; idPrefix?: string }) {
  const [index, setIndex] = useState(0);
  const path = paths[index];

  if (paths.every((p) => p.skills_you_bring.length === 0 && p.skills_to_build.length === 0)) {
    return (
      <p className="max-w-[62ch] py-6 text-base text-ink-muted">
        This report was made before skill gaps were added. Start a new route to see what transfers and what to
        build for each role.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8 pt-2">
      <RadioGroup
        value={String(index)}
        onValueChange={(v) => setIndex(Number(v))}
        aria-label="Show skill gaps for"
        className="flex w-full flex-wrap gap-2"
      >
        {paths.map((p, i) => (
          <RadioGroupChip key={p.title} value={String(i)}>
            {p.title}
          </RadioGroupChip>
        ))}
      </RadioGroup>

      <LayoutGroup id={idPrefix}>
        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <section aria-labelledby={`${idPrefix}-bring`}>
            <h3 id={`${idPrefix}-bring`} className="font-display text-xl font-[420] text-ink">
              You bring
            </h3>
            <p className="mt-1 text-sm text-ink-muted">From your CV, and they transfer directly.</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout" initial={false}>
                {path.skills_you_bring.map((skill) => (
                  <motion.li
                    key={slug(skill)}
                    layoutId={`${idPrefix}-${slug(skill)}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={move}
                    className="rounded-full bg-moss/55 px-3 py-1.5 text-sm text-ink"
                  >
                    {skill}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </section>

          <section aria-labelledby={`${idPrefix}-build`}>
            <h3 id={`${idPrefix}-build`} className="font-display text-xl font-[420] text-ink">
              To build
            </h3>
            <p className="mt-1 text-sm text-ink-muted">Most important first, with a rough time to close each gap.</p>
            <ol className="mt-4 border-t border-contour">
              <AnimatePresence mode="popLayout" initial={false}>
                {path.skills_to_build.map((gap) => (
                  <motion.li
                    key={slug(gap.skill)}
                    layoutId={`${idPrefix}-${slug(gap.skill)}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={move}
                    className="border-b border-contour py-4"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="font-medium text-ink">{gap.skill}</span>
                      <span className="text-sm text-ink-muted">{EFFORT[gap.effort]}</span>
                    </div>
                    <p className="mt-1 text-base text-ink-muted">{gap.how}</p>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
          </section>
        </div>
      </LayoutGroup>
    </div>
  );
}
