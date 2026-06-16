"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Users,
  Wallet,
  Activity,
  CheckCircle2,
  CircleDashed,
  ShieldCheck,
  Trophy,
  X,
  ListOrdered,
} from "lucide-react";
import { EditReleaseOrderModal, CrewMember } from "@/components/edit-release-order-modal";

export default function OrbitDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Mock Data mapped to domain terminology
  const orbit = {
    name: "Factory Crew Orbit",
    status: "Active",
    poolSize: 500,
    depositAmount: 100,
    cycle: 3,
    totalCycles: 5,
    nextRelease: "Jenny",
    userDeposited: false,
    crew: [
      { id: "c1", name: "Chris (You)", status: "Pending", avatar: "C" },
      { id: "c2", name: "Jenny", status: "Deposited", avatar: "J" },
      { id: "c3", name: "Mark", status: "Deposited", avatar: "M" },
      { id: "c4", name: "Sarah", status: "Deposited", avatar: "S" },
      { id: "c5", name: "David", status: "Pending", avatar: "D" },
    ],
    history: [
      { action: "Sarah deposited 100 USDC", time: "2 hours ago" },
      { action: "Mark deposited 100 USDC", time: "5 hours ago" },
      { action: "Jenny deposited 100 USDC", time: "1 day ago" },
      {
        action: "Cycle 2 Pool released to Mark",
        time: "1 week ago",
        isRelease: true,
      },
      { action: "You deposited 100 USDC", time: "1 week ago" },
      { action: "David deposited 100 USDC", time: "1 week ago" },
      { action: "Sarah deposited 100 USDC", time: "1 week ago" },
      { action: "Mark deposited 100 USDC", time: "1 week ago" },
      { action: "Jenny deposited 100 USDC", time: "1 week ago" },
      {
        action: "Cycle 1 Pool released to Jenny",
        time: "2 weeks ago",
        isRelease: true,
      },
      { action: "You deposited 100 USDC", time: "2 weeks ago" },
      { action: "David deposited 100 USDC", time: "2 weeks ago" },
      { action: "Sarah deposited 100 USDC", time: "2 weeks ago" },
      { action: "Mark deposited 100 USDC", time: "2 weeks ago" },
      { action: "Jenny deposited 100 USDC", time: "2 weeks ago" },
      { action: "Orbit Created", time: "2 weeks ago" },
    ],
  };
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);
  const [crew, setCrew] = useState<CrewMember[]>(orbit.crew);
  const recentHistory = orbit.history.slice(0, 4);

  useEffect(() => {
    if (isHistoryModalOpen || isEditOrderModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [isHistoryModalOpen, isEditOrderModalOpen]);

  return (
    <div className="min-h-screen bg-[var(--orbit-bg-app)] text-[var(--orbit-text-primary)] p-6 md:p-10 font-sans pb-20">
      <div className="mx-auto max-w-6xl">
        {/* Back Navigation - Updated to point to /orbits */}
        <Link
          href="/orbits"
          className="inline-flex items-center gap-2 text-sm text-[var(--orbit-text-secondary)] hover:text-[var(--orbit-brand-light)] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Orbits
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                {orbit.name}
              </h1>
              <span className="orbit-badge orbit-badge-brand">Active</span>
            </div>
            <p className="text-[var(--orbit-text-secondary)] flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-[var(--orbit-success)]" />
              Secured by Soroban Smart Contract
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="orbit-btn-neutral">View Contract</button>
            <button 
              onClick={() => setIsEditOrderModalOpen(true)}
              className="orbit-btn-neutral flex items-center gap-2"
            >
              <ListOrdered className="h-4 w-4" />
              Edit Release Order
            </button>
            <button className="orbit-btn-ghost">Invite Members</button>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="orbit-stat-card">
            <h4 className="orbit-eyebrow mb-2">Total Pool</h4>
            <div className="text-2xl font-semibold text-[var(--orbit-success)]">
              {orbit.poolSize}{" "}
              <span className="text-sm font-normal text-[var(--orbit-text-muted)]">
                USDC
              </span>
            </div>
          </div>
          <div className="orbit-stat-card">
            <h4 className="orbit-eyebrow mb-2">Weekly Deposit</h4>
            <div className="text-2xl font-semibold text-[var(--orbit-text-primary)]">
              {orbit.depositAmount}{" "}
              <span className="text-sm font-normal text-[var(--orbit-text-muted)]">
                USDC
              </span>
            </div>
          </div>
          <div className="orbit-stat-card">
            <h4 className="orbit-eyebrow mb-2">Current Cycle</h4>
            <div className="text-2xl font-semibold text-[var(--orbit-text-primary)]">
              {orbit.cycle}{" "}
              <span className="text-sm font-normal text-[var(--orbit-text-muted)]">
                of {orbit.totalCycles}
              </span>
            </div>
          </div>
          <div className="orbit-stat-card">
            <h4 className="orbit-eyebrow mb-2">Next Release</h4>
            <div className="text-2xl font-semibold text-[var(--orbit-brand-light)]">
              {orbit.nextRelease}
            </div>
          </div>
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Progress & Crew */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cycle Progress Visualizer */}
            <section className="orbit-card">
              <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5 text-[var(--orbit-text-secondary)]" />
                Orbit Progress
              </h2>
              <div className="relative pt-2 pb-6">
                <div className="orbit-progress-track absolute top-1/2 left-0 w-full -translate-y-1/2 z-0">
                  <div
                    className="orbit-progress-fill orbit-progress-fill-brand"
                    style={{ width: "50%" }}
                  ></div>
                </div>
                <div className="relative z-10 flex justify-between">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                          step < orbit.cycle
                            ? "bg-[var(--orbit-brand)] border-[var(--orbit-brand)] text-white"
                            : step === orbit.cycle
                              ? "bg-[var(--orbit-bg-card)] border-[var(--orbit-brand)] text-[var(--orbit-brand)] shadow-[0_0_15px_rgba(124,110,247,0.4)]"
                              : "bg-[var(--orbit-bg-elevated)] border-[var(--orbit-border)] text-[var(--orbit-text-muted)]"
                        }`}
                      >
                        {step < orbit.cycle ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          step
                        )}
                      </div>
                      <span className="text-xs font-medium text-[var(--orbit-text-secondary)]">
                        Cycle {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Crew Status */}
            <section className="orbit-card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <Users className="h-5 w-5 text-[var(--orbit-text-secondary)]" />
                  Crew Status
                </h2>
                <span className="text-sm text-[var(--orbit-text-secondary)]">
                  3 of 5 deposited
                </span>
              </div>

              <div className="space-y-4">
                {crew.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-[var(--radius-orbit-md)] bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] hover:border-[var(--orbit-border-hover)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="orbit-avatar">{member.avatar}</div>
                      <span className="font-medium text-sm text-[var(--orbit-text-primary)]">
                        {member.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.status === "Deposited" ? (
                        <span className="orbit-badge orbit-badge-success">
                          <CheckCircle2 className="h-3 w-3" /> Deposited
                        </span>
                      ) : (
                        <span className="orbit-badge orbit-badge-warning">
                          <CircleDashed className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Actions & History */}
          <div className="space-y-8">
            {/* Primary Action Card */}
            <section className="orbit-card bg-gradient-to-b from-[var(--orbit-brand-bg)] to-[var(--orbit-bg-card)] border-[var(--orbit-brand-border)]">
              <div className="text-center pb-6 border-b border-[var(--orbit-border)]">
                <h2 className="text-lg font-medium mb-2">
                  Your Weekly Deposit
                </h2>
                <p className="text-sm text-[var(--orbit-text-secondary)] mb-6">
                  Cycle {orbit.cycle} ends in 2 days
                </p>
                <div className="text-4xl font-bold tracking-tight text-[var(--orbit-text-primary)] mb-6">
                  {orbit.depositAmount}{" "}
                  <span className="text-lg font-normal text-[var(--orbit-text-muted)]">
                    USDC
                  </span>
                </div>
                <button className="orbit-btn-primary w-full justify-center py-3 text-[15px] shadow-[0_4px_14px_rgba(124,110,247,0.3)]">
                  <Wallet className="h-4 w-4" />
                  Deposit {orbit.depositAmount} USDC
                </button>
              </div>
              <div className="pt-4 text-center">
                <p className="text-xs text-[var(--orbit-text-muted)] flex items-center justify-center gap-1.5">
                  <Trophy className="h-3 w-3 text-[var(--orbit-brand-light)]" />
                  On-time deposits boost your Orbit Score.
                </p>
              </div>
            </section>

            {/* Activity History */}
            <section className="orbit-card flex flex-col">
              <h2 className="text-lg font-medium mb-6 shrink-0">Activity History</h2>
              
              <div className="space-y-5 relative before:absolute before:inset-0 before:left-[9px] md:before:left-1/2 md:before:-translate-x-1/2 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[var(--orbit-border-strong)] before:to-transparent">
                {recentHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative flex items-center group is-active"
                  >
                    <div
                      className={`flex items-center justify-center w-5 h-5 rounded-full border-2 border-[var(--orbit-bg-card)] shadow absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10 ${item.isRelease ? "bg-[var(--orbit-success)]" : "bg-[var(--orbit-brand)]"}`}
                    ></div>
                    <div className="w-[calc(100%-2.5rem)] ml-auto md:w-[calc(50%-2rem)] md:group-odd:mr-auto md:group-odd:ml-0 md:group-even:ml-auto md:group-even:mr-0 p-3 rounded-[var(--radius-orbit-md)] bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] shadow-sm">
                      <p
                        className={`text-xs font-medium mb-1 ${item.isRelease ? "text-[var(--orbit-success)]" : "text-[var(--orbit-text-primary)]"}`}
                      >
                        {item.action}
                      </p>
                      <time className="text-[10px] text-[var(--orbit-text-muted)]">
                        {item.time}
                      </time>
                    </div>
                  </div>
                ))}
              </div>

              {orbit.history.length > 4 && (
                <button 
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="w-full mt-6 py-2.5 text-sm font-medium text-[var(--orbit-text-secondary)] hover:text-white border border-[var(--orbit-border)] rounded-[var(--radius-orbit-md)] hover:bg-[var(--orbit-bg-elevated)] transition-colors shrink-0 cursor-pointer"
                >
                  View All Activity ({orbit.history.length})
                </button>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Full History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
            onClick={() => setIsHistoryModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-[var(--orbit-bg-app)] border border-[var(--orbit-border-strong)] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-[var(--orbit-border)] shrink-0 bg-[var(--orbit-bg-card)]">
              <h2 className="text-xl font-semibold">Full Activity History</h2>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-2 -mr-2 rounded-full hover:bg-[var(--orbit-bg-elevated)] text-[var(--orbit-text-secondary)] hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-[9px] md:before:left-1/2 md:before:-translate-x-1/2 before:h-full before:w-0.5 before:bg-[var(--orbit-border-strong)]">
                {orbit.history.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative flex items-center group is-active"
                  >
                    <div
                      className={`flex items-center justify-center w-5 h-5 rounded-full border-2 border-[var(--orbit-bg-card)] shadow absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10 ${item.isRelease ? "bg-[var(--orbit-success)]" : "bg-[var(--orbit-brand)]"}`}
                    ></div>
                    <div className="w-[calc(100%-2.5rem)] ml-auto md:w-[calc(50%-2rem)] md:group-odd:mr-auto md:group-odd:ml-0 md:group-even:ml-auto md:group-even:mr-0 p-4 rounded-[var(--radius-orbit-md)] bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] shadow-sm">
                      <p
                        className={`text-sm font-medium mb-1 ${item.isRelease ? "text-[var(--orbit-success)]" : "text-[var(--orbit-text-primary)]"}`}
                      >
                        {item.action}
                      </p>
                      <time className="text-xs text-[var(--orbit-text-muted)]">
                        {item.time}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Release Order Modal */}
      <EditReleaseOrderModal
        isOpen={isEditOrderModalOpen}
        onClose={() => setIsEditOrderModalOpen(false)}
        crew={crew}
        onSave={setCrew}
      />
    </div>
  );
}
