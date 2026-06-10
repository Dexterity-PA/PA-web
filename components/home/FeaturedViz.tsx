"use client";

import { useEffect, useRef, useState } from "react";
import {
  ALPHA,
  BETA,
  MU,
  SEED,
  START_TIME,
  WINDOW,
} from "@/lib/hawkes/params";
import { baked } from "@/lib/hawkes/static";
import type { BatchMsg } from "@/lib/hawkes/worker";

type Props = { className?: string };

const BG = "#050607";
const AXIS = "rgba(255,255,255,0.06)";
const EDGE_MASK =
  "linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%)";
const BUY = "#4ade80";
const SELL = "#f87171";
const BUY_FILL = "rgba(74,222,128,0.07)";
const SELL_FILL = "rgba(248,113,113,0.07)";
const LINE_W = 1.25;

const EV_CAP = 2048;
const EV_MASK = EV_CAP - 1;
const LAM_CAP = 2048;
const LAM_MASK = LAM_CAP - 1;
const HZ = 30;

const ZW = 15;
const WD = 13.229;
const springEval = (t: number) =>
  1 - Math.exp(-ZW * t) * (Math.cos(WD * t) + (ZW / WD) * Math.sin(WD * t));
const sat = (v: number) => v / (v + 2.5);

// Static fallback geometry, baked once. Mirrored, half tick density.
const VW = 600;
const VH = 220;
const AX = VH / 2;
const AMP = AX - 12;
function bakedPath(buf: Float32Array, dir: number) {
  let d = `M0 ${AX}`;
  for (let j = 0; j < buf.length; j++) {
    const t = baked.ts0 + j / baked.hz;
    const x = ((t - baked.t0) / WINDOW) * VW;
    d += ` L${x.toFixed(1)} ${(AX + dir * sat(buf[j]) * AMP).toFixed(1)}`;
  }
  d += ` L${VW} ${AX} Z`;
  return d;
}
const STATIC_B = bakedPath(baked.lamB, -1);
const STATIC_S = bakedPath(baked.lamS, 1);
const STATIC_TICKS = baked.events
  .filter((_, i) => i % 2 === 0)
  .map((e) => {
    const x = ((e.t - baked.t0) / WINDOW) * VW;
    const hh = e.mark * AMP * 0.5;
    return e.side === 0
      ? { x, y: AX - hh, h: hh, buy: true }
      : { x, y: AX, h: hh, buy: false };
  });

export default function FeaturedViz({ className = "" }: Props) {
  const [live, setLive] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const rm = matchMedia("(prefers-reduced-motion: reduce)");
    const ok =
      typeof Worker !== "undefined" &&
      !!document.createElement("canvas").getContext("2d");
    const apply = () => setLive(ok && !rm.matches);
    apply();
    rm.addEventListener("change", apply);
    return () => rm.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!live) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const step = 1 / HZ;
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

    const lamB = new Float32Array(LAM_CAP);
    const lamS = new Float32Array(LAM_CAP);
    const kFirst = Math.ceil((START_TIME - WINDOW) * HZ);
    let k = kFirst;

    let s0 = 0;
    let s1 = 0;
    let renderTime = START_TIME;
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
    let firstDraw = false;

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
      half = axisY - 10;
      pps = w / WINDOW;
      if (firstDraw) {
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, w, h);
      }
    };

    const worker = new Worker(
      new URL("../../lib/hawkes/worker.ts", import.meta.url),
      { type: "module" },
    );

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

    const integrate = () => {
      while ((k + 1) * step <= renderTime) {
        const ts = (k + 1) * step;
        s0 *= d0;
        s1 *= d1;
        while (evConsume < evHead && evT[evConsume & EV_MASK] <= ts) {
          const ci = evConsume & EV_MASK;
          const dd = ts - evT[ci];
          if (evSide[ci] === 0) s0 += Math.exp(-b0 * dd);
          else s1 += Math.exp(-b1 * dd);
          evConsume += 1;
        }
        const ki = (k + 1) & LAM_MASK;
        lamB[ki] = m0 + a00 * s0 + a01 * s1;
        lamS[ki] = m1 + a10 * s0 + a11 * s1;
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
      ctx.lineWidth = LINE_W;
      ctx.strokeStyle = line;
      ctx.stroke();
    };

    // Half tick density: render every other event (even ring index).
    const drawTicks = (side: number, t0: number) => {
      const tickMax = half * 0.5;
      ctx.fillStyle = side === 0 ? BUY : SELL;
      for (let i = evDrawTail; i < evHead; i++) {
        if ((i & 1) === 1) continue;
        const ii = i & EV_MASK;
        const tt = evT[ii];
        if (tt > renderTime) break;
        if (evSide[ii] !== side) continue;
        const age = renderTime - tt;
        const hh = evMark[ii] * tickMax * (age < 0.45 ? springEval(age) : 1);
        if (side === 0) ctx.fillRect((tt - t0) * pps - 1, axisY - hh, 2, hh);
        else ctx.fillRect((tt - t0) * pps - 1, axisY, 2, hh);
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      renderTime += dt;
      const t0 = renderTime - WINDOW;
      while (evDrawTail < evHead && evT[evDrawTail & EV_MASK] < t0 - 1)
        evDrawTail += 1;
      integrate();
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = AXIS;
      ctx.fillRect(0, axisY - 0.5, w, 1);
      const k0 = Math.max(Math.ceil(t0 * HZ), kFirst, k - LAM_CAP + 8);
      if (k > k0) {
        drawPath(lamB, -1, BUY, BUY_FILL, k0, t0);
        drawPath(lamS, 1, SELL, SELL_FILL, k0, t0);
      }
      drawTicks(0, t0);
      drawTicks(1, t0);
      firstDraw = true;
    };

    // Stream only when at least half the viz is on screen.
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[entries.length - 1].isIntersecting;
        setPlaying();
      },
      { threshold: 0.5 },
    );
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
      worker.terminate();
    };
  }, [live]);

  return (
    <div
      ref={wrapRef}
      className={`relative isolate overflow-hidden bg-bg-0 ${className}`}
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="none"
        style={{ maskImage: EDGE_MASK, WebkitMaskImage: EDGE_MASK }}
      >
        <path d={STATIC_B} fill={BUY_FILL} />
        <path d={STATIC_S} fill={SELL_FILL} />
        <path
          d={STATIC_B}
          fill="none"
          stroke={BUY}
          strokeWidth={LINE_W}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={STATIC_S}
          fill="none"
          stroke={SELL}
          strokeWidth={LINE_W}
          vectorEffect="non-scaling-stroke"
        />
        {STATIC_TICKS.map((t, i) => (
          <rect
            key={i}
            x={t.x - 1}
            y={t.y}
            width={2}
            height={t.h}
            fill={t.buy ? BUY : SELL}
          />
        ))}
      </svg>
      {live && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ maskImage: EDGE_MASK, WebkitMaskImage: EDGE_MASK }}
        />
      )}
    </div>
  );
}
