import AboutSection from "@/components/home/AboutSection";
import FeaturedQuantlab from "@/components/home/FeaturedQuantlab";
import HomeHero from "@/components/home/HomeHero";
import JourneySection from "@/components/home/JourneySection";
import Ticker from "@/components/home/Ticker";
import SectionHeader from "@/components/ui/SectionHeader";
import SectionRule from "@/components/ui/SectionRule";

export default function Home() {
  return (
    <>
      <HomeHero />

      <div className="mx-auto max-w-content px-6">
        <SectionRule />

        <section className="section-pad">
          <SectionHeader
            index={0.1}
            lead="Order flow,"
            rest="modeled."
            support="QuantLab fits a bivariate Hawkes process to live BTC-USDT order flow, then renders the fitted intensities as a point process you can watch react in real time."
            href="/quantlab"
            linkLabel="Open QuantLab"
          />
          <div className="mt-14 md:mt-20">
            <FeaturedQuantlab />
          </div>
        </section>

        <SectionRule />

        <JourneySection />

        <SectionRule />

        <AboutSection />
      </div>

      <footer className="mx-auto max-w-content px-6">
        <SectionRule />
        <div className="flex flex-col items-center gap-5 py-9 font-mono text-12 uppercase tracking-label text-text-3 sm:flex-row sm:justify-between">
          <span>© 2026 Praneeth Annapureddy</span>
          <Ticker />
          <span className="hidden md:block">Built with Next.js and Motion</span>
        </div>
      </footer>
    </>
  );
}
