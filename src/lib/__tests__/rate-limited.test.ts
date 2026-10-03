import { describe, it, expect } from "vitest";
import { rateLimitedBody, rateLimitedOutcome } from "@/components/analysis/rate-limit";

describe("rateLimitedOutcome", () => {
  it("reads the reset time from the 429 headers", () => {
    const res = new Response(null, { status: 429, headers: { "X-RateLimit-Reset": "1700000000000" } });
    expect(rateLimitedOutcome(res)).toEqual({ ok: false, kind: "rate_limited", retryAt: 1700000000000 });
  });

  it("copes with a missing or bad header", () => {
    expect(rateLimitedOutcome(new Response(null, { status: 429 }))).toEqual({ ok: false, kind: "rate_limited", retryAt: undefined });
    const bad = new Response(null, { status: 429, headers: { "X-RateLimit-Reset": "soon" } });
    expect(rateLimitedOutcome(bad)).toMatchObject({ retryAt: undefined });
  });
});

describe("rateLimitedBody", () => {
  const now = new Date(2026, 9, 2, 15, 0).getTime();

  it("names the time another route can be built", () => {
    const at = new Date(2026, 9, 2, 15, 42).getTime();
    const time = new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    expect(rateLimitedBody(at, now)).toContain(`You can try again after ${time}.`);
    expect(rateLimitedBody(at, now)).toContain("Your CV and answers are kept.");
  });

  it("falls back when the time is unknown or already past", () => {
    expect(rateLimitedBody(undefined, now)).toContain("Try again in a few minutes.");
    expect(rateLimitedBody(now - 1000, now)).toContain("Try again in a few minutes.");
  });
});
