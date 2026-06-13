import Link from "next/link";

import { OrbitLogo } from "@/components/orbit-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "How It Works", href: "#how-it-works" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--orbit-border)] bg-orbit-void-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <OrbitLogo className="h-8 w-8" />
          <span className="text-[15px] font-semibold tracking-tight text-orbit-mist-50">
            Orbit
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="orbit-nav-item">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden text-[13px] font-medium text-[var(--orbit-text-secondary)] transition-colors duration-orbit-base ease-orbit-inout hover:text-orbit-mist-50 sm:inline-block"
          >
            Sign In
          </Link>
          <Link
            href="/orbits/new"
            className={cn(buttonVariants({ variant: "primary" }))}
          >
            Start an Orbit
          </Link>
        </div>
      </div>
    </header>
  );
}
