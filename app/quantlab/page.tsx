import type { Metadata } from "next";
import PointProcessHero from "@/components/quantlab/PointProcessHero";

export const metadata: Metadata = {
  title: "QuantLab — Praneeth Annapureddy",
  description: "Bivariate Hawkes modeling of BTC-USDT order flow.",
};

export default function QuantLab() {
  return (
    <>
      <PointProcessHero variant="full" className="block h-svh w-full" />
      <section id="model" className="mx-auto max-w-content px-6 section-pad">
        <p className="font-mono text-12 uppercase tracking-label text-text-3">
          The model
        </p>
        <h2 className="mt-4 text-38 font-semibold text-text-1">
          Self-excitation, made visible
        </h2>
        <p className="mt-4 max-w-xl text-16 text-text-2">
          Placeholder — ModelSection, MathScroll, ResultsGrid, ValidationWall
          and Thesis land in Phase 4.
        </p>
      </section>
    </>
  );
}
