"use client";

import { motion, useReducedMotion } from "motion/react";
import SectionHeader from "@/components/ui/SectionHeader";
import { springSnappy, stagger } from "@/lib/motion";

const AMBER = "#fbbf24";

// Cells and the open-finding copy are carried verbatim from Phase 5.
const cells = [
  { name: "KS test", detail: "rescaled ITIs vs Exp(1)" },
  { name: "ED battery", detail: "excess dispersion" },
  { name: "Likelihood check", detail: "brute-force vs recursion" },
  { name: "Gradient check", detail: "analytic vs finite difference" },
  { name: "Ogata simulation", detail: "golden regression suite" },
  { name: "Parameter recovery", detail: "Monte Carlo, CI coverage" },
  { name: "Negative controls", detail: "flow-shuffled nulls" },
  { name: "Stationarity", detail: "ρ(G) < 1, μ-tempered" },
];

export default function ValidationWall() {
  const reduce = useReducedMotion();
  const findingDelay = reduce ? 0 : cells.length * stagger + 0.35;

  return (
    <section id="validation" className="mx-auto max-w-content px-6 section-pad">
      <SectionHeader
        className="md:[&>h2]:row-span-2"
        index={0.4}
        lead="The model must survive"
        rest="this."
        support="Every check the fit has to clear, and the one finding it does not."
        href="#thesis"
        linkLabel="Read the thesis"
      />

      <div className="mt-16 flex items-baseline gap-3 md:mt-24">
        <span className="fig-label">FIG 0.4</span>
        <span className="text-12 text-text-3">test matrix</span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cells.map((c, i) => (
          <motion.div
            key={c.name}
            className="rounded-card border border-border bg-bg-1 p-5"
            style={{ transformPerspective: 700 }}
            initial={{ opacity: 0, rotateX: -75 }}
            whileInView={{ opacity: 1, rotateX: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={reduce ? { duration: 0 } : { ...springSnappy, delay: i * stagger }}
          >
            <p className="font-mono text-12 uppercase tracking-label text-text-2">{c.name}</p>
            <p className="mt-1 font-mono text-12 text-text-3">{c.detail}</p>
            <p className="mt-4 flex items-center gap-2 font-mono text-12 uppercase tracking-label">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--accent)" }}
              />
              <span className="text-text-1">pass</span>
            </p>
          </motion.div>
        ))}

        <motion.div
          className="col-span-2 rounded-card border bg-bg-1 p-6 md:col-span-4 md:p-8"
          style={{ borderColor: "rgba(251,191,36,0.32)", transformPerspective: 900 }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: [1, 1.025, 1] }}
          viewport={{ once: true, amount: 0.4 }}
          transition={
            reduce
              ? { duration: 0 }
              : {
                  opacity: { ...springSnappy, delay: findingDelay },
                  y: { ...springSnappy, delay: findingDelay },
                  scale: {
                    duration: 0.5,
                    times: [0, 0.5, 1],
                    ease: "easeInOut",
                    delay: findingDelay + 0.35,
                  },
                }
          }
        >
          <p className="flex items-center gap-2 font-mono text-12 uppercase tracking-label">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: AMBER }} />
            <span style={{ color: AMBER }}>Residual memory</span>
            <span className="text-text-3">open finding</span>
          </p>
          <p className="mt-4 max-w-3xl font-mono text-16 leading-relaxed" style={{ color: AMBER }}>
            Ljung-Box rejects in 28/28 windows.
          </p>
          <p className="mt-2 max-w-3xl text-16 text-text-2">
            Lag-1 autocorrelation 0.34 survives every kernel and baseline extension. The remaining
            structure is sub-300s state-dependence outside the Hawkes family.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
