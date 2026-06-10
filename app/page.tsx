import FeaturedQuantlab from "@/components/home/FeaturedQuantlab";
import IntroSequence from "@/components/home/IntroSequence";
import Reveal from "@/components/ui/Reveal";

const links = [
  { label: "GitHub", href: "https://github.com/Dexterity-PA" },
  { label: "Email", href: "mailto:praneeth.a2027@gmail.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/praneeth-annapureddy/" },
];

export default function Home() {
  return (
    <>
      <IntroSequence />
      <div className="mx-auto max-w-content px-6">
        <FeaturedQuantlab />
        <section id="about" className="section-pad border-t border-border">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-8 text-center">
            <Reveal>
              <p className="font-mono text-12 uppercase tracking-label text-text-3">
                About
              </p>
            </Reveal>
            <Reveal index={1}>
              <p className="text-21 text-text-2">
                I&apos;m Praneeth — I build quantitative models and the
                companies around them. Right now that means QuantLab, a study
                of crypto order flow as a self-exciting point process, and
                tools for people locked out of the systems that could help
                them.
              </p>
            </Reveal>
            <Reveal index={2}>
              <div className="flex items-center gap-8">
                {links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                    className="font-mono text-12 uppercase tracking-label text-text-3 transition-colors hover:text-text-1"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </div>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-2 px-6 py-8 font-mono text-12 uppercase tracking-label text-text-3 sm:flex-row">
          <span>© 2026 Praneeth Annapureddy</span>
          <span>Built with Next.js + Motion — order flow simulated in a worker</span>
        </div>
      </footer>
    </>
  );
}
