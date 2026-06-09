# QUANTLAB.md — /quantlab Section Spec

Full feature page for QuantLab: bivariate buy/sell market-order exponential Hawkes model on Binance BTC-USDT aggTrades. Make the rigor visible (math, validation, tests) and present it beautifully.

## 1. Nav

Shared site nav. On /quantlab, anchors: Model, Math, Results, Validation, Thesis.

## 2. Hero — living point process (100vh, full-bleed)

Full spec in HERO.md. Summary:
- Canvas viz: streaming time axis, buy MOs tick up (accent), sell MOs tick down (sell red).
- Each event spawns a decaying exponential intensity contribution; stacked into mirrored λ⁺(t) / λ⁻(t) paths.
- Cross-excitation visibly links bursts across sides.
- Glass overlay, left 45%: mono label "MARKET MICROSTRUCTURE / POINT PROCESSES" → headline "Order flow, modeled." (90px) → one-line sub → CTAs: solid accent "Read the research", ghost "GitHub".
- Bottom-left live mono readout: `λ+ 1.42  λ− 0.97  n 3,184` (10Hz max).

## 3. The Model (~80vh)

- Two columns.
- Left: 3 short paragraphs — what a bivariate Hawkes process is, why order flow self-excites, why buy/sell cross-excitation matters.
- Right: sticky card with the conditional intensity equation, terms color-coded. Hovering a term highlights its counterpart in a mini inline viz (μ baseline band, kernel decay curve, cross-term arc).

## 4. The Math — scroll choreography (~250vh scroll, pinned)

Equations assemble term-by-term as the user scrolls. Steps:
1. Conditional intensity definition λ±(t)
2. Sum-of-P exponential kernels (β source-only + ordered constraint)
3. Log-likelihood with the O(N) recursion
4. Analytic gradient
Each step: terms fade/spring in individually with one-line mono annotations. Thin progress rail on the left edge. `prefers-reduced-motion`: static stacked equations.

## 5. Empirical Results (~120vh)

Grid of cards; SVG charts drawn stroke-by-stroke on reveal:
- Fitted kernel decay (per side)
- Branching ratio
- Intensity path over a real 1h BTC-USDT window
- QQ / residual plot
Each card: mono label, chart, one accent stat (fitted β, KS p-value, etc.). Real numbers come from Phase 2 fit outputs.

## 6. Validation Wall (~60vh)

- Mono heading: "The model must survive this."
- Grid of test cells (KS, Ljung-Box, ED battery, golden tests) flipping to pass-state with 60ms stagger on scroll-in.
- One cell stays amber: "Phase 4: parameter recovery — in progress." Honesty as a flex; update when Phase 4 gates pass.

## 7. Thesis / About the research (~50vh)

- Single centered column. Short manifesto: rigor-first quant research, validation before claims.
- Phase roadmap as a thin horizontal timeline: phases 0-2 lit (done), 3+ dim.

## 8. Footer

- Thin live ticker of BTC-USDT trades (Binance websocket, throttled; static fallback).
- Links: GitHub repo, home, contact. Copyright.
