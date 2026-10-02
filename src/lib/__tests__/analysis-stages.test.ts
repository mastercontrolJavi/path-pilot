import { describe, it, expect } from "vitest";
import { STAGES, stageAt, waitMessage } from "@/components/analysis/stages";

describe("analysis stages", () => {
  it("stays on sending until the CV is actually sent", () => {
    expect(stageAt(null)).toBe(0);
  });

  it("advances on the curve once the analysis starts", () => {
    expect(stageAt(0)).toBe(1);
    expect(stageAt(7)).toBe(2);
    expect(stageAt(15)).toBe(3);
    expect(stageAt(25)).toBe(4);
  });

  it("holds on the last stage however long it takes", () => {
    expect(stageAt(40)).toBe(STAGES.length - 1);
    expect(stageAt(10_000)).toBe(STAGES.length - 1);
  });

  it("only speaks up during long waits", () => {
    expect(waitMessage(10)).toBeNull();
    expect(waitMessage(31)).toMatch(/Still working/);
    expect(waitMessage(95)).toMatch(/longer than usual/);
  });
});
