"use client";

import { motion } from "motion/react";
import { figureDraw } from "@/lib/motion";

// Inherits the "hidden"/"show" variant state from the parent <Figure> frame,
// so the strokes draw in (strokeDashoffset via pathLength) on viewport enter.
export default function DemoFigure() {
  return (
    <svg viewBox="0 0 320 180" className="block h-auto w-full p-6" fill="none">
      <line x1="28" y1="64" x2="300" y2="64" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 6" />
      <line x1="28" y1="108" x2="300" y2="108" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 6" />
      <motion.path
        variants={figureDraw}
        d="M28 16 V152 H300"
        stroke="var(--text-3)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <motion.path
        variants={figureDraw}
        d="M28 130 C 84 130, 108 52, 150 70 S 232 138, 300 36"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
