"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus, Clock, CheckCircle2, ChevronRight, Wallet, Users, Link as LinkIcon, LogIn, Trash2 } from "lucide-react";
import { deleteOrbitAction } from "@/app/actions/orbit";
import { CreateOrbitModal } from "@/components/create-orbit-modal";
import { JoinOrbitModal } from "@/components/join-orbit-modal";
import { InviteMembersModal } from "@/components/invite-members-modal";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
  inviteCode?: string;
  completedDate?: string;
  isCreator: boolean;
}

export default function MyOrbitsPage() {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [inviteModalData, setInviteModalData] = useState<{ isOpen: boolean; orbitName: string; joined: number; total: number; inviteCode: string }>({
    isOpen: false,
    orbitName: "",
    joined: 0,
    total: 0,
    inviteCode: "",
  });

  const [orbits, setOrbits] = useState<OrbitMockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrbits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      // 1. Fetch orbits the user belongs to
      const { data: userMemberships, error: memberErr } = await supabase
        .from("orbit_members")
        .select("orbit_id, role")
        .eq("user_id", user.id);

      if (memberErr || !userMemberships || userMemberships.length === 0) {
        setOrbits([]);
        setIsLoading(false);
        return;
      }

      const orbitIds = userMemberships.map(m => m.orbit_id);

      // 2. Fetch full orbit details
      const { data: orbitsData, error: orbitErr } = await supabase
        .from("orbits")
        .select("*")
        .in("id", orbitIds);

      if (orbitErr || !orbitsData) throw orbitErr;

      // 3. Fetch members count for each orbit
      // A simple way is to fetch all memberships for these orbits and group them
      const { data: allMemberships, error: allMemberErr } = await supabase
        .from("orbit_members")
        .select("orbit_id")
        .in("orbit_id", orbitIds);

      if (allMemberErr) throw allMemberErr;

      const memberCounts = allMemberships.reduce((acc: any, curr: any) => {
        acc[curr.orbit_id] = (acc[curr.orbit_id] || 0) + 1;
        return acc;
      }, {});

      // 4. Fetch all deposits to calculate progress
      const activeOrbitIds = orbitsData.filter((o: any) => o.status === "ACTIVE").map((o: any) => o.id);
      let allDeposits: any[] = [];
      if (activeOrbitIds.length > 0) {
        const { data: depositsData } = await supabase
          .from("deposits")
          .select("orbit_id, cycle_number, status")
          .in("orbit_id", activeOrbitIds);
        if (depositsData) allDeposits = depositsData;
      }

      // 5. Fetch member details with user names to resolve "nextRelease"
      let memberDetails: any[] = [];
      if (orbitIds.length > 0) {
        const { data: md } = await supabase
          .from("orbit_members")
          .select("orbit_id, payout_order, users(full_name)")
          .in("orbit_id", orbitIds);
        if (md) memberDetails = md;
      }

      // 6. Map to UI format
      const formattedOrbits: OrbitMockData[] = orbitsData.map((orbit) => {
        const joined = memberCounts[orbit.id] || 0;
        const total = orbit.num_members;
        const pool = (Number(orbit.deposit_amount) * (total - 1)).toString();
        const membership = userMemberships.find(m => m.orbit_id === orbit.id);
        const isCreator = membership?.role === "CREATOR";
        
        // Find next release member
        const nextMember = memberDetails.find(m => m.orbit_id === orbit.id && m.payout_order === orbit.current_cycle);
        const nextRelease = orbit.status === "COMPLETED" ? "Done" : nextMember?.users?.full_name || "TBD";

        // Count deposits for current cycle
        const currentDeposits = allDeposits.filter(d => d.orbit_id === orbit.id && d.cycle_number === orbit.current_cycle && d.status === "PAID");
        const numDeposited = currentDeposits.length;
        const targetDeposits = total - 1;

        let statusBadge = "Unknown";
        let progress = "";
        let isActionNeeded = false;
        
        if (orbit.status === "FORMING") {
          statusBadge = "Waiting for Members";
          progress = `Waiting for ${total - joined} more`;
          if (isCreator && joined === total) isActionNeeded = true;
        } else if (orbit.status === "READY") {
          statusBadge = "Crew Complete";
          progress = "Ready for Cycle 1";
          if (isCreator) isActionNeeded = true;
        } else if (orbit.status === "ACTIVE") {
          statusBadge = "Active";
          progress = `${numDeposited} of ${targetDeposits} Deposited`;
          // Basic action needed check: hasn't deposited yet, and isn't the recipient
          const isRecipient = membership?.payout_order === orbit.current_cycle;
          const myDeposit = allDeposits.find(d => d.orbit_id === orbit.id && d.cycle_number === orbit.current_cycle && d.user_id === user.id);
          if (!isRecipient && (!myDeposit || myDeposit.status !== "PAID")) {
            isActionNeeded = true;
          }
        } else if (orbit.status === "COMPLETED") {
          statusBadge = "Completed";
          progress = "All Cycles Done";
        }

        return {
          id: orbit.id,
          name: orbit.name,
          pool: pool,
          cycle: orbit.current_cycle || 1,
          totalCycles: total,
          nextRelease: nextRelease,
          state: orbit.status as OrbitLifecycleState,
          statusBadge,
          membersJoined: joined,
          totalMembers: total,
          progress,
          isActionNeeded,
          inviteCode: orbit.invite_code,
          completedDate: orbit.status === "COMPLETED" ? new Date(orbit.created_at).toLocaleDateString() : undefined,
          isCreator,
        };
      });

      // Sort by creation or status
      formattedOrbits.sort((a, b) => a.state === "COMPLETED" ? 1 : -1);

      setOrbits(formattedOrbits);
    } catch (err) {
      console.error("Failed to load orbits:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "create") {
      setIsCreateModalOpen(true);
      window.history.replaceState({}, '', '/orbits');
    } else if (params.get("action") === "join") {
      setIsJoinModalOpen(true);
      window.history.replaceState({}, '', '/orbits');
    }
    fetchOrbits();
  }, [isCreateModalOpen, isJoinModalOpen]); // Refetch when modals close

  const openInviteModal = (e: React.MouseEvent, orbit: OrbitMockData) => {
    e.preventDefault(); // Prevent navigating to orbit details
    setInviteModalData({
      isOpen: true,
      orbitName: orbit.name,
      joined: orbit.membersJoined,
      total: orbit.totalMembers,
      inviteCode: orbit.inviteCode || "",
    });
  };

  const handleDeleteOrbit = async (e: React.MouseEvent, orbitId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm("Are you sure you want to delete this orbit? This action cannot be undone.")) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await deleteOrbitAction({ userId: user.id, orbitId });
      if (res.success) {
        fetchOrbits(); // Refresh the list
      } else {
        alert(res.error || "Failed to delete orbit");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("An error occurred while deleting the orbit.");
    }
  };

  // Filter orbits into active (forming, ready, active) and completed
  const activeOrbits = orbits.filter((o) => o.state !== "COMPLETED");
  const completedOrbits = orbits.filter((o) => o.state === "COMPLETED");

  const hasOrbits = orbits.length > 0;

  if (isLoading) {
    return <div className="min-h-screen bg-[var(--orbit-bg-app)] flex items-center justify-center p-10">
      <div className="w-8 h-8 border-4 border-[var(--orbit-brand)] border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[var(--orbit-bg-app)] text-[var(--orbit-text-primary)] p-6 md:p-10 font-sans relative">
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
            <div className="w-24 h-24 rounded-full bg-[var(--orbit-bg-elevated)] flex items-center justify-center mb-6 shadow-inner border border-[var(--orbit-border)]">
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
                        <h3 className="font-semibold text-lg text-white group-hover:text-[var(--orbit-brand-light)] transition-colors pr-2">
                          {orbit.name}
                        </h3>
                        <div className="flex gap-2 items-center">
                          {orbit.isCreator && orbit.state === "FORMING" && (
                            <button 
                              onClick={(e) => handleDeleteOrbit(e, orbit.id)}
                              className="p-1.5 rounded-md hover:bg-[var(--orbit-danger-bg)] text-[var(--orbit-text-secondary)] hover:text-[var(--orbit-danger)] transition-colors"
                              title="Delete Orbit"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <span className={`orbit-badge ${orbit.state === 'ACTIVE' ? 'orbit-badge-brand' : orbit.state === 'READY' ? 'orbit-badge-success' : 'orbit-badge-warning'}`}>
                            {orbit.statusBadge}
                          </span>
                        </div>
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
                      <div className="orbit-card bg-[var(--orbit-bg-sidebar)] h-full flex flex-col border-[var(--orbit-border)] border">
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
        inviteCode={inviteModalData.inviteCode}
      />
    </div>
  );
}
