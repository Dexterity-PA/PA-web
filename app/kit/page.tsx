import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import GlassPanel from "@/components/ui/GlassPanel";
import MagneticButton from "@/components/ui/MagneticButton";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "UI Kit — Praneeth Annapureddy",
  description: "Phase 1 component gallery.",
};

const label = "font-mono text-12 uppercase tracking-label text-text-3";

function Section({
  tag,
  title,
  note,
  children,
}: {
  tag: string;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-20">
      <Reveal>
        <p className={label}>{tag}</p>
        <h2 className="mt-3 text-28 font-semibold text-text-1">{title}</h2>
        <p className="mt-2 max-w-xl text-16 text-text-2">{note}</p>
      </Reveal>
      <div className="mt-10">{children}</div>
    </section>
  );
}

export default function Kit() {
  return (
    <div className="mx-auto max-w-content px-6 pb-40 pt-32">
      <Reveal>
        <p className={label}>UI Kit / Phase 1</p>
        <h1 className="mt-4 text-50 font-semibold text-text-1">
          Component gallery
        </h1>
        <p className="mt-4 max-w-xl text-16 text-text-2">
          The motion primitives behind the site. Every interaction is spring
          physics — no fixed-duration easing. Tab through to see the designed
          focus states.
        </p>
      </Reveal>

      <Section
        tag="Reveal"
        title="Viewport reveal + stagger"
        note="Opacity and translateY only, springs from the tokens, staggered 60ms per index. Scroll to retrigger."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Reveal key={i} index={i}>
              <div className="flex h-24 items-end rounded-card border border-border bg-bg-2 p-3 shadow-edge">
                <span className="font-mono text-12 text-text-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section
        tag="MagneticButton"
        title="Magnetic pull + asymmetric hover"
        note="Cursor drags the button on a snappy spring and it settles back on release. Snappy in, slow out."
      >
        <div className="flex flex-wrap items-center gap-5">
          <MagneticButton href="/quantlab">Read the research</MagneticButton>
          <MagneticButton href="https://github.com/Dexterity-PA" variant="ghost">
            GitHub
          </MagneticButton>
          <MagneticButton variant="ghost">Explore →</MagneticButton>
        </div>
      </Section>

      <Section
        tag="Card"
        title="Cursor-aware tilt, warm border, glow"
        note="Tilts toward the cursor, the border brightens, and an accent glow tracks the pointer. The last card is static for comparison."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { t: "Branching ratio", v: "0.63", c: "Self-excitation strength of the fitted kernel." },
            { t: "Kernel half-life", v: "1.8s", c: "Decay of one event's intensity contribution." },
          ].map((d) => (
            <Card key={d.t} className="p-6">
              <p className={label}>{d.t}</p>
              <p className="mt-4 font-mono text-38 text-accent">{d.v}</p>
              <p className="mt-3 text-16 text-text-2">{d.c}</p>
            </Card>
          ))}
          <Card interactive={false} className="p-6">
            <p className={label}>Static</p>
            <p className="mt-4 font-mono text-38 text-text-1">—</p>
            <p className="mt-3 text-16 text-text-2">
              interactive=false: the resting surface, no tilt or glow.
            </p>
          </Card>
        </div>
      </Section>

      <Section
        tag="GlassPanel"
        title="Glass over moving content"
        note="Backdrop blur reads only over real, moving content — here, drifting gradient blobs."
      >
        <div className="relative h-72 overflow-hidden rounded-card border border-border bg-bg-1">
          <div
            className="absolute -left-10 top-4 h-56 w-56 rounded-full bg-accent-dim blur-2xl animate-[mesh-drift_14s_ease-in-out_infinite_alternate]"
            aria-hidden
          />
          <div
            className="absolute right-0 bottom-0 h-64 w-64 rounded-full blur-2xl animate-[mesh-drift_22s_ease-in-out_infinite_alternate]"
            style={{ background: "rgba(56,78,110,0.5)" }}
            aria-hidden
          />
          <GlassPanel className="absolute inset-y-0 left-0 flex w-[45%] flex-col justify-end p-6">
            <p className={label}>Live readout</p>
            <p className="mt-3 font-mono text-21 text-text-1">
              <span className="text-accent">λ+ 1.42</span>{"  "}
              <span className="text-sell">λ− 0.97</span>{"  "}
              <span className="text-text-2">n 3,184</span>
            </p>
          </GlassPanel>
        </div>
      </Section>
    </div>
  );
}
