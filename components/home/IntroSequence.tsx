"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  type Variants,
} from "motion/react";
import { Fragment, useEffect, useState } from "react";
import { spring } from "@/lib/motion";
import HeroLambda from "./HeroLambda";

const CURSOR = 1;
const W0 = 2;
const W1 = 3;
const W2 = 4;
const STRIKE = 5;
const REST = 6;
const DONE = 7;

const strikeSpring = { type: "spring", stiffness: 440, damping: 21, mass: 1 } as const;

const noscriptCss =
  ".intro-overlay{display:none}.intro-gate{opacity:1!important;transform:none!important;filter:none!important}";

const letterV: Variants = {
  hidden: { y: "118%", opacity: 0, filter: "blur(8px)", scale: 1.06 },
  show: { y: "0%", opacity: 1, filter: "blur(0px)", scale: 1, transition: spring },
};

function ClipWord({
  text,
  show,
  instant,
}: {
  text: string;
  show: boolean;
  instant: boolean;
}) {
  return (
    <span className="block overflow-hidden pb-[0.09em]" aria-hidden>
      <motion.span
        className="block"
        initial={instant ? "show" : "hidden"}
        animate={instant || show ? "show" : "hidden"}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: instant ? 0 : 0.03 } },
        }}
      >
        {[...text].map((ch, i) => (
          <motion.span
            key={i}
            className="intro-gate inline-block"
            variants={letterV}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </motion.span>
    </span>
  );
}

function SubWords({ show, instant }: { show: boolean; instant: boolean }) {
  const text =
    "Praneeth Annapureddy. I build quantitative models, companies, and tools for people locked out of the systems that could help them.";
  return (
    <motion.span
      initial={instant ? "show" : "hidden"}
      animate={instant || show ? "show" : "hidden"}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: instant ? 0 : 0.022 } },
      }}
    >
      {text.split(" ").map((w, i) => (
        <Fragment key={i}>
          <motion.span
            className="intro-gate inline-block"
            variants={{
              hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
              show: { opacity: 1, y: 0, filter: "blur(0px)", transition: spring },
            }}
          >
            {w}
          </motion.span>{" "}
        </Fragment>
      ))}
    </motion.span>
  );
}

export default function IntroSequence() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    if (y > 4) setScrolled(true);
  });

  useEffect(() => {
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) =>
      timers.push(window.setTimeout(fn, ms));
    const prm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || prm || sessionStorage.getItem("intro-seen") === "1") {
      setSkipped(true);
      setStep(DONE);
    } else {
      at(0, () => {
        sessionStorage.setItem("intro-seen", "1");
        setStep(CURSOR);
      });
      at(500, () => setStep(W0));
      at(1300, () => setStep(W1));
      at(2100, () => setStep(W2));
      at(3500, () => setStep(STRIKE));
      at(4450, () => setStep(REST));
      at(5350, () => setStep(DONE));
    }
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  const instant = skipped || !!reduce;
  const struck = step >= STRIKE;
  const atRest = step >= REST;

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6">
      <noscript>
        <style>{noscriptCss}</style>
      </noscript>

      {step < DONE && (
        <motion.div
          aria-hidden
          className="intro-overlay pointer-events-none fixed inset-0 z-50 bg-bg-0 motion-reduce:hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: atRest ? 0 : 1 }}
          transition={instant ? { duration: 0 } : { duration: 0.7, ease: "easeOut" }}
        />
      )}

      {!instant && step >= CURSOR && step < STRIKE && (
        <motion.span
          aria-hidden
          className="fixed left-6 top-24 z-[51] h-7 w-2.5 bg-accent sm:top-28"
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1.1, times: [0, 0.5, 0.5, 1], repeat: Infinity }}
        />
      )}

      <HeroLambda className="absolute inset-x-0 top-1/2 z-0 h-[44vh] -translate-y-[60%]" />

      <motion.div
        className={`relative text-center ${step < DONE ? "z-[51]" : "z-10"}`}
        initial={{ y: "4vh" }}
        animate={{ y: atRest ? "0vh" : "4vh" }}
        transition={instant ? { duration: 0 } : spring}
      >
        <h1
          aria-label="Genius. Billionaire. Philanthropist."
          className="flex flex-col items-center gap-[0.16em] text-50 font-semibold tracking-head text-text-1 sm:text-67 lg:text-90"
        >
          <ClipWord text="Genius." show={step >= W0} instant={instant} />

          <span className="relative inline-block">
            <motion.span
              className="block"
              initial={{ y: 0 }}
              animate={{ y: struck ? 4 : 0 }}
              transition={instant ? { duration: 0 } : spring}
            >
              <ClipWord text="Billionaire." show={step >= W1} instant={instant} />
            </motion.span>

            <motion.span
              aria-hidden
              className="intro-gate absolute left-[-0.09em] right-[-0.09em] top-[0.5em] h-[0.05em] origin-left rounded-full bg-text-1"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: struck ? 1 : 0 }}
              transition={instant ? { duration: 0 } : strikeSpring}
            />

            <motion.span
              aria-hidden
              className="intro-gate absolute right-[0.02em] top-0 flex origin-bottom-left -translate-y-[118%] translate-x-[22%] items-end gap-[0.2em] text-21"
              style={{ rotate: -3 }}
              initial={{ opacity: 0, scale: 0.82, y: 8 }}
              animate={struck ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={instant ? { duration: 0 } : { ...spring, delay: 0.18 }}
            >
              <svg
                className="mb-[0.15em] h-[0.85em] w-[0.85em] shrink-0"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M12 2 L4 10 M4 10 L9 10 M4 10 L4 5"
                  stroke="#4ade80"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-mono leading-none text-accent">pending</span>
            </motion.span>
          </span>

          <ClipWord text="Philanthropist." show={step >= W2} instant={instant} />
        </h1>

        <p className="intro-gate mx-auto mt-8 max-w-xl text-balance text-16 text-text-2 sm:text-21">
          <SubWords show={atRest} instant={instant} />
        </p>
      </motion.div>

      <motion.div
        aria-hidden
        className="intro-gate absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: atRest && !scrolled ? 1 : 0 }}
        transition={instant ? { duration: 0 } : { ...spring, delay: 0.5 }}
      >
        <span className="font-mono text-12 uppercase tracking-label text-text-3">
          scroll
        </span>
        <span className="block h-10 w-px overflow-hidden bg-border">
          <motion.span
            className="block h-3 w-px bg-text-2"
            animate={instant ? undefined : { y: [-12, 40] }}
            transition={
              instant
                ? undefined
                : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
            }
          />
        </span>
      </motion.div>
    </section>
  );
}
