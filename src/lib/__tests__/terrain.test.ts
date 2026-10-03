import { describe, it, expect } from "vitest";
import { layoutTerrain, MAP } from "@/components/results/terrain";
import { sampleReport } from "@/lib/fixtures/sample-report";
import { normalizeAnalysisResult, type CareerPath } from "@/lib/schemas";

const paths = sampleReport.career_paths;

describe("terrain map layout", () => {
  it("puts better fit to the right and higher pay higher", () => {
    const t = layoutTerrain(paths)!;
    const [po, csm, impl] = t.points; // 87%, 82%, 79%
    expect(po.x).toBeGreaterThan(csm.x);
    expect(csm.x).toBeGreaterThan(impl.x);
    expect(po.y).toBeLessThan(csm.y); // $110k mid is above $94k
    expect(csm.y).toBeLessThan(impl.y);
  });

  it("keeps every point and label inside the plot", () => {
    const t = layoutTerrain(paths)!;
    for (const p of t.points) {
      expect(p.x).toBeGreaterThanOrEqual(MAP.left);
      expect(p.x).toBeLessThanOrEqual(MAP.w - MAP.right);
      expect(p.labelY).toBeGreaterThanOrEqual(0);
      expect(p.labelY).toBeLessThanOrEqual(MAP.h - MAP.bottom);
    }
  });

  it("spaces labels apart when roles pay the same", () => {
    const same: CareerPath[] = paths.map((p) => ({ ...p, salary_estimate: { ...p.salary_estimate!, low: 80000, high: 100000 } }));
    const ys = layoutTerrain(same)!.points.map((p) => p.labelY).sort((a, b) => a - b);
    for (let i = 1; i < ys.length; i++) expect(ys[i] - ys[i - 1]).toBeGreaterThanOrEqual(46);
  });

  it("is skipped for reports without comparable pay", () => {
    const legacy = normalizeAnalysisResult({ ...sampleReport, career_paths: paths.map(({ title, fit_score }) => ({ title, fit_score })) });
    expect(layoutTerrain(legacy.career_paths)).toBeNull();
    const mixed = paths.map((p, i) => ({ ...p, salary_estimate: { ...p.salary_estimate!, currency: i ? "USD" : "GBP" } }));
    expect(layoutTerrain(mixed)).toBeNull();
  });
});
