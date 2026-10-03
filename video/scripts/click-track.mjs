// Generates public/audio/click-100bpm.wav: a 25s, 100 BPM click with the
// 0.4s pickup from src/timing.ts. Scene cuts get a higher accent click.
// Peaks stay below -1 dBFS (brief §6). Usage: npm run click
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const RATE = 48_000;
const LENGTH_S = 25;
const BPM = 100;
const PICKUP_S = 0.4;
const BEAT_S = 60 / BPM;
const CUT_BEATS = new Set([0, 6, 11, 16, 31]); // S2, S3, S4, S7, S8 starts

const samples = new Float32Array(RATE * LENGTH_S);
for (let n = 0; PICKUP_S + n * BEAT_S < LENGTH_S - 0.05; n++) {
  const accent = CUT_BEATS.has(n);
  const freq = accent ? 1760 : 1180;
  const amp = accent ? 0.6 : 0.4; // −4.4 dBFS and −8 dBFS peaks
  const start = Math.round((PICKUP_S + n * BEAT_S) * RATE);
  const len = Math.round(0.035 * RATE);
  for (let i = 0; i < len && start + i < samples.length; i++) {
    const env = Math.exp(-i / (0.006 * RATE)) * Math.min(1, i / 24); // 0.5ms attack, fast decay
    samples[start + i] += amp * env * Math.sin((2 * Math.PI * freq * i) / RATE);
  }
}

const peak = samples.reduce((m, s) => Math.max(m, Math.abs(s)), 0);
if (20 * Math.log10(peak) > -1) throw new Error(`Peak ${peak} is above -1 dBFS`);

const data = Buffer.alloc(samples.length * 2);
samples.forEach((s, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), i * 2));
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(1, 22); // mono
header.writeUInt32LE(RATE, 24);
header.writeUInt32LE(RATE * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(data.length, 40);

const out = path.resolve(import.meta.dirname, "..", "public", "audio", "click-100bpm.wav");
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, Buffer.concat([header, data]));
console.log(`wrote ${path.relative(process.cwd(), out)} (${LENGTH_S}s, peak ${(20 * Math.log10(peak)).toFixed(1)} dBFS)`);
