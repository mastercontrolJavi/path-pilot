/**
 * Fake-door test for a paid feature, shown at the end of the plan.
 * OFF by default. Before switching it on, decide where interest is recorded:
 * today it only emits analytics events (pricing_intent_clicked, waitlist_joined),
 * and no analytics provider is connected yet, so nothing would be captured.
 */
export const FAKE_DOOR = {
  enabled: false,
  price: "$9 a month",
  headline: "Get weekly matched job listings for this route",
  body: "Every Monday, a short list of open roles that fit this route, filtered by your location and constraints.",
  cta: "Get weekly listings",
  followUpTitle: "We're opening this soon. Want early access?",
  followUpBody: "Nothing is charged and nothing is set up yet. We're checking whether this is worth building.",
  confirm: "Yes, I'm interested",
  thanks: "Thanks. That helps us decide what to build next.",
} as const;
