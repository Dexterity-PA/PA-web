"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";
import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";

gsap.registerPlugin(ScrollTrigger);

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function kernelPath(amp: number, beta: number) {
  const pts: string[] = [];
  for (let x = 0; x <= 272; x += 4) {
    const t = (x / 272) * 8;
    pts.push(`${x + 24},${(160 - amp * Math.exp(-beta * t)).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}

function intensityPath(seed: number) {
  const r = rng(seed);
  const pts: string[] = [];
  let s = 0;
  for (let i = 0; i <= 144; i++) {
    s *= 0.82;
    if (r() < 0.09) s += 1 + 2.2 * r();
    const v = Math.min(0.8 + 0.25 * r() + s, 6);
    pts.push(`${(16 + (i / 144) * 288).toFixed(1)},${(168 - v * 24).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}

const QQ = (() => {
  const r = rng(7);
  const n = 36;
  const out: { x: number; y: number }[] = [];
  for (let i = 1; i <= n; i++) {
    const q = -Math.log(1 - (i - 0.5) / n);
    const e = Math.max(0, q + (r() - 0.5) * 0.12 * (1 + q));
    out.push({
      x: 20 + (Math.min(q, 4) / 4) * 268,
      y: 166 - (Math.min(e, 4) / 4) * 146,
    });
  }
  return out;
})();

const KERNEL_BUY = kernelPath(135, 0.62);
const KERNEL_SELL = kernelPath(108, 0.51);
const INTENSITY = intensityPath(0x51ab1e);

const bars = [
  { label: "buy → buy", v: 0.45, color: "var(--accent)" },
  { label: "sell → buy", v: 0.2, color: "rgba(242,243,244,0.35)" },
  { label: "buy → sell", v: 0.2, color: "rgba(242,243,244,0.35)" },
  { label: "sell → sell", v: 0.45, color: "var(--sell)" },
];

type Result = {
  label: string;
  stat: string;
  caption: string;
  chart: ReactNode;
};

const axis = <line x1="16" y1="168" x2="304" y2="168" stroke="rgba(255,255,255,0.1)" />;

const results: Result[] = [
  {
    label: "Fitted kernel decay",
    stat: "β⁺ 0.62 s⁻¹",
    caption: "buy kernel half-life 1.1s · sell 1.4s",
    chart: (
      <svg viewBox="0 0 320 180" className="w-full">
        {axis}
        <path className="draw" d={KERNEL_BUY} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
        <path className="draw" d={KERNEL_SELL} fill="none" stroke="var(--sell)" strokeWidth="1.5" />
        <text x="240" y="40" fontSize="9" fill="var(--text-3)" fontFamily="var(--font-geist-mono)">
          α e
          <tspan baselineShift="super" fontSize="7">
            −βt
          </tspan>
        </text>
      </svg>
    ),
  },
  {
    label: "Branching matrix",
    stat: "ρ(G) 0.65",
    caption: "spectral radius — subcritical, stationary",
    chart: (
      <svg viewBox="0 0 320 180" className="w-full">
        {bars.map((b, i) => (
          <g key={b.label}>
            <text
              x="20"
              y={44 + i * 34}
              fontSize="9"
              fill="var(--text-3)"
              fontFamily="var(--font-geist-mono)"
            >
              {b.label}
            </text>
            <path
              className="draw"
              d={`M100,${40 + i * 34} L${100 + b.v * 380},${40 + i * 34}`}
              stroke={b.color}
              strokeWidth="8"
            />
            <text
              x={108 + b.v * 380}
              y={44 + i * 34}
              fontSize="9"
              fill="var(--text-2)"
              fontFamily="var(--font-geist-mono)"
            >
              {b.v.toFixed(2)}
            </text>
          </g>
        ))}
      </svg>
    ),
  },
  {
    label: "Intensity · 1h BTC-USDT",
    stat: "n 14,212",
    caption: "λ⁺(t), 25s bins over one hour",
    chart: (
      <svg viewBox="0 0 320 180" className="w-full">
        {axis}
        <path className="draw" d={INTENSITY} fill="none" stroke="var(--accent)" strokeWidth="1.25" />
      </svg>
    ),
  },
  {
    label: "QQ · rescaled residuals",
    stat: "KS p 0.41",
    caption: "time-rescaled ITIs vs Exp(1)",
    chart: (
      <svg viewBox="0 0 320 180" className="w-full">
        <path
          d="M20,166 L288,20"
          stroke="var(--accent)"
          strokeWidth="1"
          strokeDasharray="4 4"
          fill="none"
        />
        {QQ.map((p, i) => (
          <circle
            key={i}
            className="pt"
            cx={p.x}
            cy={p.y}
            r="2.25"
            fill="rgba(242,243,244,0.55)"
          />
        ))}
      </svg>
    ),
  },
];

export default function ResultsGrid() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<SVGPathElement>(".draw").forEach((path) => {
        const len = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDasharray: len, strokeDashoffset: len },
          {
            strokeDashoffset: 0,
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: { trigger: path, start: "top 88%", once: true },
          },
        );
      });
      gsap.fromTo(
        ".pt",
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          stagger: 0.025,
          duration: 0.3,
          scrollTrigger: { trigger: ".pt", start: "top 88%", once: true },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="results" className="mx-auto max-w-content px-6 section-pad">
      <Reveal>
        <p className="font-mono text-12 uppercase tracking-label text-text-3">
          Results
        </p>
        <h2 className="mt-4 text-38 font-semibold text-text-1">
          Empirical results
        </h2>
        <p className="mt-3 font-mono text-12 uppercase tracking-label text-text-3">
          placeholder fit — real numbers land in Phase 5
        </p>
      </Reveal>
      <div ref={root} className="mt-16 grid gap-6 md:grid-cols-2">
        {results.map((r, i) => (
          <Reveal key={r.label} index={i}>
            <Card tiltMax={3} className="p-8">
              <p className="font-mono text-12 uppercase tracking-label text-text-3">
                {r.label}
              </p>
              <div className="mt-6">{r.chart}</div>
              <p className="mt-6 font-mono text-21 text-accent">{r.stat}</p>
              <p className="mt-1 font-mono text-12 text-text-3">{r.caption}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
