"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { armIntro, introSignal } from "./introBus";
import IntroCurtain from "./IntroCurtain";
import IntroTyping from "./IntroTyping";

// The cinematic first-visit intro, in one orchestrator. Owns the master clock and
// the cross-component signals (introSignal) the backdrop shader and atmosphere
// globe follow. The server-rendered hero (#hero-rest) stays painted — and so
// keeps its early LCP — until PART, when it is hidden under the still-closed
// curtain; the intro then carries the foreground until the handoff at DONE.

const DRAW = 0; // monogram strokes draw in on black, then hold
const PART = 1; // panels part; globe arrives, field blooms
const TYPING = 2; // headline types over the revealed backdrop, then settles
const DONE = 3;
type Phase = 0 | 1 | 2 | 3;

const DRAW_MS = 1200; // ~900ms figureDraw + ~300ms hold
const PART_MS = 880; // part begins → typing mounts (curtain still sliding out)

const revealEase = [0.22, 1, 0.36, 1] as const;

export default function HeroIntro() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(DRAW);
  const anims = useRef<{ stop: () => void }[]>([]);
  const skippedRef = useRef(false);

  const drive = (
    from: number,
    to: number,
    duration: number,
    onUpdate: (v: number) => void,
    ease: typeof revealEase | "easeOut" = "easeOut",
  ) => {
    const c = animate(from, to, { duration, ease, onUpdate });
    anims.current.push(c);
    return c;
  };

  // Snap to the resting hero from any beat: stop the run, settle the signals,
  // reveal the server foreground. Used by SKIP (click / any key).
  const skip = () => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    anims.current.forEach((c) => c.stop());
    anims.current = [];
    introSignal.reveal = 1;
    introSignal.bloom = 1;
    try {
      sessionStorage.setItem("intro-seen", "1");
    } catch {}
    document.documentElement.removeAttribute("data-intro-running");
    setPhase(DONE);
  };

  useEffect(() => {
    const html = document.documentElement;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const cleanup = () => {
      timers.forEach(clearTimeout);
      anims.current.forEach((c) => c.stop());
      anims.current = [];
    };

    const willSkip =
      !!reduce ||
      html.hasAttribute("data-intro-skip") ||
      (() => {
        try {
          return sessionStorage.getItem("intro-seen") === "1";
        } catch {
          return false;
        }
      })();

    if (willSkip) {
      at(0, () => setPhase(DONE));
      return cleanup;
    }

    try {
      sessionStorage.setItem("intro-seen", "1");
    } catch {}
    armIntro();

    at(DRAW_MS, () => {
      // Hide the (still-covered) server foreground a frame before the panels move,
      // then part: the globe arrives and the field blooms as the seam opens.
      html.setAttribute("data-intro-running", "");
      setPhase(PART);
      drive(0, 1, 1.05, (v) => (introSignal.reveal = v), revealEase);
      drive(0, 0.82, 1.3, (v) => (introSignal.bloom = v));
    });
    at(DRAW_MS + PART_MS, () => setPhase(TYPING));

    const onKey = () => skip();
    window.addEventListener("keydown", onKey);

    return () => {
      cleanup();
      window.removeEventListener("keydown", onKey);
    };
  }, [reduce]);

  if (phase === DONE) return null;

  return (
    <>
      {(phase === DRAW || phase === PART) && <IntroCurtain parting={phase === PART} />}

      {phase === TYPING && (
        <IntroTyping
          onSettleStart={() =>
            drive(introSignal.bloom, 1, 0.9, (v) => (introSignal.bloom = v))
          }
          onComplete={() => {
            document.documentElement.removeAttribute("data-intro-running");
            setPhase(DONE);
          }}
        />
      )}

      {phase < TYPING && (
        // Catch a click anywhere, plus the visible mono SKIP affordance.
        <div className="intro-skip fixed inset-0 z-[60] motion-reduce:hidden">
          <button
            type="button"
            onClick={skip}
            aria-label="Skip intro"
            className="pointer-events-auto absolute inset-0 h-full w-full cursor-default bg-transparent"
          />
          <span className="pointer-events-none absolute bottom-7 right-7 font-mono text-12 uppercase tracking-label text-text-3">
            Skip
          </span>
        </div>
      )}
    </>
  );
}
