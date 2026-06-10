import { mulberry32 } from "@/lib/hawkes/ogata";

// Geometry + data for the intro's first two beats. Pure and deterministic: the
// whole branching schedule and the monogram target points are computed once at
// init so the canvas rAF loop only reads typed arrays — zero per-frame alloc.

// "PA" as single-stroke letterforms, viewBox 0 0 120 64. The gap between P and A
// straddles the viewBox center (x=60) so a split down the middle parts the
// monogram cleanly. Shared verbatim with the curtain so the canvas points land
// exactly under the strokes that draw over them at solidify.
export const MONO_P = "M12 60 L12 4 L38 4 Q50 4 50 17 Q50 30 38 30 L12 30";
export const MONO_A = "M70 60 L90 4 L110 60 M77 41 L103 41";
export const MONO_VB = { w: 120, h: 64, cx: 60, cy: 32 } as const;

export type Monogram = { vx: Float32Array; vy: Float32Array; n: number };

// Sample both strokes at an even arc-length step into viewBox-space points.
// Browser-only (uses SVGPathElement.getPointAtLength); never called during SSR.
export function sampleMonogram(target: number): Monogram {
  const svgns = "http://www.w3.org/2000/svg";
  const make = (d: string) => {
    const p = document.createElementNS(svgns, "path");
    p.setAttribute("d", d);
    return p;
  };
  const pa = make(MONO_P);
  const aa = make(MONO_A);
  const lp = pa.getTotalLength();
  const la = aa.getTotalLength();
  const total = lp + la;
  const np = Math.max(2, Math.round((target * lp) / total));
  const na = Math.max(2, target - np);
  const n = np + na;
  const vx = new Float32Array(n);
  const vy = new Float32Array(n);
  let w = 0;
  const walk = (path: SVGPathElement, len: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const pt = path.getPointAtLength((len * i) / (count - 1));
      vx[w] = pt.x;
      vy[w] = pt.y;
      w += 1;
    }
  };
  walk(pa, lp, np);
  walk(aa, la, na);
  return { vx, vy, n };
}

export type Cascade = {
  n: number;
  birth: Float32Array; // seconds from cascade start
  nx: Float32Array; // normalized x offset from center, ~[-1.2, 1.2]
  ny: Float32Array; // normalized y offset from center
  side: Uint8Array; // 0 buy (accent), 1 sell (red)
  mark: Float32Array; // 0.4..1 soft size
  target: Int32Array; // monogram point index this tick converges onto
};

// A Hawkes-flavoured branching cascade: one seed at center, each tick triggering
// 0–3 offspring at exponentially-spaced delays (rate climbs with depth so the
// cascade accelerates), drifting outward to fill the viewport. Buy/sell duality:
// children mostly inherit the parent side, occasionally flip to a red sell tick.
// Built to an exact `count` (re-seeding from center if a line dies out early),
// then each tick is routed to a monogram target by left-to-right order so the
// convergence reads as the swarm folding into the letters with little crossing.
export function buildCascade(
  seed: number,
  count: number,
  mono: Monogram,
  birthWindow = 1.65,
): Cascade {
  const rand = mulberry32(seed);
  const gauss = () => rand() + rand() - 1; // cheap ~triangular, [-1,1]

  const birth = new Float32Array(count);
  const nx = new Float32Array(count);
  const ny = new Float32Array(count);
  const side = new Uint8Array(count);
  const mark = new Float32Array(count);
  const gen = new Int32Array(count);

  let m = 0;
  const seedRoot = (t: number) => {
    const i = m++;
    birth[i] = t;
    nx[i] = 0;
    ny[i] = 0;
    side[i] = 0;
    mark[i] = 0.6 + 0.4 * rand();
    gen[i] = 0;
  };
  seedRoot(0);

  let head = 0;
  let maxBirth = 0;
  while (m < count) {
    if (head >= m) seedRoot(maxBirth + 0.12); // a line died out — relight center
    const i = head++;
    const gi = gen[i];
    const kids = gi === 0 ? 3 : rand() < 0.5 ? 2 : rand() < 0.78 ? 1 : 0;
    const rate = 2.0 * (1 + 0.4 * gi); // delays shorten with depth
    for (let c = 0; c < kids && m < count; c++) {
      const j = m++;
      const dt = -Math.log(1 - rand()) / rate;
      const t = birth[i] + dt;
      birth[j] = t;
      if (t > maxBirth) maxBirth = t;
      // Spatial-Hawkes offspring: a child lands near its parent with an isotropic
      // Gaussian kick plus a gentle outward nudge. Over generations this diffuses
      // into a dense cloud — packed at center, thinning to the edges — that fills
      // the frame, rather than running every lineage out to the boundary.
      const ox = nx[i];
      const oy = ny[i];
      const rad = Math.hypot(ox, oy) || 1;
      let x = ox + gauss() * 0.2 + (ox / rad) * 0.05;
      let y = oy + gauss() * 0.2 + (oy / rad) * 0.05;
      x = x < -1.05 ? -1.05 : x > 1.05 ? 1.05 : x;
      y = y < -1 ? -1 : y > 1 ? 1 : y;
      nx[j] = x;
      ny[j] = y;
      gen[j] = gi + 1;
      side[j] = rand() < 0.17 ? (side[i] ^ 1) : side[i];
      const r = rand();
      mark[j] = 0.4 + 0.6 * r * r;
    }
  }

  // Normalize births so the swarm fills its allotted window (last tick at
  // birthWindow), independent of how the branching happened to play out.
  if (maxBirth > 0) {
    const s = birthWindow / maxBirth;
    for (let i = 0; i < count; i++) birth[i] *= s;
  }

  // Route ticks → monogram points: both sorted left-to-right, paired in order.
  const order = Array.from({ length: count }, (_, i) => i).sort(
    (a, b) => nx[a] - nx[b],
  );
  const tOrder = Array.from({ length: mono.n }, (_, i) => i).sort(
    (a, b) => mono.vx[a] - mono.vx[b],
  );
  const target = new Int32Array(count);
  for (let k = 0; k < count; k++) {
    target[order[k]] = tOrder[Math.min(k, mono.n - 1) % mono.n];
  }

  return { n: count, birth, nx, ny, side, mark, target };
}
