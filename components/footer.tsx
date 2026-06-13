import { OrbitLogo } from "@/components/orbit-logo";

const footerLinks = [
  { label: "About", href: "#about" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Sign In", href: "/sign-in" },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--orbit-border)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2.5">
          <OrbitLogo className="h-7 w-7" />
          <span className="text-sm font-semibold text-orbit-mist-50">
            Orbit
          </span>
          <span className="hidden text-xs text-[var(--orbit-text-muted)] sm:inline">
            — Save together. Build trust.
          </span>
        </div>

        <nav className="flex items-center gap-6" aria-label="Footer">
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-[var(--orbit-text-secondary)] transition-colors duration-orbit-base ease-orbit-inout hover:text-orbit-mist-50"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="font-mono text-xs text-[var(--orbit-text-muted)]">
          Built on Stellar · Testnet
        </p>
      </div>
    </footer>
  );
}
