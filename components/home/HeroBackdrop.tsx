"use client";

import { useEffect, useRef, useState } from "react";

const STATIC_FIELD =
  "radial-gradient(45% 45% at 28% 32%, rgba(74,222,128,0.10), transparent 70%)," +
  "radial-gradient(55% 55% at 72% 62%, rgba(56,78,110,0.30), transparent 70%)," +
  "radial-gradient(42% 42% at 52% 18%, rgba(30,41,59,0.42), transparent 70%)," +
  "#050607";

export default function HeroBackdrop({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shader, setShader] = useState(false);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let teardown = () => {};
    let dead = false;
    const run = () => {
      if (dead) return;
      import("./heroShader")
        .then(({ startShader }) => {
          if (dead) return;
          setShader(true);
          teardown = startShader(canvas, { wrap, onSlow: () => setShader(false) });
        })
        .catch(() => setShader(false));
    };
    const ric = window.requestIdleCallback as
      | ((cb: () => void) => number)
      | undefined;
    const cancelRic = window.cancelIdleCallback as
      | ((h: number) => void)
      | undefined;
    const handle = ric ? ric(run) : window.setTimeout(run, 200);

    return () => {
      dead = true;
      if (ric && cancelRic) cancelRic(handle);
      else window.clearTimeout(handle);
      teardown();
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden className={`overflow-hidden ${className}`}>
      <div className="absolute inset-0" style={{ background: STATIC_FIELD }} />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full transition-opacity duration-700"
        style={{ opacity: shader ? 1 : 0 }}
      />
    </div>
  );
}
