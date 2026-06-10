"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
import { lenisLerp } from "@/lib/motion";

let instance: Lenis | null = null;
const subs = new Set<(lenis: Lenis) => void>();

export function onLenis(cb: (lenis: Lenis) => void) {
  subs.add(cb);
  if (instance) cb(instance);
  return () => {
    subs.delete(cb);
  };
}

export default function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: lenisLerp, anchors: true });
    instance = lenis;
    subs.forEach((cb) => cb(lenis));
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      instance = null;
    };
  }, []);
  return children;
}
