// Storyboard stills: one key frame per scene (two for Scene 7), both layouts.
// Usage: node scripts/stills.mjs
import path from "node:path";
import { mkdirSync } from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "out", "stills");
mkdirSync(out, { recursive: true });

// Seconds into the film. Pass times as arguments to render just those (16:9 only):
//   node scripts/stills.mjs 4.1 7.15
const custom = process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n));
const KEYS = custom.length ? custom.map((s) => [`check-${s.toFixed(2)}s`, s]) : [
  ["s2-forty-tabs", 3.2],
  ["s3-one-route", 6.4],
  ["s4-cv-upload", 9.6],
  ["s7a-map", 13.0],
  ["s7b-fit-pay-gaps", 18.4],
  ["s8-logo", 24.0],
];

const browserExecutable = process.env.BROWSER ?? undefined;
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts") });

for (const id of custom.length ? ["Film16x9"] : ["Film16x9", "Film9x16"]) {
  const composition = await selectComposition({ serveUrl, id, browserExecutable });
  for (const [name, s] of KEYS) {
    const frame = Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps));
    const file = path.join(out, `${id === "Film16x9" ? "16x9" : "9x16"}-${name}.png`);
    await renderStill({ serveUrl, composition, frame, output: file, imageFormat: "png", browserExecutable });
    console.log("rendered", path.relative(root, file), "frame", frame);
  }
}
