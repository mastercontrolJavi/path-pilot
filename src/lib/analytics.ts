/**
 * Typed product analytics.
 *
 * Every event PathPilot can emit is declared in `AnalyticsEvents`. Calls go to
 * the registered sinks (logged in development too).
 *
 * PostHog is the provider when NEXT_PUBLIC_POSTHOG_KEY is set. Its sink is
 * loaded lazily: the first event schedules the import for an idle moment and
 * events are queued until it registers, so nothing is added to the landing
 * page's initial JS. Without a key, events are dropped. What is sent is
 * described in the Privacy Policy ("Page and product analytics").
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

/** When and where an event happened (it may be sent later, from another page). */
export type EventMeta = { timestamp: string; pathname: string };

export type AnalyticsSink = <E extends AnalyticsEventName>(
  event: E,
  properties: AnalyticsEvents[E],
  meta: EventMeta
) => void;

const sinks = new Set<AnalyticsSink>();

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

type Queued = [AnalyticsEventName, AnalyticsEvents[AnalyticsEventName], EventMeta];
const QUEUE_LIMIT = 50;
const queue: Queued[] = [];
let providerRequested = false;

/** Register a provider (e.g. PostHog). Flushes queued events. Returns an unregister function. */
export function registerAnalyticsSink(sink: AnalyticsSink): () => void {
  sinks.add(sink);
  for (const [event, properties, meta] of queue.splice(0)) send(sink, event, properties, meta);
  return () => sinks.delete(sink);
}

function send(sink: AnalyticsSink, ...[event, properties, meta]: Queued) {
  try {
    sink(event, properties, meta);
  } catch {
    // A failing provider must never break the product.
  }
}

function requestProvider() {
  if (providerRequested || !POSTHOG_KEY) return;
  providerRequested = true;
  const key = POSTHOG_KEY;
  const load = () =>
    import("./posthog-sink")
      .then(({ createPostHogSink }) => registerAnalyticsSink(createPostHogSink(key, POSTHOG_HOST)))
      .catch(() => {
        queue.length = 0;
      });
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(load, { timeout: 4000 });
  else window.setTimeout(load, 2000);
}

type PropsArg<E extends AnalyticsEventName> =
  AnalyticsEvents[E] extends Record<string, never> ? [properties?: AnalyticsEvents[E]] : [properties: AnalyticsEvents[E]];

/** Emit an event. Safe to call anywhere; a no-op on the server. */
export function track<E extends AnalyticsEventName>(event: E, ...args: PropsArg<E>): void {
  if (typeof window === "undefined") return;
  const properties = (args[0] ?? {}) as AnalyticsEvents[E];
  const meta: EventMeta = { timestamp: new Date().toISOString(), pathname: window.location?.pathname ?? "" };

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, properties);
  }

  if (sinks.size === 0 && POSTHOG_KEY) {
    if (queue.length < QUEUE_LIMIT) queue.push([event, properties, meta]);
    requestProvider();
    return;
  }

  for (const sink of sinks) send(sink, event, properties, meta);
}

/** Bucket a byte size for `cv_uploaded` without sending the exact size. */
export function sizeBucket(bytes: number): SizeBucket {
  if (bytes < 250 * 1024) return "<250KB";
  if (bytes < 1024 * 1024) return "250KB-1MB";
  if (bytes < 3 * 1024 * 1024) return "1-3MB";
  return "3-5MB";
}
