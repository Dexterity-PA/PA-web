import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuantLab — Praneeth Annapureddy",
  description: "Bivariate Hawkes modeling of BTC-USDT order flow.",
};

export default function QuantLab() {
  return (
    <div className="mx-auto max-w-content px-6">
      <section className="flex min-h-screen flex-col justify-center">
        <p className="font-mono text-12 uppercase tracking-label text-text-3">
          QuantLab
        </p>
        <h1 className="mt-6 text-50 font-semibold text-text-1">
          Bivariate Hawkes modeling of BTC-USDT order flow
        </h1>
        <p className="mt-6 max-w-xl text-16 text-text-2">
          Placeholder — the point-process hero lands in Phase 2.
        </p>
      </section>
    </div>
  );
}
