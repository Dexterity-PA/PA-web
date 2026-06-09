import { createSim, mulberry32 } from "./ogata";
import { ALPHA, BETA, MU, SEED, START_TIME, WINDOW } from "./params";

const HZ = 24;

export type BakedEvent = { t: number; side: number; mark: number };
export type Baked = {
  t0: number;
  hz: number;
  ts0: number;
  lamB: Float32Array;
  lamS: Float32Array;
  events: BakedEvent[];
};

function bake(): Baked {
  const sim = createSim(mulberry32(SEED));
  const buf = new Float32Array(512 * 3);
  const m = sim.advance(START_TIME, buf, 512);
  const t0 = START_TIME - WINDOW;
  const kn = Math.floor(START_TIME * HZ);
  const lamB = new Float32Array(kn + 1);
  const lamS = new Float32Array(kn + 1);
  const events: BakedEvent[] = [];
  const d0 = Math.exp(-BETA[0] / HZ);
  const d1 = Math.exp(-BETA[1] / HZ);
  let s0 = 0;
  let s1 = 0;
  let i = 0;
  for (let k = 1; k <= kn; k++) {
    const ts = k / HZ;
    s0 *= d0;
    s1 *= d1;
    while (i < m && buf[i * 3] <= ts) {
      const tt = buf[i * 3];
      const side = buf[i * 3 + 1];
      if (side === 0) s0 += Math.exp(-BETA[0] * (ts - tt));
      else s1 += Math.exp(-BETA[1] * (ts - tt));
      if (tt >= t0) events.push({ t: tt, side, mark: buf[i * 3 + 2] });
      i += 1;
    }
    lamB[k] = MU[0] + ALPHA[0][0] * s0 + ALPHA[0][1] * s1;
    lamS[k] = MU[1] + ALPHA[1][0] * s0 + ALPHA[1][1] * s1;
  }
  const k0 = Math.ceil(t0 * HZ);
  return {
    t0,
    hz: HZ,
    ts0: k0 / HZ,
    lamB: lamB.slice(k0),
    lamS: lamS.slice(k0),
    events,
  };
}

export const baked = bake();
