"use client";

import { motion, useReducedMotion } from "motion/react";
import Reveal from "@/components/ui/Reveal";
import { springSnappy, stagger } from "@/lib/motion";

const AMBER = "#fbbf24";

type Cell = {
  name: string;
  detail: string;
  wip?: boolean;
};

const cells: Cell[] = [
  { name: "KS test", detail: "rescaled ITIs vs Exp(1)" },
  { name: "Ljung-Box", detail: "residual autocorrelation" },
  { name: "ED battery", detail: "excess dispersion" },
  { name: "Golden tests", detail: "simulator regression suite" },
  { name: "QQ envelope", detail: "bootstrap confidence band" },
  { name: "Stationarity", detail: "ρ(G) < 1, μ-tempered" },
  { name: "Gradient check", detail: "analytic vs finite difference" },
  { name: "Phase 4", detail: "parameter recovery", wip: true },
];

export default function ValidationWall() {
  const reduce = useReducedMotion();

  return (
    <section id="validation" className="mx-auto max-w-content px-6 section-pad">
      <Reveal>
        <p className="font-mono text-12 uppercase tracking-label text-text-3">
          Validation
        </p>
        <h2 className="mt-4 font-mono text-28 text-text-1">
          The model must survive this.
        </h2>
      </Reveal>
      <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cells.map((c, i) => (
          <motion.div
            key={c.name}
            className="rounded-card border bg-bg-1 p-5"
            style={{
              transformPerspective: 700,
              borderColor: c.wip ? "rgba(251,191,36,0.3)" : "var(--border)",
            }}
            initial={{ opacity: 0, rotateX: -75 }}
            whileInView={{ opacity: 1, rotateX: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={
              reduce ? { duration: 0 } : { ...springSnappy, delay: i * stagger }
            }
          >
            <p className="font-mono text-12 uppercase tracking-label text-text-2">
              {c.name}
            </p>
            <p className="mt-1 font-mono text-12 text-text-3">{c.detail}</p>
            <p className="mt-4 flex items-center gap-2 font-mono text-12 uppercase tracking-label">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: c.wip ? AMBER : "var(--accent)" }}
              />
              <span style={{ color: c.wip ? AMBER : "var(--text-1)" }}>
                {c.wip ? "in progress" : "pass"}
              </span>
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
