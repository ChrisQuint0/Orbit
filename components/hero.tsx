"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

import { HeroBackground } from "@/components/hero-background";
import { OrbitRing } from "@/components/orbit-ring";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated particle background */}
      <HeroBackground />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pt-16 pb-24 md:grid-cols-2 md:items-center md:pt-20 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="orbit-badge orbit-badge-brand mb-6">
            Built on Stellar · Testnet
          </span>

          <h1 className="text-4xl font-semibold tracking-tight text-orbit-mist-50 sm:text-5xl md:text-[3.25rem] md:leading-[1.1]">
            Community saving, reimagined.
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--orbit-text-secondary)]">
            Create secure savings circles that run automatically on Stellar.
            Deposit with your Crew, and let the smart contract handle the rest.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row mt-8">
            <Link
              href="/?auth=open"
              className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
            >
              Start an Orbit
            </Link>
            <Button variant="neutral" size="lg">
              <Play className="h-3.5 w-3.5" strokeWidth={2} />
              Watch Demo
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="hidden md:block"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.15,
          }}
        >
          <OrbitRing />
        </motion.div>
      </div>
    </section>
  );
}
