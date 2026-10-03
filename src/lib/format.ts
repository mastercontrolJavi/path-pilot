/** Formatting for data figures (rendered in Fragment Mono). */

const symbolCache = new Map<string, string>();

function currencySymbol(currency: string): string {
  const cached = symbolCache.get(currency);
  if (cached) return cached;
  let symbol = currency + " ";
  try {
    const part = new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "narrowSymbol" })
      .formatToParts(0)
      .find((p) => p.type === "currency");
    if (part) symbol = part.value;
  } catch {
    // Unknown currency code: fall back to the code itself.
  }
  symbolCache.set(currency, symbol);
  return symbol;
}

/** $95k, £42k, $38/hr style. Values under 1,000 are shown in full. */
export function formatMoney(value: number, currency = "USD", period: "year" | "hour" = "year"): string {
  const symbol = currencySymbol(currency);
  const amount =
    period === "hour" || Math.abs(value) < 1000
      ? new Intl.NumberFormat("en-US", { maximumFractionDigits: value % 1 === 0 ? 0 : 2 }).format(value)
      : `${Math.round(value / 1000)}k`;
  return `${symbol}${amount}${period === "hour" ? "/hr" : ""}`;
}

/** $78k–$110k (en dash, no spaces). */
export function formatMoneyRange(low: number, high: number, currency = "USD", period: "year" | "hour" = "year"): string {
  return `${formatMoney(low, currency, period)}–${formatMoney(high, currency, period)}`;
}

/** Spoken form for screen readers: "78,000 to 110,000 US dollars a year". */
export function describeMoneyRange(low: number, high: number, currency = "USD", period: "year" | "hour" = "year"): string {
  const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 });
  return `${fmt.format(low)} to ${fmt.format(high)} ${period === "hour" ? "an hour" : "a year"}`;
}

/** Oct 2, 2026 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
