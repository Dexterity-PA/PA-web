"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import Card from "@/components/ui/Card";
import MagneticButton from "@/components/ui/MagneticButton";
import { spring } from "@/lib/motion";
import FeaturedViz from "./FeaturedViz";

const BRANCHING_RATIO = 0.62;

export default function FeaturedQuantlab() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 28, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={reduce ? { duration: 0 } : spring}
    >
      <Card tiltMax={2} className="w-full">
        <div className="grid md:grid-cols-[5fr_6fr]">
          <div className="relative z-30 flex flex-col items-start gap-6 p-8 md:p-12">
            <p className="font-mono text-12 uppercase tracking-label text-text-3">
              Featured / QuantLab
            </p>
            <h2 className="text-38 font-semibold tracking-head text-text-1 md:text-50">
              QuantLab
            </h2>
            <p className="max-w-md text-16 text-text-2">
              Bivariate Hawkes model of BTC-USDT order flow. Buys excite sells,
              sells excite buys, rendered as a living point process.
            </p>
            <div className="flex items-baseline gap-3 font-mono">
              <span className="text-28 tabular-nums text-accent">
                {BRANCHING_RATIO.toFixed(2)}
              </span>
              <span className="text-12 uppercase tracking-label text-text-3">
                fitted branching ratio
              </span>
            </div>
            <div className="relative z-30 mt-2">
              <MagneticButton href="/quantlab" variant="ghost">
                Explore →
              </MagneticButton>
            </div>
          </div>

          <div className="relative h-56 md:h-auto">
            <FeaturedViz className="absolute inset-0 h-full w-full" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg-2 via-bg-2/40 to-transparent md:bg-gradient-to-r md:from-bg-2 md:via-bg-2/55 md:to-transparent"
            />
          </div>
        </div>

        <Link
          href="/quantlab"
          aria-label="Explore QuantLab"
          className="absolute inset-0 z-20"
        />
      </Card>
    </motion.div>
  );
}
