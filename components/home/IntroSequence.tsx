"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { spring, springSnappy } from "@/lib/motion";
import Ticker from "./Ticker";

const BOOT = 1;
const STRIKE = 5;
const REST = 6;
const FADED = 7;

const noscriptCss =
  ".intro-overlay{display:none}.intro-gate{opacity:1!important;transform:none!important}";

function Word({
  visible,
  instant,
  children,
}: {
  visible: boolean;
  instant: boolean;
  children: ReactNode;
}) {
  return (
    <motion.span
      className="intro-gate block"
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={instant ? { duration: 0 } : springSnappy}
    >
      {children}
    </motion.span>
  );
}

export default function IntroSequence() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) =>
      timers.push(window.setTimeout(fn, ms));
    const prm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || prm || sessionStorage.getItem("intro-seen") === "1") {
      at(0, () => {
        setSkipped(true);
        setStep(FADED);
      });
    } else {
      at(0, () => {
        sessionStorage.setItem("intro-seen", "1");
        setStep(BOOT);
      });
      at(600, () => setStep(2));
      at(1000, () => setStep(3));
      at(1400, () => setStep(4));
      at(1800, () => setStep(STRIKE));
      at(2350, () => setStep(REST));
      at(3100, () => setStep(FADED));
    }
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  const instant = skipped || !!reduce;

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6">
      <noscript>
        <style>{noscriptCss}</style>
      </noscript>
      {step < FADED && (
        <motion.div
          aria-hidden
          className="intro-overlay pointer-events-none fixed inset-0 z-50 bg-bg-0 motion-reduce:hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: step >= REST ? 0 : 1 }}
          transition={instant ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
        />
      )}
      {!instant && step >= BOOT && step < REST && (
        <motion.span
          aria-hidden
          className="fixed left-6 top-6 z-[51] h-7 w-3 bg-accent"
          initial={{ opacity: 0 }}
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{
            duration: 1.1,
            times: [0, 0.5, 0.5, 1],
            repeat: Infinity,
          }}
        />
      )}
      <motion.div
        className={`relative text-center ${step < FADED ? "z-[51]" : ""}`}
        initial={{ y: "6vh" }}
        animate={{ y: step >= REST ? "0vh" : "6vh" }}
        transition={instant ? { duration: 0 } : spring}
      >
        <h1 className="flex flex-col items-center gap-[0.18em] text-50 font-semibold tracking-head text-text-1 sm:text-67 lg:text-90">
          <Word visible={step >= 2} instant={instant}>
            Genius.
          </Word>
          <span className="relative">
            <Word visible={step >= 3} instant={instant}>
              <s className="no-underline">Billionaire.</s>
            </Word>
            <motion.span
              aria-hidden
              className="intro-gate absolute -inset-x-[0.06em] top-[0.44em] h-[0.045em] origin-left rounded-full bg-text-1"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: step >= STRIKE ? 1 : 0 }}
              transition={
                instant ? { duration: 0 } : { duration: 0.25, ease: "easeInOut" }
              }
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-full flex justify-center pb-[0.06em]">
              <motion.span
                aria-hidden
                className="intro-gate font-mono text-12 tracking-label text-accent"
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={step >= STRIKE ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={
                  instant ? { duration: 0 } : { ...springSnappy, delay: 0.2 }
                }
              >
                pending
              </motion.span>
            </span>
          </span>
          <Word visible={step >= 4} instant={instant}>
            Philanthropist.
          </Word>
        </h1>
        <motion.p
          className="intro-gate mx-auto mt-8 max-w-xl text-16 text-text-2 sm:text-21"
          initial={{ opacity: 0, y: 16 }}
          animate={step >= REST ? { opacity: 1, y: 0 } : {}}
          transition={instant ? { duration: 0 } : { ...spring, delay: 0.15 }}
        >
          Praneeth Annapureddy. I build quantitative models, companies, and
          tools for people locked out of the systems that could help them.
        </motion.p>
      </motion.div>
      <motion.div
        className="intro-gate absolute inset-x-0 bottom-8"
        initial={{ opacity: 0 }}
        animate={step >= REST ? { opacity: 1 } : {}}
        transition={instant ? { duration: 0 } : { ...spring, delay: 0.3 }}
      >
        <Ticker active={step >= REST} />
      </motion.div>
    </section>
  );
}
