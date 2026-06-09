"use client";

import Link from "next/link";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useState } from "react";
import { spring } from "@/lib/motion";

const links = [
  { label: "QuantLab", href: "/quantlab" },
  { label: "About", href: "/#about" },
  { label: "GitHub", href: "https://github.com/Dexterity-PA" },
];

export default function Nav() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 8);
    if (reduce) return;
    setHidden(y > prev && y > 120);
  });

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-40 h-14 bg-glass backdrop-blur-[20px]"
      initial={{ y: 0 }}
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={spring}
    >
      <nav className="mx-auto flex h-full max-w-content items-center justify-between px-6">
        <Link
          href="/"
          className="font-mono text-12 uppercase tracking-label text-text-1"
        >
          Praneeth Annapureddy
        </Link>
        <div className="flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="font-mono text-12 uppercase tracking-label text-text-3 transition-colors hover:text-text-1"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border-hover"
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled ? 1 : 0 }}
        transition={spring}
      />
    </motion.header>
  );
}
