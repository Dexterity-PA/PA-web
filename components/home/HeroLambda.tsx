"use client";

import { motion, useReducedMotion } from "motion/react";
import { WINDOW } from "@/lib/hawkes/params";
import { baked } from "@/lib/hawkes/static";

const VW = 1000;
const VH = 280;
const AX = VH / 2;
const AMP = AX - 8;
const sat = (v: number) => v / (v + 2.5);

function path(buf: Float32Array, dir: number) {
  let d = "";
  for (let j = 0; j < buf.length; j++) {
    const t = baked.ts0 + j / baked.hz;
    const x = ((t - baked.t0) / WINDOW) * VW;
    const y = (AX + dir * sat(buf[j]) * AMP).toFixed(1);
    d += `${j === 0 ? "M" : "L"}${x.toFixed(1)} ${y} `;
  }
  return d;
}
const PB = path(baked.lamB, -1);
const PS = path(baked.lamS, 1);

// Faint full-width intensity paths drifting behind the headline.
export default function HeroLambda({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden
      className={`pointer-events-none overflow-hidden opacity-[0.06] ${className}`}
    >
      <motion.svg
        className="h-full w-[112%] -translate-x-[6%]"
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="none"
        initial={false}
        animate={reduce ? undefined : { x: ["-1.4%", "1.4%"] }}
        transition={
          reduce
            ? undefined
            : { duration: 26, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
        }
      >
        <path
          d={PB}
          fill="none"
          stroke="#4ade80"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={PS}
          fill="none"
          stroke="#f87171"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </motion.svg>
    </div>
  );
}
