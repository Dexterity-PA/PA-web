import Link from "next/link";
import FooterTicker from "@/components/quantlab/FooterTicker";

const links = [
  { label: "GitHub", href: "https://github.com/Dexterity-PA" },
  { label: "Home", href: "/" },
  { label: "Contact", href: "mailto:praneeth.a2027@gmail.com" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <FooterTicker />
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-4 px-6 py-8">
        <p className="font-mono text-12 uppercase tracking-label text-text-3">
          © 2026 Praneeth Annapureddy
        </p>
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
      </div>
    </footer>
  );
}
