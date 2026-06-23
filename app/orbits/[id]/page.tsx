"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
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
  ExternalLink,
  Clock,
} from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { EditReleaseOrderModal, CrewMember } from "@/components/edit-release-order-modal";
import { supabase } from "@/lib/supabase";
import { startOrbitAction, makeDepositAction, celebrateCycleAction, updateReleaseOrderAction } from "@/app/actions/orbit";

export default function OrbitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const orbitId = unwrappedParams.id;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [orbit, setOrbit] = useState<any>(null);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [myPayoutOrder, setMyPayoutOrder] = useState<number>(0);
  
  // Deposit state
  const [hasDeposited, setHasDeposited] = useState(false);
  const [currentCycleDeposits, setCurrentCycleDeposits] = useState<any[]>([]);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);

  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg("");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);

      // 1. Fetch Orbit
      const { data: orbitData, error: orbitError } = await supabase
        .from("orbits")
        .select("*")
        .eq("id", orbitId)
        .single();

      if (orbitError || !orbitData) throw new Error("Orbit not found");
      setOrbit(orbitData);

      // 2. Fetch Members & Users
      const { data: membersData, error: membersError } = await supabase
        .from("orbit_members")
        .select("*, users(full_name)")
        .eq("orbit_id", orbitId)
        .order("payout_order", { ascending: true });

      if (membersError) throw membersError;

      const myMember = membersData.find(m => m.user_id === user.id);
      if (myMember) {
        setUserRole(myMember.role);
        setMyPayoutOrder(myMember.payout_order);
      }

      // 3. Fetch Deposits for Current Cycle
      const { data: depositsData } = await supabase
        .from("deposits")
        .select("id, user_id, status, due_date")
        .eq("orbit_id", orbitId)
        .eq("cycle_number", orbitData.current_cycle);

      const cycleDeposits = depositsData || [];
      setCurrentCycleDeposits(cycleDeposits);

      const myDeposit = cycleDeposits.find(d => d.user_id === user.id);
      setHasDeposited(myDeposit?.status === "PAID");

      // Map to CrewMember UI model
      const mappedCrew: CrewMember[] = membersData.map((m: any) => {
        const isRecipient = m.payout_order === orbitData.current_cycle;
        const dStatus = cycleDeposits.find(d => d.user_id === m.user_id);
        const hasPaid = dStatus?.status === "PAID";
        const name = m.users?.full_name || "Unknown";
        return {
          id: m.user_id,
          name: m.user_id === user.id ? `${name} (You)` : name,
          status: isRecipient ? "Recipient" : hasPaid ? "Deposited" : "Pending",
          avatar: name.charAt(0).toUpperCase()
        };
      });
      setCrew(mappedCrew);

      // 5. Determine if we need to celebrate
      const highestCompletedCycle = orbitData.status === "COMPLETED" ? orbitData.num_members : orbitData.current_cycle - 1;
      
      if (myMember && (myMember.last_celebrated_cycle || 0) < highestCompletedCycle && highestCompletedCycle > 0) {
        setCelebrationMessage(highestCompletedCycle === orbitData.num_members ? `Orbit Completed!` : `Cycle ${highestCompletedCycle} Completed!`);
        setShowConfetti(true);
      }

      // 4. Fetch Activity Feed
      const { data: activityData } = await supabase
        .from("activity_feed")
        .select("*, users(full_name)")
        .eq("orbit_id", orbitId)
        .order("created_at", { ascending: false });

      if (activityData) {
        const mappedHistory = activityData.map(a => {
          let message = a.message;
          const userName = a.users?.full_name || "A member";
          
          // Fallback for older hardcoded messages
          if (a.action_type === "JOINED" && message.startsWith("Joined")) {
            message = `${userName} ${message.toLowerCase()}`;
          } else if (a.action_type === "CREATED" && message.startsWith("Created")) {
            message = `${userName} ${message.toLowerCase()}`;
          }

          return {
            action: message,
            time: new Date(a.created_at).toLocaleString(),
            isRelease: a.action_type === "RELEASED"
          };
        });
        setHistory(mappedHistory);
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to load orbit details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orbitId]);

  useEffect(() => {
    if (isHistoryModalOpen || isEditOrderModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [isHistoryModalOpen, isEditOrderModalOpen]);

  const handleStartOrbit = async () => {
    setIsProcessing(true);
    const res = await startOrbitAction({ userId, orbitId });
    if (res.success) {
      await fetchData();
    } else {
      alert(res.error || "Failed to start orbit");
    }
    setIsProcessing(false);
  };

  const handleDeposit = async () => {
    setIsProcessing(true);
    const res = await makeDepositAction({ userId, orbitId });
    if (res.success) {
      await fetchData();
    } else {
      alert(res.error || "Failed to make deposit");
    }
    setIsProcessing(false);
  };

  const handleSaveOrder = async (newCrew: CrewMember[]) => {
    try {
      setIsLoading(true);
      const newOrder = newCrew.map((c, index) => ({ userId: c.id, order: index + 1 }));
      await updateReleaseOrderAction(orbitId, newOrder);
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setIsEditOrderModalOpen(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-white"><div className="w-8 h-8 border-4 border-[var(--orbit-brand)] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!orbit) {
    return <div className="min-h-screen flex items-center justify-center text-white">Orbit not found.</div>;
  }

  const recentHistory = history.slice(0, 4);
  const totalPool = Number(orbit.deposit_amount) * (Number(orbit.num_members) - 1);
  const isRecipientThisCycle = myPayoutOrder === orbit.current_cycle;
  
  // Find next release person
  const nextReleaseMember = crew[orbit.current_cycle - 1];
  const nextReleaseName = nextReleaseMember ? nextReleaseMember.name : "TBD";

  const numDeposited = currentCycleDeposits.filter(d => d.status === "PAID").length;
  const targetDeposits = orbit.num_members - 1;
  const currentDueDate = currentCycleDeposits.length > 0 ? currentCycleDeposits[0].due_date : null;

  return (
    <div className="min-h-screen bg-[var(--orbit-bg-app)] text-[var(--orbit-text-primary)] p-6 md:p-10 font-sans pb-20">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/orbits"
          className="inline-flex items-center gap-2 text-sm text-[var(--orbit-text-secondary)] hover:text-[var(--orbit-brand-light)] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Orbits
        </Link>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--orbit-danger-bg)] border border-[var(--orbit-danger-border)] text-[var(--orbit-danger)]">
            {errorMsg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                {orbit.name}
              </h1>
              <span className={`orbit-badge ${orbit.status === 'ACTIVE' ? 'orbit-badge-brand' : orbit.status === 'COMPLETED' ? 'orbit-badge-success' : 'orbit-badge-warning'}`}>
                {orbit.status}
              </span>
            </div>
            <p className="text-[var(--orbit-text-secondary)] flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-[var(--orbit-success)]" />
              Secured by Smart Contract
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {userRole === "CREATOR" && orbit.status === "FORMING" && (
               <button className="orbit-btn-neutral flex items-center gap-2 opacity-50 cursor-not-allowed">
                 Waiting for full crew...
               </button>
            )}
            {userRole === "CREATOR" && orbit.status === "READY" && (
               <button 
                onClick={handleStartOrbit}
                disabled={isProcessing}
                className="orbit-btn-primary flex items-center gap-2"
               >
                 {isProcessing ? "Starting..." : "Start First Cycle"}
               </button>
            )}
            <button 
              onClick={() => setIsEditOrderModalOpen(true)}
              className="orbit-btn-neutral flex items-center gap-2"
            >
              <ListOrdered className="h-4 w-4" />
              View Release Order
            </button>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="orbit-stat-card">
            <h4 className="orbit-eyebrow mb-2">Total Pool</h4>
            <div className="text-2xl font-semibold text-[var(--orbit-success)]">
              {totalPool}{" "}
              <span className="text-sm font-normal text-[var(--orbit-text-muted)]">
                USDC
              </span>
            </div>
          </div>
          <div className="orbit-stat-card">
            <h4 className="orbit-eyebrow mb-2">Periodic Deposit</h4>
            <div className="text-2xl font-semibold text-[var(--orbit-text-primary)]">
              {orbit.deposit_amount}{" "}
              <span className="text-sm font-normal text-[var(--orbit-text-muted)]">
                USDC
              </span>
            </div>
          </div>
          <div className="orbit-stat-card">
            <h4 className="orbit-eyebrow mb-2">Current Cycle</h4>
            <div className="text-2xl font-semibold text-[var(--orbit-text-primary)]">
              {orbit.current_cycle}{" "}
              <span className="text-sm font-normal text-[var(--orbit-text-muted)]">
                of {orbit.num_members}
              </span>
            </div>
            {currentDueDate && orbit.status === "ACTIVE" && (
              <div className="text-xs font-medium text-[var(--orbit-warning)] mt-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Due {new Date(currentDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>
          <div className="orbit-stat-card">
            <h4 className="orbit-eyebrow mb-2">Next Release</h4>
            <div 
              className="text-xl sm:text-2xl font-semibold text-[var(--orbit-brand-light)] line-clamp-2 break-words" 
              title={orbit.status === "COMPLETED" ? "Done" : nextReleaseName}
            >
              {orbit.status === "COMPLETED" ? "Done" : nextReleaseName}
            </div>
          </div>
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Progress & Crew */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cycle Progress Visualizer */}
            <section className="orbit-card">
              <h2 className="text-lg font-medium mb-6 flex items-center gap-2 text-white">
                <Activity className="h-5 w-5 text-[var(--orbit-text-secondary)]" />
                Orbit Progress
              </h2>
              <div className="relative pt-2 pb-6 overflow-x-auto">
                <div className="min-w-[400px]">
                  <div className="orbit-progress-track absolute top-1/2 left-0 w-full -translate-y-1/2 z-0 mt-[-12px]">
                    <div
                      className="orbit-progress-fill orbit-progress-fill-brand"
                      style={{ width: `${(orbit.current_cycle / orbit.num_members) * 100}%` }}
                    ></div>
                  </div>
                  <div className="relative z-10 flex justify-between">
                    {Array.from({ length: orbit.num_members }).map((_, i) => {
                      const step = i + 1;
                      return (
                        <div
                          key={step}
                          className="flex flex-col items-center gap-2"
                        >
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                              step < orbit.current_cycle || orbit.status === "COMPLETED"
                                ? "bg-[var(--orbit-brand)] border-[var(--orbit-brand)] text-white"
                                : step === orbit.current_cycle
                                  ? "bg-[var(--orbit-bg-card)] border-[var(--orbit-brand)] text-[var(--orbit-brand)] shadow-[0_0_15px_rgba(124,110,247,0.4)]"
                                  : "bg-[var(--orbit-bg-elevated)] border-[var(--orbit-border)] text-[var(--orbit-text-muted)]"
                            }`}
                          >
                            {step < orbit.current_cycle || orbit.status === "COMPLETED" ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              step
                            )}
                          </div>
                          <span className="text-xs font-medium text-[var(--orbit-text-secondary)]">
                            Cycle {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* Crew Status */}
            <section className="orbit-card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-[var(--orbit-text-secondary)]" />
                  Crew Status
                </h2>
                <span className="text-sm text-[var(--orbit-text-secondary)]">
                  {orbit.status === 'ACTIVE' ? `${numDeposited} of ${targetDeposits} deposited` : 'N/A'}
                </span>
              </div>

              <div className="space-y-4">
                {crew.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-[var(--radius-orbit-md)] bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] hover:border-[var(--orbit-border-hover)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="orbit-avatar bg-[var(--orbit-brand-bg)] text-[var(--orbit-brand-light)] font-bold">{member.avatar}</div>
                      <span className="font-medium text-sm text-[var(--orbit-text-primary)]">
                        {member.name}
                      </span>
                    </div>
                    {orbit.status === "ACTIVE" && (
                      <div className="flex items-center gap-2">
                        {member.status === "Recipient" ? (
                          <span className="orbit-badge orbit-badge-brand">
                            <Wallet className="h-3 w-3 mr-1" /> Receiving
                          </span>
                        ) : member.status === "Deposited" ? (
                          <span className="orbit-badge orbit-badge-success">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Deposited
                          </span>
                        ) : (
                          <span className="orbit-badge orbit-badge-warning">
                            <CircleDashed className="h-3 w-3 mr-1" /> Pending
                          </span>
                        )}
                      </div>
                    )}
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
                <h2 className="text-lg font-medium mb-2 text-white">
                  Your Deposit
                </h2>
                <p className="text-sm text-[var(--orbit-text-secondary)] mb-6">
                  {orbit.status === "ACTIVE" ? `Cycle ${orbit.current_cycle}` : "Orbit not active"}
                </p>
                <div className="text-4xl font-bold tracking-tight text-[var(--orbit-text-primary)] mb-6">
                  {orbit.deposit_amount}{" "}
                  <span className="text-lg font-normal text-[var(--orbit-text-muted)]">
                    USDC
                  </span>
                </div>
                
                {orbit.status === "ACTIVE" ? (
                  isRecipientThisCycle ? (
                    <div className="p-4 bg-[var(--orbit-brand-bg)] border border-[var(--orbit-brand-border)] rounded-xl flex items-center justify-center gap-2 text-[var(--orbit-brand-light)] text-sm font-semibold text-center leading-relaxed">
                      <Wallet className="h-5 w-5 shrink-0" />
                      <span>You are receiving this cycle's pool!<br/>No deposit required.</span>
                    </div>
                  ) : !hasDeposited ? (
                    <button 
                      onClick={handleDeposit}
                      disabled={isProcessing}
                      className="orbit-btn-primary w-full justify-center py-3 text-[15px] shadow-[0_4px_14px_rgba(124,110,247,0.3)] disabled:opacity-50"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      {isProcessing ? "Processing..." : `Deposit ${orbit.deposit_amount} USDC`}
                    </button>
                  ) : (
                    <div className="p-3 bg-[var(--orbit-success-bg)] border border-[var(--orbit-success)]/20 rounded-xl flex items-center justify-center gap-2 text-[var(--orbit-success)] text-sm font-semibold">
                      <CheckCircle2 className="h-5 w-5" />
                      You have deposited for this cycle.
                    </div>
                  )
                ) : orbit.status === "COMPLETED" ? (
                  <div className="p-3 bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] rounded-xl text-sm text-[var(--orbit-text-secondary)]">
                    Orbit is completed. No more deposits needed!
                  </div>
                ) : (
                  <button disabled className="orbit-btn-neutral w-full justify-center py-3 opacity-50 cursor-not-allowed">
                    Waiting for Orbit to Start
                  </button>
                )}
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
              <h2 className="text-lg font-medium mb-6 shrink-0 text-white">Activity History</h2>
              
              {recentHistory.length === 0 ? (
                <p className="text-sm text-[var(--orbit-text-secondary)] text-center py-4">No activity yet.</p>
              ) : (
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
                        <div className="flex items-center justify-between mt-1">
                          <time className="text-[10px] text-[var(--orbit-text-muted)]">
                            {item.time}
                          </time>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {history.length > 4 && (
                <button 
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="w-full mt-6 py-2.5 text-sm font-medium text-[var(--orbit-text-secondary)] hover:text-white border border-[var(--orbit-border)] rounded-[var(--radius-orbit-md)] hover:bg-[var(--orbit-bg-elevated)] transition-colors shrink-0 cursor-pointer"
                >
                  View All Activity ({history.length})
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
              <h2 className="text-xl font-semibold text-white">Full Activity History</h2>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-2 -mr-2 rounded-full hover:bg-[var(--orbit-bg-elevated)] text-[var(--orbit-text-secondary)] hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-[9px] md:before:left-1/2 md:before:-translate-x-1/2 before:h-full before:w-0.5 before:bg-[var(--orbit-border-strong)]">
                {history.map((item, idx) => (
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
                      <div className="flex items-center justify-between mt-2">
                        <time className="text-xs text-[var(--orbit-text-muted)]">
                          {item.time}
                        </time>
                      </div>
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
        onSave={handleSaveOrder}
        isReadOnly={orbit.status !== "FORMING" && orbit.status !== "READY"}
      />

      {/* Confetti Celebration */}
      {showConfetti && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <Confetti width={width} height={height} recycle={false} numberOfPieces={800} gravity={0.15} />
          <div className="pointer-events-auto bg-[var(--orbit-bg-card)]/95 backdrop-blur-xl border border-[var(--orbit-border-strong)] p-10 rounded-3xl shadow-2xl flex flex-col items-center animate-in zoom-in duration-300">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--orbit-brand-light)] to-[var(--orbit-success)] mb-4 text-center">
              🎉 Congratulations!
            </h2>
            <p className="text-[var(--orbit-text-primary)] text-xl mb-8 font-medium">
              {celebrationMessage}
            </p>
            <button 
              onClick={async () => {
                setShowConfetti(false);
                const highestCompletedCycle = orbit.status === "COMPLETED" ? orbit.num_members : orbit.current_cycle - 1;
                await celebrateCycleAction(orbit.id, userId, highestCompletedCycle);
                fetchData();
              }}
              className="orbit-btn-primary px-10 py-3 text-lg"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
