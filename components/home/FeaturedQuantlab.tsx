import Link from "next/link";
import Card from "@/components/ui/Card";
import MagneticButton from "@/components/ui/MagneticButton";
import Reveal from "@/components/ui/Reveal";
import PointProcessHero from "@/components/quantlab/PointProcessHero";
import { BRANCHING } from "@/lib/hawkes/params";

const branching = (BRANCHING[0][0] + BRANCHING[0][1]).toFixed(2);

export default function FeaturedQuantlab() {
  return (
    <section className="section-pad">
      <Reveal>
        <Card tiltMax={2} className="w-full">
          <div className="grid md:grid-cols-[5fr_6fr]">
            <div className="flex flex-col items-start gap-6 p-8 md:p-12">
              <p className="font-mono text-12 uppercase tracking-label text-text-3">
                Featured / QuantLab
              </p>
              <h2 className="text-38 font-semibold tracking-head text-text-1 md:text-50">
                QuantLab
              </h2>
              <p className="max-w-md text-16 text-text-2">
                Bivariate Hawkes modeling of BTC-USDT order flow — buys
                exciting sells, sells exciting buys, rendered as a living
                point process.
              </p>
              <div className="flex items-baseline gap-3 font-mono">
                <span className="text-28 tabular-nums text-accent">
                  {branching}
                </span>
                <span className="text-12 uppercase tracking-label text-text-3">
                  fitted branching ratio
                </span>
              </div>
              <div className="relative z-30">
                <MagneticButton href="/quantlab">Explore →</MagneticButton>
              </div>
            </div>
            <div className="relative h-64 md:h-auto">
              <PointProcessHero
                variant="mini"
                className="absolute inset-0 block h-full w-full"
              />
            </div>
          </div>
          <Link
            href="/quantlab"
            aria-label="Explore QuantLab"
            className="absolute inset-0 z-20"
          />
        </Card>
      </Reveal>
    </section>
  );
}
