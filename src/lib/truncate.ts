const TRUNCATION_NOTICE = "\n\n[CV text truncated for analysis limits]";

export function smartTruncateCv(text: string, maxLength = 12000): string {
  if (text.length <= maxLength) return text;

  const sliced = text.slice(0, maxLength);
  const boundary = Math.max(
    sliced.lastIndexOf("."),
    sliced.lastIndexOf("!"),
    sliced.lastIndexOf("\n")
  );

  const truncated = boundary > 0 ? sliced.slice(0, boundary + 1) : sliced;
  return truncated + TRUNCATION_NOTICE;
}
