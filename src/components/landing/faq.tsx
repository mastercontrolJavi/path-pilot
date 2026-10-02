import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { FAQ, faqAnswerClass, faqLinkClass, faqRowClass } from "./faq-content";
import { LazyFaq } from "./lazy-sections";

/** No-JS version: native disclosure widgets, fully keyboard operable. */
function FaqStatic() {
  return (
    <div className="border-t border-contour">
      {FAQ.map((item) => (
        <details key={item.id} className="group border-b border-contour">
          <summary className={`${faqRowClass} list-none [&::-webkit-details-marker]:hidden`}>
            {item.question}
            <ChevronDown
              aria-hidden
              className="size-[18px] shrink-0 stroke-[1.5] text-ink-muted transition-transform duration-[180ms] group-open:rotate-180"
            />
          </summary>
          <div className={faqAnswerClass}>
            {item.answer.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {item.link && (
              <Link href={item.link.href} className={faqLinkClass}>
                {item.link.label}
              </Link>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

export function Faq() {
  return (
    <LazyFaq>
      <FaqStatic />
    </LazyFaq>
  );
}
