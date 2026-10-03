// Original score for the 25s cut, synthesized here so it is fully owned and
// locked to the film's beats (100 BPM, first downbeat at 0.4s, src/timing.ts).
// D major. Fog (sparse, unresolved, a pluck per tab) → relief on the collapse →
// a pulse under the upload → a build through the destination → resolves on the logo.
// Writes public/audio/score-100bpm.wav (stereo) and public/audio/sfx/ui-ticks.wav.
// Usage: npm run score
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const RATE = 48_000;
const LEN = 25;
const N = RATE * LEN;
const beat = (n) => 0.4 + n * 0.6;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

function mulberry32(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);

// Dry stereo bus and a reverb send.
const L = new Float32Array(N);
const R = new Float32Array(N);
const SL = new Float32Array(N);
const SR = new Float32Array(N);

/** Renders `fn(secondsSinceOnset)` into the buses with equal-power pan and a reverb send. */
function voice(t0, dur, fn, { gain = 1, pan = 0, send = 0.3 } = {}) {
  const s0 = Math.round(t0 * RATE);
  const n = Math.round(dur * RATE);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4) * gain;
  const gr = Math.sin(((pan + 1) * Math.PI) / 4) * gain;
  for (let i = 0; i < n; i++) {
    const idx = s0 + i;
    const v = fn(i / RATE);
    if (idx < 0 || idx >= N) continue;
    L[idx] += v * gl;
    R[idx] += v * gr;
    SL[idx] += v * gl * send;
    SR[idx] += v * gr * send;
  }
}

/** Soft felt-piano / e-piano tone: a few decaying partials and a faint bell overtone. */
function keys(t0, midi, vel, { len = 2.6, pan = 0, send = 0.35, bright = 1 } = {}) {
  const f = hz(midi);
  const decay = 0.8 + 1.8 * Math.max(0, (76 - midi) / 28);
  voice(
    t0,
    len,
    (t) => {
      const env = Math.min(1, t / 0.004) * Math.exp(-t / decay) * (t > len - 0.2 ? (len - t) / 0.2 : 1);
      const w = 2 * Math.PI * f * t;
      return (
        vel *
        env *
        (Math.sin(w) +
          0.3 * bright * Math.sin(2 * w) * Math.exp(-t / 0.5) +
          0.08 * bright * Math.sin(3 * w) * Math.exp(-t / 0.25) +
          0.035 * bright * Math.sin(2 * Math.PI * f * 4.07 * t) * Math.exp(-t / 0.07))
      );
    },
    { pan, send }
  );
}

/** Warm pad: three slightly detuned sines per note, slow attack, release after `t1`. */
function pad(t0, t1, notes, vel, { attack = 0.8, release = 1, send = 0.55 } = {}) {
  const hold = t1 - t0;
  notes.forEach((m, k) => {
    const f = hz(m);
    const d = 0.0035; // about ±6 cents
    voice(
      t0,
      hold + release,
      (t) => {
        const env = Math.min(1, t / attack) * (t > hold ? Math.max(0, 1 - (t - hold) / release) : 1);
        const s =
          Math.sin(2 * Math.PI * f * t) +
          0.5 * Math.sin(2 * Math.PI * f * (1 + d) * t + 1.3) +
          0.5 * Math.sin(2 * Math.PI * f * (1 - d) * t + 2.1) +
          0.1 * Math.sin(4 * Math.PI * f * t);
        return (vel * env * s) / 2.1;
      },
      { pan: k % 2 ? 0.3 : -0.3, send }
    );
  });
}

function bass(t0, midi, dur, vel) {
  const f = hz(midi);
  voice(
    t0,
    dur + 0.25,
    (t) => {
      const env = Math.min(1, t / 0.012) * Math.exp(-t / 1.6) * (t > dur ? Math.max(0, 1 - (t - dur) / 0.25) : 1);
      return vel * env * (Math.sin(2 * Math.PI * f * t) + 0.22 * Math.sin(4 * Math.PI * f * t));
    },
    { send: 0.04 }
  );
}

/** Soft kick: a sine sweeping 115→45 Hz. */
function kick(t0, vel) {
  voice(t0, 0.4, (t) => vel * Math.exp(-t / 0.13) * Math.sin(2 * Math.PI * (45 * t + 70 * 0.03 * (1 - Math.exp(-t / 0.03)))), { send: 0.02 });
}

/** Shaker: a short burst of high-passed noise. */
function shaker(t0, vel, pan) {
  let prev = 0;
  let hp = 0;
  voice(
    t0,
    0.09,
    (t) => {
      const x = rand() * 2 - 1;
      hp = 0.82 * (hp + x - prev);
      prev = x;
      return vel * hp * Math.min(1, t / 0.003) * Math.exp(-t / 0.02);
    },
    { pan, send: 0.12 }
  );
}

// ---------------------------------------------------------------- the cue
// Scene 2 · the fog (0–4.0): an unresolved Dsus2 bed, a swell into the cut,
// and one muted pluck per tab, accelerating with them (same curve as ui/Tabs.tsx).
pad(0, beat(6), [50, 52, 57], 0.1, { attack: 1.6, release: 0.05 });
pad(2.9, beat(6), [57, 62, 64, 69], 0.13, { attack: 1.1, release: 0.04 });
const penta = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83];
for (let i = 0; i < 40; i++) {
  const t = 0.15 + 2.25 * (i / 39) ** 0.62 + 0.03;
  keys(t, penta[Math.floor(rand() * penta.length)], 0.05 + 0.07 * (i / 39), { len: 0.7, pan: rand() * 1.6 - 0.8, bright: 0.35, send: 0.45 });
}

// Scene 3 · one route (4.0–7.0): the collapse lands on a clear D major; the
// motif climbs while the Route draws.
for (const [m, v] of [[38, 0.34], [50, 0.22], [57, 0.19], [66, 0.19], [74, 0.15]]) keys(beat(6), m, v, { len: 3.4 });
pad(beat(6), beat(11), [50, 54, 57, 62], 0.085, { attack: 0.5, release: 0.6 });
keys(beat(7), 66, 0.2, { pan: -0.2 });
keys(beat(8), 69, 0.2);
keys(beat(9), 74, 0.22, { pan: 0.2 });
keys(beat(10), 76, 0.18, { pan: 0.3 });

// Scene 4 · upload (7.0–10.0): a pulse starts under Gmaj7. "Ready" gets a chime.
pad(beat(11), beat(16), [55, 59, 62, 66], 0.1, { attack: 0.3, release: 0.4 });
for (let n = 11; n <= 15; n++) kick(beat(n), 0.32);
bass(beat(11), 43, 1.1, 0.34);
bass(beat(13), 43, 1.1, 0.3);
for (const m of [55, 59, 62, 66]) keys(beat(11), m, 0.14, { len: 2 });
keys(beat(14), 86, 0.12, { len: 1.6, send: 0.6 }); // Ready

// Scene 7 · the destination (10.0–19.0): D → A/C# → Bm7 → G, eighth-note
// arpeggios building, a bell on each branch arrival, an accent when the match lands.
const chords = [
  { at: 16, bass: 38, pad: [50, 54, 57, 62], arp: [62, 66, 69, 74] },
  { at: 20, bass: 37, pad: [52, 57, 61, 64], arp: [61, 64, 69, 73] },
  { at: 24, bass: 35, pad: [54, 57, 59, 62], arp: [59, 62, 66, 69] },
  { at: 28, bass: 31, pad: [55, 59, 62, 67], arp: [59, 62, 67, 71] },
];
const order = [0, 2, 1, 3, 2, 0, 3, 1];
chords.forEach((c, ci) => {
  const end = ci < chords.length - 1 ? chords[ci + 1].at : 31;
  pad(beat(c.at), beat(end), c.pad, 0.1 + ci * 0.016, { attack: 0.25, release: 0.5 });
  bass(beat(c.at), c.bass, (end - c.at) * 0.6 - 0.1, 0.42);
  for (let e = 0; e < (end - c.at) * 2; e++) {
    const t = beat(c.at) + e * 0.3;
    const lift = (c.at - 16 + e / 2) / 15;
    keys(t, c.arp[order[e % order.length]], 0.16 + 0.1 * lift, { len: 1.1, pan: e % 2 ? 0.3 : -0.3, bright: 0.8, send: 0.4 });
  }
});
for (let n = 16; n <= 30; n++) kick(beat(n), 0.4);
for (let n = 20; n <= 30; n++) shaker(beat(n) + 0.3, 0.05 + 0.03 * ((n - 20) / 10), n % 2 ? 0.35 : -0.35);
[[17, 78], [18, 81], [19, 86]].forEach(([n, m]) => keys(beat(n), m, 0.15, { len: 1.8, send: 0.6 })); // branches
for (const m of [47, 59, 62, 66]) keys(beat(24), m, 0.2, { len: 2.4 }); // 87% lands

// Scene 8 · the logo (19.0–25.0): the drums drop out on the pull-back, the
// Scene 3 motif returns, and it resolves on D add9 under the wordmark.
pad(beat(31), LEN + 1, [50, 57, 62, 64, 66], 0.11, { attack: 1.2, release: 1 });
bass(beat(31), 38, 5.5, 0.32);
keys(beat(31), 66, 0.22, { pan: -0.2, len: 3 });
keys(beat(32), 69, 0.22, { len: 3 });
for (const [m, v] of [[38, 0.4], [50, 0.26], [57, 0.24], [66, 0.22], [74, 0.26]]) keys(beat(33), m, v, { len: 4.8 });
keys(beat(35), 81, 0.12, { len: 3.5, send: 0.7 });

// ---------------------------------------------------------------- mix
function reverb(input, combs, allpasses) {
  const out = new Float32Array(N);
  for (const ms of combs) {
    const D = Math.round((ms * RATE) / 1000);
    const buf = new Float32Array(D);
    let idx = 0;
    let lp = 0;
    for (let i = 0; i < N; i++) {
      const y = buf[idx];
      lp = y * 0.72 + lp * 0.28; // damping
      buf[idx] = input[i] + lp * 0.84;
      idx = (idx + 1) % D;
      out[i] += y / combs.length;
    }
  }
  for (const ms of allpasses) {
    const D = Math.round((ms * RATE) / 1000);
    const buf = new Float32Array(D);
    let idx = 0;
    for (let i = 0; i < N; i++) {
      const x = out[i];
      const y = -0.5 * x + buf[idx];
      buf[idx] = x + 0.5 * y;
      idx = (idx + 1) % D;
      out[i] = y;
    }
  }
  return out;
}
const WL = reverb(SL, [29.7, 37.1, 41.1, 43.7], [5.0, 1.7]);
const WR = reverb(SR, [31.3, 36.7, 40.3, 45.1], [5.3, 1.9]);

const mixL = new Float32Array(N);
const mixR = new Float32Array(N);
let peak = 0;
for (let i = 0; i < N; i++) {
  mixL[i] = Math.tanh((L[i] + 0.9 * WL[i]) * 0.9);
  mixR[i] = Math.tanh((R[i] + 0.9 * WR[i]) * 0.9);
  peak = Math.max(peak, Math.abs(mixL[i]), Math.abs(mixR[i]));
}
const target = 10 ** (-3 / 20); // peak at −3 dBFS
for (let i = 0; i < N; i++) {
  mixL[i] *= target / peak;
  mixR[i] *= target / peak;
}

function writeWav(file, channels) {
  const frames = channels[0].length;
  const data = Buffer.alloc(frames * channels.length * 2);
  for (let i = 0; i < frames; i++) {
    channels.forEach((ch, c) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, ch[i])) * 32767), (i * channels.length + c) * 2));
  }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(channels.length, 22);
  h.writeUInt32LE(RATE, 24);
  h.writeUInt32LE(RATE * channels.length * 2, 28);
  h.writeUInt16LE(channels.length * 2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(data.length, 40);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, Buffer.concat([h, data]));
}

const audioDir = path.resolve(import.meta.dirname, "..", "public", "audio");
writeWav(path.join(audioDir, "score-100bpm.wav"), [mixL, mixR]);

// UI ticks (brief §6: at least 12 dB under the music): the drop (8.2s) and Continue (9.4s).
const ticks = new Float32Array(N);
for (const [t, f] of [[beat(13), 2100], [beat(15), 2400]]) {
  const s0 = Math.round(t * RATE);
  for (let i = 0; i < 0.03 * RATE; i++) ticks[s0 + i] += 0.07 * Math.exp(-i / (0.004 * RATE)) * Math.sin((2 * Math.PI * f * i) / RATE);
}
writeWav(path.join(audioDir, "sfx", "ui-ticks.wav"), [ticks]);

let rms = 0;
for (let i = 0; i < N; i++) rms += mixL[i] ** 2 + mixR[i] ** 2;
rms = Math.sqrt(rms / (2 * N));
console.log(`score: peak −3.0 dBFS, RMS ${(20 * Math.log10(rms)).toFixed(1)} dBFS; ticks peak ${(20 * Math.log10(0.07)).toFixed(1)} dBFS`);
