# HERO.md — Living Point Process Visualization

Signature viz. Full version = /quantlab hero. Mini version = homepage featured card (mobile-tier settings).

## Simulation

- Bivariate exponential Hawkes, Ogata thinning, in a Web Worker.
- Placeholder params at plausible fitted scale until Phase 2 numbers swapped in:
  - μ ≈ 0.3–0.5 events/s per side
  - branching ratio ~0.6–0.7
  - β giving ~1–3s kernel half-lives
- Sim runs ~2s ahead of render time so the stream never starves.
- Stability clamp: if total intensity exceeds a cap, temper μ briefly. No runaway feel.

## Render

Single `<canvas>`, 2D context, devicePixelRatio-aware.

- Layout: time axis at vertical center; window = last 20s; streams left at fixed px/s.
- Events: 2px ticks. Buys up (accent), sells down (sell red). Height ∝ soft random mark. Spawn: scale 0→1 spring + brief accent glow fading over 300ms.
- Intensity paths: λ⁺ above axis (accent, 1.5px), λ⁻ mirrored below (sell red). Area fill at 8% opacity. Computed from kernel sums, sampled at 60Hz, drawn as one polyline per side.
- Cross-excitation cue: when a burst on one side lifts the opposite λ by more than a threshold, draw a faint 1px arc linking the triggering cluster to the opposite path. Rare and subtle — the detail designers screenshot.
- Trail fade: 12% bg-0 overlay per frame for slight motion smear.

## Cursor as participant

- Cursor over canvas = exogenous intensity bump centered at cursor x-time, decaying with the same β.
- Click injects an event cluster.
- No tooltip; discoverable.

## Glass overlay (/quantlab only)

- Left 45%, blur(20px), bg rgba(10,12,14,0.6).
- Pointer-events pass through except CTAs.
- λ readout bottom-left: `λ+ 1.42  λ− 0.97  n 3,184`, mono 12px, updates ≤10Hz.

## Performance budget

- Worker sim + main-thread draw only. Zero DOM mutation per frame.
- Single rAF loop. Paths as Float32Array ring buffers. No per-frame allocation.
- Pause sim when tab hidden or viz scrolled out (IntersectionObserver).
- `prefers-reduced-motion`: static pre-rendered frame; events fade in once.
- Mobile / mini-card tier: 30 samples/s paths, no smear, no cursor layer.

## Failure mode

- Canvas or Worker unsupported → static SVG of one pre-baked window. The site never looks broken.
