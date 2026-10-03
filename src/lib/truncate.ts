const TRUNCATION_NOTICE = "\n\n[CV text truncated for analysis limits]";

// Only back up to a sentence or line break near the cutoff. An early boundary
// (a CV pasted as one long line with an initial like "J. Smith") would
// otherwise throw away almost the whole CV.
const MIN_KEPT_RATIO = 0.8;

export function smartTruncateCv(text: string, maxLength = 12000): string {
  if (text.length <= maxLength) return text;

  const sliced = text.slice(0, maxLength);
  const boundary = Math.max(
    sliced.lastIndexOf("."),
    sliced.lastIndexOf("!"),
    sliced.lastIndexOf("\n")
  );

  const truncated =
    boundary >= maxLength * MIN_KEPT_RATIO ? sliced.slice(0, boundary + 1) : sliced;
  return truncated + TRUNCATION_NOTICE;
}
