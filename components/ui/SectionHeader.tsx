"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { Fragment, useRef } from "react";
import { sectionReveal, springOut, springSnappy, useIndexCount } from "@/lib/motion";

type Props = {
  index: number;
  lead: string;
  rest: string;
  support?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
};

const words = (s: string) => s.trim().split(/\s+/);

function Words({ text }: { text: string }) {
  const parts = words(text);
  return parts.map((w, i) => (
    <Fragment key={i}>
      <motion.span variants={sectionReveal.word} className="inline-block">
        {w}
      </motion.span>
      {i < parts.length - 1 ? " " : null}
    </Fragment>
  ));
}

export default function SectionHeader({
  index,
  lead,
  rest,
  support,
  href,
  linkLabel = "Explore section",
  className = "",
}: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const idx = useIndexCount(index, inView, !!reduce);

  return (
    <header ref={ref} className={`grid gap-x-8 gap-y-10 md:grid-cols-12 ${className}`}>
      <motion.h2
        variants={sectionReveal.container}
        initial={reduce ? "show" : "hidden"}
        animate={reduce || inView ? "show" : "hidden"}
        className="two-tone order-2 text-balance text-38 md:order-none md:col-span-7 md:text-50"
      >
        <motion.span variants={sectionReveal.lead} className="lead">
          <Words text={lead} />
        </motion.span>{" "}
        <motion.span variants={sectionReveal.continuation}>
          <Words text={rest} />
        </motion.span>
      </motion.h2>

      <div className="order-1 flex items-start justify-between gap-6 font-mono text-12 uppercase tracking-label text-text-3 md:order-none md:col-span-4 md:col-start-9">
        <motion.span aria-hidden className="tabular-nums">
          {idx}
        </motion.span>
        {href && (
          <motion.a
            href={href}
            aria-label={linkLabel}
            className="inline-flex text-text-2 transition-colors hover:text-accent focus-visible:text-accent"
            transition={springOut}
            whileHover={reduce ? undefined : { x: 3, y: -3, transition: springSnappy }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M3 11L11 3M11 3H5M11 3V9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.a>
        )}
      </div>

      {support && (
        <p className="order-3 max-w-md text-16 text-text-2 md:order-none md:col-span-4 md:col-start-9">
          {support}
        </p>
      )}
    </header>
  );
}
