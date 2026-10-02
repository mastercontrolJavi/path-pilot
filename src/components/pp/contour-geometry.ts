/*
 * Contour generation for <ContourField>: smooth value noise plus a few hills,
 * contoured with marching squares (lines never cross), smoothed with quadratic
 * curves. Deterministic for a given seed and size; memoized.
 */

export type ContourLine = { d: string; index: boolean };

function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function valueNoise(rand: () => number, gx: number, gy: number) {
  const grid = Array.from({ length: (gx + 1) * (gy + 1) }, rand);
  const at = (i: number, j: number) => grid[j * (gx + 1) + i];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (u: number, v: number) => {
    const x = u * gx;
    const y = v * gy;
    const i = Math.min(gx - 1, Math.floor(x));
    const j = Math.min(gy - 1, Math.floor(y));
    const fx = smooth(x - i);
    const fy = smooth(y - j);
    const a = at(i, j);
    const b = at(i + 1, j);
    const c = at(i, j + 1);
    const d = at(i + 1, j + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
}

type Pt = [number, number];

// Segment table: for each case, pairs of cell edges the contour crosses.
// Edges: 0 top, 1 right, 2 bottom, 3 left. Saddles (5, 10) resolved by the centre value.
const CASES: Record<number, [number, number][]> = {
  1: [[3, 2]], 2: [[2, 1]], 3: [[3, 1]], 4: [[0, 1]], 6: [[0, 2]], 7: [[0, 3]],
  8: [[0, 3]], 9: [[0, 2]], 11: [[0, 1]], 12: [[3, 1]], 13: [[2, 1]], 14: [[3, 2]],
};

function contour(values: number[][], level: number, cell: Pt): Pt[][] {
  const ny = values.length - 1;
  const nx = values[0].length - 1;
  const points = new Map<string, Pt>();
  const segs: [string, string][] = [];

  const lerp = (a: number, b: number) => (level - a) / (b - a || 1e-9);

  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const a = values[j][i];
      const b = values[j][i + 1];
      const c = values[j + 1][i + 1];
      const d = values[j + 1][i];
      const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
      if (idx === 0 || idx === 15) continue;

      const edge = (e: number): string => {
        let key: string;
        let p: Pt;
        if (e === 0) {
          key = `h${i},${j}`;
          p = [(i + lerp(a, b)) * cell[0], j * cell[1]];
        } else if (e === 2) {
          key = `h${i},${j + 1}`;
          p = [(i + lerp(d, c)) * cell[0], (j + 1) * cell[1]];
        } else if (e === 3) {
          key = `v${i},${j}`;
          p = [i * cell[0], (j + lerp(a, d)) * cell[1]];
        } else {
          key = `v${i + 1},${j}`;
          p = [(i + 1) * cell[0], (j + lerp(b, c)) * cell[1]];
        }
        if (!points.has(key)) points.set(key, p);
        return key;
      };

      let pairs = CASES[idx];
      if (idx === 5 || idx === 10) {
        const centreAbove = (a + b + c + d) / 4 > level;
        // 5: b,d above. 10: a,c above.
        pairs =
          (idx === 5) === centreAbove
            ? [[3, 0], [2, 1]] // isolate a and c
            : [[0, 1], [3, 2]]; // isolate b and d
      }
      for (const [e1, e2] of pairs) segs.push([edge(e1), edge(e2)]);
    }
  }

  // Join segments into polylines.
  const adj = new Map<string, number[]>();
  segs.forEach(([p, q], s) => {
    if (!adj.has(p)) adj.set(p, []);
    if (!adj.has(q)) adj.set(q, []);
    adj.get(p)!.push(s);
    adj.get(q)!.push(s);
  });
  const used = new Uint8Array(segs.length);
  const next = (key: string): string | null => {
    for (const s of adj.get(key) ?? []) {
      if (used[s]) continue;
      used[s] = 1;
      return segs[s][0] === key ? segs[s][1] : segs[s][0];
    }
    return null;
  };

  const lines: Pt[][] = [];
  for (let s = 0; s < segs.length; s++) {
    if (used[s]) continue;
    used[s] = 1;
    const chain = [segs[s][0], segs[s][1]];
    for (let k = next(chain[chain.length - 1]); k; k = next(chain[chain.length - 1])) chain.push(k);
    for (let k = next(chain[0]); k; k = next(chain[0])) chain.unshift(k);
    lines.push(chain.map((k) => points.get(k)!));
  }
  return lines;
}

const fmt = (n: number) => Math.round(n);
const mid = (p: Pt, q: Pt): Pt => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];

function smoothPath(pts: Pt[]): string {
  const closed = pts.length > 3 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1];
  if (closed) {
    const p = pts.slice(0, -1);
    const start = mid(p[p.length - 1], p[0]);
    let d = `M${fmt(start[0])} ${fmt(start[1])}`;
    for (let k = 0; k < p.length; k++) {
      const m = mid(p[k], p[(k + 1) % p.length]);
      d += `Q${fmt(p[k][0])} ${fmt(p[k][1])} ${fmt(m[0])} ${fmt(m[1])}`;
    }
    return d + "Z";
  }
  let d = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
  for (let k = 1; k < pts.length - 1; k++) {
    const end = k === pts.length - 2 ? pts[k + 1] : mid(pts[k], pts[k + 1]);
    d += `Q${fmt(pts[k][0])} ${fmt(pts[k][1])} ${fmt(end[0])} ${fmt(end[1])}`;
  }
  if (pts.length === 2) d += `L${fmt(pts[1][0])} ${fmt(pts[1][1])}`;
  return d;
}

const cache = new Map<string, ContourLine[]>();

export function contourLines(seed: number, width: number, height: number, levels: number): ContourLine[] {
  const key = `${seed}:${width}:${height}:${levels}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const rand = mulberry32(seed);
  const broad = valueNoise(rand, 4, 3);
  const detail = valueNoise(rand, 9, 6);
  const aspect = width / height;
  const hills = Array.from({ length: 3 }, () => ({
    x: 0.15 + rand() * 0.7,
    y: 0.15 + rand() * 0.7,
    s: 0.1 + rand() * 0.14,
    h: 0.5 + rand() * 0.6,
  }));

  const nx = 40;
  const ny = Math.max(12, Math.round(nx / aspect));
  const values: number[][] = [];
  let min = Infinity;
  let max = -Infinity;
  for (let j = 0; j <= ny; j++) {
    const row: number[] = [];
    for (let i = 0; i <= nx; i++) {
      const u = i / nx;
      const v = j / ny;
      let h = 0.9 * broad(u, v) + 0.3 * detail(u, v);
      for (const hill of hills) {
        const dx = (u - hill.x) * aspect;
        const dy = v - hill.y;
        h += hill.h * Math.exp(-(dx * dx + dy * dy) / (2 * hill.s * hill.s));
      }
      row.push(h);
      min = Math.min(min, h);
      max = Math.max(max, h);
    }
    values.push(row);
  }

  const cell: Pt = [width / nx, height / ny];
  const out: ContourLine[] = [];
  for (let l = 0; l < levels; l++) {
    const level = min + ((max - min) * (l + 1)) / (levels + 1);
    for (const pts of contour(values, level, cell)) {
      if (pts.length < 4) continue;
      out.push({ d: smoothPath(pts), index: l % 4 === 1 });
    }
  }
  cache.set(key, out);
  return out;
}
