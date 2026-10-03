import { describe, it, expect } from "vitest";
import { smartTruncateCv } from "../truncate";

const NOTICE = "\n\n[CV text truncated for analysis limits]";

describe("smartTruncateCv", () => {
  it("leaves text under the limit untouched", () => {
    expect(smartTruncateCv("Short CV.", 100)).toBe("Short CV.");
    expect(smartTruncateCv("x".repeat(100), 100)).toBe("x".repeat(100));
  });

  it("cuts at the last sentence or line break before the limit", () => {
    const text = "a".repeat(85) + ". " + "b".repeat(50);
    expect(smartTruncateCv(text, 100)).toBe("a".repeat(85) + "." + NOTICE);

    const lines = "a".repeat(90) + "\n" + "b".repeat(50);
    expect(smartTruncateCv(lines, 100)).toBe("a".repeat(90) + "\n" + NOTICE);
  });

  it("hard-cuts when the only boundary is far from the limit", () => {
    const text = "J. " + "a".repeat(200);
    expect(smartTruncateCv(text, 100)).toBe(text.slice(0, 100) + NOTICE);
  });
});
