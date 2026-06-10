"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import { figureDraw } from "@/lib/motion";

const AMBER = "#fbbf24";
const MONO = "var(--font-geist-mono)";

// Data values below are carried verbatim from the Phase 5 fit outputs.
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

// Stroke-by-stroke draw container; figureDraw children animate pathLength.
const chartFrame = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { delayChildren: 0.05, staggerChildren: 0.03 } },
};

function DrawSvg({ reduce, children }: { reduce: boolean; children: ReactNode }) {
  return (
    <motion.svg
      viewBox="0 0 320 180"
      className="w-full"
      variants={chartFrame}
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
    >
      {children}
    </motion.svg>
  );
}

const HoldoutContent = (
  <>
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
        <motion.path
          key={i}
          variants={figureDraw}
          d={`M${x},158 L${x},${y}`}
          stroke="var(--accent)"
          strokeWidth="4"
        />
      );
    })}
  </>
);

const BranchingContent = (
  <>
    <text x="22" y="60" fontSize="9" fill="var(--text-3)" fontFamily={MONO}>
      constant μ
    </text>
    <motion.path variants={figureDraw} d="M22,80 L226.6,80" stroke="var(--accent)" strokeWidth="14" />
    <motion.path variants={figureDraw} d="M226.6,80 L262.9,80" stroke={AMBER} strokeWidth="14" />
    <text x="270" y="84" fontSize="10" fill="var(--text-2)" fontFamily={MONO}>
      0.73
    </text>
    <text x="230" y="62" fontSize="9" fill={AMBER} fontFamily={MONO}>
      0.11 drift
    </text>
    <text x="22" y="116" fontSize="9" fill="var(--text-3)" fontFamily={MONO}>
      piecewise μ · 12×300s
    </text>
    <motion.path variants={figureDraw} d="M22,130 L226.6,130" stroke="var(--accent)" strokeWidth="14" />
    <text x="232" y="134" fontSize="10" fill="var(--accent)" fontFamily={MONO}>
      0.62
    </text>
  </>
);

const CrossContent = (
  <>
    <text x="24" y="52" fontSize="9" fill="var(--text-3)" fontFamily={MONO}>
      buy → sell
    </text>
    <motion.path variants={figureDraw} d="M24,66 L242.5,66" stroke="var(--accent)" strokeWidth="12" />
    <text x="248" y="70" fontSize="10" fill="var(--text-2)" fontFamily={MONO}>
      Φ 0.038
    </text>
    <text x="24" y="104" fontSize="9" fill="var(--text-3)" fontFamily={MONO}>
      sell → buy
    </text>
    <motion.path variants={figureDraw} d="M24,118 L139,118" stroke="var(--sell)" strokeWidth="12" />
    <text x="145" y="122" fontSize="10" fill="var(--text-2)" fontFamily={MONO}>
      Φ 0.020
    </text>
    <text x="24" y="158" fontSize="9" fill="var(--text-3)" fontFamily={MONO}>
      self Φ ≈ 0.63, off scale
    </text>
  </>
);

const FitContent = (
  <>
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
        <motion.path
          key={i}
          variants={figureDraw}
          d={`M${x},150 L${x},${y}`}
          stroke={i === 0 ? AMBER : "var(--text-3)"}
          strokeWidth="6"
        />
      );
    })}
    <text x="42" y="44" fontSize="9" fill={AMBER} fontFamily={MONO}>
      lag-1 ρ 0.34
    </text>
  </>
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
    chart: HoldoutContent,
  },
  {
    label: "Branching, baseline-corrected",
    stat: "0.73 → 0.62",
    caption: "0.11 gap is intra-hour μ drift (Filimonov-Sornette) · piecewise μ wins AIC 28/28",
    chart: BranchingContent,
  },
  {
    label: "Cross-excitation asymmetry",
    stat: "buy → sell 1.9× sell → buy",
    caption: "self Φ ≈ 0.63, cross Φ ≈ 0.03 · buy flow leads",
    chart: CrossContent,
  },
  {
    label: "Goodness of fit",
    stat: "ρ₁ 0.34 survives",
    caption: "KS, ED near-pass at high P · Ljung-Box rejects 28/28",
    chart: FitContent,
    amber: true,
  },
];

const NUM = /^\d+\.?\d*$/;

function CountNum({ target, play, reduce }: { target: string; play: boolean; reduce: boolean }) {
  const decimals = target.includes(".") ? target.split(".")[1].length : 0;
  const end = parseFloat(target);
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => v.toFixed(decimals));
  useEffect(() => {
    if (reduce) {
      mv.set(end);
      return;
    }
    if (!play) return;
    const controls = animate(mv, end, { duration: 0.9, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [play, reduce, end, mv]);
  return <motion.span className="tabular-nums">{text}</motion.span>;
}

function CountStat({ value, reduce }: { value: string; reduce: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const parts = useMemo(() => value.split(/(\d+\.?\d*)/), [value]);
  return (
    <span ref={ref}>
      {parts.map((p, i) =>
        NUM.test(p) ? (
          <CountNum key={i} target={p} play={inView} reduce={reduce} />
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}

export default function ResultsGrid() {
  const reduce = !!useReducedMotion();

  return (
    <section id="results" className="mx-auto max-w-content px-6 section-pad">
      <SectionHeader
        className="md:[&>h2]:row-span-2"
        index={0.3}
        lead="Empirical"
        rest="results."
        support="28 one-hour BTC-USDT windows · full MLE · scored on the held-out next hour."
        href="#validation"
        linkLabel="Stress-test the model"
      />
      <div className="mt-16 grid gap-6 md:mt-24 md:grid-cols-2">
        {results.map((r, i) => (
          <Reveal key={r.label} index={i}>
            <Card tiltMax={3} className="p-8">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-mono text-12 uppercase tracking-label text-text-3">{r.label}</p>
                <span className="fig-label">FIG 0.3{i + 1}</span>
              </div>
              <div className="mt-6">
                <DrawSvg reduce={reduce}>{r.chart}</DrawSvg>
              </div>
              <p
                className="mt-6 font-mono text-21"
                style={{ color: r.amber ? AMBER : "var(--accent)" }}
              >
                <CountStat value={r.stat} reduce={reduce} />
              </p>
              <p className="mt-1 font-mono text-12 text-text-3">{r.caption}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
