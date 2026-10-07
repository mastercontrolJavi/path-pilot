import type { AnalyticsSink } from "./analytics";

/**
 * PostHog over its capture API, without the SDK: no cookies, no autocapture,
 * no session recording, no extra scripts. Only the typed events in
 * lib/analytics.ts are sent. Loaded lazily by lib/analytics.ts.
 */

const ID_KEY = "pp:analytics-id";

/** A random ID for this tab, kept in sessionStorage so it survives reloads but not closing the tab. */
function tabId(): string {
  try {
    const existing = window.sessionStorage.getItem(ID_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.sessionStorage.setItem(ID_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/** "/analysis/0b6f…" becomes "/analysis/:id": report IDs aren't needed to read a funnel. */
export function scrubPath(pathname: string): string {
  return pathname.replace(UUID, ":id");
}

export function createPostHogSink(apiKey: string, host: string): AnalyticsSink {
  const distinctId = tabId();
  const url = `${host.replace(/\/$/, "")}/i/v0/e/`;

  return (event, properties, meta) => {
    // A string body goes as text/plain: no CORS preflight, so `keepalive` lets
    // the request finish while the page navigates away. PostHog parses it as JSON.
    void fetch(url, {
      method: "POST",
      keepalive: true,
      credentials: "omit",
      body: JSON.stringify({
        api_key: apiKey,
        event,
        distinct_id: distinctId,
        timestamp: meta.timestamp,
        properties: {
          ...properties,
          $pathname: scrubPath(meta.pathname),
          // Anonymous events only: no person profile is created or updated.
          $process_person_profile: false,
        },
      }),
    }).catch(() => {});
  };
}
