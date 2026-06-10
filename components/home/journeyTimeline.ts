// Everything the globe draws is a pure function of scroll progress p ∈ [0,1].
// No time-based tweens, no fire-once state — scrubbing backward reverses cleanly.
//
// Timeline (p):
//   [0.00,0.10] intro      camera pulled back, rotates to face Nuzvid, zooms in
//   [0.10,0.20] dwell 0    Nuzvid marker + label
//   [0.20,0.36] travel 0   arc Nuzvid→Simi draws as camera flies along it
//   [0.36,0.46] dwell 1    Simi Valley
//   [0.46,0.60] travel 1   arc Simi→Philadelphia
//   [0.60,0.70] dwell 2    Philadelphia
//   [0.70,0.86] travel 2   arc Philadelphia→Chandler
//   [0.86,1.00] settle 3   Chandler, marker stays lit

const INTRO_END = 0.1;
const DWELL: [number, number][] = [
  [0.1, 0.2],
  [0.36, 0.46],
  [0.6, 0.7],
  [0.86, 1.0],
];
const SEG: [number, number][] = [
  [0.2, 0.36],
  [0.46, 0.6],
  [0.7, 0.86],
];
const REVEAL = [0.06, 0.33, 0.57, 0.83];

const FAR = 3.6;
const NEAR = 2.25;
const END = 2.12;
const LIFT = 0.5;
const POP = 0.06;
const FADE = 0.04;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (x: number) => {
  x = clamp01(x);
  return x * x * (3 - 2 * x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const inv = (a: number, b: number, x: number) => (x - a) / (b - a);

// Camera position along the journey, in stop-index space.
// -1 = intro orientation, 0..3 = the four stops, fractional = mid-flight.
export function journeyJ(p: number): number {
  if (p <= INTRO_END) return lerp(-1, 0, smooth(p / INTRO_END));
  for (let i = 0; i < 3; i++) {
    const [s, e] = SEG[i];
    if (p < s) return i;
    if (p <= e) return i + smooth(inv(s, e, p));
  }
  return 3;
}

// Camera distance: far at the start, settles close on each stop, lifts mid-flight.
export function journeyDist(p: number): number {
  let d = NEAR;
  if (p < INTRO_END) d = lerp(FAR, NEAR, smooth(p / INTRO_END));
  for (let i = 0; i < 3; i++) {
    const [s, e] = SEG[i];
    if (p >= s && p <= e) d += LIFT * Math.sin(Math.PI * inv(s, e, p));
  }
  if (p > DWELL[3][0]) d = lerp(d, END, smooth(inv(DWELL[3][0], 1, p)));
  return d;
}

// Marker scale: pops from 0 with a touch of overshoot once its reveal point passes.
function pop(x: number): number {
  x = clamp01(x);
  const e = 1 - (1 - x) * (1 - x);
  return e + Math.sin(x * Math.PI) * 0.14 * (1 - x);
}
export function markerScale(p: number, i: number): number {
  if (p < REVEAL[i]) return 0;
  return pop(inv(REVEAL[i], REVEAL[i] + POP, p));
}

// The stop currently in focus (last one revealed). Drives accent vs. dim.
export function activeIndex(p: number): number {
  let a = 0;
  for (let i = 0; i < REVEAL.length; i++) if (p >= REVEAL[i]) a = i;
  return a;
}

// Arc i (stop i → i+1) draws across its travel segment, then stays drawn.
export function arcDraw(p: number, i: number): number {
  const [s, e] = SEG[i];
  if (p < s) return 0;
  if (p > e) return 1;
  return smooth(inv(s, e, p));
}
export function arcActive(p: number, i: number): boolean {
  const [s, e] = SEG[i];
  return p >= s && p <= e;
}

// Label fades in on arrival, out as the camera leaves; the last one stays lit.
export function labelOpacity(p: number, i: number): number {
  const inStart = DWELL[i][0];
  if (p < inStart) return 0;
  let o = smooth(inv(inStart, inStart + FADE, p));
  if (i < 3) {
    const out = SEG[i][0];
    o *= 1 - smooth(inv(out, out + FADE, p));
  }
  return o;
}
