"use client";

import { motion, useReducedMotion } from "motion/react";
import { Fragment, useEffect, useState } from "react";
import { spring } from "@/lib/motion";
import { onReveal } from "./introBus";
import PendingMark from "./PendingMark";
import {
  HERO_LABEL,
  HERO_SENTENCE,
  HERO_WORDS,
  SHOVE,
  h1Class,
  labelClass,
  pendingClass,
  sentenceClass,
  strikeClass,
} from "./heroCopy";

const TYPING = 0;
const BEAT = 1;
const STRIKE = 2;
const REST = 3;
const FADE = 4;
const DONE = 5;

const CH = 55;
const JITTER = 15;
const PAUSE = 350;
const strikeSpring = { type: "spring", stiffness: 460, damping: 18, mass: 1 } as const;
const sentenceWords = HERO_SENTENCE.split(" ");

function Cursor() {
  return (
    <motion.span
      aria-hidden
      className="ml-[0.06em] inline-block h-[1em] w-[0.5ch] bg-accent align-baseline"
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: "linear" }}
    />
  );
}

export default function IntroOverlay() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(TYPING);
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    const skip =
      !!reduce ||
      document.documentElement.hasAttribute("data-intro-skip") ||
      sessionStorage.getItem("intro-seen") === "1";

    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    if (skip) {
      at(0, () => setPhase(DONE));
      return () => timers.forEach(clearTimeout);
    }

    // Hold at the resting first frame until the curtain begins to clear, then
    // type. onReveal fires immediately if the curtain has already parted.
    const begin = () => {
      sessionStorage.setItem("intro-seen", "1");
      let clock = 0;
      HERO_WORDS.forEach((w, li) => {
        at(clock, () => {
          setLine(li);
          setChars(0);
        });
        for (let c = 1; c <= w.length; c++) {
          clock += CH + (Math.random() * 2 - 1) * JITTER;
          const cc = c;
          at(clock, () => setChars(cc));
        }
        clock += PAUSE;
      });
      at(clock, () => setPhase(BEAT));
      clock += 400;
      at(clock, () => setPhase(STRIKE));
      clock += 480;
      at(clock, () => setPhase(REST));
      clock += 560;
      at(clock, () => setPhase(FADE));
      clock += 560;
      at(clock, () => setPhase(DONE));
    };

    const unsub = onReveal(begin);
    return () => {
      unsub();
      timers.forEach(clearTimeout);
    };
  }, [reduce]);

  if (phase === DONE) return null;

  const typing = phase === TYPING;
  const struck = phase >= STRIKE;
  const rested = phase >= REST;
  const fading = phase >= FADE;
  const revealed = (li: number) =>
    li < line ? HERO_WORDS[li].length : li === line ? chars : 0;

  const renderLine = (w: string, li: number) => {
    const rev = revealed(li);
    const active = typing && li === line;
    return (
      <span className="relative inline-block">
        {[...w].map((ch, i) => (
          <Fragment key={i}>
            {active && i === rev && <Cursor />}
            <span style={{ opacity: i < rev ? 1 : 0 }}>{ch}</span>
          </Fragment>
        ))}
        {active && rev === w.length && <Cursor />}
      </span>
    );
  };

  return (
    <motion.div
      aria-hidden
      className="intro-overlay fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-bg-0 px-6 motion-reduce:hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className="flex flex-col items-center text-center">
        <span className={labelClass}>{HERO_LABEL}</span>

        <h1 className={h1Class}>
          <span className="block">{renderLine(HERO_WORDS[0], 0)}</span>

          <span className="relative block">
            <motion.span
              className="block"
              initial={{ y: 0 }}
              animate={{ y: struck ? SHOVE : 0 }}
              transition={spring}
            >
              {renderLine(HERO_WORDS[1], 1)}
            </motion.span>

            <motion.span
              aria-hidden
              className={strikeClass}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: struck ? 1 : 0 }}
              transition={strikeSpring}
            />

            <motion.span
              aria-hidden
              className={pendingClass}
              style={{ transformOrigin: "bottom left" }}
              initial={{ opacity: 0, scale: 0.82, x: "20%", y: "-108%", rotate: -3 }}
              animate={
                struck
                  ? { opacity: 1, scale: 1, x: "20%", y: "-116%", rotate: -3 }
                  : { opacity: 0, scale: 0.82, x: "20%", y: "-108%", rotate: -3 }
              }
              transition={{ ...spring, delay: 0.16 }}
            >
              <PendingMark />
            </motion.span>
          </span>

          <span className="block">{renderLine(HERO_WORDS[2], 2)}</span>
        </h1>

        <p className={sentenceClass}>
          <motion.span
            initial="hidden"
            animate={rested ? "show" : "hidden"}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
          >
            {sentenceWords.map((wd, i) => (
              <Fragment key={i}>
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
                    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: spring },
                  }}
                >
                  {wd}
                </motion.span>{" "}
              </Fragment>
            ))}
          </motion.span>
        </p>
      </div>
    </motion.div>
  );
}
