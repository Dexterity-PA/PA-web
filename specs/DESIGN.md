# DESIGN.md — Tokens & Craft Rules

Personal site for Praneeth Annapureddy. QuantLab is the flagship feature.
Benchmarks: Linear (design system, restraint, single-accent discipline), Mercury (animation quality, spring physics, material gradients).
Thesis: the site should feel like the model itself — precise, reactive, alive. Flashiness comes from motion quality and the living visualizations, never from color or clutter.

## Color

```
--bg-0:      #050607                      page
--bg-1:      #0a0c0e                      raised
--bg-2:      #101316                      cards
--border:    rgba(255,255,255,0.08)       hover: 0.14
--text-1:    #f2f3f4                      headlines
--text-2:    #9ba1a6                      body
--text-3:    #5c6166                      captions, mono labels
--accent:    #4ade80                      phosphor green — buys, CTAs, key data
--accent-dim: rgba(74,222,128,0.12)       glows, fills
--sell:      #f87171                      viz-only, never UI chrome
```

Rules:
- Accent appears max ~5 places per viewport.
- Sell red exists only inside visualizations so the buy/sell duality reads instantly.
- Mostly grayscale; the accent must earn attention.

## Type

```
Display: sharp grotesk (Söhne-class; free: Geist or Inter Display)
Mono:    all numbers, labels, math annotations (Geist Mono or Berkeley Mono-class)

Scale (ratio 1.333): 12 / 16 / 21 / 28 / 38 / 50 / 67 / 90
Headlines:   tracking -0.03em, weight 550-600
Body:        16px / 1.65 line-height, tracking 0
Mono labels: 12px, uppercase, tracking +0.08em
```

No arbitrary sizes outside the scale.

## Spacing

- 4px base unit.
- Section padding: 160px desktop / 96px mobile.
- Max content width 1120px; visualizations may go full-bleed.

## Motion

```
Spring default:      stiffness 260, damping 28, mass 1
Spring snappy (in):  stiffness 400, damping 30
Hover out:           stiffness 170, damping 26  (~300ms decay feel)
Stagger:             60ms per element (40-80ms range)
Lenis:               lerp 0.1
Reveal:              opacity 0→1, translateY 24px→0, springs only
```

Rules:
- Spring physics everywhere. Never fixed-duration easings for reveals/interactions.
- Animate only `transform` and `opacity`. Never layout properties.
- Asymmetric hover: snappy in (~150ms feel), slow out (~300ms feel).
- Lenis smooth scroll site-wide.

## Surfaces / material depth

```
Card:  bg-2, 1px border (--border), radius 12px,
       inset 0 1px 0 rgba(255,255,255,0.06)  (top-edge light)
Glass: backdrop-filter: blur(20px), bg rgba(10,12,14,0.6) — over real content only
Grain: SVG noise overlay, 4% opacity, fixed, full-site
Mesh:  2-3 radial gradients (accent-dim + deep blue-gray), 30s loop, opacity ~0.15
```

- 1px borders at white 8-12% opacity, never solid gray.
- Glass must sit over actual moving content, not flat fills.

## Micro-interactions

- Magnetic buttons (shift toward cursor, spring back).
- Cursor-aware card border warm / subtle tilt.
- Designed focus states (accent ring, 2px offset) — never default outlines.

## Performance (a design feature)

- Locked 60fps, 120 where possible.
- Lazy-load everything below the fold.
- Surgical `will-change`; remove after animation.
- Zero main-thread jank during scroll. Sims in workers.
- `prefers-reduced-motion`: skip intros, static viz frames, instant reveals.
