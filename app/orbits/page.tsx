"use client";

import Link from "next/link";
import { Plus, Clock, CheckCircle2, ChevronRight, Wallet } from "lucide-react";

// Mock Data for UI presentation
const ACTIVE_ORBITS = [
  {
    id: "orb_1",
    name: "Factory Crew Orbit",
    pool: "500",
    cycle: 3,
    totalCycles: 5,
    nextRelease: "Jenny",
    status: "Waiting for deposits",
    userDeposited: true,
  },
  {
    id: "orb_2",
    name: "Weekend Fund",
    pool: "200",
    cycle: 1,
    totalCycles: 4,
    nextRelease: "Mark",
    status: "Your turn to deposit",
    userDeposited: false,
  },
];

const COMPLETED_ORBITS = [
  {
    id: "orb_3",
    name: "Q1 Tech Upgrade",
    pool: "1000",
    completedDate: "Mar 15, 2026",
  },
];

export default function MyOrbitsPage() {
  return (
    <div className="min-h-screen bg-[var(--orbit-bg-app)] text-[var(--orbit-text-primary)] p-6 md:p-10 font-sans">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">My Orbits</h1>
            <p className="text-[var(--orbit-text-secondary)] mt-1">
              Manage your active savings circles and track your progress.
            </p>
          </div>
          <button className="orbit-btn-primary shrink-0 self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            Create Orbit
          </button>
        </div>

        {/* Active Orbits Section */}
        <section className="mb-12">
          <h2 className="orbit-eyebrow mb-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[var(--orbit-warning)] animate-pulse"></div>
            Active Orbits ({ACTIVE_ORBITS.length})
          </h2>

          {ACTIVE_ORBITS.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ACTIVE_ORBITS.map((orbit) => (
                <Link
                  href={`/orbits/${orbit.id}`}
                  key={orbit.id}
                  className="block group"
                >
                  <div className="orbit-card h-full flex flex-col relative overflow-hidden">
                    {/* Glassmorphic Brand Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--orbit-brand)]/5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>

                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg text-[var(--orbit-text-primary)] group-hover:text-[var(--orbit-brand-light)] transition-colors">
                        {orbit.name}
                      </h3>
                      <span
                        className={`orbit-badge ${orbit.userDeposited ? "orbit-badge-neutral" : "orbit-badge-warning"}`}
                      >
                        {orbit.userDeposited ? "Deposited" : "Action Needed"}
                      </span>
                    </div>

                    <div className="mb-6 flex-grow">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-[var(--orbit-text-secondary)]">
                          Cycle {orbit.cycle} of {orbit.totalCycles}
                        </span>
                        <span className="font-medium text-[var(--orbit-text-primary)]">
                          {orbit.pool} USDC Pool
                        </span>
                      </div>
                      <div className="orbit-progress-track">
                        <div
                          className="orbit-progress-fill orbit-progress-fill-brand"
                          style={{
                            width: `${(orbit.cycle / orbit.totalCycles) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="orbit-divider mb-4"></div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-sm text-[var(--orbit-text-secondary)]">
                        <Wallet className="h-4 w-4" />
                        <span>
                          Next Release:{" "}
                          <strong className="text-[var(--orbit-text-primary)] font-medium">
                            {orbit.nextRelease}
                          </strong>
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[var(--orbit-text-muted)] group-hover:text-[var(--orbit-brand)] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="orbit-card border-dashed flex flex-col items-center justify-center p-12 text-center">
              <div className="orbit-circle-icon orbit-circle-icon-brand mb-4 h-12 w-12">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium mb-1">No Active Orbits</h3>
              <p className="text-[var(--orbit-text-secondary)] mb-6 max-w-sm">
                You are not part of any savings circles right now. Create a new
                one to start saving with your crew.
              </p>
              <button className="orbit-btn-ghost">
                Create your first Orbit
              </button>
            </div>
          )}
        </section>

        {/* Completed Orbits Section */}
        <section>
          <h2 className="orbit-eyebrow mb-4">
            Completed Orbits ({COMPLETED_ORBITS.length})
          </h2>

          {COMPLETED_ORBITS.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity">
              {COMPLETED_ORBITS.map((orbit) => (
                <div
                  key={orbit.id}
                  className="orbit-card bg-[var(--orbit-bg-sidebar)]"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-[var(--orbit-text-secondary)]">
                      {orbit.name}
                    </h3>
                    <span className="orbit-badge orbit-badge-success">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--orbit-text-muted)] flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {orbit.completedDate}
                    </span>
                    <span className="font-medium text-[var(--orbit-text-primary)]">
                      {orbit.pool} USDC Pool
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-[var(--orbit-text-muted)] italic">
              Your completed orbits will appear here.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
