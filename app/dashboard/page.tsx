import React from "react";
import { ArrowRight } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-6xl mx-auto w-full">
      {/* Greeting */}
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium text-[var(--orbit-text-secondary)]">
          Good evening,
        </h1>
        <h2 className="text-3xl sm:text-4xl leading-tight font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
          Chris
        </h2>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Wallet Balance (Most Important) */}
        <div className="orbit-stat-card group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg border-[var(--orbit-brand-border)] bg-gradient-to-br from-[var(--orbit-brand-bg)] to-[var(--orbit-bg-card)] ring-1 ring-[var(--orbit-brand)]/30">
          <div className="absolute inset-0 bg-gradient-to-tl from-[var(--orbit-brand)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--orbit-brand-light)] mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--orbit-brand-light)] animate-pulse shadow-[0_0_8px_var(--orbit-brand-light)]"></span>
              Wallet Balance
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-4xl font-bold tracking-tight text-white">1,250.00</span>
              <span className="text-sm font-semibold text-[var(--orbit-brand-light)]">USDC</span>
            </div>
          </div>
        </div>

        <div className="orbit-stat-card group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--orbit-brand-bg)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--orbit-text-secondary)] mb-2">
              Active Orbits
            </div>
            <div className="text-3xl font-bold tracking-tight text-[var(--orbit-text-primary)] group-hover:text-[var(--orbit-brand-light)] transition-colors">2</div>
          </div>
        </div>

        <div className="orbit-stat-card group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--orbit-success-bg)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--orbit-text-secondary)] mb-2">
              Orbit Score
            </div>
            <div className="text-3xl font-bold tracking-tight text-[var(--orbit-success)] group-hover:text-[var(--orbit-success)] transition-colors">96</div>
          </div>
        </div>

        <div className="orbit-stat-card group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-tl from-[var(--orbit-bg-elevated)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--orbit-text-secondary)] mb-2">
              Total Saved
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight text-[var(--orbit-text-primary)]">340</span>
              <span className="text-sm font-semibold text-[var(--orbit-text-secondary)]">USDC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Orbits Section */}
      <div className="flex flex-col gap-5 mt-2">
        <div className="flex items-center justify-between">
          <h3 className="orbit-eyebrow text-xs tracking-widest text-[var(--orbit-text-muted)]">
            ACTIVE ORBITS
          </h3>
          <a href="#" className="text-xs font-medium text-[var(--orbit-brand-light)] hover:text-white transition-colors">
            View all
          </a>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Card 1: Factory Crew Orbit */}
          <div className="orbit-card flex flex-col gap-5 p-6 relative overflow-hidden group hover:border-[var(--orbit-brand-border)] hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-[var(--orbit-bg-card)] to-[var(--orbit-bg-app)]">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--orbit-brand)] rounded-l-lg shadow-[0_0_10px_var(--orbit-brand)]"></div>
            
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-lg text-white group-hover:text-[var(--orbit-brand-light)] transition-colors">
                  Factory Crew Orbit
                </h4>
                <p className="text-sm text-[var(--orbit-text-secondary)] mt-1">
                  Cycle 3 of 5 • 5 members
                </p>
              </div>
              <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors shadow-sm active:scale-95">
                Open <ArrowRight size={16} />
              </button>
            </div>

            <div className="flex justify-between items-end mt-2">
              <span className="text-sm font-medium text-[var(--orbit-text-secondary)]">
                Pool: <span className="text-white font-semibold text-base">40 USDC</span>
              </span>
              <span className="text-xs font-semibold text-[var(--orbit-brand-light)] bg-[var(--orbit-brand-bg)] px-3 py-1.5 rounded-full ring-1 ring-[var(--orbit-brand-border)]">
                Waiting for 1 deposit
              </span>
            </div>

            <div className="mt-2">
              <div className="orbit-progress-track mb-3 h-2 bg-[var(--orbit-bg-elevated)] rounded-full overflow-hidden">
                <div
                  className="orbit-progress-fill bg-gradient-to-r from-[var(--orbit-brand-light)] to-[var(--orbit-brand)] rounded-full relative"
                  style={{ width: "80%" }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <p className="text-xs font-medium text-[var(--orbit-text-secondary)]">
                4 of 5 members deposited
              </p>
            </div>
          </div>

          {/* Card 2: Weekend Savers */}
          <div className="orbit-card flex flex-col gap-5 p-6 relative overflow-hidden group hover:border-[var(--orbit-warning-border)] hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-[var(--orbit-bg-card)] to-[var(--orbit-bg-app)]">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--orbit-warning)] rounded-l-lg shadow-[0_0_10px_var(--orbit-warning)]"></div>

            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-lg text-white group-hover:text-[var(--orbit-warning)] transition-colors">
                  Weekend Savers
                </h4>
                <p className="text-sm text-[var(--orbit-text-secondary)] mt-1">
                  Cycle 1 of 4 • 4 members
                </p>
              </div>
              <button className="orbit-btn-neutral rounded-full px-5 py-2 text-sm font-semibold hover:border-[var(--orbit-warning-border)] hover:text-[var(--orbit-warning)] hover:bg-[var(--orbit-warning-bg)] active:scale-95 transition-all">
                Open
              </button>
            </div>

            <div className="flex justify-between items-end mt-2">
              <span className="text-sm font-medium text-[var(--orbit-text-secondary)]">
                Pool: <span className="text-white font-semibold text-base">0 USDC</span>
              </span>
              <span className="text-xs font-semibold text-[var(--orbit-warning)] bg-[var(--orbit-warning-bg)] px-3 py-1.5 rounded-full flex items-center gap-2 ring-1 ring-[var(--orbit-warning-border)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--orbit-warning)] animate-ping absolute"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--orbit-warning)] relative"></span>
                Your deposit due
              </span>
            </div>

            <div className="mt-2">
              <div className="orbit-progress-track mb-3 h-2 bg-[var(--orbit-bg-elevated)] rounded-full overflow-hidden">
                <div
                  className="orbit-progress-fill bg-[var(--orbit-warning)] rounded-full"
                  style={{ width: "0%" }}
                ></div>
              </div>
              <p className="text-xs font-medium text-[var(--orbit-text-secondary)]">
                0 of 4 members deposited
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
