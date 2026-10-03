import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

export const analyzeRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "ratelimit:analyze",
    })
  : null;

export const globalRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "ratelimit:global",
    })
  : null;

/**
 * Returns a 429 response when `identifier` is over its limit, otherwise null.
 * Fails open: if Upstash is unreachable the request goes through, so a Redis
 * outage can't take the site or the analysis down with it.
 */
export async function rateLimitResponse(
  limiter: Ratelimit | null,
  identifier: string,
  message: string
): Promise<NextResponse | null> {
  if (!limiter) return null;

  let result: Awaited<ReturnType<Ratelimit["limit"]>>;
  try {
    result = await limiter.limit(identifier);
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return null;
  }

  if (result.success) return null;

  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
      },
    }
  );
}
