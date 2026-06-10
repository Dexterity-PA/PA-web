import type { Metadata } from "next";
import PointProcessHero from "@/components/quantlab/PointProcessHero";
import HeroOverlay from "@/components/quantlab/HeroOverlay";
import ModelSection from "@/components/quantlab/ModelSection";
import MathScroll from "@/components/quantlab/MathScroll";
import ResultsGrid from "@/components/quantlab/ResultsGrid";
import ValidationWall from "@/components/quantlab/ValidationWall";
import Thesis from "@/components/quantlab/Thesis";
import Footer from "@/components/quantlab/Footer";
import SectionRule from "@/components/ui/SectionRule";

const description =
  "Bivariate Hawkes modeling of BTC-USDT market-order flow. Fitted branching ratio 0.62, with the validation and the limits in plain sight.";

export const metadata: Metadata = {
  title: "QuantLab",
  description,
  openGraph: {
    title: "QuantLab · Praneeth Annapureddy",
    description,
    url: "/quantlab",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuantLab · Praneeth Annapureddy",
    description,
  },
};

function Divider() {
  return (
    <div className="mx-auto max-w-content px-6">
      <SectionRule />
    </div>
  );
}

export default function QuantLab() {
  return (
    <>
      <section
        className="relative isolate h-svh w-full overflow-hidden bg-bg-0"
        aria-label="Live bivariate Hawkes point process of BTC-USDT order flow"
      >
        <PointProcessHero variant="full" className="absolute inset-0" />
        <HeroOverlay />
      </section>
      <Divider />
      <ModelSection />
      <Divider />
      <MathScroll />
      <Divider />
      <ResultsGrid />
      <Divider />
      <ValidationWall />
      <Divider />
      <Thesis />
      <Footer />
    </>
  );
}
