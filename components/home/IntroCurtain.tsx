"use client";

import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { MotionValue } from "motion/react";
import { useEffect, useState } from "react";
import { signalReveal } from "./introBus";

const DRAW = 0;
const PART = 1;
const GONE = 2;

// Fast, monotonic stroke draw (~500ms) — figureDraw look without the slow settle.
const drawTransition = { type: "spring", duration: 0.5, bounce: 0 } as const;
const partSpring = { type: "spring", stiffness: 210, damping: 30 } as const;

// "PA" as single-stroke letterforms. The gap between P and A sits at the viewBox
// center (x=60) so a split down the middle parts the monogram cleanly — P rides
// the left panel out, A the right.
function Monogram({ draw }: { draw: MotionValue<number> }) {
  return (
    <svg viewBox="0 0 120 64" fill="none" className="w-[clamp(7rem,13vw,10.5rem)]">
      <motion.path
        d="M12 60 L12 4 L38 4 Q50 4 50 17 Q50 30 38 30 L12 30"
        stroke="#f2f3f4"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pathLength: draw }}
      />
      <motion.path
        d="M70 60 L90 4 L110 60 M77 41 L103 41"
        stroke="#f2f3f4"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pathLength: draw }}
      />
    </svg>
  );
}

export default function IntroCurtain() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(DRAW);
  const draw = useMotionValue(0);

  useEffect(() => {
    const skip =
      !!reduce ||
      document.documentElement.hasAttribute("data-intro-skip") ||
      sessionStorage.getItem("intro-seen") === "1";
    const timers: number[] = [];

    if (skip) {
      signalReveal();
      timers.push(window.setTimeout(() => setPhase(GONE), 0));
      return () => timers.forEach(clearTimeout);
    }

    const controls = animate(draw, 1, drawTransition);
    // ~500ms draw + a short hold so "PA" reads, then part.
    timers.push(window.setTimeout(() => setPhase(PART), 600));
    // Typing begins as the curtain starts to clear — well under the 1.2s budget.
    timers.push(window.setTimeout(signalReveal, 600));
    // Unmount once the part spring has settled.
    timers.push(window.setTimeout(() => setPhase(GONE), 1300));

    return () => {
      controls.stop();
      timers.forEach(clearTimeout);
    };
  }, [reduce, draw]);

  if (phase === GONE) return null;
  const parting = phase >= PART;

  const panel =
    "absolute inset-y-0 w-1/2 overflow-hidden bg-bg-0 will-change-transform";
  const inner = "absolute inset-y-0 flex w-screen items-center justify-center";
  const edge =
    "absolute inset-y-0 w-px bg-white/[0.12] transition-opacity duration-500";

  return (
    <div
      aria-hidden
      className="intro-curtain pointer-events-none fixed inset-0 z-[55] motion-reduce:hidden"
    >
      <motion.div
        className={`${panel} left-0`}
        initial={{ x: 0 }}
        animate={{ x: parting ? "-100%" : 0 }}
        transition={partSpring}
      >
        <div className={`${inner} left-0`}>
          <Monogram draw={draw} />
        </div>
        <span className={`${edge} right-0`} style={{ opacity: parting ? 1 : 0 }} />
      </motion.div>

      <motion.div
        className={`${panel} right-0`}
        initial={{ x: 0 }}
        animate={{ x: parting ? "100%" : 0 }}
        transition={partSpring}
      >
        <div className={`${inner} right-0`}>
          <Monogram draw={draw} />
        </div>
        <span className={`${edge} left-0`} style={{ opacity: parting ? 1 : 0 }} />
      </motion.div>
    </div>
  );
}
