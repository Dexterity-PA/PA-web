"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion, useScroll } from "motion/react";
import SectionHeader from "@/components/ui/SectionHeader";
import JourneyStatic from "./JourneyStatic";

const JourneyGlobe = dynamic(() => import("./JourneyGlobe"), { ssr: false });

export default function JourneySection() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const [near, setNear] = useState(false);
  // Optimistic: render the globe, fall back to the static frame only if the
  // browser can't give us a WebGL context (the globe reports it).
  const [supported, setSupported] = useState(true);
  const [ready, setReady] = useState(false);

  // Lazy-mount the globe chunk once the section is within ~1 viewport.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onUnsupported = useCallback(() => setSupported(false), []);
  const onReady = useCallback(() => setReady(true), []);

  const immersive = !reduce && supported;

  return (
    <section id="journey" className="section-pad">
      <div className="mb-14 md:mb-20">
        <SectionHeader
          index={0.2}
          lead="From Nuzvid"
          rest="to Chandler."
          support="Four homes since 2009, from a town in southern India to a suburb of Phoenix."
        />
      </div>

      {immersive ? (
        <div ref={containerRef} className="relative h-[300vh]">
          <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-0 mx-auto flex max-w-content items-center justify-center px-6 transition-opacity duration-700"
              style={{ opacity: ready ? 0 : 0.5 }}
            >
              <JourneyStatic className="max-h-[80vh]" />
            </div>
            {near && (
              <JourneyGlobe
                progress={scrollYProgress}
                onUnsupported={onUnsupported}
                onReady={onReady}
                className="h-[86vh] w-full"
              />
            )}
          </div>
        </div>
      ) : (
        <div className="relative mx-auto h-[64vh] max-w-3xl">
          <JourneyStatic />
        </div>
      )}
    </section>
  );
}
