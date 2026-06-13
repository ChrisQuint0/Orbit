import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { TrustSection } from "@/components/trust-section";
import { OrbitScore } from "@/components/orbit-score";
import { FinalCta } from "@/components/final-cta";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <TrustSection />
        <OrbitScore />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
