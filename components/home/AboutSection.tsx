"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import Figure from "@/components/ui/Figure";
import { figureDraw, spring } from "@/lib/motion";

const links = [
  { label: "GitHub", value: "github.com/Dexterity-PA", href: "https://github.com/Dexterity-PA" },
  { label: "Email", value: "praneeth.a2027@gmail.com", href: "mailto:praneeth.a2027@gmail.com" },
  {
    label: "LinkedIn",
    value: "in/praneeth-annapureddy",
    href: "https://www.linkedin.com/in/praneeth-annapureddy/",
  },
];

const listV: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemV: Variants = {
  hidden: { opacity: 0, x: 16 },
  show: { opacity: 1, x: 0, transition: spring },
};
const nodeV: Variants = {
  hidden: { opacity: 0, scale: 0 },
  show: { opacity: 1, scale: 1, transition: spring },
};

// Self-exciting cascade: one seed tick branching into offspring events.
function EventTree() {
  const edges = [
    "M120 150 L70 104",
    "M120 150 L172 104",
    "M70 104 L42 60",
    "M70 104 L96 58",
    "M172 104 L150 56",
    "M172 104 L202 52",
    "M96 58 L82 24",
  ];
  const nodes: [number, number, boolean][] = [
    [120, 150, true],
    [70, 104, false],
    [172, 104, false],
    [42, 60, false],
    [96, 58, false],
    [150, 56, false],
    [202, 52, false],
    [82, 24, false],
  ];
  return (
    <svg viewBox="0 0 244 168" className="h-full w-full" fill="none">
      {edges.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          stroke={i === 0 || i === 1 ? "rgba(74,222,128,0.5)" : "rgba(255,255,255,0.14)"}
          strokeWidth={1}
          strokeLinecap="round"
          variants={figureDraw}
        />
      ))}
      {nodes.map(([cx, cy, seed], i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r={seed ? 3.5 : 2}
          fill={seed ? "#4ade80" : "#5c6166"}
          variants={nodeV}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
      ))}
    </svg>
  );
}

export default function AboutSection() {
  const reduce = useReducedMotion();
  return (
    <section id="about" className="section-pad">
      <p className="mb-12 font-mono text-12 uppercase tracking-label text-text-3">
        0.3 / About
      </p>
      <div className="grid gap-x-8 gap-y-14 md:grid-cols-12">
        <p className="two-tone order-2 text-balance text-28 md:order-none md:col-span-6 md:text-38">
          <span className="lead">I build quantitative models and the companies around them.</span>{" "}
          Right now that means QuantLab, a study of crypto order flow as a
          self-exciting point process, and tools for people locked out of the
          systems that could help them.
        </p>

        <div className="order-1 flex flex-col gap-10 md:order-none md:col-span-5 md:col-start-8">
          <motion.ul
            className="flex flex-col"
            initial={reduce ? "show" : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={listV}
          >
            {links.map((l) => (
              <motion.li key={l.label} variants={reduce ? undefined : itemV}>
                <a
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                  className="group flex items-baseline justify-between gap-6 border-b border-border py-4 font-mono text-12 uppercase tracking-label transition-colors hover:border-border-hover"
                >
                  <span className="text-text-1">{l.label}</span>
                  <span className="inline-flex items-center gap-2 text-text-3 transition-colors group-hover:text-accent">
                    {l.value}
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path
                        d="M3 11L11 3M11 3H5M11 3V9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </a>
              </motion.li>
            ))}
          </motion.ul>

          <Figure index={0.3} caption="self-exciting cascade from one tick" drift={28}>
            <div className="h-44 px-6 py-5">
              <EventTree />
            </div>
          </Figure>
        </div>
      </div>
    </section>
  );
}
