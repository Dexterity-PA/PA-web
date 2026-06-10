"use client";

import { motion } from "motion/react";
import { useState } from "react";
import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";
import { spring } from "@/lib/motion";

type Term = "mu" | "self" | "cross";

const BASE_Y = 100;
const MU_Y = 78;

function lambdaPath() {
  const pts: string[] = [];
  for (let x = 16; x <= 304; x += 4) {
    let y = MU_Y;
    if (x >= 70) y -= 34 * Math.exp(-(x - 70) / 55);
    if (x >= 165) y -= 15 * Math.exp(-(x - 165) / 55);
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}

const LAMBDA_D = lambdaPath();

const captions: Record<Term, string> = {
  mu: "μ⁺: exogenous baseline arrival rate",
  self: "each buy lifts λ⁺ by α₊₊, decaying at β⁺",
  cross: "sell flow feeds back into λ⁺ through α₊₋",
};

const paragraphs = [
  "A bivariate Hawkes process is a counting process whose intensity is a function of its own history. Every market order momentarily raises the probability of the next one, and that excitement decays exponentially. Order flow arrives in clusters, not as the uniform drizzle a Poisson model assumes.",
  "Aggressive flow begets aggressive flow. A marketable buy consumes liquidity, moves the quote, and trips the algorithms watching it: momentum ignition, stop cascades, queue reshuffling. In the data this shows up as a branching ratio far above zero. Most market orders are children of earlier ones, not spontaneous arrivals.",
  "The bivariate structure is the point. Buys excite sells and sells excite buys. Market makers lean against flow, mean-reversion strategies fade it. The cross-excitation terms measure that coupling directly, and their asymmetry between sides is where the microstructure signal lives.",
];

export default function ModelSection() {
  const [term, setTerm] = useState<Term | null>(null);

  const eq = (t: Term) => ({
    opacity: term && term !== t ? 0.35 : 1,
  });
  const viz = (t: Term) => ({
    opacity: term ? (term === t ? 1 : 0.18) : 0.7,
  });

  const termProps = (t: Term) => ({
    onPointerEnter: () => setTerm(t),
    onPointerLeave: () => setTerm(null),
    onFocus: () => setTerm(t),
    onBlur: () => setTerm(null),
  });

  return (
    <section id="model" className="mx-auto max-w-content px-6 section-pad">
      <div className="grid gap-16 md:grid-cols-2">
        <div>
          <Reveal>
            <p className="font-mono text-12 uppercase tracking-label text-text-3">
              The model
            </p>
            <h2 className="mt-4 text-38 font-semibold text-text-1">
              Self-excitation, made visible
            </h2>
          </Reveal>
          {paragraphs.map((p, i) => (
            <Reveal key={i} index={i + 1}>
              <p className="mt-6 text-16 text-text-2">{p}</p>
            </Reveal>
          ))}
        </div>
        <div className="relative">
          <Reveal className="md:sticky md:top-28">
            <Card tiltMax={3} className="p-8">
              <p className="font-mono text-12 uppercase tracking-label text-text-3">
                Conditional intensity · buy side
              </p>
              <div className="mt-6 select-none font-mono text-16 leading-loose text-text-2">
                <div>
                  <span className="text-text-1">λ⁺(t)</span>
                  {" = "}
                  <motion.button
                    type="button"
                    className="cursor-default text-text-1"
                    animate={eq("mu")}
                    transition={spring}
                    {...termProps("mu")}
                  >
                    μ⁺
                  </motion.button>
                </div>
                <div className="mt-1 pl-6">
                  {"+ "}
                  <motion.button
                    type="button"
                    className="cursor-default text-accent"
                    animate={eq("self")}
                    transition={spring}
                    {...termProps("self")}
                  >
                    Σ<sub>tⱼ∈N⁺</sub> α₊₊ e<sup>−β⁺(t−tⱼ)</sup>
                  </motion.button>
                </div>
                <div className="mt-1 pl-6">
                  {"+ "}
                  <motion.button
                    type="button"
                    className="cursor-default text-sell"
                    animate={eq("cross")}
                    transition={spring}
                    {...termProps("cross")}
                  >
                    Σ<sub>tₖ∈N⁻</sub> α₊₋ e<sup>−β⁻(t−tₖ)</sup>
                  </motion.button>
                </div>
              </div>
              <svg
                viewBox="0 0 320 132"
                className="mt-8 w-full"
                aria-label="Diagram of baseline, self-excitation kernel, and cross-excitation"
              >
                <line
                  x1="16"
                  y1={BASE_Y}
                  x2="304"
                  y2={BASE_Y}
                  stroke="rgba(255,255,255,0.12)"
                />
                <motion.g animate={viz("mu")} transition={spring}>
                  <rect
                    x="16"
                    y={MU_Y}
                    width="288"
                    height={BASE_Y - MU_Y}
                    fill="rgba(255,255,255,0.04)"
                  />
                  <line
                    x1="16"
                    y1={MU_Y}
                    x2="304"
                    y2={MU_Y}
                    stroke="rgba(242,243,244,0.5)"
                    strokeDasharray="3 5"
                  />
                  <text
                    x="22"
                    y={MU_Y - 6}
                    className="fill-text-3 font-mono"
                    fontSize="9"
                  >
                    μ⁺
                  </text>
                </motion.g>
                <motion.g animate={viz("self")} transition={spring}>
                  <line
                    x1="70"
                    y1={BASE_Y}
                    x2="70"
                    y2={BASE_Y - 14}
                    stroke="var(--accent)"
                    strokeWidth="2"
                  />
                  <path
                    d={LAMBDA_D}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                  />
                </motion.g>
                <motion.g animate={viz("cross")} transition={spring}>
                  <line
                    x1="165"
                    y1={BASE_Y}
                    x2="165"
                    y2={BASE_Y + 14}
                    stroke="var(--sell)"
                    strokeWidth="2"
                  />
                  <path
                    d="M165,112 C150,84 152,68 163,58"
                    fill="none"
                    stroke="var(--sell)"
                    strokeWidth="1.25"
                    strokeDasharray="4 4"
                  />
                  <path
                    d="M163,58 l-5,1.5 M163,58 l-1,5.2"
                    stroke="var(--sell)"
                    strokeWidth="1.25"
                    fill="none"
                  />
                </motion.g>
              </svg>
              <p className="mt-4 h-5 font-mono text-12 uppercase tracking-label text-text-3">
                {term ? captions[term] : "hover a term"}
              </p>
              <p className="mt-6 border-t border-border pt-4 font-mono text-12 text-text-3">
                λ⁻(t) mirrors with μ⁻, α₋₋, α₋₊. β is source-only: every buy
                decays at β⁺, every sell at β⁻.
              </p>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
