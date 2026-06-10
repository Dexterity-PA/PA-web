import Reveal from "@/components/ui/Reveal";

const phases = [
  { n: "00", name: "Data", detail: "aggTrade capture", done: true },
  { n: "01", name: "Simulator", detail: "Ogata thinning", done: true },
  { n: "02", name: "Fit", detail: "MLE, O(N) gradient", done: true },
  { n: "03", name: "Validation", detail: "KS · LB · ED", done: false },
  { n: "04", name: "Recovery", detail: "parameter recovery", done: false },
  { n: "05", name: "Live", detail: "streaming inference", done: false },
];

export default function Thesis() {
  return (
    <section id="thesis" className="mx-auto max-w-content px-6 section-pad">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="font-mono text-12 uppercase tracking-label text-text-3">
            Thesis
          </p>
          <h2 className="mt-4 text-38 font-semibold text-text-1">
            Validation before claims
          </h2>
          <p className="mt-6 text-21 text-text-2">
            Most quant content shows you the win. QuantLab shows the work: a
            model is not done when it fits — it is done when it survives every
            test designed to kill it. Parameters ship with their diagnostics,
            and the roadmap is honest about what is not finished.
          </p>
        </Reveal>
      </div>
      <Reveal index={2} className="mt-24">
        <div className="relative">
          <div aria-hidden className="absolute left-0 right-0 top-[3px] h-px bg-border" />
          <ol className="relative grid grid-cols-3 gap-y-10 md:grid-cols-6">
            {phases.map((p) => (
              <li key={p.n} className="pr-4">
                <span
                  aria-hidden
                  className={`block h-[7px] w-[7px] rounded-full ${
                    p.done ? "bg-accent" : "border border-border-hover bg-bg-1"
                  }`}
                />
                <p
                  className={`mt-4 font-mono text-12 uppercase tracking-label ${
                    p.done ? "text-text-2" : "text-text-3"
                  }`}
                >
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
