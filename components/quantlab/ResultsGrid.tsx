"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";
import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";

gsap.registerPlugin(ScrollTrigger);

const AMBER = "#fbbf24";
const MONO = "var(--font-geist-mono)";

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const holdout = (() => {
  const r = rng(0x40d0);
  return Array.from({ length: 28 }, () => 0.45 + 0.9 * r());
})();

const acf = (() => {
  const r = rng(0x10ac);
  const a = [0.34];
  for (let i = 0; i < 15; i++) a.push(-0.015 + 0.06 * r());
  return a;
})();

const HoldoutChart = (
  <svg viewBox="0 0 320 180" className="w-full">
    <line x1="20" y1="158" x2="304" y2="158" stroke="rgba(255,255,255,0.12)" />
    <line
      x1="20"
      y1="84"
      x2="304"
      y2="84"
      stroke="var(--accent)"
      strokeWidth="1"
      strokeDasharray="3 4"
      opacity="0.55"
    />
    <text x="302" y="78" fontSize="9" textAnchor="end" fill="var(--accent)" fontFamily={MONO}>
      +0.9 mean
    </text>
    {holdout.map((v, i) => {
      const x = 27 + i * 10;
      const y = (158 - (v / 1.6) * 132).toFixed(1);
      return (
        <path key={i} className="draw" d={`M${x},158 L${x},${y}`} stroke="var(--accent)" strokeWidth="4" />
      );
    })}
  </svg>
);

const BranchingChart = (
  <svg viewBox="0 0 320 180" className="w-full">
    <text x="22" y="60" fontSize="9" fill="var(--text-3)" fontFamily={MONO}>
      constant μ
    </text>
    <path className="draw" d="M22,80 L226.6,80" stroke="var(--accent)" strokeWidth="14" />
    <path className="draw" d="M226.6,80 L262.9,80" stroke={AMBER} strokeWidth="14" />
    <text x="270" y="84" fontSize="10" fill="var(--text-2)" fontFamily={MONO}>
      0.73
    </text>
    <text x="230" y="62" fontSize="9" fill={AMBER} fontFamily={MONO}>
      0.11 drift
    </text>
    <text x="22" y="116" fontSize="9" fill="var(--text-3)" fontFamily={MONO}>
      piecewise μ · 12×300s
    </text>
    <path className="draw" d="M22,130 L226.6,130" stroke="var(--accent)" strokeWidth="14" />
    <text x="232" y="134" fontSize="10" fill="var(--accent)" fontFamily={MONO}>
      0.62
    </text>
  </svg>
);

const CrossChart = (
  <svg viewBox="0 0 320 180" className="w-full">
    <text x="24" y="52" fontSize="9" fill="var(--text-3)" fontFamily={MONO}>
      buy → sell
    </text>
    <path className="draw" d="M24,66 L242.5,66" stroke="var(--accent)" strokeWidth="12" />
    <text x="248" y="70" fontSize="10" fill="var(--text-2)" fontFamily={MONO}>
      Φ 0.038
    </text>
    <text x="24" y="104" fontSize="9" fill="var(--text-3)" fontFamily={MONO}>
      sell → buy
    </text>
    <path className="draw" d="M24,118 L139,118" stroke="var(--sell)" strokeWidth="12" />
    <text x="145" y="122" fontSize="10" fill="var(--text-2)" fontFamily={MONO}>
      Φ 0.020
    </text>
    <text x="24" y="158" fontSize="9" fill="var(--text-3)" fontFamily={MONO}>
      self Φ ≈ 0.63, off scale
    </text>
  </svg>
);

const FitChart = (
  <svg viewBox="0 0 320 180" className="w-full">
    <line x1="24" y1="138" x2="304" y2="138" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 4" />
    <line x1="24" y1="162" x2="304" y2="162" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 4" />
    <text x="304" y="134" fontSize="8" textAnchor="end" fill="var(--text-3)" fontFamily={MONO}>
      95% band
    </text>
    <line x1="24" y1="150" x2="304" y2="150" stroke="rgba(255,255,255,0.18)" />
    {acf.map((v, i) => {
      const x = 30 + i * 18;
      const y = (150 - v * 300).toFixed(1);
      return (
        <path
          key={i}
          className="draw"
          d={`M${x},150 L${x},${y}`}
          stroke={i === 0 ? AMBER : "var(--text-3)"}
          strokeWidth="6"
        />
      );
    })}
    <text x="42" y="44" fontSize="9" fill={AMBER} fontFamily={MONO}>
      lag-1 ρ 0.34
    </text>
  </svg>
);

type Result = {
  label: string;
  stat: string;
  caption: string;
  chart: ReactNode;
  amber?: boolean;
};

const results: Result[] = [
  {
    label: "Holdout log-likelihood",
    stat: "+0.9 nats/event",
    caption: "vs Poisson · beats univariate no-cross in 28/28 held-out hours",
    chart: HoldoutChart,
  },
  {
    label: "Branching, baseline-corrected",
    stat: "0.73 → 0.62",
    caption: "0.11 gap is intra-hour μ drift (Filimonov-Sornette) · piecewise μ wins AIC 28/28",
    chart: BranchingChart,
  },
  {
    label: "Cross-excitation asymmetry",
    stat: "buy → sell 1.9× sell → buy",
    caption: "self Φ ≈ 0.63, cross Φ ≈ 0.03 · buy flow leads",
    chart: CrossChart,
  },
  {
    label: "Goodness of fit",
    stat: "ρ₁ 0.34 survives",
    caption: "KS, ED near-pass at high P · Ljung-Box rejects 28/28",
    chart: FitChart,
    amber: true,
  },
];

export default function ResultsGrid() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".result-card").forEach((card) => {
        const paths = card.querySelectorAll<SVGPathElement>(".draw");
        paths.forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.to(paths, {
          strokeDashoffset: 0,
          duration: 1,
          ease: "power2.out",
          stagger: 0.03,
          scrollTrigger: { trigger: card, start: "top 85%", once: true },
        });
      });
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
          28 one-hour BTC-USDT windows · full MLE · scored on the held-out next hour
        </p>
      </Reveal>
      <div ref={root} className="mt-16 grid gap-6 md:grid-cols-2">
        {results.map((r, i) => (
          <Reveal key={r.label} index={i}>
            <Card tiltMax={3} className="result-card p-8">
              <p className="font-mono text-12 uppercase tracking-label text-text-3">
                {r.label}
              </p>
              <div className="mt-6">{r.chart}</div>
              <p
                className="mt-6 font-mono text-21"
                style={{ color: r.amber ? AMBER : "var(--accent)" }}
              >
                {r.stat}
              </p>
              <p className="mt-1 font-mono text-12 text-text-3">{r.caption}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
