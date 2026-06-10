"use client";

import { useEffect, useRef, useState } from "react";
import StaticPointProcess from "./StaticPointProcess";
import {
  ALPHA,
  BETA,
  MU,
  SEED,
  START_TIME,
  WINDOW,
  tiers,
} from "@/lib/hawkes/params";
import type { BatchMsg } from "@/lib/hawkes/worker";

type Props = { variant?: "full" | "mini"; className?: string };

const BG = "#050607";
const SMEAR = "rgba(5,6,7,0.12)";
const AXIS = "rgba(255,255,255,0.08)";
const BUY = "#4ade80";
const SELL = "#f87171";
const BUY_FILL = "rgba(74,222,128,0.08)";
const SELL_FILL = "rgba(248,113,113,0.08)";
const BUY_FILL_SMEAR = "rgba(74,222,128,0.012)";
const SELL_FILL_SMEAR = "rgba(248,113,113,0.012)";

const EV_CAP = 2048;
const EV_MASK = EV_CAP - 1;
const LAM_CAP = 2048;
const LAM_MASK = LAM_CAP - 1;
const INJ_CAP = 256;
const INJ_MASK = INJ_CAP - 1;
const ARC_CAP = 4;

const ZW = 15;
const WD = 13.229;
const springEval = (t: number) =>
  1 - Math.exp(-ZW * t) * (Math.cos(WD * t) + (ZW / WD) * Math.sin(WD * t));
const sat = (v: number) => v / (v + 2.5);

function glowSprite(core: string, edge: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, core);
  grad.addColorStop(1, edge);
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  return c;
}

export default function PointProcessHero({ variant = "full", className = "" }: Props) {
  const [live, setLive] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const rm = matchMedia("(prefers-reduced-motion: reduce)");
    const ok =
      typeof Worker !== "undefined" &&
      !!document.createElement("canvas").getContext("2d");
    const apply = () => setLive(ok && !rm.matches);
    const ric =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(apply, { timeout: 1500 })
        : window.setTimeout(apply, 300);
    rm.addEventListener("change", apply);
    return () => {
      rm.removeEventListener("change", apply);
      if (typeof window.cancelIdleCallback === "function")
        window.cancelIdleCallback(ric as number);
      else clearTimeout(ric);
    };
  }, []);

  useEffect(() => {
    if (!live) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;
    const readB = document.getElementById("lam-buy");
    const readS = document.getElementById("lam-sell");
    const readN = document.getElementById("lam-n");

    const cfg =
      variant === "mini" ||
      matchMedia("(max-width: 767px), (pointer: coarse)").matches
        ? tiers.mini
        : tiers.full;
    const hz = cfg.hz;
    const step = 1 / hz;

    const m0 = MU[0];
    const m1 = MU[1];
    const b0 = BETA[0];
    const b1 = BETA[1];
    const a00 = ALPHA[0][0];
    const a01 = ALPHA[0][1];
    const a10 = ALPHA[1][0];
    const a11 = ALPHA[1][1];
    const d0 = Math.exp(-b0 * step);
    const d1 = Math.exp(-b1 * step);

    const evT = new Float32Array(EV_CAP);
    const evMark = new Float32Array(EV_CAP);
    const evSide = new Uint8Array(EV_CAP);
    let evHead = 0;
    let evDrawTail = 0;
    let evConsume = 0;

    const injT = new Float32Array(INJ_CAP);
    const injMark = new Float32Array(INJ_CAP);
    const injSide = new Uint8Array(INJ_CAP);
    let injHead = 0;
    let injDrawTail = 0;
    let injConsume = 0;
    let lastInjT = 0;

    const lamB = new Float32Array(LAM_CAP);
    const lamS = new Float32Array(LAM_CAP);
    const kFirst = Math.ceil((START_TIME - WINDOW) * hz);
    let k = kFirst;

    const arcT = new Float32Array(ARC_CAP);
    const arcBorn = new Float32Array(ARC_CAP);
    const arcSide = new Uint8Array(ARC_CAP);
    const arcOn = new Uint8Array(ARC_CAP);
    let lastArc = -10;
    const burst0 = new Float32Array(4).fill(-10);
    const burst1 = new Float32Array(4).fill(-10);
    let bi0 = 0;
    let bi1 = 0;

    let s0 = 0;
    let s1 = 0;
    let n = 0;
    let renderTime = START_TIME;
    let curOff = 0;
    let curAmp = 0;
    let curLeft = -1;
    let w = 0;
    let h = 0;
    let axisY = 0;
    let half = 0;
    let pps = 0;
    let playing = false;
    let ready = false;
    let inView = false;
    let vis = !document.hidden;
    let raf = 0;
    let last = 0;
    let lastRead = 0;
    let lastBumpMsg = 0;
    let firstDraw = false;

    const glowB = glowSprite("rgba(74,222,128,0.9)", "rgba(74,222,128,0)");
    const glowS = glowSprite("rgba(248,113,113,0.9)", "rgba(248,113,113,0)");

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      axisY = h / 2;
      half = axisY - 14;
      pps = w / WINDOW;
      if (cfg.smear && firstDraw) {
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, w, h);
      }
    };

    const worker = new Worker(new URL("../../lib/hawkes/worker.ts", import.meta.url), {
      type: "module",
    });

    const setPlaying = () => {
      const should = ready && inView && vis;
      if (should === playing) return;
      playing = should;
      if (playing) {
        last = performance.now();
        worker.postMessage({ type: "resume", renderTime });
        raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
        worker.postMessage({ type: "pause" });
      }
    };

    worker.onmessage = (e: MessageEvent<BatchMsg>) => {
      if (e.data.type !== "batch") return;
      const a = new Float32Array(e.data.buf);
      for (let i = 0; i < e.data.n; i++) {
        const ii = evHead & EV_MASK;
        evT[ii] = a[i * 3];
        evSide[ii] = a[i * 3 + 1];
        evMark[ii] = a[i * 3 + 2];
        evHead += 1;
      }
      if (!ready) {
        ready = true;
        setPlaying();
      }
    };
    worker.postMessage({ type: "start", seed: SEED, renderTime });

    const noteBurst = (side: number, ts: number) => {
      if (side === 0) {
        burst0[bi0] = ts;
        bi0 = (bi0 + 1) & 3;
      } else {
        burst1[bi1] = ts;
        bi1 = (bi1 + 1) & 3;
      }
      const oldest = side === 0 ? burst0[bi0] : burst1[bi1];
      const lift = side === 0 ? a10 * s0 : a01 * s1;
      if (ts - oldest < 0.8 && lift > 0.32 && ts - lastArc > 4) {
        for (let a = 0; a < ARC_CAP; a++) {
          if (!arcOn[a]) {
            arcOn[a] = 1;
            arcT[a] = ts;
            arcBorn[a] = ts;
            arcSide[a] = side;
            lastArc = ts;
            break;
          }
        }
      }
    };

    const integrate = () => {
      while ((k + 1) * step <= renderTime) {
        const ts = (k + 1) * step;
        s0 *= d0;
        s1 *= d1;
        while (evConsume < evHead && evT[evConsume & EV_MASK] <= ts) {
          const ci = evConsume & EV_MASK;
          const dd = ts - evT[ci];
          if (evSide[ci] === 0) {
            s0 += Math.exp(-b0 * dd);
            noteBurst(0, ts);
          } else {
            s1 += Math.exp(-b1 * dd);
            noteBurst(1, ts);
          }
          n += 1;
          evConsume += 1;
        }
        while (injConsume < injHead && injT[injConsume & INJ_MASK] <= ts) {
          const ci = injConsume & INJ_MASK;
          const dd = ts - injT[ci];
          if (injSide[ci] === 0) {
            s0 += Math.exp(-b0 * dd);
            noteBurst(0, ts);
          } else {
            s1 += Math.exp(-b1 * dd);
            noteBurst(1, ts);
          }
          n += 1;
          injConsume += 1;
        }
        let g0 = 0;
        let g1 = 0;
        if (curAmp > 0) {
          const ext = curLeft < 0 ? 0 : Math.max(0, ts - curLeft);
          g0 = curAmp * Math.exp(-b0 * (curOff + ext));
          g1 = curAmp * Math.exp(-b1 * (curOff + ext));
        }
        const ki = (k + 1) & LAM_MASK;
        lamB[ki] = m0 + a00 * s0 + a01 * s1 + g0;
        lamS[ki] = m1 + a10 * s0 + a11 * s1 + g1;
        k += 1;
      }
    };

    const drawPath = (
      buf: Float32Array,
      dir: number,
      line: string,
      fill: string,
      k0: number,
      t0: number,
    ) => {
      let x = (k0 * step - t0) * pps;
      ctx.beginPath();
      ctx.moveTo(x, axisY);
      for (let i = k0; i <= k; i++) {
        x = (i * step - t0) * pps;
        ctx.lineTo(x, axisY + dir * sat(buf[i & LAM_MASK]) * half);
      }
      ctx.lineTo(x, axisY);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.beginPath();
      for (let i = k0; i <= k; i++) {
        x = (i * step - t0) * pps;
        const y = axisY + dir * sat(buf[i & LAM_MASK]) * half;
        if (i === k0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = line;
      ctx.stroke();
    };

    const drawTicks = (
      tA: Float32Array,
      mA: Float32Array,
      sA: Uint8Array,
      lo: number,
      hi: number,
      mask: number,
      side: number,
      t0: number,
    ) => {
      const tickMax = half * 0.5;
      ctx.fillStyle = side === 0 ? BUY : SELL;
      for (let i = lo; i < hi; i++) {
        const ii = i & mask;
        const tt = tA[ii];
        if (tt > renderTime) break;
        if (sA[ii] !== side) continue;
        const age = renderTime - tt;
        const hh = mA[ii] * tickMax * (age < 0.45 ? springEval(age) : 1);
        if (side === 0) ctx.fillRect((tt - t0) * pps - 1, axisY - hh, 2, hh);
        else ctx.fillRect((tt - t0) * pps - 1, axisY, 2, hh);
      }
    };

    const drawGlows = (
      tA: Float32Array,
      mA: Float32Array,
      sA: Uint8Array,
      lo: number,
      hi: number,
      mask: number,
      t0: number,
    ) => {
      for (let i = hi - 1; i >= lo; i--) {
        const ii = i & mask;
        const tt = tA[ii];
        if (tt > renderTime) continue;
        const age = renderTime - tt;
        if (age > 0.3) break;
        const x = (tt - t0) * pps;
        const hh = mA[ii] * half * 0.5 * springEval(Math.max(age, 0.01));
        const y = sA[ii] === 0 ? axisY - hh : axisY + hh;
        ctx.globalAlpha = 1 - age / 0.3;
        ctx.drawImage(sA[ii] === 0 ? glowB : glowS, x - 12, y - 12, 24, 24);
      }
      ctx.globalAlpha = 1;
    };

    const drawArcs = (t0: number) => {
      for (let a = 0; a < ARC_CAP; a++) {
        if (!arcOn[a]) continue;
        const life = renderTime - arcBorn[a];
        if (life > 2.4 || arcT[a] < t0) {
          arcOn[a] = 0;
          continue;
        }
        const ke = Math.min(Math.floor((arcT[a] + 0.9) * hz), k);
        if (ke <= kFirst) continue;
        const from = arcSide[a];
        const lam = from === 0 ? lamS : lamB;
        const dir = from === 0 ? 1 : -1;
        const xs = (arcT[a] - t0) * pps;
        const ys = from === 0 ? axisY - half * 0.3 : axisY + half * 0.3;
        const xe = (ke * step - t0) * pps;
        const ye = axisY + dir * sat(lam[ke & LAM_MASK]) * half;
        ctx.globalAlpha = Math.sin((life / 2.4) * Math.PI) * 0.16;
        ctx.strokeStyle = from === 0 ? SELL : BUY;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xs, ys);
        ctx.quadraticCurveTo((xs + xe) / 2, axisY + dir * half * 0.9, xe, ye);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      renderTime += dt;
      const t0 = renderTime - WINDOW;
      while (evDrawTail < evHead && evT[evDrawTail & EV_MASK] < t0 - 1) evDrawTail += 1;
      while (injDrawTail < injHead && injT[injDrawTail & INJ_MASK] < t0 - 1)
        injDrawTail += 1;
      integrate();
      ctx.fillStyle = cfg.smear ? SMEAR : BG;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = AXIS;
      ctx.fillRect(0, axisY - 0.5, w, 1);
      const k0 = Math.max(Math.ceil(t0 * hz), kFirst, k - LAM_CAP + 8);
      if (k > k0) {
        drawPath(lamB, -1, BUY, cfg.smear ? BUY_FILL_SMEAR : BUY_FILL, k0, t0);
        drawPath(lamS, 1, SELL, cfg.smear ? SELL_FILL_SMEAR : SELL_FILL, k0, t0);
      }
      drawArcs(t0);
      drawTicks(evT, evMark, evSide, evDrawTail, evHead, EV_MASK, 0, t0);
      drawTicks(evT, evMark, evSide, evDrawTail, evHead, EV_MASK, 1, t0);
      drawTicks(injT, injMark, injSide, injDrawTail, injHead, INJ_MASK, 0, t0);
      drawTicks(injT, injMark, injSide, injDrawTail, injHead, INJ_MASK, 1, t0);
      drawGlows(evT, evMark, evSide, evDrawTail, evHead, EV_MASK, t0);
      drawGlows(injT, injMark, injSide, injDrawTail, injHead, INJ_MASK, t0);
      if (now - lastRead > 100) {
        lastRead = now;
        if (readB) readB.textContent = lamB[k & LAM_MASK].toFixed(2);
        if (readS) readS.textContent = lamS[k & LAM_MASK].toFixed(2);
        if (readN) readN.textContent = n.toLocaleString("en-US");
      }
      firstDraw = true;
    };

    const onMove = (e: PointerEvent) => {
      if (!playing) return;
      curOff = Math.max(0, (w - e.offsetX) / pps);
      curAmp = 0.9;
      curLeft = -1;
      const nw = performance.now();
      if (nw - lastBumpMsg > 120) {
        lastBumpMsg = nw;
        worker.postMessage({ type: "bump", t: renderTime - curOff, a0: 0.25, a1: 0.25 });
      }
    };
    const onLeave = () => {
      curLeft = renderTime;
    };
    const onDown = (e: PointerEvent) => {
      if (!playing) return;
      const above = e.offsetY < axisY;
      const size = 3 + ((Math.random() * 3) | 0);
      let c0 = 0;
      let c1 = 0;
      let tb = Math.max(renderTime + 0.02, lastInjT + 0.03);
      for (let i = 0; i < size; i++) {
        const ii = injHead & INJ_MASK;
        tb += 0.04 + Math.random() * 0.05;
        injT[ii] = tb;
        const side = Math.random() < (above ? 0.75 : 0.25) ? 0 : 1;
        injSide[ii] = side;
        injMark[ii] = 0.45 + 0.55 * Math.random();
        if (side === 0) c0 += 1;
        else c1 += 1;
        injHead += 1;
      }
      lastInjT = tb;
      worker.postMessage({ type: "cluster", t: renderTime, c0, c1 });
    };
    if (cfg.cursor) {
      canvas.addEventListener("pointermove", onMove, { passive: true });
      canvas.addEventListener("pointerleave", onLeave, { passive: true });
      canvas.addEventListener("pointerdown", onDown);
    }

    const io = new IntersectionObserver((entries) => {
      inView = entries[entries.length - 1].isIntersecting;
      setPlaying();
    });
    io.observe(wrap);
    const onVis = () => {
      vis = !document.hidden;
      setPlaying();
    };
    document.addEventListener("visibilitychange", onVis);
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();
    const syncId = setInterval(() => {
      if (playing) worker.postMessage({ type: "sync", renderTime });
    }, 5000);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(syncId);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      worker.terminate();
    };
  }, [live, variant]);

  return (
    <div ref={wrapRef} className={`isolate overflow-hidden bg-bg-0 ${className}`}>
      <StaticPointProcess className="absolute inset-0 h-full w-full" />
      {live && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />}
    </div>
  );
}
