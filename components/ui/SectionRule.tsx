"use client";

import { motion, useReducedMotion } from "motion/react";
import { springDraw } from "@/lib/motion";

type Props = { className?: string };

export default function SectionRule({ className = "" }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={`hairline origin-left ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={reduce ? { duration: 0 } : springDraw}
    />
  );
}
