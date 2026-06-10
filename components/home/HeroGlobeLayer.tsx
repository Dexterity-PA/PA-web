"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const HeroGlobe = dynamic(() => import("./HeroGlobe"), { ssr: false });

// Atmosphere globe behind the headline: a large wireframe whose center sits off
// the lower-right of the viewport, so only the upper-left of the sphere reads.
export default function HeroGlobeLayer() {
  const reduce = useReducedMotion();
  const [mount, setMount] = useState(false);
  const [ready, setReady] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  // Defer the three.js chunk to idle: it must never compete with the
  // server-rendered headline for LCP. The globe can arrive a beat late.
  useEffect(() => {
    let handle = 0;
    const run = () => setMount(true);
    const ric = window.requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    const cancel = window.cancelIdleCallback as ((h: number) => void) | undefined;
    if (ric) handle = ric(run, { timeout: 1500 });
    else handle = window.setTimeout(run, 400);
    return () => {
      if (ric && cancel) cancel(handle);
      else window.clearTimeout(handle);
    };
  }, []);

  // WebGL unsupported → omit entirely; the shader backdrop already fills behind.
  if (unsupported) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      <div
        className="absolute aspect-square transition-opacity duration-1000 ease-out motion-reduce:transition-none"
        style={{
          width: "140vh",
          left: "80%",
          top: "85%",
          transform: "translate(-50%, -50%)",
          opacity: ready ? 1 : 0,
        }}
      >
        {mount && (
          <HeroGlobe
            reduce={!!reduce}
            onReady={() => setReady(true)}
            onUnsupported={() => setUnsupported(true)}
          />
        )}
      </div>
    </div>
  );
}
