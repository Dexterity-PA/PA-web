import type { Metadata } from "next";
import PointProcessHero from "@/components/quantlab/PointProcessHero";
import ModelSection from "@/components/quantlab/ModelSection";
import MathScroll from "@/components/quantlab/MathScroll";
import ResultsGrid from "@/components/quantlab/ResultsGrid";
import ValidationWall from "@/components/quantlab/ValidationWall";
import Thesis from "@/components/quantlab/Thesis";
import Footer from "@/components/quantlab/Footer";

export const metadata: Metadata = {
  title: "QuantLab — Praneeth Annapureddy",
  description: "Bivariate Hawkes modeling of BTC-USDT order flow.",
};

export default function QuantLab() {
  return (
    <>
      <PointProcessHero variant="full" className="block h-svh w-full" />
      <ModelSection />
      <MathScroll />
      <ResultsGrid />
      <ValidationWall />
      <Thesis />
      <Footer />
    </>
  );
}
