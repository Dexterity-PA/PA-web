"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { spring, stagger } from "@/lib/motion";

type Props = {
  children: ReactNode;
  className?: string;
  index?: number;
  delay?: number;
  y?: number;
  amount?: number;
  once?: boolean;
};

export default function Reveal({
  children,
  className,
  index = 0,
  delay = 0,
  y = 24,
  amount = 0.3,
  once = true,
}: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={reduce ? { duration: 0 } : { ...spring, delay: delay + index * stagger }}
    >
      {children}
    </motion.div>
  );
}
