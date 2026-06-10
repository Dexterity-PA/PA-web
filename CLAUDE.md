# CLAUDE.md — Personal Site (Praneeth Annapureddy)

Repo: github.com/Dexterity-PA/PA-web (remote: https://github.com/Dexterity-PA/PA-web.git). Commit and push all work here.

Personal site, QuantLab flagship feature. Award-tier craft. Specs in /specs are the source of truth: DESIGN.md (tokens, craft rules), HOME.md, QUANTLAB.md, HERO.md.

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript strict
- Tailwind v4, tokens as CSS variables (DESIGN.md is canonical)
- Motion (framer-motion) — all reveals, hovers, springs, micro-interactions
- GSAP + ScrollTrigger — ONLY the pinned math choreography on /quantlab
- Lenis smooth scroll (lerp 0.1), wired to ScrollTrigger via lenis.on('scroll', ScrollTrigger.update)
- Canvas hero: raw rAF + Web Worker, no animation library
- Vercel deploy

## Animation division of labor

- Motion: viewport reveals (staggered, springs), magnetic buttons, card tilt/glow, nav hide/show, hero intro typing sequence
- GSAP ScrollTrigger: /quantlab math section pin + term-by-term assembly, SVG stroke draw-ins (DrawSVG-style via strokeDashoffset)
- Never both libraries on the same element
- Springs from DESIGN.md only: default 260/28, snappy 400/30, out 170/26
- transform + opacity only, surgical will-change, removed after

## Next 16 quirks

- middleware → proxy.ts
- Route handlers needing Node APIs: runtime 'nodejs'
- Motion v12: `custom` does not propagate to nested children; set it on every animating leaf.

## Code style

- No comments, short vars, functions over classes
- Server components by default; 'use client' only where interaction demands
- One component per file, co-located in section folders

## Structure

```
app/
  page.tsx               home
  quantlab/page.tsx
  layout.tsx             fonts, Lenis provider, grain, mesh
components/
  home/                  IntroSequence, FeaturedQuantlab, Ticker
  quantlab/              PointProcessHero, ModelSection, MathScroll,
                         ResultsGrid, ValidationWall, Thesis
  ui/                    MagneticButton, Card, Reveal, GlassPanel, Nav
lib/
  hawkes/                worker.ts, ogata.ts, params.ts
  motion.ts              spring constants
specs/                   the md files
```

## Hard rules

- prefers-reduced-motion respected everywhere (skip intro, static viz, instant reveals)
- Sim in worker; zero per-frame allocation; pause off-screen
- Accent max ~5 uses per viewport; sell red viz-only
- No layout-property animation, ever
- Intro sequence session-stored (sessionStorage key 'intro-seen')
- Binance websocket throttled; static fallback data committed

## Parallel CC sessions

Forbidden shared files: app/layout.tsx, app/globals.css, package.json, tsconfig.json, next.config.ts, lib/motion.ts. Each stream owns exclusive files, branches off origin/main in isolated worktrees, draft PR, never self-merges.
