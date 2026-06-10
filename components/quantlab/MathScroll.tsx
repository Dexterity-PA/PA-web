"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { onLenis } from "@/components/ui/LenisProvider";

gsap.registerPlugin(ScrollTrigger);

const REDUCE_MQ = "(prefers-reduced-motion: reduce)";
const subscribeReduce = (cb: () => void) => {
  const mq = window.matchMedia(REDUCE_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useReduced = () =>
  useSyncExternalStore(
    subscribeReduce,
    () => window.matchMedia(REDUCE_MQ).matches,
    () => false,
  );

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
    note: "β is source-only — the parent's side sets the decay. ordered: α₊₊ > α₊₋",
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
    note: "the kernel sum telescopes — one recursion, one pass over N events, never N²",
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
    note: "exact gradients into L-BFGS-B — no finite differences in the fit loop",
  },
];

function StepBlock({ step, animated }: { step: Step; animated: boolean }) {
  return (
    <div className={animated ? "step absolute inset-x-6 mx-auto max-w-3xl" : "mx-auto max-w-3xl"}>
      <p className="term font-mono text-12 uppercase tracking-label text-text-3">
        {step.label}
      </p>
      <p className="mt-6 font-mono text-16 leading-relaxed text-text-2 md:text-21">
        {step.terms.map((t, i) => (
          <span key={i} className="term mr-3 inline-block">
            {t}
          </span>
        ))}
      </p>
      <p className="term mt-6 font-mono text-12 uppercase tracking-label text-text-3">
        {step.note}
      </p>
    </div>
  );
}

export default function MathScroll() {
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReduced();

  useEffect(() => {
    if (reduced || window.matchMedia(REDUCE_MQ).matches) return;
    let detach: (() => void) | undefined;
    const off = onLenis((lenis) => {
      lenis.on("scroll", ScrollTrigger.update);
      detach = () => lenis.off("scroll", ScrollTrigger.update);
    });

    const ctx = gsap.context(() => {
      const stepEls = gsap.utils.toArray<HTMLElement>(".step");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage.current,
          start: "top top",
          end: "+=250%",
          pin: true,
          scrub: true,
          anticipatePin: 1,
        },
      });
      stepEls.forEach((el, i) => {
        const terms = el.querySelectorAll(".term");
        gsap.set(el, { autoAlpha: 1 });
        tl.fromTo(
          terms,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, stagger: 0.14, duration: 0.5, ease: "back.out(1.6)" },
        );
        tl.to({}, { duration: 0.5 });
        if (i < stepEls.length - 1) {
          tl.to(el, { autoAlpha: 0, y: -24, duration: 0.35, ease: "power1.in" });
        }
      });
      tl.fromTo(
        ".rail-fill",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", duration: tl.duration() },
        0,
      );
    }, stage);

    return () => {
      ctx.revert();
      off();
      detach?.();
    };
  }, [reduced]);

  if (reduced) {
    return (
      <section id="math" className="mx-auto max-w-content px-6 section-pad">
        <p className="font-mono text-12 uppercase tracking-label text-text-3">
          The math
        </p>
        <div className="mt-16 space-y-20">
          {steps.map((s) => (
            <StepBlock key={s.label} step={s} animated={false} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="math">
      <div ref={stage} className="relative flex h-svh items-center overflow-hidden">
        <p className="absolute left-6 top-24 font-mono text-12 uppercase tracking-label text-text-3 md:left-12">
          The math
        </p>
        <div
          aria-hidden
          className="absolute left-6 top-1/2 h-[55svh] w-px -translate-y-1/2 bg-white/10 md:left-12"
        >
          <div className="rail-fill h-full w-full origin-top bg-accent" />
        </div>
        <div className="relative h-72 w-full -translate-y-12">
          {steps.map((s) => (
            <StepBlock key={s.label} step={s} animated />
          ))}
        </div>
      </div>
    </section>
  );
}
