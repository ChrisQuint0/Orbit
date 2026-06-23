"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FinalCta() {
  return (
    <section className="border-t border-[var(--orbit-border)]">
      <div className="relative mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
        {/* Subtle radial glow */}
        <div
          className="pointer-events-none absolute inset-0 mx-auto max-w-md"
          aria-hidden="true"
        >
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orbit-violet-500/8 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-orbit-mist-50 sm:text-4xl">
            Start your first Orbit today.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[var(--orbit-text-secondary)]">
            Set up your Crew, choose a schedule, and let the smart contract
            handle the rest.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/?auth=open"
              className={cn(
                buttonVariants({ variant: "primary", size: "lg" }),
                "min-w-[200px]"
              )}
            >
              Start an Orbit
            </Link>
            <a
              href="#how-it-works"
              className="mt-1 text-sm font-medium text-[var(--orbit-text-secondary)] transition-colors duration-200 hover:text-orbit-mist-50"
            >
              Learn how it works →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
