import { createSim, mulberry32, type Sim } from "./ogata";
import { LOOKAHEAD } from "./params";

export type WorkerMsg =
  | { type: "start"; seed: number; renderTime: number }
  | { type: "pause" }
  | { type: "resume"; renderTime: number }
  | { type: "sync"; renderTime: number }
  | { type: "bump"; t: number; a0: number; a1: number }
  | { type: "cluster"; t: number; c0: number; c1: number };

export type BatchMsg = { type: "batch"; n: number; buf: ArrayBuffer };

const port = self as unknown as {
  postMessage: (msg: BatchMsg, transfer: Transferable[]) => void;
  onmessage: ((e: MessageEvent<WorkerMsg>) => void) | null;
};

const out = new Float32Array(512 * 3);
let sim: Sim | null = null;
let playing = false;
let base = 0;
let baseReal = 0;

const now = () => performance.now() / 1000;

function pump() {
  if (!sim || !playing) return;
  const until = base + (now() - baseReal) + LOOKAHEAD;
  for (;;) {
    const m = sim.advance(until, out, 512);
    if (m > 0) {
      const buf = out.buffer.slice(0, m * 3 * 4);
      port.postMessage({ type: "batch", n: m, buf }, [buf]);
    }
    if (m < 512) return;
  }
}

port.onmessage = (e) => {
  const d = e.data;
  if (d.type === "start") {
    sim = createSim(mulberry32(d.seed));
    base = d.renderTime;
    baseReal = now();
    playing = true;
    pump();
  } else if (d.type === "pause") {
    playing = false;
  } else if (d.type === "resume") {
    base = d.renderTime;
    baseReal = now();
    playing = true;
    pump();
  } else if (d.type === "sync") {
    base = d.renderTime;
    baseReal = now();
  } else if (d.type === "bump") {
    sim?.bump(d.t, d.a0, d.a1);
  } else if (d.type === "cluster") {
    sim?.excite(d.t, d.c0, d.c1);
  }
};

setInterval(pump, 100);
