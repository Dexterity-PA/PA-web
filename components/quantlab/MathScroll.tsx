"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { onLenis } from "@/components/ui/LenisProvider";
import SectionHeader from "@/components/ui/SectionHeader";

gsap.registerPlugin(ScrollTrigger);

// Static (stacked) on reduced-motion, mobile, and touch; pinning is desktop-only.
// The choice is a one-way latch decided once at mount (never reactive on resize)
// so GSAP's pin-spacer never races React reconciliation.
const CAN_PIN_MQ =
  "(prefers-reduced-motion: reduce), (max-width: 767px), (pointer: coarse)";

type Step = {
  label: string;
  terms: ReactNode[];
  note: string;
};

const steps: Step[] = [
  {
    label: "01 · conditional intensity",
    terms: [
      <span key="l" className="text-text-1">λ±(t)</span>,
      <span key="e">=</span>,
      <span key="lim">
        lim<sub>Δ→0</sub>
      </span>,
      <span key="ex" className="text-text-1">
        𝔼[N±(t+Δ) − N±(t) | ℱₜ] / Δ
      </span>,
    ],
    note: "the instantaneous arrival rate, conditioned on the full order-flow history",
  },
  {
    label: "02 · exponential kernels",
    terms: [
      <span key="l" className="text-text-1">λ⁺(t)</span>,
      <span key="e">=</span>,
      <span key="mu" className="text-text-1">μ⁺</span>,
      <span key="self" className="text-accent">
        + Σ<sub>tⱼ∈N⁺</sub> α₊₊ e<sup>−β⁺(t−tⱼ)</sup>
      </span>,
      <span key="cross" className="text-sell">
        + Σ<sub>tₖ∈N⁻</sub> α₊₋ e<sup>−β⁻(t−tₖ)</sup>
      </span>,
    ],
    note: "β is source-only: the parent's side sets the decay. ordered α₊₊ > α₊₋",
  },
  {
    label: "03 · log-likelihood, O(N)",
    terms: [
      <span key="l" className="text-text-1">ℓ(θ)</span>,
      <span key="e">=</span>,
      <span key="sum" className="text-text-1">
        Σᵢ log λ<sub>mᵢ</sub>(tᵢ)
      </span>,
      <span key="comp">
        − Σ<sub>±</sub> ∫₀<sup>T</sup> λ±(s) ds
      </span>,
      <span key="rec" className="text-accent">
        R<sub>ab</sub>(i) = e<sup>−β_b Δᵢ</sup> (R<sub>ab</sub>(i−1) +
        𝟙[mᵢ₋₁ = b])
      </span>,
    ],
    note: "the kernel sum telescopes: one recursion, one pass over N events, never N²",
  },
  {
    label: "04 · analytic gradient",
    terms: [
      <span key="l" className="text-text-1">∇θ ℓ</span>,
      <span key="e">:</span>,
      <span key="da" className="text-text-1">
        ∂ℓ/∂α₊₊ = Σ<sub>i∈N⁺</sub> R₊₊(i)/λ⁺(tᵢ)
      </span>,
      <span key="comp">
        − (1/β⁺) Σ<sub>tⱼ∈N⁺</sub> (1 − e<sup>−β⁺(T−tⱼ)</sup>)
      </span>,
      <span key="note" className="text-accent">
        ∂ℓ/∂μ, ∂ℓ/∂β closed-form alike
      </span>,
    ],
    note: "exact gradients into L-BFGS-B, no finite differences in the fit loop",
  },
];

const HEADER = {
  index: 0.2,
  lead: "The likelihood,",
  rest: "derived in full.",
  support: "From the conditional intensity to an O(N) log-likelihood and its analytic gradient.",
  href: "#results",
  linkLabel: "See the results",
} as const;

function StepBlock({ step, animated }: { step: Step; animated: boolean }) {
  return (
    <div className={animated ? "step absolute inset-x-6 mx-auto max-w-3xl" : "mx-auto max-w-3xl"}>
      <p className="term font-mono text-12 uppercase tracking-label text-accent/80">{step.label}</p>
      <p className="mt-6 font-mono text-16 leading-relaxed text-text-2 md:text-21">
        {step.terms.map((t, i) => (
          <span key={i} className="term mr-3 inline-block">
            {t}
          </span>
        ))}
      </p>
      <p className="note mt-6 min-h-[1.4em] font-mono text-12 uppercase tracking-label text-text-3">
        {animated ? "" : step.note}
      </p>
    </div>
  );
}

export default function MathScroll() {
  const stage = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (!window.matchMedia(CAN_PIN_MQ).matches) setPinned(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!pinned) return;
    let detach: (() => void) | undefined;
    const off = onLenis((lenis) => {
      lenis.on("scroll", ScrollTrigger.update);
      detach = () => lenis.off("scroll", ScrollTrigger.update);
    });

    const ctx = gsap.context(() => {
      const nums = gsap.utils.toArray<HTMLElement>(".rail-num");
      const dots = gsap.utils.toArray<HTMLElement>(".rail-dot");
      const setActive = (a: number) => {
        nums.forEach((el, i) => {
          el.style.color =
            i === a ? "var(--accent)" : i < a ? "rgba(74,222,128,0.55)" : "var(--text-3)";
          el.style.transform = i === a ? "scale(1.25)" : "scale(1)";
          el.style.opacity = i <= a ? "1" : "0.5";
        });
        dots.forEach((el, i) => {
          el.style.background = i <= a ? "var(--accent)" : "rgba(255,255,255,0.18)";
          el.style.boxShadow = i === a ? "0 0 0 4px var(--accent-dim)" : "0 0 0 0 transparent";
        });
      };
      setActive(0);

      const stepEls = gsap.utils.toArray<HTMLElement>(".step");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage.current,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) =>
            setActive(Math.min(stepEls.length - 1, Math.floor(self.progress * stepEls.length))),
        },
      });

      stepEls.forEach((el, i) => {
        const terms = el.querySelectorAll(".term");
        const noteEl = el.querySelector<HTMLElement>(".note");
        const noteText = steps[i].note;
        gsap.set(el, { autoAlpha: 1, scale: 1 });
        if (noteEl) noteEl.textContent = "";
        tl.fromTo(
          terms,
          { autoAlpha: 0, y: 18, filter: "blur(8px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            stagger: 0.13,
            duration: 0.5,
            ease: "back.out(1.5)",
          },
        );
        const proxy = { c: 0 };
        tl.to(
          proxy,
          {
            c: noteText.length,
            duration: 0.5,
            ease: "none",
            onUpdate: () => {
              if (!noteEl) return;
              const n = Math.round(proxy.c);
              noteEl.textContent = noteText.slice(0, n) + (n < noteText.length ? "▌" : "");
            },
          },
          ">-0.15",
        );
        tl.to({}, { duration: 0.6 });
        if (i < stepEls.length - 1) {
          tl.to(el, { scale: 0.96, autoAlpha: 0.12, y: -18, duration: 0.4, ease: "power1.in" });
        }
      });

      tl.fromTo(".rail-fill", { scaleY: 0 }, { scaleY: 1, ease: "none", duration: tl.duration() }, 0);
    }, stage);

    return () => {
      ctx.revert();
      off();
      detach?.();
    };
  }, [pinned]);

  if (!pinned) {
    return (
      <section id="math" className="mx-auto max-w-content px-6 section-pad">
        <SectionHeader {...HEADER} />
        <div className="mt-16 space-y-20 md:mt-24">
          {steps.map((s) => (
            <StepBlock key={s.label} step={s} animated={false} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="math">
      <div className="mx-auto max-w-content px-6 pb-4 pt-24 md:pt-32">
        <SectionHeader {...HEADER} />
      </div>
      <div ref={stage} className="relative flex h-svh items-center overflow-hidden">
        <div className="pointer-events-none absolute left-6 top-1/2 z-10 h-[55svh] -translate-y-1/2 md:left-12">
          <div aria-hidden className="absolute left-[3px] top-0 h-full w-px bg-white/10">
            <div className="rail-fill h-full w-full origin-top bg-accent" />
          </div>
          <ol className="relative flex h-full flex-col justify-between">
            {steps.map((s, i) => (
              <li key={s.label} className="flex items-center gap-3">
                <span className="rail-dot h-[7px] w-[7px] shrink-0 rounded-full transition-[background,box-shadow] duration-300" />
                <span
                  className="rail-num font-mono text-12 tabular-nums text-text-3 transition-[color,transform,opacity] duration-300"
                  style={{ transformOrigin: "left center" }}
                >
                  0{i + 1}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative h-72 w-full -translate-y-8">
          {steps.map((s) => (
            <StepBlock key={s.label} step={s} animated />
          ))}
        </div>
      </div>
    </section>
  );
}
