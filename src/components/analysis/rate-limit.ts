import type { RunOutcome } from "./analysis-run";

/**
 * A 429 from /api/analyze (the per-account hourly limit) or from middleware
 * (the per-IP flood limit). Both send `X-RateLimit-Reset` as epoch ms.
 */
export function rateLimitedOutcome(response: Response): RunOutcome {
  const reset = Number(response.headers.get("X-RateLimit-Reset"));
  return { ok: false, kind: "rate_limited", retryAt: Number.isFinite(reset) && reset > 0 ? reset : undefined };
}

/** "You can try again after 3:42 PM." An absolute time stays true while the page sits open. */
export function rateLimitedBody(retryAt: number | undefined, now = Date.now()): string {
  const lead = "To keep PathPilot free during beta, there's a cap on how many routes can be built in a short time.";
  const kept = "Your CV and answers are kept.";
  if (!retryAt || retryAt <= now) return `${lead} Try again in a few minutes. ${kept}`;
  const time = new Date(retryAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${lead} You can try again after ${time}. ${kept}`;
}
