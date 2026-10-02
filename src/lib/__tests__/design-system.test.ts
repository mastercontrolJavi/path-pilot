import { describe, it, expect, vi, afterEach } from "vitest";
import { contourLines } from "@/components/pp/contour-geometry";
import { routePath, waypointFractions } from "@/components/pp/route-geometry";
import { formatMoney, formatMoneyRange, describeMoneyRange } from "@/lib/format";
import { registerAnalyticsSink, sizeBucket, track } from "@/lib/analytics";

describe("contourLines", () => {
  it("is deterministic for a seed", () => {
    const a = contourLines(11, 1200, 800, 10).map((l) => l.d).join("");
    const b = contourLines(11, 1200, 800, 10).map((l) => l.d).join("");
    expect(a).toBe(b);
    expect(a.length).toBeGreaterThan(1000);
  });

  it("differs between seeds", () => {
    const a = contourLines(11, 1200, 800, 10).map((l) => l.d).join("");
    const b = contourLines(23, 1200, 800, 10).map((l) => l.d).join("");
    expect(a).not.toBe(b);
  });

  it("stays under the 20KB inline SVG budget", () => {
    for (const [seed, w, h] of [
      [11, 1200, 800],
      [23, 640, 320],
    ]) {
      const bytes = contourLines(seed, w, h, 10).reduce((n, l) => n + l.d.length + 60, 0);
      expect(bytes).toBeLessThan(20_000);
    }
  });
});

describe("route geometry", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 300, y: 0 },
  ];

  it("builds a cubic path through every point", () => {
    const d = routePath(points);
    expect(d.startsWith("M0 0")).toBe(true);
    expect(d.match(/C/g)).toHaveLength(2);
    expect(d.endsWith("300 0")).toBe(true);
  });

  it("returns arc-length fractions per waypoint", () => {
    const f = waypointFractions(points);
    expect(f[0]).toBe(0);
    expect(f[2]).toBeCloseTo(1);
    expect(f[1]).toBeCloseTo(1 / 3, 1);
  });
});

describe("format", () => {
  it("formats money compactly with an en dash", () => {
    expect(formatMoney(95000)).toBe("$95k");
    expect(formatMoneyRange(78000, 110000)).toBe("$78k–$110k");
    expect(formatMoney(38, "USD", "hour")).toBe("$38/hr");
    expect(formatMoneyRange(42000, 55000, "GBP")).toBe("£42k–£55k");
  });

  it("describes ranges in words for screen readers", () => {
    expect(describeMoneyRange(78000, 110000)).toBe("$78,000 to $110,000 a year");
  });
});

describe("analytics", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("buckets sizes without exact bytes", () => {
    expect(sizeBucket(100 * 1024)).toBe("<250KB");
    expect(sizeBucket(600 * 1024)).toBe("250KB-1MB");
    expect(sizeBucket(2 * 1024 * 1024)).toBe("1-3MB");
    expect(sizeBucket(4.5 * 1024 * 1024)).toBe("3-5MB");
  });

  it("is a no-op on the server", () => {
    const sink = vi.fn();
    const off = registerAnalyticsSink(sink);
    track("results_viewed");
    expect(sink).not.toHaveBeenCalled();
    off();
  });

  it("forwards typed events to registered sinks in the browser", () => {
    vi.stubGlobal("window", {});
    const sink = vi.fn();
    const off = registerAnalyticsSink(sink);
    track("landing_cta_clicked", { location: "hero" });
    expect(sink).toHaveBeenCalledWith("landing_cta_clicked", { location: "hero" });
    off();
    track("landing_cta_clicked", { location: "nav" });
    expect(sink).toHaveBeenCalledTimes(1);
  });

  it("never lets a failing sink throw", () => {
    vi.stubGlobal("window", {});
    const off = registerAnalyticsSink(() => {
      throw new Error("provider down");
    });
    expect(() => track("pdf_downloaded")).not.toThrow();
    off();
  });
});
