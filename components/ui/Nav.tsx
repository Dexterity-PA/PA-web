import Link from "next/link";

const links = [
  { label: "QuantLab", href: "/quantlab" },
  { label: "About", href: "/#about" },
  { label: "GitHub", href: "https://github.com/Dexterity-PA" },
];

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 h-14 bg-glass backdrop-blur-[20px]">
      <nav className="mx-auto flex h-full max-w-content items-center justify-between px-6">
        <Link
          href="/"
          className="font-mono text-12 uppercase tracking-label text-text-1"
        >
          Praneeth Annapureddy
        </Link>
        <div className="flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="font-mono text-12 uppercase tracking-label text-text-3 transition-colors hover:text-text-1"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
