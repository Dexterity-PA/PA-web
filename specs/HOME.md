# HOME.md — Homepage Spec (/)

Homepage is about Praneeth. QuantLab is the featured showpiece. Content will grow later; for now only QuantLab is listed under work.

## 1. Nav

- Fixed, glass, 56px tall.
- Left: "PRANEETH ANNAPUREDDY" (or "PA") mono wordmark.
- Right: QuantLab, About, GitHub.
- Border-bottom fades in on scroll. Hides on scroll-down, springs back on scroll-up.

## 2. Hero — identity intro

One-time intro sequence (~2.5s total), session-stored so it replays only on hard refresh / new session. `prefers-reduced-motion` or replay → jump straight to resting state.

Sequence:
1. Black screen (bg-0), grain only. Blinking mono cursor top-left, terminal-style.
2. Words spring in one at a time, centered, 90px display:
   "Genius." → "Billionaire." → "Philanthropist."
   400ms apart, each lands with spring overshoot (snappy spring).
3. Beat (~400ms). "Billionaire" gets struck through (line draws left→right, ~250ms) and a small mono accent annotation springs in above it: `pending`
4. Line collapses upward into resting position. Sub-line fades in below:
   "Praneeth Annapureddy. I build quantitative models, companies, and tools for people locked out of the systems that could help them."
5. Mesh gradient blooms in behind. Nav fades in. Ticker teaser starts.

Resting state (permanent):
- Headline with struck-through "Billionaire" + `pending` annotation stays. This is the screenshot.
- Faint mono BTC-USDT ticker strip near the bottom edge as a QuantLab teaser (throttled Binance websocket; static sample data fallback).
- No point-process viz here — it is saved for /quantlab.

## 3. Featured: QuantLab (the wow moment)

- Large card, full content width, links to /quantlab.
- Inside: a live MINI version of the point-process visualization (see HERO.md, mobile-tier settings: 30Hz paths, no smear, no cursor layer).
- Mono label: "FEATURED / QUANTLAB". Title + one-liner: bivariate Hawkes modeling of BTC-USDT order flow.
- One accent stat (e.g. fitted branching ratio) + "Explore →" magnetic CTA.
- Card has cursor-aware border warm + slight tilt.
- Sim pauses when card is off-screen (IntersectionObserver).

## 4. Other work

- Placeholder section, hidden for v1. Grid of compact cards added later (WEI, Strata, Keldra, BidBoard, BEACON, publications).

## 5. About / contact + footer

- Short centered column: 2-3 sentences, links (GitHub, email, LinkedIn).
- Footer: thin mono line, copyright, built-with note.

## Route map

```
/            home (this spec)
/quantlab    full QuantLab feature site (QUANTLAB.md + HERO.md)
```
