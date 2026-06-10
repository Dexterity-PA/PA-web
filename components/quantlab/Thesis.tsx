import Reveal from "@/components/ui/Reveal";

const phases = [
  { n: "00", name: "Data", detail: "aggTrade capture" },
  { n: "01", name: "Simulator", detail: "Ogata thinning" },
  { n: "02", name: "Fit", detail: "MLE, analytic gradient" },
  { n: "03", name: "Validation", detail: "KS, ED, LB" },
  { n: "04", name: "Recovery", detail: "parameter recovery" },
  { n: "05", name: "Baseline", detail: "piecewise μ" },
  { n: "06", name: "Selection", detail: "holdout, AIC" },
  { n: "07", name: "Findings", detail: "residual memory" },
];

export default function Thesis() {
  return (
    <section id="thesis" className="mx-auto max-w-content px-6 section-pad">
      <div className="mx-auto max-w-2xl">
        <Reveal className="text-center">
          <p className="font-mono text-12 uppercase tracking-label text-text-3">
            Thesis
          </p>
          <h2 className="mt-4 text-38 font-semibold text-text-1">
            A good model, and its limits
          </h2>
        </Reveal>
        <Reveal index={1}>
          <p className="mt-8 text-21 text-text-2">
            Exponential-kernel Hawkes describes most of what BTC-USDT
            market-order flow does: the clustering, the branching, the
            asymmetric pull between buys and sells. It does not describe all of
            it. Ljung-Box rejects in every window, and a lag-1 autocorrelation
            of 0.34 survives every kernel and baseline I tried. Some sub-300s
            memory lives outside the model, in book imbalance and order
            splitting that a fixed exponential kernel cannot see. Rigor is
            reporting that, not burying it under a good log-likelihood.
          </p>
        </Reveal>
        <Reveal index={2}>
          <p className="mt-6 text-16 text-text-2">
            One result cuts against itself. A piecewise-constant baseline,
            twelve 300-second segments, wins AIC in all 28 windows and pulls the
            branching ratio from 0.73 to 0.62: it absorbs intra-hour drift that
            a constant baseline mistakes for self-excitation. The same baseline
            slightly degrades the held-out next hour. The drift is real inside
            the hour, not a profile that transfers to the one after it. The
            piecewise model measures branching better. The constant baseline
            forecasts better. Both are true at once.
          </p>
        </Reveal>
      </div>
      <Reveal index={3} className="mt-24">
        <p className="mb-10 text-center font-mono text-12 uppercase tracking-label text-text-3">
          Roadmap · complete through validation
        </p>
        <div className="relative">
          <div aria-hidden className="absolute left-0 right-0 top-[3px] h-px bg-accent/40" />
          <ol className="relative grid grid-cols-4 gap-y-10 md:grid-cols-8">
            {phases.map((p) => (
              <li key={p.n} className="pr-4">
                <span aria-hidden className="block h-[7px] w-[7px] rounded-full bg-text-1" />
                <p className="mt-4 font-mono text-12 uppercase tracking-label text-text-2">
                  {p.n} {p.name}
                </p>
                <p className="mt-1 font-mono text-12 text-text-3">{p.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </section>
  );
}
