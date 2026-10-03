// Readability rule (brief §0.6): every story line holds for at least
// 0.4s + 0.3s per word after it is fully in, before it moves or leaves.
// "in" = last word fully visible; "out" = the line starts to move or fade.
// Times are film seconds and mirror the scene constants (S2 PUSH, S4 DROP/READY,
// S7 BRANCHES/PUSH/…, S8). Tab titles in Scene 2 and UI chrome (rail labels,
// help text, buttons) are texture and are not checked.
// Usage: node scripts/check-holds.ts
import { beat } from "../src/timing.ts";

const S2 = 0, S3 = beat(6), S4 = beat(11), S7 = beat(16), S8 = beat(31), END = beat(41);
const kinetic = (start: number, words: number) => start + (words - 1) * 0.05 + 0.3;
const branchIn = (b: number) => S7 + b + 0.6 - 0.1 + 0.25;

const lines: { text: string; in: number; out: number }[] = [
  { text: "Operations coordinator · 6 yrs", in: S2 + 0.3, out: S2 + 2.2 },
  { text: "Changing careers usually means forty tabs.", in: S2 + kinetic(1.0, 6), out: S3 },
  { text: "PathPilot gives you one route.", in: S3 + kinetic(0.45, 5), out: S4 },
  { text: "Start with your CV", in: S4 + 0.8, out: S7 },
  { text: "maria-reyes-cv.pdf", in: S4 + 1.2, out: S7 },
  { text: "214 KB", in: S4 + 1.2, out: S7 },
  { text: "Ready", in: S4 + 1.8, out: S7 },
  { text: "Estimates, not live market data.", in: S7 + 0.3, out: S7 + 3.6 },
  { text: "Product operations manager", in: branchIn(0.6), out: S7 + 3.6 },
  { text: "87% $95k–$125k", in: branchIn(0.6), out: S7 + 3.6 },
  { text: "Customer success manager", in: branchIn(1.2), out: S7 + 3.6 },
  { text: "82% $78k–$110k", in: branchIn(1.2), out: S7 + 3.6 },
  { text: "Implementation specialist", in: branchIn(1.8), out: S7 + 3.6 },
  { text: "79% $72k–$98k", in: branchIn(1.8), out: S7 + 3.6 },
  { text: "See where you fit, what it pays, and what to build.", in: S7 + 1.2 + 0.3, out: S8 },
  { text: "Best fit Product operations manager", in: S7 + 3.6 + 0.45, out: S8 },
  { text: "87% match", in: S7 + 4.8, out: S8 },
  { text: "Typical pay $95k $125k", in: S7 + 4.8 + 0.6, out: S8 },
  { text: "Stakeholder communication", in: S7 + 5.4 + 0.1 + 3 * 0.08 + 0.3, out: S8 },
  { text: "Forecasting", in: S7 + 5.4 + 0.1 + 4 * 0.08 + 0.3, out: S8 },
  { text: "Experiment design A few weeks", in: S7 + 6.0 + 0.15 + 2 * 0.3 + 0.3, out: S8 },
  { text: "PathPilot", in: S8 + 1.6, out: END },
  { text: "Know where your experience can take you.", in: S8 + 2.2, out: END },
  { text: "pathpilot.javiertpadilla.com", in: S8 + 2.8, out: END },
];

let failed = 0;
for (const l of lines) {
  const need = 0.4 + 0.3 * l.text.trim().split(/\s+/).length;
  const held = l.out - l.in;
  const ok = held + 1e-6 >= need;
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${held.toFixed(2)}s held / ${need.toFixed(2)}s needed  ${l.text}`);
}
console.log(failed ? `\n${failed} line(s) too short` : `\nAll ${lines.length} lines pass.`);
process.exit(failed ? 1 : 0);
