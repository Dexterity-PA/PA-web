"use client";

import { motion } from "motion/react";
import { Fragment, useEffect, useState } from "react";
import { spring } from "@/lib/motion";
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

// Beat 4 + the settle. Mounts over the revealed backdrop (transparent), types
// the headline, strikes "Billionaire" and lands the pending mark, then settles
// in one continuous motion: cursor fades, the name label and sub-line fade in
// per word, the scroll cue arrives last. Label/sentence/cue keep their layout
// space the whole time (only opacity moves), so the headline never shifts — the
// handoff to the server-rendered h1 at DONE is pixel-identical.

const TYPING = 0;
const BEAT = 1;
const STRIKE = 2;
const SETTLE = 3;
const DONE = 4;

const CH = 55;
const JITTER = 15;
const PAUSE = 350;
const SETTLE_MS = 900;
const strikeSpring = { type: "spring", stiffness: 460, damping: 18, mass: 1 } as const;

const labelWords = HERO_LABEL.split(" ");
const sentenceWords = HERO_SENTENCE.split(" ");

const fadeWord = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: spring },
};

function Cursor({ on }: { on: boolean }) {
  return (
    <motion.span
      aria-hidden
      className="ml-[0.06em] inline-block h-[1em] w-[0.5ch] bg-accent align-baseline"
      animate={on ? { opacity: [1, 1, 0, 0] } : { opacity: 0 }}
      transition={
        on
          ? { duration: 1, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: "linear" }
          : { duration: 0.25, ease: "easeOut" }
      }
    />
  );
}

export default function IntroTyping({
  onSettleStart,
  onComplete,
}: {
  onSettleStart: () => void;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState(TYPING);
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

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
    clock += 380;
    at(clock, () => setPhase(STRIKE));
    clock += 640;
    at(clock, () => {
      setPhase(SETTLE);
      onSettleStart();
    });
    clock += SETTLE_MS;
    at(clock, () => {
      setPhase(DONE);
      onComplete();
    });

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const typing = phase === TYPING;
  const struck = phase >= STRIKE;
  const settling = phase >= SETTLE;
  const lastLine = HERO_WORDS.length - 1;
  const revealed = (li: number) =>
    li < line ? HERO_WORDS[li].length : li === line ? chars : 0;

  const renderLine = (w: string, li: number) => {
    const rev = revealed(li);
    const active = typing && li === line;
    const tail = !settling && li === lastLine && rev === w.length;
    return (
      <span className="relative inline-block">
        {[...w].map((ch, i) => (
          <Fragment key={i}>
            {active && i === rev && <Cursor on />}
            <span style={{ opacity: i < rev ? 1 : 0 }}>{ch}</span>
          </Fragment>
        ))}
        {active && rev === w.length && <Cursor on />}
        {tail && <Cursor on={!settling} />}
      </span>
    );
  };

  return (
    <div
      aria-hidden
      className="intro-typing pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-6 motion-reduce:hidden"
    >
      <div className="flex flex-col items-center text-center">
        <motion.span
          className={labelClass}
          initial="hidden"
          animate={settling ? "show" : "hidden"}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        >
          {labelWords.map((wd, i) => (
            <Fragment key={i}>
              <motion.span className="inline-block" variants={fadeWord}>
                {wd}
              </motion.span>{" "}
            </Fragment>
          ))}
        </motion.span>

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
            animate={settling ? "show" : "hidden"}
            variants={{
              hidden: {},
              show: { transition: { delayChildren: 0.12, staggerChildren: 0.03 } },
            }}
          >
            {sentenceWords.map((wd, i) => (
              <Fragment key={i}>
                <motion.span className="inline-block" variants={fadeWord}>
                  {wd}
                </motion.span>{" "}
              </Fragment>
            ))}
          </motion.span>
        </p>
      </div>

      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-3 text-text-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: settling ? 1 : 0 }}
        transition={{ duration: 0.5, delay: settling ? 0.5 : 0, ease: "easeOut" }}
      >
        <span className="font-mono text-12 uppercase tracking-label">scroll</span>
        <span className="block h-10 w-px animate-pulse bg-border" />
      </motion.div>
    </div>
  );
}
