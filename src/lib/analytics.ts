/**
 * Typed product analytics.
 *
 * Every event PathPilot can emit is declared in `AnalyticsEvents`. Calls go to
 * the registered sinks; with no sink registered, events are dropped (and logged
 * in development). No provider is wired up yet: PostHog will be registered here
 * once there is a project key and the Privacy Policy describes it.
 *
 * Page views are still collected separately by Vercel Web Analytics
 * (<Analytics /> in the root layout).
 */

type SizeBucket = "<250KB" | "250KB-1MB" | "1-3MB" | "3-5MB";

export type AnalyticsEvents = {
  landing_cta_clicked: { location: "hero" | "final" | "nav" };
  sample_report_viewed: Record<string, never>;
  sample_tab_switched: { tab: string };
  signup_completed: Record<string, never>;
  wizard_started: Record<string, never>;
  wizard_step_completed: { step: string };
  wizard_completed: Record<string, never>;
  cv_uploaded: { type: "pdf" | "text"; size_bucket: SizeBucket | "n/a" };
  cv_upload_failed: { reason: "wrong_type" | "too_large" | "unreadable" | "network" | "too_short" };
  analysis_started: Record<string, never>;
  analysis_completed: { duration_ms: number };
  analysis_failed: { reason: string };
  results_viewed: Record<string, never>;
  results_section_viewed: { section: string };
  plan_task_checked: { step: number; checked: boolean };
  pdf_downloaded: Record<string, never>;
  pricing_intent_clicked: { price: string };
  waitlist_joined: Record<string, never>;
};

export type AnalyticsEventName = keyof AnalyticsEvents;

export type AnalyticsSink = <E extends AnalyticsEventName>(
  event: E,
  properties: AnalyticsEvents[E]
) => void;

const sinks = new Set<AnalyticsSink>();

/** Register a provider (e.g. PostHog). Returns an unregister function. */
export function registerAnalyticsSink(sink: AnalyticsSink): () => void {
  sinks.add(sink);
  return () => sinks.delete(sink);
}

type PropsArg<E extends AnalyticsEventName> =
  AnalyticsEvents[E] extends Record<string, never> ? [properties?: AnalyticsEvents[E]] : [properties: AnalyticsEvents[E]];

/** Emit an event. Safe to call anywhere; a no-op on the server. */
export function track<E extends AnalyticsEventName>(event: E, ...args: PropsArg<E>): void {
  if (typeof window === "undefined") return;
  const properties = (args[0] ?? {}) as AnalyticsEvents[E];

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, properties);
  }

  for (const sink of sinks) {
    try {
      sink(event, properties);
    } catch {
      // A failing provider must never break the product.
    }
  }
}

/** Bucket a byte size for `cv_uploaded` without sending the exact size. */
export function sizeBucket(bytes: number): SizeBucket {
  if (bytes < 250 * 1024) return "<250KB";
  if (bytes < 1024 * 1024) return "250KB-1MB";
  if (bytes < 3 * 1024 * 1024) return "1-3MB";
  return "3-5MB";
}
