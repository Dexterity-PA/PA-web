"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { armIntro, introSignal } from "./introBus";
import IntroCascade from "./IntroCascade";
import IntroCurtain from "./IntroCurtain";
import IntroTyping from "./IntroTyping";

// The cinematic first-visit intro, in one orchestrator. Owns the master clock and
// the cross-component signals (introSignal) the backdrop shader and atmosphere
// globe follow. The server-rendered hero (#hero-rest) stays painted — and so
// keeps its early LCP — until PART, when it is hidden under the still-closed
// curtain; the intro then carries the foreground until the handoff at DONE.

const CASCADE = 0;
const CONVERGE = 1;
const SOLIDIFY = 2;
const PART = 3;
const TYPING = 4;
const DONE = 5;
type Phase = 0 | 1 | 2 | 3 | 4 | 5;

const CASCADE_MS = 1850;
const CONVERGE_MS = 820;
const SOLIDIFY_MS = 700;
const PART_MS = 880; // part begins → typing mounts (curtain still sliding out)

const SEED = 0x9e3779b1;
const revealEase = [0.22, 1, 0.36, 1] as const;

export default function HeroIntro() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(CASCADE);
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

    let t = CASCADE_MS;
    at(t, () => setPhase(CONVERGE));
    t += CONVERGE_MS;
    at(t, () => setPhase(SOLIDIFY));
    t += SOLIDIFY_MS;
    at(t, () => {
      // Hide the (still-covered) server foreground a frame before the panels move,
      // then part: the globe arrives and the field blooms as the seam opens.
      html.setAttribute("data-intro-running", "");
      setPhase(PART);
      drive(0, 1, 1.05, (v) => (introSignal.reveal = v), revealEase);
      drive(0, 0.82, 1.3, (v) => (introSignal.bloom = v));
    });
    t += PART_MS;
    at(t, () => setPhase(TYPING));

    const onKey = () => skip();
    window.addEventListener("keydown", onKey);

    return () => {
      cleanup();
      window.removeEventListener("keydown", onKey);
    };
  }, [reduce]);

  if (phase === DONE) return null;

  const cascadeMode =
    phase === CASCADE ? "cascade" : phase === CONVERGE ? "converge" : "fade";

  return (
    <>
      {(phase === CASCADE || phase === CONVERGE || phase === SOLIDIFY) && (
        <IntroCascade seed={SEED} mode={cascadeMode} />
      )}

      {(phase === SOLIDIFY || phase === PART) && (
        <IntroCurtain parting={phase === PART} />
      )}

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
