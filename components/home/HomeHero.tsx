import HeroBackdrop from "./HeroBackdrop";
import HeroGlobeLayer from "./HeroGlobeLayer";
import HeroIntro from "./HeroIntro";
import PendingMark from "./PendingMark";
import {
  HERO_LABEL,
  HERO_SENTENCE,
  HERO_WORDS,
  SHOVE,
  h1Class,
  labelClass,
  pendingClass,
  pendingTransform,
  sentenceClass,
  strikeClass,
} from "./heroCopy";

const skipScript =
  '(function(){try{var p=matchMedia("(prefers-reduced-motion: reduce)").matches;var s=sessionStorage.getItem("intro-seen")==="1";if(p||s)document.documentElement.setAttribute("data-intro-skip","");}catch(e){}})();';

// Repeat-visit / reduced-motion: the whole intro is display:none before first
// paint (zero flash). During an active run the server foreground (#hero-rest)
// stays painted for early LCP, then is hidden under the closed curtain the frame
// before it parts, and restored at the handoff.
const introStyle =
  "[data-intro-skip] .intro-cascade,[data-intro-skip] .intro-curtain,[data-intro-skip] .intro-typing,[data-intro-skip] .intro-skip{display:none}" +
  "[data-intro-running] .hero-rest{opacity:0}";

export default function HomeHero() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6">
      <style dangerouslySetInnerHTML={{ __html: introStyle }} />
      <script dangerouslySetInnerHTML={{ __html: skipScript }} />

      <HeroBackdrop className="absolute inset-0 z-0" />
      <HeroGlobeLayer />

      <div className="hero-rest relative z-10 flex flex-col items-center text-center">
        <span className={labelClass}>{HERO_LABEL}</span>

        <h1 className={h1Class} aria-label="Genius. Billionaire. Philanthropist.">
          <span className="block">{HERO_WORDS[0]}</span>

          <span className="relative block">
            <span className="block" style={{ transform: `translateY(${SHOVE}px)` }}>
              {HERO_WORDS[1]}
            </span>
            <span aria-hidden className={strikeClass} />
            <span
              aria-hidden
              className={pendingClass}
              style={{ transform: pendingTransform, transformOrigin: "bottom left" }}
            >
              <PendingMark />
            </span>
          </span>

          <span className="block">{HERO_WORDS[2]}</span>
        </h1>

        <p className={sentenceClass}>{HERO_SENTENCE}</p>
      </div>

      <HeroIntro />

      <div
        aria-hidden
        className="hero-rest pointer-events-none absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-3 text-text-3"
      >
        <span className="font-mono text-12 uppercase tracking-label">scroll</span>
        <span className="block h-10 w-px animate-pulse bg-border motion-reduce:animate-none" />
      </div>
    </section>
  );
}
