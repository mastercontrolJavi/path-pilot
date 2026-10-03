/*
 * Landing FAQ. Every answer has to match the code and the Privacy Policy /
 * Terms; anything not yet verified carries a COPY-CHECK note.
 */
// Shared by the static and interactive versions so they look identical.
export const faqRowClass =
  "flex min-h-16 w-full cursor-pointer items-center justify-between gap-6 py-4 text-left text-base font-medium text-ink transition-colors duration-[180ms] hover:text-forest md:text-lg";
export const faqAnswerClass = "max-w-[68ch] pb-6 text-base text-ink-muted";
export const faqLinkClass =
  "mt-3 inline-block text-forest underline decoration-forest/40 underline-offset-4 hover:decoration-forest";

export type FaqItem = {
  id: string;
  question: string;
  answer: string[];
  link?: { href: string; label: string };
};

export const FAQ: FaqItem[] = [
  {
    id: "pay",
    question: "How accurate are the pay figures?",
    answer: [
      "They're estimates for the location you give, at the level you could realistically enter. They're useful for comparing routes, but they aren't live market data, so check current listings before you negotiate.",
    ],
  },
  {
    id: "markets",
    question: "Which countries does it work for?",
    answer: [
      "Any location you name. Pay is estimated in the local currency. If the location is too broad to estimate responsibly, the report leaves pay out rather than guess.",
    ],
  },
  {
    id: "privacy",
    question: "What happens to my CV?",
    answer: [
      "Your CV text and answers are sent to OpenAI's API to write your report. Your file and report are stored with Supabase, where access is limited to your account. We don't sell your data, and you can ask us to delete it at any time.",
    ],
    link: { href: "/privacy", label: "Read the privacy policy" },
  },
  {
    id: "time",
    question: "How long does it take?",
    // COPY-CHECK: re-time the analysis once report v2 runs in production (was 30-60s for v1).
    answer: [
      "About five minutes to upload your CV and answer the questions. The analysis itself usually takes about a minute.",
    ],
  },
  {
    id: "cost",
    question: "What does it cost?",
    // COPY-CHECK: true while there is no pricing; revisit if the paid listings idea launches.
    answer: ["Nothing right now. There's no credit card and no trial to cancel."],
  },
  {
    id: "degree",
    question: "What if I don't have a degree?",
    // COPY-CHECK: relies on the wizard's education question (Phase 3) and the v2 prompt.
    answer: [
      "You'll be asked about your education, and routes that hire on demonstrated skill are favored. When a role usually expects a degree, your report says so.",
    ],
  },
];
