"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

import { SectionHeading } from "@/components/section-heading";

const stats = [
  { label: "Orbit Score", value: 96, highlight: true },
  { label: "Completed Orbits", value: 4, highlight: false },
  { label: "Reliability Rate", value: 100, suffix: "%", highlight: false },
];

const badges = ["Reliable Saver", "Orbit Finisher", "Community Builder"];

function CountUp({
  target,
  suffix = "",
  duration = 1200,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

export function OrbitScore() {
  return (
    <section className="border-t border-[var(--orbit-border)]">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center md:py-32">
        <SectionHeading
          eyebrow="Your reputation, on-chain"
          title="Every on-time Deposit counts."
          description="Orbit Score reflects how consistently you show up for your Crew. It's a portable record you carry between Orbits — built from Deposits, not paperwork."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="orbit-card p-6"
        >
          <div className="flex items-center gap-3">
            <div className="orbit-avatar">CH</div>
            <div>
              <p className="text-sm font-semibold text-orbit-mist-50">Chris</p>
              <p className="text-xs text-[var(--orbit-text-muted)]">
                Member since Orbit #3
              </p>
            </div>
          </div>

          <div className="orbit-divider my-5" />

          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`orbit-stat-card ${
                  stat.highlight
                    ? "ring-1 ring-orbit-violet-500/20 shadow-[0_0_16px_rgba(124,110,247,0.08)]"
                    : ""
                }`}
              >
                <p className="font-mono text-xl font-semibold text-orbit-violet-300">
                  <CountUp
                    target={stat.value}
                    suffix={stat.suffix}
                    duration={stat.highlight ? 1400 : 1000}
                  />
                </p>
                <p className="mt-1 text-xs text-[var(--orbit-text-muted)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <motion.span
                key={badge}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.4,
                  delay: 0.4 + index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="orbit-badge orbit-badge-success"
              >
                {badge}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
