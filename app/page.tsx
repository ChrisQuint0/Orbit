import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { OrbitRing } from "@/components/orbit-ring";
import { HowItWorks } from "@/components/how-it-works";
import { TrustSection } from "@/components/trust-section";
import { OrbitScore } from "@/components/orbit-score";
import { FinalCta } from "@/components/final-cta";
import { Footer } from "@/components/footer";
import { AuthModal } from "@/components/auth-modal";
import { Suspense } from "react";
import { LandingPageWrapper } from "@/components/landing-page-wrapper";

export default function Home() {
  return (
    <LandingPageWrapper>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Hero />
          
          {/* Mobile-only interactive demonstration section */}
          <section className="block border-t border-[var(--orbit-border)] py-16 px-6 md:hidden">
            <div className="mx-auto max-w-sm text-center mb-8">
              <span className="orbit-badge orbit-badge-brand mb-3">
                Interactive Demo
              </span>
              <h2 className="text-2xl font-semibold tracking-tight text-orbit-mist-50">
                See how it works
              </h2>
              <p className="mt-2 text-xs text-[var(--orbit-text-muted)]">
                Click a member avatar on the ring to see how contributions pool together.
              </p>
            </div>
            <OrbitRing triggerOnScroll={true} />
          </section>

          <HowItWorks />
          <TrustSection />
          <OrbitScore />
          <FinalCta />
        </main>
        <Footer />
        <Suspense fallback={null}>
          <AuthModal />
        </Suspense>
      </div>
    </LandingPageWrapper>
  );
}
