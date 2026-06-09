import { ALPHA, BETA, LAMBDA_CAP, MU } from "./params";

export type Rand = () => number;

export type Sim = {
  time: () => number;
  count: () => number;
  advance: (until: number, out: Float32Array, max: number) => number;
  excite: (at: number, c0: number, c1: number) => void;
  bump: (at: number, v0: number, v1: number) => void;
};

export function mulberry32(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSim(rand: Rand): Sim {
  const m0 = MU[0];
  const m1 = MU[1];
  const b0 = BETA[0];
  const b1 = BETA[1];
  const a00 = ALPHA[0][0];
  const a01 = ALPHA[0][1];
  const a10 = ALPHA[1][0];
  const a11 = ALPHA[1][1];
  let t = 0;
  let s0 = 0;
  let s1 = 0;
  let e0 = 0;
  let e1 = 0;
  let scale = 1;
  let n = 0;

  const decay = (dt: number) => {
    const d0 = Math.exp(-b0 * dt);
    const d1 = Math.exp(-b1 * dt);
    s0 *= d0;
    e0 *= d0;
    s1 *= d1;
    e1 *= d1;
    scale = 1 - (1 - scale) * Math.exp(-dt / 3);
  };

  return {
    time: () => t,
    count: () => n,
    advance(until, out, max) {
      let w = 0;
      while (w < max) {
        const bar = m0 + m1 + (a00 + a10) * s0 + (a01 + a11) * s1 + e0 + e1 + 1e-9;
        const dt = -Math.log(1 - rand()) / bar;
        if (t + dt >= until) {
          decay(until - t);
          t = until;
          break;
        }
        t += dt;
        decay(dt);
        const l0 = scale * m0 + a00 * s0 + a01 * s1 + e0;
        const l1 = scale * m1 + a10 * s0 + a11 * s1 + e1;
        const tot = l0 + l1;
        if (rand() * bar > tot) continue;
        const side = rand() * tot < l0 ? 0 : 1;
        if (side === 0) s0 += 1;
        else s1 += 1;
        if (tot > LAMBDA_CAP) scale *= 0.6;
        const r = rand();
        out[w * 3] = t;
        out[w * 3 + 1] = side;
        out[w * 3 + 2] = 0.35 + 0.65 * r * r;
        w += 1;
        n += 1;
      }
      return w;
    },
    excite(at, c0, c1) {
      const d = Math.max(0, t - at);
      s0 += c0 * Math.exp(-b0 * d);
      s1 += c1 * Math.exp(-b1 * d);
    },
    bump(at, v0, v1) {
      const d = Math.max(0, t - at);
      e0 = Math.min(6, e0 + v0 * Math.exp(-b0 * d));
      e1 = Math.min(6, e1 + v1 * Math.exp(-b1 * d));
    },
  };
}
