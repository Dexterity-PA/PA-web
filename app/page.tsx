export default function Home() {
  return (
    <div className="mx-auto max-w-content px-6">
      <section className="flex min-h-screen flex-col justify-center">
        <p className="font-mono text-12 uppercase tracking-label text-text-3">
          Phase 0 / Scaffold
        </p>
        <h1 className="mt-6 text-67 font-semibold text-text-1">
          Praneeth Annapureddy
        </h1>
        <p className="mt-6 max-w-xl text-16 text-text-2">
          I build quantitative models, companies, and tools for people locked
          out of the systems that could help them.
        </p>
        <p className="mt-10 font-mono text-12 uppercase tracking-label text-accent">
          λ(t) coming soon
        </p>
      </section>
      <section id="about" className="section-pad border-t border-border">
        <p className="font-mono text-12 uppercase tracking-label text-text-3">
          About
        </p>
        <p className="mt-6 max-w-xl text-21 text-text-2">
          Placeholder — content lands in Phase 3.
        </p>
      </section>
    </div>
  );
}
