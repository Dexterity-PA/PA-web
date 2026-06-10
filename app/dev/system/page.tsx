import Figure from "@/components/ui/Figure";
import SectionHeader from "@/components/ui/SectionHeader";
import SectionRule from "@/components/ui/SectionRule";
import DemoFigure from "./DemoFigure";

// Demo route for the scrollytelling foundation. Delete in the polish phase.
export default function SystemDemo() {
  return (
    <main className="mx-auto max-w-[var(--container-content)] px-6 py-40">
      <p className="fig-label mb-24">DEV · system primitives</p>

      <section className="section-pad">
        <SectionHeader
          index={0.1}
          lead="Precise, reactive, alive."
          rest="The site behaves like the model it describes."
          support="SectionHeader: two-tone per-word reveal, mono index ticking from 0.0, and a magnetic arrow link in the top-right of the row."
          href="#figure"
        />
      </section>

      <SectionRule />

      <section id="figure" className="section-pad grid gap-16 md:grid-cols-2">
        <Figure index={0.1} caption="stroke draw-in + parallax drift">
          <DemoFigure />
        </Figure>
        <Figure index={0.2} caption="second frame, independent enter" drift={28}>
          <DemoFigure />
        </Figure>
      </section>

      <SectionRule />

      <section className="section-pad">
        <SectionHeader
          index={0.2}
          lead="Restraint is the feature."
          rest="Motion quality carries the weight, never color or clutter."
          support="Scroll past each primitive to confirm 60fps. Toggle prefers-reduced-motion: everything renders static and instant."
          href="#tail"
        />
      </section>

      {/* tall tail so the parallax drift has room to travel */}
      <div className="h-[60vh]" />

      <section id="tail" className="section-pad">
        <Figure index={0.3} caption="drift travels across a full viewport">
          <DemoFigure />
        </Figure>
      </section>

      <div className="h-[60vh]" />
    </main>
  );
}
