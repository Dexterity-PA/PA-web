import MagneticButton from "@/components/ui/MagneticButton";
import { BRANCHING_RATIO } from "@/lib/hawkes/params";

export default function HeroOverlay() {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 w-full md:w-[45%]">
      <div
        aria-hidden
        className="absolute inset-0 border-r border-border bg-glass backdrop-blur-[20px]"
      />
      <div className="relative flex h-full flex-col justify-center px-6 md:px-12">
        <p className="font-mono text-12 uppercase tracking-label text-text-3">
          Market microstructure / point processes
        </p>
        <h1 className="mt-6 max-w-xl text-50 font-semibold text-text-1 md:text-90">
          Order flow, modeled.
        </h1>
        <p className="mt-5 max-w-md text-16 text-text-2">
          A bivariate Hawkes process fit to BTC-USDT market orders. Every tick
          you see excites the next.
        </p>
        <div className="mt-8 flex items-baseline gap-3 font-mono">
          <span className="text-38 tabular-nums text-accent">
            {BRANCHING_RATIO.toFixed(2)}
          </span>
          <span className="text-12 uppercase tracking-label text-text-3">
            fitted branching ratio
          </span>
        </div>
        <div className="pointer-events-auto mt-9 flex flex-wrap gap-3">
          <MagneticButton href="#model">Read the research</MagneticButton>
          <MagneticButton href="https://github.com/Dexterity-PA/PA-web" variant="ghost">
            GitHub
          </MagneticButton>
        </div>
        <div
          className="absolute bottom-6 left-6 flex gap-5 font-mono text-12 tracking-label text-text-3 md:left-12"
          aria-hidden
        >
          <span>
            λ+ <span id="lam-buy" className="text-accent">1.42</span>
          </span>
          <span>
            λ− <span id="lam-sell" className="text-sell">0.97</span>
          </span>
          <span>
            n <span id="lam-n">3,184</span>
          </span>
        </div>
      </div>
    </div>
  );
}
