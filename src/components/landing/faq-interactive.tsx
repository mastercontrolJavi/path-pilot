"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { MotionRoot } from "@/components/pp/motion-root";
import { duration, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { FAQ, faqAnswerClass, faqLinkClass, faqRowClass } from "./faq-content";

/**
 * FAQ with smooth reflow: the answer fades in and the questions below glide
 * to their new place (layout animation = transforms, never height).
 */
export function FaqInteractive() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <MotionRoot>
      <LayoutGroup>
        <div className="border-t border-contour">
          {FAQ.map((item) => {
            const isOpen = open === item.id;
            return (
              <motion.div
                key={item.id}
                layout="position"
                transition={{ duration: duration.base, ease: ease.out }}
                className="border-b border-contour"
              >
                <h3>
                  <button
                    type="button"
                    id={`faq-${item.id}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${item.id}-answer`}
                    onClick={() => setOpen(isOpen ? null : item.id)}
                    className={faqRowClass}
                  >
                    {item.question}
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "size-[18px] shrink-0 stroke-[1.5] text-ink-muted transition-transform duration-[180ms]",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      id={`faq-${item.id}-answer`}
                      role="region"
                      aria-labelledby={`faq-${item.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { duration: duration.base, ease: ease.out } }}
                      exit={{ opacity: 0, transition: { duration: duration.fast } }}
                      className={faqAnswerClass}
                    >
                      {item.answer.map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                      {item.link && (
                        <Link href={item.link.href} className={faqLinkClass}>
                          {item.link.label}
                        </Link>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </LayoutGroup>
    </MotionRoot>
  );
}
