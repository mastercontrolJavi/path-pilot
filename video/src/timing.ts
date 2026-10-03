/**
 * 100 BPM click (no licensed track yet). The first downbeat sits 0.4s in, so
 * every cut lands on a beat while the scenes keep the requested lengths:
 * 4s, 3s, 3s, 9s, 6s = 25s.
 */
export const BPM = 100;
export const BEAT_S = 60 / BPM; // 0.6s
export const PICKUP_S = 0.4;

/** Seconds of beat n (beat 0 = first downbeat). */
export const beat = (n: number) => PICKUP_S + n * BEAT_S;

export const SCENES = [
  { id: "S2", name: "Forty tabs", start: 0, end: beat(6) }, // 0.0–4.0
  { id: "S3", name: "One route", start: beat(6), end: beat(11) }, // 4.0–7.0
  { id: "S4", name: "CV upload", start: beat(11), end: beat(16) }, // 7.0–10.0
  { id: "S7", name: "Destination", start: beat(16), end: beat(31) }, // 10.0–19.0
  { id: "S8", name: "Logo", start: beat(31), end: beat(41) }, // 19.0–25.0
] as const;

export const FILM_S = SCENES[SCENES.length - 1].end; // 25.0

/**
 * Soundtrack. Swap in the licensed track (public/audio/track.mp3) here and
 * re-snap BPM / PICKUP_S to it; until then, the generated click (npm run click).
 */
export const AUDIO = "audio/click-100bpm.wav";
export const MUSIC_FADE_S = 1.5;

export const frames = (seconds: number, fps: number) => Math.round(seconds * fps);
