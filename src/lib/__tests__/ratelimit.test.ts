import { describe, it, expect, vi } from "vitest";
import type { Ratelimit } from "@upstash/ratelimit";
import { rateLimitResponse } from "../ratelimit";

function fakeLimiter(limit: () => Promise<unknown>) {
  return { limit: vi.fn(limit) } as unknown as Ratelimit;
}

describe("rateLimitResponse", () => {
  it("skips the check when Upstash isn't configured", async () => {
    expect(await rateLimitResponse(null, "user:1", "Slow down")).toBeNull();
  });

  it("lets requests under the limit through", async () => {
    const limiter = fakeLimiter(async () => ({ success: true, limit: 5, remaining: 4, reset: 0 }));
    expect(await rateLimitResponse(limiter, "user:1", "Slow down")).toBeNull();
  });

  it("returns a 429 with rate-limit headers over the limit", async () => {
    const limiter = fakeLimiter(async () => ({ success: false, limit: 5, remaining: 0, reset: 1700000000000 }));
    const res = await rateLimitResponse(limiter, "user:1", "Slow down");
    expect(res?.status).toBe(429);
    expect(await res?.json()).toEqual({ error: "Slow down" });
    expect(res?.headers.get("X-RateLimit-Limit")).toBe("5");
    expect(res?.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(res?.headers.get("X-RateLimit-Reset")).toBe("1700000000000");
  });

  it("fails open when Upstash errors", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const limiter = fakeLimiter(async () => {
      throw new Error("ECONNRESET");
    });
    expect(await rateLimitResponse(limiter, "ip:1.2.3.4", "Slow down")).toBeNull();
    spy.mockRestore();
  });
});
