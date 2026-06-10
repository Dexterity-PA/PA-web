"use client";

import { animate, motion, useMotionValue } from "motion/react";
import type { MotionValue } from "motion/react";
import { useEffect } from "react";
import { MONO_A, MONO_P } from "./cascade";

// Beat 2 (solidify) → Beat 3 (part), controlled by the orchestrator.
// Mounts at the convergence moment: two black panels fade up over the canvas
// swarm (black-on-black, so only the change reads) while the monogram strokes
// draw in over the landed dots — the points fusing into letters. When `parting`
// flips true the panels slide out, P on the left, A on the right, revealing the
// backdrop arriving behind.

// Fast, monotonic stroke draw — figureDraw look without the slow settle.
const drawTransition = { type: "spring", duration: 0.52, bounce: 0 } as const;
const partSpring = { type: "spring", stiffness: 210, damping: 30 } as const;

function Monogram({ draw }: { draw: MotionValue<number> }) {
  return (
    <svg viewBox="0 0 120 64" fill="none" className="w-[clamp(7rem,13vw,10.5rem)]">
      <motion.path
        d={MONO_P}
        stroke="#f2f3f4"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pathLength: draw }}
      />
      <motion.path
        d={MONO_A}
        stroke="#f2f3f4"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pathLength: draw }}
      />
    </svg>
  );
}

export default function IntroCurtain({ parting }: { parting: boolean }) {
  const draw = useMotionValue(0);

  useEffect(() => {
    const controls = animate(draw, 1, drawTransition);
    return () => controls.stop();
  }, [draw]);

  const panel = "absolute inset-y-0 w-1/2 overflow-hidden bg-bg-0 will-change-transform";
  const inner = "absolute inset-y-0 flex w-screen items-center justify-center";
  const edge = "absolute inset-y-0 w-px bg-white/[0.12] transition-opacity duration-500";

  return (
    <div aria-hidden className="intro-curtain pointer-events-none fixed inset-0 z-[55] motion-reduce:hidden">
      <motion.div
        className={`${panel} left-0`}
        initial={{ x: 0, opacity: 0 }}
        animate={{ x: parting ? "-100%" : 0, opacity: 1 }}
        transition={{ x: partSpring, opacity: { duration: 0.2, ease: "easeOut" } }}
      >
        <div className={`${inner} left-0`}>
          <Monogram draw={draw} />
        </div>
        <span className={`${edge} right-0`} style={{ opacity: parting ? 1 : 0 }} />
      </motion.div>

      <motion.div
        className={`${panel} right-0`}
        initial={{ x: 0, opacity: 0 }}
        animate={{ x: parting ? "100%" : 0, opacity: 1 }}
        transition={{ x: partSpring, opacity: { duration: 0.2, ease: "easeOut" } }}
      >
        <div className={`${inner} right-0`}>
          <Monogram draw={draw} />
        </div>
        <span className={`${edge} left-0`} style={{ opacity: parting ? 1 : 0 }} />
      </motion.div>
    </div>
  );
}
