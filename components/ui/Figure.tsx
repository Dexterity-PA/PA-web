"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";
import { figureFrame, formatIndex, useParallaxDrift } from "@/lib/motion";

type Props = {
  index: number;
  caption?: string;
  children: ReactNode;
  className?: string;
  drift?: number;
};

export default function Figure({ index, caption, children, className = "", drift = 40 }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const y = useParallaxDrift(ref, drift, !!reduce);

  return (
    <figure ref={ref} className={`flex flex-col gap-3 ${className}`}>
      <figcaption className="flex items-baseline gap-3">
        <span className="fig-label">FIG {formatIndex(index)}</span>
        {caption && <span className="text-12 text-text-3">{caption}</span>}
      </figcaption>
      <motion.div
        style={{ y }}
        variants={figureFrame}
        custom={!!reduce}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="relative overflow-hidden rounded-card border border-border bg-bg-1 shadow-edge"
      >
        {children}
      </motion.div>
    </figure>
  );
}
