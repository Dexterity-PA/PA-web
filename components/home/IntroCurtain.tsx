"use client";

import { animate, motion, useMotionValue } from "motion/react";
import type { MotionValue } from "motion/react";
import { useEffect } from "react";

// Beat 1 (monogram) → Beat 2 (part), controlled by the orchestrator. The intro
// opens here: two solid black panels carry a split "PA" monogram whose strokes
// draw in (figureDraw) over ~900ms on the black, hold a beat, then — when
// `parting` flips true — slide out, P on the left, A on the right, revealing the
// backdrop arriving behind.

// "PA" as single-stroke letterforms, viewBox 0 0 120 64. The gap between P and A
// straddles the viewBox center (x=60) so a split down the middle parts the
// monogram cleanly: each panel clips a full-viewport-centered copy.
const MONO_P = "M12 60 L12 4 L38 4 Q50 4 50 17 Q50 30 38 30 L12 30";
const MONO_A = "M70 60 L90 4 L110 60 M77 41 L103 41";

// Slow, monotonic stroke draw — figureDraw feel, no overshoot.
const drawTransition = { type: "spring", duration: 0.9, bounce: 0 } as const;
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
