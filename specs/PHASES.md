# PHASES.md — Build Order

Serial 0→2, then 3-5 parallelizable. Each phase = one CC session, branch off origin/main, draft PR.

## Phase 0 — Scaffold (solo, blocking)
Next 16 + TS strict + Tailwind v4. Tokens from DESIGN.md as CSS vars in globals.css. Fonts (display + mono) via next/font. layout.tsx: Lenis provider, grain overlay, mesh background, Nav shell. lib/motion.ts spring constants. Empty routes / and /quantlab. Deploy to Vercel.
Gate: tokens render, Lenis scrolls, 60fps idle, deployed.

## Phase 1 — UI kit
ui/: MagneticButton, Card (top-edge highlight, cursor-aware border warm + tilt), Reveal (Motion spring + stagger), GlassPanel, Nav (glass, hide/show on scroll, border on scroll). Focus states.
Gate: storybook-style demo page, all interactions spring-correct.

## Phase 2 — Hawkes engine + canvas viz
lib/hawkes/: Ogata thinning sim in worker, params.ts placeholders. PointProcessHero canvas per HERO.md: ticks, λ paths, cross-excitation arcs, smear, cursor participant, readout. Tiers: full / mini / reduced-motion / fallback SVG.
Gate: 60fps sustained, zero per-frame allocation (profile), pauses off-screen.

## Phase 3 — Home (parallel-safe)
IntroSequence (typing + strikethrough + `pending`, sessionStorage), resting hero, FeaturedQuantlab card embedding mini viz, ticker teaser (throttled websocket + static fallback), about/footer.
Gate: intro plays once, reduced-motion skips, mini viz pauses off-screen.

## Phase 4 — /quantlab sections (parallel-safe)
ModelSection (sticky equation card, term↔viz hover), MathScroll (GSAP pin, term-by-term assembly, progress rail), ResultsGrid (SVG stroke draw-ins, placeholder data), ValidationWall (flip stagger, amber Phase 4 cell), Thesis + roadmap timeline, footer ticker.
Gate: pin section scrubs cleanly with Lenis, no jank.

## Phase 5 — Polish + data + audit
Swap real Phase 2 fit numbers into params.ts and ResultsGrid. Copy pass. Lighthouse ≥95 perf. Profile scroll. prefers-reduced-motion audit. OG cards. Mobile pass.
Gate: Lighthouse, 60fps on mid-tier laptop, visual QA vs specs.
