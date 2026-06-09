"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { tiltSpring } from "@/lib/motion";

type Props = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  tiltMax?: number;
  glow?: boolean;
};

const surface = "relative overflow-hidden rounded-card bg-bg-2 shadow-edge";

export default function Card({
  children,
  className = "",
  interactive = true,
  tiltMax = 6,
  glow = true,
}: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);

  const rotateX = useSpring(useTransform(py, [0, 1], [tiltMax, -tiltMax]), tiltSpring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-tiltMax, tiltMax]), tiltSpring);
  const borderAlpha = useSpring(useTransform(hover, [0, 1], [0.08, 0.14]), tiltSpring);
  const borderColor = useMotionTemplate`rgba(255,255,255,${borderAlpha})`;
  const glowOpacity = useSpring(hover, tiltSpring);
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const glowBg = useMotionTemplate`radial-gradient(420px circle at ${gx} ${gy}, var(--accent-dim), transparent 60%)`;

  if (!interactive) {
    return <div className={`${surface} border border-border ${className}`}>{children}</div>;
  }

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    hover.set(0);
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      className={`${surface} border ${className}`}
      style={{ rotateX, rotateY, borderColor, transformPerspective: 900 }}
      onPointerMove={reduce ? undefined : onMove}
      onPointerEnter={reduce ? undefined : () => hover.set(1)}
      onPointerLeave={reduce ? undefined : onLeave}
    >
      {glow && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: glowBg, opacity: glowOpacity }}
        />
      )}
      <div className="relative">{children}</div>
    </motion.div>
  );
}
