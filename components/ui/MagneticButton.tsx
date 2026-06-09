"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { magnetSpring, springOut, springSnappy } from "@/lib/motion";

type Variant = "solid" | "ghost";

type Props = {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  strength?: number;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 font-mono text-12 uppercase tracking-label";
const styles: Record<Variant, string> = {
  solid: "bg-accent text-bg-0",
  ghost: "border border-border text-text-1 transition-colors hover:border-border-hover",
};

export default function MagneticButton({
  children,
  href,
  variant = "solid",
  strength = 0.4,
  className = "",
  onClick,
  ariaLabel,
}: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, magnetSpring);
  const y = useSpring(my, magnetSpring);

  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * strength);
    my.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  const cls = `${base} ${styles[variant]} ${className}`;
  const internal = href?.startsWith("/") || href?.startsWith("#");
  const inner = !href ? (
    <button type="button" className={cls} aria-label={ariaLabel} onClick={onClick}>
      {children}
    </button>
  ) : internal ? (
    <Link href={href} className={cls} aria-label={ariaLabel} onClick={onClick}>
      {children}
    </Link>
  ) : (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cls}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </a>
  );

  return (
    <motion.span
      ref={ref}
      tabIndex={-1}
      className="inline-flex"
      style={{ x, y }}
      onPointerMove={reduce ? undefined : onMove}
      onPointerLeave={reduce ? undefined : reset}
      whileHover={reduce ? undefined : { scale: 1.04, transition: springSnappy }}
      whileTap={reduce ? undefined : { scale: 0.96, transition: springSnappy }}
      transition={springOut}
    >
      {inner}
    </motion.span>
  );
}
