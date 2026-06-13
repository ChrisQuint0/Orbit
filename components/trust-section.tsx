"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";

const oldWay = [
  "One organizer collects everyone's cash by hand",
  "Records live in a notebook or a group chat",
  "If the organizer disappears, so does the Pool",
  "Trust is the only thing enforcing the schedule",
];

const orbitWay = [
  "Deposits go straight into a smart contract",
  "Releases happen automatically, on schedule",
  "Every Deposit and Release is recorded on-chain",
  "No one — including Orbit — can move funds early",
];

export function TrustSection() {
  return (
    <section id="about" className="border-t border-[var(--orbit-border)]">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading
          eyebrow="Why Orbit"
          title="One person shouldn't hold everyone's money."
          description="Paluwagan already work because communities trust each other. Orbit keeps that spirit, and removes the single point of failure."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {/* The old way */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="orbit-card p-6"
          >
            <h3 className="text-sm font-semibold text-[var(--orbit-text-secondary)]">
              The old way
            </h3>
            <ul className="mt-5 space-y-3.5">
              {oldWay.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-relaxed text-[var(--orbit-text-secondary)]"
                >
                  <X
                    className="mt-0.5 h-4 w-4 shrink-0 text-orbit-crimson-400"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* With Orbit */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="orbit-card relative overflow-hidden border-[var(--orbit-brand-border)] p-6"
          >
            {/* Subtle violet gradient accent */}
            <div
              className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-orbit-violet-500/8 blur-2xl"
              aria-hidden="true"
            />

            <h3 className="relative text-sm font-semibold text-orbit-violet-300">
              With Orbit
            </h3>
            <ul className="relative mt-5 space-y-3.5">
              {orbitWay.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-relaxed text-orbit-mist-100"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-orbit-teal-400"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
