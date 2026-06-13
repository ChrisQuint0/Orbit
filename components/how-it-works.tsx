"use client";

import { motion } from "framer-motion";
import { CirclePlus, RefreshCw, UserPlus, type LucideIcon } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    icon: CirclePlus,
    title: "Create an Orbit",
    description:
      "Set the deposit amount, schedule, and number of Crew members. Orbit sets up the smart contract for you.",
  },
  {
    number: "02",
    icon: UserPlus,
    title: "Invite your Crew",
    description:
      "Share an invite link. Once everyone joins, your Orbit goes live and the schedule begins.",
  },
  {
    number: "03",
    icon: RefreshCw,
    title: "Save together, automatically",
    description:
      "Deposit on schedule. The smart contract releases the Pool to the next member — no organizer required.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-[var(--orbit-border)]"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <SectionHeading
          eyebrow="How it works"
          title="From sign-up to your first payout."
          description={'No spreadsheets, no group chats full of \u201cdid you send it yet?\u201d Orbit handles the schedule, the Pool, and the Release.'}
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.7,
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="orbit-card group flex flex-col gap-4 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--orbit-border-hover)]"
            >
              <div className="flex items-center justify-between">
                <span className="orbit-circle-icon orbit-circle-icon-brand">
                  <step.icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="font-mono text-xs text-[var(--orbit-text-muted)]">
                  {step.number}
                </span>
              </div>

              <div>
                <h3 className="text-base font-semibold text-orbit-mist-50">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--orbit-text-secondary)]">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
