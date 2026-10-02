"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { CareerPath } from "@/lib/schemas";
import { duration, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { DestinationDetails, DestinationSummary } from "./destination-summary";

export const detailsToggleClass =
  "inline-flex min-h-9 items-center gap-1.5 rounded-control px-0 text-sm font-medium text-forest underline decoration-forest/30 underline-offset-4 pointer-coarse:min-h-11";

/**
 * Ranked destination rows (not cards). Expanding a row fades its detail in;
 * rows below glide to their new position (transform only).
 */
export function DestinationList({
  paths,
  animate = false,
  idPrefix = "destination",
}: {
  paths: CareerPath[];
  animate?: boolean;
  idPrefix?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <LayoutGroup>
      <ol className="border-b border-contour">
        {paths.map((path, i) => {
          const isOpen = open === i;
          const detailsId = `${idPrefix}-${i}-details`;
          return (
            <motion.li
              key={path.title}
              layout="position"
              transition={{ duration: duration.base, ease: ease.out }}
              className={cn(i > 0 && "border-t border-contour")}
            >
              <DestinationSummary path={path} rank={i} animate={animate} delay={i * 0.12}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={detailsId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className={cn(detailsToggleClass, "cursor-pointer hover:decoration-forest")}
                >
                  {isOpen ? "Hide details" : "Details"}
                  <ChevronDown
                    aria-hidden
                    className={cn("size-4 stroke-[1.5] transition-transform duration-[180ms]", isOpen && "rotate-180")}
                  />
                </button>
              </DestinationSummary>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: duration.base, ease: ease.out } }}
                    exit={{ opacity: 0, transition: { duration: duration.fast } }}
                  >
                    <DestinationDetails path={path} id={detailsId} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ol>
    </LayoutGroup>
  );
}
