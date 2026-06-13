"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useInView,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const SIZE = 400;
const CENTER = SIZE / 2;
const RADIUS = 152;
const CONTRIBUTION_PER_MEMBER = 12.5;
const CONTRIBUTION_DELAY = 700;
const TOTAL_POOL = 50;
const RESET_DELAY = 5000; // ms after completion before resetting

// Circumference for the stroke-dashoffset draw animation
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface CrewMember {
  id: string;
  name: string;
  initials: string;
  angle: number;
}

const crew: CrewMember[] = [
  { id: "jenny", name: "Jenny", initials: "JN", angle: -90 },
  { id: "mark", name: "Mark", initials: "MK", angle: -18 },
  { id: "ana", name: "Ana", initials: "AN", angle: 54 },
  { id: "leo", name: "Leo", initials: "LE", angle: 126 },
  { id: "ria", name: "Ria", initials: "RI", angle: 198 },
];

function pointOnCircle(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

/** SVG checkmark drawn as a polyline — safe to nest inside <svg> */
function SvgCheck({ cx, cy }: { cx: number; cy: number }) {
  return (
    <polyline
      points={`${cx - 5},${cy} ${cx - 1},${cy + 4} ${cx + 5},${cy - 3}`}
      fill="none"
      stroke="var(--color-orbit-teal-300)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

type Phase = "entering" | "idle" | "animating" | "complete";

export function OrbitRing({ triggerOnScroll = false }: { triggerOnScroll?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-100px" });
  const reduceMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState("jenny");
  const [contributedIds, setContributedIds] = useState<Set<string>>(new Set());
  const [poolAmount, setPoolAmount] = useState(0);
  const [phase, setPhase] = useState<Phase>("entering");
  const [hintMemberId, setHintMemberId] = useState<string | null>(null);
  const nextHintIndexRef = useRef(1); // Start at 1 (Mark) since Jenny is the first auto-play
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const selectedMember = crew.find((m) => m.id === selectedId)!;
  const nonSelectedMembers = crew.filter((m) => m.id !== selectedId);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const resetToIdle = useCallback(() => {
    setContributedIds(new Set());
    setPoolAmount(0);
    setPhase("idle");
    // Show hint on the next member in sequence
    const idx = nextHintIndexRef.current;
    setHintMemberId(crew[idx % crew.length].id);
    nextHintIndexRef.current = idx + 1;
  }, []);

  const runContributionAnimation = useCallback(
    (receiverId: string) => {
      clearAllTimeouts();
      setContributedIds(new Set());
      setPoolAmount(0);
      setPhase("animating");

      const others = crew.filter((m) => m.id !== receiverId);

      others.forEach((member, index) => {
        const t = setTimeout(() => {
          setContributedIds((prev) => new Set(prev).add(member.id));
          setPoolAmount((prev) =>
            Math.min(TOTAL_POOL, +(prev + CONTRIBUTION_PER_MEMBER).toFixed(2))
          );

          if (index === others.length - 1) {
            const completeT = setTimeout(() => {
              setPoolAmount(TOTAL_POOL);
              setPhase("complete");
            }, 400);
            timeoutsRef.current.push(completeT);
          }
        }, (index + 1) * CONTRIBUTION_DELAY);
        timeoutsRef.current.push(t);
      });
    },
    [clearAllTimeouts]
  );

  // Auto-reset after completion — fade out checkmarks after 5s
  useEffect(() => {
    if (phase !== "complete") return;

    const resetT = setTimeout(() => {
      resetToIdle();
    }, RESET_DELAY);
    timeoutsRef.current.push(resetT);

    return () => clearTimeout(resetT);
  }, [phase, resetToIdle]);

  // Entrance sequence: draw ring → pop avatars → auto-play contribution
  useEffect(() => {
    // If triggerOnScroll is active, wait until inView is true
    if (triggerOnScroll && !inView) return;

    // After entrance animation finishes (ring draw + avatar pop = ~1.5s),
    // start the contribution animation
    const entranceT = setTimeout(() => {
      runContributionAnimation("jenny");
    }, 1800);
    timeoutsRef.current.push(entranceT);

    return () => clearAllTimeouts();
  }, [runContributionAnimation, clearAllTimeouts, triggerOnScroll, inView]);

  const handleMemberClick = useCallback(
    (memberId: string) => {
      if (phase === "animating" || phase === "entering") return;
      setHintMemberId(null); // Clear hint on click
      setSelectedId(memberId);
      runContributionAnimation(memberId);
    },
    [phase, runContributionAnimation]
  );

  const poolFraction = poolAmount / TOTAL_POOL;

  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-square w-full max-w-[320px] sm:max-w-[420px] md:max-w-[520px]"
      aria-label="Interactive demonstration of an Orbit savings circle. Click a member to see how the pool fills."
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-[12%] rounded-full bg-orbit-violet-500/10 blur-3xl" />

      {/* Pool card — centered, pointer-events pass through wrapper */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={(!triggerOnScroll || inView) ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto orbit-card flex w-32 flex-col items-center gap-1 px-3 py-3 text-center sm:w-40 sm:gap-1.5 sm:px-4 sm:py-4"
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--orbit-text-muted)] sm:text-[10px]">
            Pool
          </span>

          <span className="font-mono text-base font-semibold text-orbit-mist-50 sm:text-xl">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={poolAmount}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="inline-block"
              >
                {poolAmount}
              </motion.span>
            </AnimatePresence>
            <span className="text-[var(--orbit-text-muted)]">
              {" "}
              / {TOTAL_POOL}
            </span>
            <span className="block text-[10px] text-[var(--orbit-text-muted)] sm:inline sm:text-base">
              {" "}
              USDC
            </span>
          </span>

          {/* Progress bar */}
          <div className="orbit-progress-track mt-0.5 w-full sm:mt-1">
            <motion.div
              className="orbit-progress-fill orbit-progress-fill-success"
              initial={{ width: 0 }}
              animate={{ width: `${poolFraction * 100}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <div className="orbit-divider my-0.5 w-full sm:my-1" />

          <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--orbit-text-muted)] sm:text-[10px]">
            Next Release
          </span>

          <span
            className={`orbit-badge text-[10px] sm:text-[11px] ${
              phase === "complete"
                ? "orbit-badge-success"
                : "orbit-badge-brand"
            } transition-colors duration-300`}
          >
            <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={2.5} />
            {selectedMember.name}
          </span>
        </motion.div>
      </div>

      {/* Contributed labels — positioned outside SVG for crisp text */}
      <AnimatePresence>
        {phase !== "idle" &&
          nonSelectedMembers.map((member) => {
            if (!contributedIds.has(member.id)) return null;
            const p = pointOnCircle(member.angle, RADIUS);
            const labelX = (p.x / SIZE) * 100;
            const labelY = (p.y / SIZE) * 100 + 8;

            return (
              <motion.span
                key={`label-${member.id}-${selectedId}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.5 } }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-none absolute z-20 hidden text-[9px] font-semibold text-orbit-teal-300 sm:block"
                style={{
                  left: `${labelX}%`,
                  top: `${labelY}%`,
                  transform: "translateX(-50%)",
                }}
              >
                Contributed
              </motion.span>
            );
          })}
      </AnimatePresence>

      {/* SVG ring and avatars */}
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 z-0 h-full w-full"
      >
        {/* Orbit path — draw-in animation */}
        <motion.circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--color-orbit-mist-800)"
          strokeWidth="1"
          strokeDasharray={`3 7`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={(!triggerOnScroll || inView) ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Deposit lines from each member to center — fade in */}
        {crew.map((member, index) => {
          const p = pointOnCircle(member.angle, RADIUS);
          return (
            <motion.line
              key={`line-${member.id}`}
              x1={p.x}
              y1={p.y}
              x2={CENTER}
              y2={CENTER}
              stroke="var(--color-orbit-mist-800)"
              strokeWidth="0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.08 }}
            />
          );
        })}

        {/* Contribution pulse animations */}
        {!reduceMotion &&
          phase === "animating" &&
          nonSelectedMembers.map((member) => {
            if (!contributedIds.has(member.id)) return null;
            const p = pointOnCircle(member.angle, RADIUS);
            return (
              <motion.circle
                key={`pulse-${member.id}-${selectedId}`}
                r="3"
                fill="var(--color-orbit-teal-400)"
                initial={{ cx: p.x, cy: p.y, opacity: 0 }}
                animate={{
                  cx: [p.x, CENTER],
                  cy: [p.y, CENTER],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut",
                }}
              />
            );
          })}

        {/* Crew avatars — staggered pop-in + clickable */}
        {crew.map((member, index) => {
          const p = pointOnCircle(member.angle, RADIUS);
          const isSelected = member.id === selectedId;
          const hasContributed =
            contributedIds.has(member.id) && phase !== "idle";

          return (
            <motion.g
              key={member.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={(!triggerOnScroll || inView) ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.4 + index * 0.12,
                ease: [0.34, 1.56, 0.64, 1], // spring-like
              }}
              style={{
                cursor: phase === "animating" || phase === "entering" ? "default" : "pointer",
                transformOrigin: `${p.x}px ${p.y}px`,
              }}
              onClick={() => handleMemberClick(member.id)}
            >
              {/* Invisible larger hit target */}
              <circle
                cx={p.x}
                cy={p.y}
                r="28"
                fill="transparent"
                stroke="none"
              />

              {/* Selected member pulsing ring */}
              {isSelected && !reduceMotion && (
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={24}
                  fill="none"
                  stroke="var(--color-orbit-teal-400)"
                  strokeWidth="1.5"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: [0.5, 0], r: [24, 36] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              )}

              {/* Click hint ring — pulses on hinted member during idle */}
              {hintMemberId === member.id && phase === "idle" && !reduceMotion && (
                <motion.circle
                  key={`hint-${member.id}`}
                  cx={p.x}
                  cy={p.y}
                  r={24}
                  fill="none"
                  stroke="var(--color-orbit-violet-400)"
                  strokeWidth="1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.6, 0], r: [22, 30, 22] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              {/* Avatar circle */}
              <circle
                cx={p.x}
                cy={p.y}
                r="20"
                fill={
                  isSelected
                    ? "var(--color-orbit-teal-500)"
                    : hasContributed
                    ? "var(--color-orbit-void-500)"
                    : "var(--color-orbit-void-600)"
                }
                stroke={
                  isSelected
                    ? "var(--color-orbit-teal-300)"
                    : hasContributed
                    ? "var(--color-orbit-teal-400)"
                    : "var(--color-orbit-mist-700)"
                }
                strokeWidth="1"
              />

              {/* Initials or checkmark */}
              {hasContributed && !isSelected ? (
                <SvgCheck cx={p.x} cy={p.y} />
              ) : (
                <text
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="11"
                  fontWeight="600"
                  fill={
                    isSelected
                      ? "var(--color-orbit-void-950)"
                      : "var(--color-orbit-mist-200)"
                  }
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {member.initials}
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>

      {/* Click hint label — appears near hinted member */}
      <AnimatePresence mode="wait">
        {hintMemberId && phase === "idle" && (() => {
          const hintMember = crew.find((m) => m.id === hintMemberId);
          if (!hintMember) return null;
          const p = pointOnCircle(hintMember.angle, RADIUS);
          const labelX = (p.x / SIZE) * 100;
          const labelY = (p.y / SIZE) * 100 - 9;

          return (
            <motion.span
              key={`hint-label-${hintMemberId}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute z-20 text-[9px] font-semibold text-orbit-violet-300"
              style={{
                left: `${labelX}%`,
                top: `${labelY}%`,
                transform: "translateX(-50%)",
              }}
            >
              Click me
            </motion.span>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
