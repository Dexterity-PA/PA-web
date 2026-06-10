"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { Fragment, useMemo, useRef } from "react";
import { sectionReveal, spring, springSnappy, useIndexCount, wordStagger } from "@/lib/motion";

// Manifesto, roadmap, and copy are carried verbatim from Phase 5.
const HEADING = "A good model, and its limits";

const para1 =
  "Exponential-kernel Hawkes describes most of what BTC-USDT market-order flow does: the clustering, the branching, the asymmetric pull between buys and sells. It does not describe all of it. Ljung-Box rejects in every window, and a lag-1 autocorrelation of 0.34 survives every kernel and baseline I tried. Some sub-300s memory lives outside the model, in book imbalance and order splitting that a fixed exponential kernel cannot see. Rigor is reporting that, not burying it under a good log-likelihood.";

const para2 =
  "One result cuts against itself. A piecewise-constant baseline, twelve 300-second segments, wins AIC in all 28 windows and pulls the branching ratio from 0.73 to 0.62: it absorbs intra-hour drift that a constant baseline mistakes for self-excitation. The same baseline slightly degrades the held-out next hour. The drift is real inside the hour, not a profile that transfers to the one after it. The piecewise model measures branching better. The constant baseline forecasts better. Both are true at once.";

const phases = [
  { n: "00", name: "Data", detail: "aggTrade capture" },
  { n: "01", name: "Simulator", detail: "Ogata thinning" },
  { n: "02", name: "Fit", detail: "MLE, analytic gradient" },
  { n: "03", name: "Validation", detail: "KS, ED, LB" },
  { n: "04", name: "Recovery", detail: "parameter recovery" },
  { n: "05", name: "Baseline", detail: "piecewise μ" },
  { n: "06", name: "Selection", detail: "holdout, AIC" },
  { n: "07", name: "Findings", detail: "residual memory" },
];
const DONE_THROUGH = phases.length - 1; // all phases 00–07 complete

const headlineGroup = {
  hidden: {},
  show: { transition: { delayChildren: 0.05, staggerChildren: wordStagger } },
};
const lineGroup = {
  hidden: {},
  show: { transition: { delayChildren: 0.05, staggerChildren: 0.08 } },
};
const lineItem = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: spring },
};
const nodeGroup = {
  hidden: {},
  show: { transition: { delayChildren: 0.1, staggerChildren: 0.08 } },
};
const nodeItem = {
  hidden: { opacity: 0, scale: 0.5, y: 6 },
  show: { opacity: 1, scale: 1, y: 0, transition: springSnappy },
};

function Lines({ text, className, reduce }: { text: string; className: string; reduce: boolean }) {
  const lines = useMemo(() => text.split(/(?<=\.)\s+/), [text]);
  return (
    <motion.p
      className={className}
      variants={lineGroup}
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      {lines.map((ln, i) => (
        <motion.span key={i} variants={lineItem}>
          {ln}
          {i < lines.length - 1 ? " " : null}
        </motion.span>
      ))}
    </motion.p>
  );
}

export default function Thesis() {
  const reduce = !!useReducedMotion();
  const headRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headRef, { once: true, amount: 0.6 });
  const idx = useIndexCount(0.5, inView, reduce);

  return (
    <section id="thesis" className="mx-auto max-w-content px-6 section-pad">
      <div ref={headRef} className="mx-auto max-w-2xl text-center">
        <motion.p
          className="font-mono text-12 uppercase tracking-label text-text-3"
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={reduce || inView ? { opacity: 1 } : { opacity: 0 }}
          transition={spring}
        >
          <motion.span className="tabular-nums text-accent">{idx}</motion.span> · Thesis
        </motion.p>
        <motion.h2
          className="two-tone mt-4 text-center text-38 md:text-50"
          variants={headlineGroup}
          initial={reduce ? "show" : "hidden"}
          animate={reduce || inView ? "show" : "hidden"}
        >
          {HEADING.split(" ").map((w, i, a) => (
            <Fragment key={i}>
              <motion.span variants={sectionReveal.word} className="lead inline-block">
                {w}
              </motion.span>
              {i < a.length - 1 ? " " : null}
            </Fragment>
          ))}
        </motion.h2>
      </div>

      <Lines text={para1} reduce={reduce} className="mx-auto mt-10 max-w-2xl text-21 text-text-2" />
      <Lines text={para2} reduce={reduce} className="mx-auto mt-6 max-w-2xl text-16 text-text-2" />

      <div className="mt-24">
        <div className="mb-10 flex items-baseline justify-center gap-3">
          <span className="fig-label">FIG 0.5</span>
          <span className="font-mono text-12 uppercase tracking-label text-text-3">
            Roadmap · all phases complete
          </span>
        </div>
        <div className="relative">
          <motion.div
            aria-hidden
            className="absolute left-0 right-0 top-[3px] h-px origin-left bg-accent/40"
            initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={reduce ? { duration: 0 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.ol
            className="relative grid grid-cols-4 gap-y-10 md:grid-cols-8"
            variants={nodeGroup}
            initial={reduce ? "show" : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
          >
            {phases.map((p, i) => (
              <motion.li key={p.n} className="pr-4" variants={nodeItem}>
                <span
                  aria-hidden
                  className="block h-[7px] w-[7px] rounded-full"
                  style={{ background: i <= DONE_THROUGH ? "var(--accent)" : "var(--text-3)" }}
                />
                <p className="mt-4 font-mono text-12 uppercase tracking-label text-text-2">
                  {p.n} {p.name}
                </p>
                <p className="mt-1 font-mono text-12 text-text-3">{p.detail}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}
