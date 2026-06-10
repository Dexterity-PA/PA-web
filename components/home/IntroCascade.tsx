"use client";

import { useEffect, useRef } from "react";
import { buildCascade, sampleMonogram } from "./cascade";

// Beats 1–2, drawn on one full-screen 2D canvas. The orchestrator drives `mode`:
//   cascade  — the branching swarm spreads from center across the viewport
//   converge — ticks fold onto the PA monogram points and shrink to dots
//   fade     — the canvas dissolves (the curtain's solid strokes take over)
// All tick state lives in typed arrays from buildCascade(); the loop only reads.

type Mode = "cascade" | "converge" | "fade";

const BG = "#050607";
const BUY = "74,222,128"; // accent, as rgb triplet for rgb()/rgba() compositing
const SELL = "248,113,113";
const COUNT = 720;
const CONVERGE_MS = 820;
const FADE_MS = 360;
const TICK_H = 15; // px at mark 1, before per-tick scale
const GLOW_MS = 460;

const easeSnap = (p: number) => {
  const c1 = 1.18;
  const c3 = c1 + 1;
  const x = p - 1;
  return 1 + c3 * x * x * x + c1 * x * x;
};
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function IntroCascade({
  seed,
  mode,
  className = "",
}: {
  seed: number;
  mode: Mode;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<Mode>(mode);
  const stampRef = useRef<{ converge: number; fade: number }>({ converge: 0, fade: 0 });

  // Stamp the moment each later mode begins so the loop can measure its progress
  // without restarting the rAF.
  useEffect(() => {
    if (mode !== modeRef.current) {
      const now = performance.now();
      if (mode === "converge") stampRef.current.converge = now;
      if (mode === "fade") stampRef.current.fade = now;
      modeRef.current = mode;
    }
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const mono = sampleMonogram(COUNT);
    const c = buildCascade(seed, COUNT, mono);

    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let halfW = 0;
    let halfH = 0;
    let scale = 1;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2;
      cy = h / 2;
      halfW = w / 2;
      halfH = h / 2;
      const monoW = Math.min(Math.max(112, w * 0.13), 168);
      scale = monoW / 120;
    };
    resize();

    let raf = 0;
    let t0 = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!t0) t0 = now;
      const m = modeRef.current;

      let alpha = 1;
      if (m === "fade") {
        alpha = 1 - (now - stampRef.current.fade) / FADE_MS;
        if (alpha <= 0) {
          ctx.clearRect(0, 0, w, h);
          cancelAnimationFrame(raf);
          return;
        }
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = alpha;

      const elapsed = (now - t0) / 1000;
      const cp =
        m === "cascade"
          ? 0
          : clamp01((now - stampRef.current.converge) / CONVERGE_MS);
      const ce = easeSnap(cp);

      for (let i = 0; i < c.n; i++) {
        const born = c.birth[i];
        // In cascade, ticks appear over time; once converging, all are present.
        if (m === "cascade" && elapsed < born) continue;
        const age = elapsed - born;
        const grow = age < 0.32 ? 1 - Math.exp(-age / 0.07) : 1; // spawn pop

        const sx = cx + c.nx[i] * halfW;
        const sy = cy + c.ny[i] * halfH;
        const ti = c.target[i];
        const txp = cx + (mono.vx[ti] - 60) * scale;
        const typ = cy + (mono.vy[ti] - 32) * scale;
        const x = sx + (txp - sx) * ce;
        const y = sy + (typ - sy) * ce;

        const col = c.side[i] === 0 ? BUY : SELL;
        // Tick height collapses to a ~2px dot as it lands on a letter.
        const hh = (TICK_H * c.mark[i] * grow) * (1 - cp) + 2 * cp;
        const half = hh / 2;

        if (m === "cascade" && age < GLOW_MS / 1000) {
          const g = (1 - age / (GLOW_MS / 1000)) * 0.5 * alpha;
          ctx.globalAlpha = g;
          ctx.fillStyle = `rgb(${col})`;
          const r = 3 + 4 * c.mark[i];
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
          ctx.globalAlpha = alpha;
        }

        ctx.fillStyle = `rgb(${col})`;
        ctx.fillRect(x - 1, y - half, 2, hh);
      }
    };
    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(resize);
    ro.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [seed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`intro-cascade pointer-events-none fixed inset-0 z-50 motion-reduce:hidden ${className}`}
    />
  );
}
