# PA-web

Personal site of Praneeth Annapureddy, with QuantLab as the flagship feature.

## Stack

- [Next.js 16](https://nextjs.org) — App Router, Turbopack
- TypeScript (strict)
- [Tailwind CSS v4](https://tailwindcss.com) — design tokens as CSS variables
- [Motion](https://motion.dev) — reveals, springs, and micro-interactions
- [GSAP](https://gsap.com) + ScrollTrigger — the pinned math choreography on `/quantlab`
- [Lenis](https://lenis.darkroom.engineering) — smooth scroll, wired to ScrollTrigger
- Canvas point-process hero — raw `requestAnimationFrame` + Web Worker
- Deployed on [Vercel](https://vercel.com)

## Specs

The specs in `specs/` are the source of truth for design and behavior:

- [`specs/DESIGN.md`](specs/DESIGN.md) — tokens, craft rules, spring constants
- [`specs/HOME.md`](specs/HOME.md) — homepage
- [`specs/HERO.md`](specs/HERO.md) — hero / intro sequence
- [`specs/QUANTLAB.md`](specs/QUANTLAB.md) — QuantLab feature
- [`specs/PHASES.md`](specs/PHASES.md) — build phases

## Develop

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # production build
pnpm lint
```
