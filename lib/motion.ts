import { useEffect, useSyncExternalStore } from "react";
import type { RefObject } from "react";
import {
  animate,
  useMotionValue,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";

export const spring = { type: "spring", stiffness: 260, damping: 28, mass: 1 } as const;
export const springSnappy = { type: "spring", stiffness: 400, damping: 30 } as const;
export const springOut = { type: "spring", stiffness: 170, damping: 26 } as const;
export const stagger = 0.06;
export const lenisLerp = 0.1;

export const magnetSpring = { stiffness: 400, damping: 30, mass: 1 } as const;
export const tiltSpring = { stiffness: 260, damping: 28, mass: 1 } as const;

// ── narrative primitives ──────────────────────────────────────────────
// Slow, overdamped draw for strokes and rules — monotonic, no overshoot.
export const springDraw = { type: "spring", stiffness: 80, damping: 22, mass: 1 } as const;
// Soft count for the mono section index.
export const indexCount = { type: "spring", stiffness: 120, damping: 20 } as const;

export const wordStagger = 0.045;
export const continuationDelay = 0.12;

// Reduced-motion settle: snap to the end state with no animation. Variants below
// take a `reduce` custom value so SSR always renders the static `hidden` state
// (no hydration mismatch) while reduced-motion clients settle instantly post-mount.
export const instant = { duration: 0 } as const;

// Two-tone headline: lead group springs in per-word, continuation group
// follows 120ms later. blur 6px → 0, y 14 → 0. springs only.
export const sectionReveal: {
  container: Variants;
  lead: Variants;
  continuation: Variants;
  word: Variants;
} = {
  container: { hidden: {}, show: {} },
  lead: { hidden: {}, show: (r: boolean) => ({ transition: { staggerChildren: r ? 0 : wordStagger } }) },
  continuation: {
    hidden: {},
    show: (r: boolean) => ({
      transition: { delayChildren: r ? 0 : continuationDelay, staggerChildren: r ? 0 : wordStagger },
    }),
  },
  word: {
    hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
    show: (r: boolean) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: r ? instant : spring }),
  },
};

// Figure frame fades in and staggers the stroke draw-ins of its children.
export const figureFrame: Variants = {
  hidden: { opacity: 0 },
  show: (r: boolean) => ({
    opacity: 1,
    transition: r ? instant : { ...spring, delayChildren: 0.05, staggerChildren: 0.08 },
  }),
};

// SVG stroke draw-in (strokeDashoffset via pathLength) tied to viewport enter.
export const figureDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (r: boolean) => ({
    pathLength: 1,
    opacity: 1,
    transition: r ? instant : { pathLength: springDraw, opacity: { duration: 0.2 } },
  }),
};

export const formatIndex = (n: number) => n.toFixed(1);

// Mono section index that ticks up from 0.0 to target on enter.
export function useIndexCount(target: number, play: boolean, reduce: boolean): MotionValue<string> {
  // Always start at 0 so SSR and first client render agree (no hydration mismatch);
  // the effect settles to target — instant under reduced motion, a count otherwise.
  const value = useMotionValue(0);
  const text = useTransform(value, formatIndex);
  useEffect(() => {
    if (reduce) {
      value.set(target);
      return;
    }
    if (!play) return;
    const controls = animate(value, target, indexCount);
    return () => controls.stop();
  }, [play, reduce, target, value]);
  return text;
}

// False on the server and the first client render, true thereafter — the SSR-safe
// way to defer client-only state without a setState-in-effect cascade.
const subscribeNoop = () => () => {};
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

// Subtle scroll-driven translateY for figures. Transform only, |y| ≤ distance/2.
// Returns a flat 0 on the server and the first client render so the SSR transform
// matches in both motion modes (no hydration mismatch); the drift attaches after
// mount for motion users only. Figures sit below the fold, so the handoff is unseen.
export function useParallaxDrift(
  ref: RefObject<HTMLElement | null>,
  distance = 40,
  reduce = false,
): MotionValue<number> | number {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance / 2, -distance / 2]);
  const hydrated = useHydrated();
  return reduce || !hydrated ? 0 : y;
}
