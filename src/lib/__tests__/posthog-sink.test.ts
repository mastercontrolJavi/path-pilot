import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("analytics queue (PostHog key set)", () => {
  it("queues events, requests the provider once, and flushes in order when it registers", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    const requestIdleCallback = vi.fn();
    vi.stubGlobal("window", { requestIdleCallback, location: { pathname: "/" } });
    const { track, registerAnalyticsSink } = await import("../analytics");

    track("landing_cta_clicked", { location: "hero" });
    track("sample_report_viewed");
    expect(requestIdleCallback).toHaveBeenCalledTimes(1);

    const sink = vi.fn();
    registerAnalyticsSink(sink);
    expect(sink.mock.calls.map((c) => c[0])).toEqual(["landing_cta_clicked", "sample_report_viewed"]);
    expect(sink.mock.calls[0][2]).toMatchObject({ pathname: "/" });

    track("pdf_downloaded");
    expect(sink).toHaveBeenCalledTimes(3);
  });

  it("drops events when no key is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    const requestIdleCallback = vi.fn();
    vi.stubGlobal("window", { requestIdleCallback, location: { pathname: "/" } });
    const { track, registerAnalyticsSink } = await import("../analytics");

    track("results_viewed");
    const sink = vi.fn();
    registerAnalyticsSink(sink);
    expect(sink).not.toHaveBeenCalled();
    expect(requestIdleCallback).not.toHaveBeenCalled();
  });
});

describe("createPostHogSink", () => {
  it("sends anonymous events with a scrubbed path and no preflight-triggering headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}"));
    const store = new Map<string, string>();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", {
      sessionStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) },
    });
    const { createPostHogSink } = await import("../posthog-sink");

    const sink = createPostHogSink("phc_test", "https://eu.i.posthog.com/");
    sink("analysis_completed", { duration_ms: 41000 }, {
      timestamp: "2026-10-02T12:00:00.000Z",
      pathname: "/analysis/0b6f3c2e-1d2a-4c5b-9e8f-112233445566",
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://eu.i.posthog.com/i/v0/e/");
    expect(init).toMatchObject({ method: "POST", keepalive: true, credentials: "omit" });
    expect(init.headers).toBeUndefined();
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      api_key: "phc_test",
      event: "analysis_completed",
      timestamp: "2026-10-02T12:00:00.000Z",
      properties: { duration_ms: 41000, $pathname: "/analysis/:id", $process_person_profile: false },
    });
    expect(body.distinct_id).toBe(store.get("pp:analytics-id"));

    // Same tab, same ID.
    const again = createPostHogSink("phc_test", "https://eu.i.posthog.com");
    again("pdf_downloaded", {}, { timestamp: "", pathname: "/" });
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).distinct_id).toBe(body.distinct_id);
  });
});
