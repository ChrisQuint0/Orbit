"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Clock, CheckCircle2, ChevronRight, Wallet, Users, Link as LinkIcon, LogIn } from "lucide-react";
import { CreateOrbitModal } from "@/components/create-orbit-modal";
import { JoinOrbitModal } from "@/components/join-orbit-modal";
import { InviteMembersModal } from "@/components/invite-members-modal";

// Define the types for the Orbit states
type OrbitLifecycleState = "FORMING" | "READY" | "ACTIVE" | "COMPLETED";

interface OrbitMockData {
  id: string;
  name: string;
  pool: string;
  cycle: number;
  totalCycles: number;
  nextRelease: string;
  state: OrbitLifecycleState;
  statusBadge: string;
  membersJoined: number;
  totalMembers: number;
  progress: string;
  isActionNeeded: boolean;
  completedDate?: string;
}

// Mock Data for UI presentation
const ALL_ORBITS: OrbitMockData[] = [
  {
    id: "orb_1",
    name: "Factory Crew Orbit",
    pool: "500",
    cycle: 3,
    totalCycles: 5,
    nextRelease: "Jenny",
    state: "ACTIVE",
    statusBadge: "Active",
    membersJoined: 5,
    totalMembers: 5,
    progress: "4 of 5 Deposited",
    isActionNeeded: false,
  },
  {
    id: "orb_2",
    name: "Weekend Fund",
    pool: "0",
    cycle: 1,
    totalCycles: 5,
    nextRelease: "TBD",
    state: "FORMING",
    statusBadge: "Waiting for Members",
    membersJoined: 3,
    totalMembers: 5,
    progress: "Waiting for 2 more",
    isActionNeeded: true,
  },
  {
    id: "orb_3",
    name: "Family Trip Savings",
    pool: "0",
    cycle: 1,
    totalCycles: 10,
    nextRelease: "Sarah",
    state: "READY",
    statusBadge: "Crew Complete",
    membersJoined: 10,
    totalMembers: 10,
    progress: "Ready for Cycle 1",
    isActionNeeded: false,
  },
  {
    id: "orb_4",
    name: "Q1 Tech Upgrade",
    pool: "1000",
    cycle: 4,
    totalCycles: 4,
    nextRelease: "You",
    state: "COMPLETED",
    statusBadge: "Completed",
    membersJoined: 4,
    totalMembers: 4,
    progress: "All Cycles Done",
    isActionNeeded: false,
    completedDate: "Mar 15, 2026",
  }
];

export default function MyOrbitsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [inviteModalData, setInviteModalData] = useState<{ isOpen: boolean; orbitName: string; joined: number; total: number }>({
    isOpen: false,
    orbitName: "",
    joined: 0,
    total: 0,
  });

  const openInviteModal = (e: React.MouseEvent, orbit: OrbitMockData) => {
    e.preventDefault(); // Prevent navigating to orbit details
    setInviteModalData({
      isOpen: true,
      orbitName: orbit.name,
      joined: orbit.membersJoined,
      total: orbit.totalMembers,
    });
  };

  // Filter orbits into active (forming, ready, active) and completed
  const activeOrbits = ALL_ORBITS.filter((o) => o.state !== "COMPLETED");
  const completedOrbits = ALL_ORBITS.filter((o) => o.state === "COMPLETED");

  const hasOrbits = ALL_ORBITS.length > 0;

  return (
    <div className="min-h-screen bg-[var(--orbit-bg-app)] text-[var(--orbit-text-primary)] p-6 md:p-10 font-sans">
      <div className="mx-auto max-w-6xl">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">My Orbits</h1>
            <p className="text-[var(--orbit-text-secondary)] mt-1">
              Manage your savings circles and track their progress.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsJoinModalOpen(true)}
              className="orbit-btn-secondary shrink-0 self-start sm:self-auto hidden sm:flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Join Orbit
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="orbit-btn-primary shrink-0 self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              Create Orbit
            </button>
          </div>
        </div>

        {!hasOrbits ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 rounded-full bg-[var(--orbit-bg-elevated)] flex items-center justify-center mb-6 shadow-inner">
              <Users className="text-[var(--orbit-text-muted)] w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">You haven't joined any Orbit yet.</h2>
            <p className="text-[var(--orbit-text-secondary)] text-center max-w-md mb-8">
              Create your first Orbit to start saving with your crew, or join an existing one using an invite link.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => setIsCreateModalOpen(true)} className="orbit-btn-primary py-3 px-8 text-base">Create Orbit</button>
              <button onClick={() => setIsJoinModalOpen(true)} className="orbit-btn-secondary py-3 px-8 text-base bg-[var(--orbit-bg-card)]">Join Orbit</button>
            </div>
          </div>
        ) : (
          <>
            {/* Active Orbits Section */}
            <section className="mb-12">
              <h2 className="orbit-eyebrow mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--orbit-warning)] animate-pulse"></div>
                Active Orbits
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeOrbits.map((orbit) => {
                  const cardContent = (
                    <div className="orbit-card h-full flex flex-col relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:border-[var(--orbit-brand-border)]">
                      {/* Brand Accent */}
                      {orbit.state === "ACTIVE" && <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--orbit-brand)]/5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>}
                      {orbit.state === "FORMING" && <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--orbit-warning)]/5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>}
                      {orbit.state === "READY" && <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--orbit-success)]/5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>}

                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-lg text-white group-hover:text-[var(--orbit-brand-light)] transition-colors">
                          {orbit.name}
                        </h3>
                        <span className={`orbit-badge ${orbit.state === 'ACTIVE' ? 'orbit-badge-brand' : orbit.state === 'READY' ? 'orbit-badge-success' : 'orbit-badge-warning'}`}>
                          {orbit.statusBadge}
                        </span>
                      </div>

                      <div className="mb-6 flex-grow flex flex-col gap-4">
                        
                        {/* Dynamic Render based on State */}
                        {orbit.state === "FORMING" && (
                          <>
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-[var(--orbit-text-secondary)]">Members Joined</span>
                                <span className="font-medium text-white">{orbit.membersJoined} / {orbit.totalMembers} Members</span>
                              </div>
                              <div className="orbit-progress-track">
                                <div className="orbit-progress-fill bg-[var(--orbit-warning)]" style={{ width: `${(orbit.membersJoined / orbit.totalMembers) * 100}%` }}></div>
                              </div>
                            </div>
                            <button onClick={(e) => openInviteModal(e, orbit)} className="orbit-btn-secondary w-full py-2 flex items-center justify-center gap-2 mt-auto border-[var(--orbit-warning-border)] hover:bg-[var(--orbit-warning-bg)] hover:text-[var(--orbit-warning)]">
                              <LinkIcon size={14} /> Invite Members
                            </button>
                          </>
                        )}

                        {orbit.state === "READY" && (
                          <>
                            <div className="flex items-center gap-3 bg-[var(--orbit-success-bg)] border border-[var(--orbit-success)]/20 p-3 rounded-xl">
                              <div className="w-8 h-8 rounded-full bg-[var(--orbit-success)]/20 flex items-center justify-center shrink-0">
                                <Users size={16} className="text-[var(--orbit-success)]" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">{orbit.membersJoined} / {orbit.totalMembers} Members</p>
                                <p className="text-xs text-[var(--orbit-success)]">{orbit.progress}</p>
                              </div>
                            </div>
                            <div className="mt-auto pt-2">
                               <span className="text-xs text-[var(--orbit-text-secondary)]">The cycle will begin automatically on the start date.</span>
                            </div>
                          </>
                        )}

                        {orbit.state === "ACTIVE" && (
                          <>
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-[var(--orbit-text-secondary)]">Cycle {orbit.cycle} of {orbit.totalCycles}</span>
                                <span className="font-medium text-[var(--orbit-brand-light)]">{orbit.pool} USDC Pool</span>
                              </div>
                              <div className="orbit-progress-track">
                                <div className="orbit-progress-fill orbit-progress-fill-brand relative overflow-hidden" style={{ width: `${(orbit.cycle / orbit.totalCycles) * 100}%` }}>
                                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
                               <div className="bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-lg p-2 flex flex-col justify-center">
                                 <span className="text-[10px] uppercase tracking-wider text-[var(--orbit-text-secondary)] mb-0.5">Status</span>
                                 <span className="text-xs font-semibold text-white">{orbit.progress}</span>
                               </div>
                               <div className="bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-lg p-2 flex flex-col justify-center">
                                 <span className="text-[10px] uppercase tracking-wider text-[var(--orbit-text-secondary)] mb-0.5">Next Release</span>
                                 <span className="text-xs font-semibold text-white truncate">{orbit.nextRelease}</span>
                               </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="orbit-divider mb-4"></div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-[var(--orbit-text-secondary)] group-hover:text-white transition-colors">
                          <span>
                            {orbit.state === "FORMING" ? "Manage Invites" : orbit.state === "READY" ? "Start Cycle" : "Open Orbit"}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[var(--orbit-text-muted)] group-hover:text-[var(--orbit-brand)] group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  );

                  if (orbit.state === "FORMING") {
                    return (
                      <div key={orbit.id} onClick={(e) => openInviteModal(e, orbit)} className="block group cursor-pointer">
                        {cardContent}
                      </div>
                    );
                  }

                  return (
                    <Link href={`/orbits/${orbit.id}`} key={orbit.id} className="block group">
                      {cardContent}
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Completed Orbits Section */}
            {completedOrbits.length > 0 && (
              <section>
                <h2 className="orbit-eyebrow mb-4">
                  Completed Orbits
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedOrbits.map((orbit) => (
                    <Link
                      href={`/orbits/${orbit.id}`}
                      key={orbit.id}
                      className="block group opacity-80 hover:opacity-100 transition-opacity"
                    >
                      <div className="orbit-card bg-[var(--orbit-bg-sidebar)] h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-white group-hover:text-[var(--orbit-brand-light)] transition-colors">
                            {orbit.name}
                          </h3>
                          <span className="orbit-badge orbit-badge-success">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-auto pt-2 border-t border-[var(--orbit-border)]">
                          <span className="text-[var(--orbit-text-secondary)] flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {orbit.completedDate}
                          </span>
                          <span className="font-semibold text-white">
                            {orbit.pool} USDC Final
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <CreateOrbitModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
      <JoinOrbitModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
      <InviteMembersModal
        isOpen={inviteModalData.isOpen}
        onClose={() => setInviteModalData((prev) => ({...prev, isOpen: false}))}
        orbitName={inviteModalData.orbitName}
        joinedMembers={inviteModalData.joined}
        totalMembers={inviteModalData.total}
      />
    </div>
  );
}
