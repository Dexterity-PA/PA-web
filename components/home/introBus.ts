// Cross-component channel for the first-visit cinematic intro. The orchestrator
// (HeroIntro) owns the timeline and writes these signals; the backdrop shader and
// the atmosphere globe read them every frame to bloom/arrive in lockstep with the
// curtain. A plain mutable object — no React state, no per-frame allocation, no
// re-renders — so reads stay free inside rAF/WebGL loops.
//
// reveal: 0→1 over Beat 3 (curtain part). Drives the globe arrival (camera zoom,
//         line + container opacity).
// bloom:  0→1 from Beat 3 into the settle. Drives the shader field up from black.
// Both rest at 1, so any reader that mounts late — or keeps reading after the
// orchestrator unmounts — sees the resting state.
export const introSignal = { reveal: 1, bloom: 1 };

// True only on a genuine first-visit run. The data-intro-skip attribute is set
// pre-paint (reduced-motion or repeat visit) by the inline script in HomeHero,
// before any component hydrates — so this read is deterministic and race-free.
// Readers call it once on mount to decide: arrive (start dark, follow signals) or
// rest (snap to full immediately).
export function introActive(): boolean {
  if (typeof document === "undefined") return false;
  return !document.documentElement.hasAttribute("data-intro-skip");
}

// Arm the signals for a run: globe distant, field black. Called by the
// orchestrator before it drives them back up. Idempotent.
export function armIntro() {
  introSignal.reveal = 0;
  introSignal.bloom = 0;
}
