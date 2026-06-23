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
    return (
      <div className="min-h-screen bg-[var(--orbit-bg-app)] p-6 md:p-10">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-4 w-32 rounded-md bg-[var(--color-orbit-mist-900)] mb-8" style={{ animation: 'skeleton-pulse 2s ease-in-out infinite' }} />
          <div className="h-10 w-64 rounded-lg bg-[var(--color-orbit-mist-900)] mb-3" style={{ animation: 'skeleton-pulse 2s ease-in-out infinite 0.1s' }} />
          <div className="h-4 w-48 rounded-md bg-[var(--color-orbit-mist-900)] mb-8" style={{ animation: 'skeleton-pulse 2s ease-in-out infinite 0.2s' }} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-xl bg-[var(--color-orbit-mist-900)]" style={{ animation: `skeleton-pulse 2s ease-in-out infinite ${0.1 * i}s` }} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-40 rounded-2xl bg-[var(--color-orbit-mist-900)]" style={{ animation: 'skeleton-pulse 2s ease-in-out infinite 0.3s' }} />
              <div className="h-64 rounded-2xl bg-[var(--color-orbit-mist-900)]" style={{ animation: 'skeleton-pulse 2s ease-in-out infinite 0.4s' }} />
            </div>
            <div className="space-y-6">
              <div className="h-72 rounded-2xl bg-[var(--color-orbit-mist-900)]" style={{ animation: 'skeleton-pulse 2s ease-in-out infinite 0.5s' }} />
              <div className="h-48 rounded-2xl bg-[var(--color-orbit-mist-900)]" style={{ animation: 'skeleton-pulse 2s ease-in-out infinite 0.6s' }} />
            </div>
          </div>
        </div>
      </div>
    );
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
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--orbit-text-secondary)] hover:text-[var(--orbit-brand-light)] transition-colors mb-8 group"
          style={{ animation: 'fade-in-up 0.3s ease-out forwards' }}
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to My Orbits
        </Link>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--orbit-danger-bg)] border border-[var(--orbit-danger-border)] text-[var(--orbit-danger)] text-sm">
            {errorMsg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8" style={{ animation: 'fade-in-up 0.4s ease-out forwards' }}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight orbit-gradient-text">
                {orbit.name}
              </h1>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ring-1 ${
                orbit.status === 'ACTIVE' 
                  ? 'text-[var(--orbit-brand-light)] bg-[var(--orbit-brand-bg)] ring-[var(--orbit-brand-border)]' 
                  : orbit.status === 'COMPLETED' 
                    ? 'text-[var(--orbit-success)] bg-[var(--orbit-success-bg)] ring-[var(--orbit-success-border)]' 
                    : 'text-[var(--orbit-warning)] bg-[var(--orbit-warning-bg)] ring-[var(--orbit-warning-border)]'
              }`}>
                {orbit.status}
              </span>
            </div>
            <p className="text-[var(--orbit-text-secondary)] flex items-center gap-2 text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--orbit-success)]" />
              Secured by Smart Contract
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {userRole === "CREATOR" && orbit.status === "FORMING" && (
               <button className="orbit-btn-neutral flex items-center gap-2 opacity-50 cursor-not-allowed rounded-lg text-xs">
                 Waiting for full crew...
               </button>
            )}
            {userRole === "CREATOR" && orbit.status === "READY" && (
               <button 
                onClick={handleStartOrbit}
                disabled={isProcessing}
                className="orbit-btn-primary flex items-center gap-2 rounded-lg shadow-lg shadow-[var(--orbit-brand)]/20"
               >
                 {isProcessing ? "Starting..." : "Start First Cycle"}
               </button>
            )}
            <button 
              onClick={() => setIsEditOrderModalOpen(true)}
              className="orbit-btn-secondary flex items-center gap-2 rounded-lg"
            >
              <ListOrdered className="h-4 w-4" />
              View Release Order
            </button>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" style={{ animation: 'fade-in-up 0.5s ease-out forwards', animationDelay: '0.05s', animationFillMode: 'backwards' }}>
          <div className="orbit-shimmer relative overflow-hidden rounded-xl border border-[var(--orbit-border)] bg-[var(--orbit-bg-card)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--orbit-success-border)]/50 group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--orbit-success)]/50 to-transparent" />
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--orbit-text-muted)] mb-2">Total Pool</h4>
            <div className="text-2xl font-bold text-[var(--orbit-success)] font-mono">
              {totalPool}{" "}
              <span className="text-xs font-medium text-[var(--orbit-text-muted)]">
                USDC
              </span>
            </div>
          </div>
          <div className="orbit-shimmer relative overflow-hidden rounded-xl border border-[var(--orbit-border)] bg-[var(--orbit-bg-card)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--orbit-border-hover)] group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--color-orbit-mist-400)]/20 to-transparent" />
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--orbit-text-muted)] mb-2">Periodic Deposit</h4>
            <div className="text-2xl font-bold text-[var(--orbit-text-primary)] font-mono">
              {orbit.deposit_amount}{" "}
              <span className="text-xs font-medium text-[var(--orbit-text-muted)]">
                USDC
              </span>
            </div>
          </div>
          <div className="orbit-shimmer relative overflow-hidden rounded-xl border border-[var(--orbit-border)] bg-[var(--orbit-bg-card)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--orbit-brand-border)]/50 group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--orbit-brand)]/40 to-transparent" />
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--orbit-text-muted)] mb-2">Current Cycle</h4>
            <div className="text-2xl font-bold text-[var(--orbit-text-primary)] font-mono">
              {orbit.current_cycle}{" "}
              <span className="text-xs font-medium text-[var(--orbit-text-muted)]">
                of {orbit.num_members}
              </span>
            </div>
            {currentDueDate && orbit.status === "ACTIVE" && (
              <div className="text-[11px] font-medium text-[var(--orbit-warning)] mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Due {new Date(currentDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>
          <div className="orbit-shimmer relative overflow-hidden rounded-xl border border-[var(--orbit-border)] bg-[var(--orbit-bg-card)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--orbit-brand-border)]/50 group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--orbit-brand-light)]/40 to-transparent" />
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--orbit-text-muted)] mb-2">Next Release</h4>
            <div 
              className="text-lg sm:text-xl font-bold text-[var(--orbit-brand-light)] line-clamp-2 break-words" 
              title={orbit.status === "COMPLETED" ? "Done" : nextReleaseName}
            >
              {orbit.status === "COMPLETED" ? "Done" : nextReleaseName}
            </div>
          </div>
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" style={{ animation: 'fade-in-up 0.5s ease-out forwards', animationDelay: '0.1s', animationFillMode: 'backwards' }}>
          {/* Left Column: Progress & Crew */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cycle Progress Visualizer */}
            <section className="relative overflow-hidden rounded-2xl border border-[var(--orbit-border)] bg-[var(--orbit-bg-card)] p-6 transition-colors hover:border-[var(--orbit-border-hover)]">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-[var(--orbit-brand)]/5 rounded-full blur-3xl pointer-events-none" />
              <h2 className="text-base font-semibold mb-6 flex items-center gap-2.5 text-white relative z-10">
                <div className="w-7 h-7 rounded-lg bg-[var(--orbit-brand-bg)] flex items-center justify-center ring-1 ring-[var(--orbit-brand-border)]/50">
                  <Activity className="h-3.5 w-3.5 text-[var(--orbit-brand-light)]" />
                </div>
                Orbit Progress
              </h2>
              <div className="relative pt-2 pb-6 overflow-x-auto">
                <div className="min-w-[400px]">
                  <div className="orbit-progress-track absolute top-1/2 left-0 w-full -translate-y-1/2 z-0 mt-[-12px] h-[2px] bg-[var(--color-orbit-mist-800)]/60 rounded-full">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--orbit-brand)] to-[var(--orbit-brand-light)] relative"
                      style={{ width: `${(orbit.current_cycle / orbit.num_members) * 100}%`, transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--orbit-brand-light)] shadow-[0_0_8px_var(--orbit-brand-light)]" />
                    </div>
                  </div>
                  <div className="relative z-10 flex justify-between">
                    {Array.from({ length: orbit.num_members }).map((_, i) => {
                      const step = i + 1;
                      return (
                        <div
                          key={step}
                          className="flex flex-col items-center gap-2.5"
                        >
                          <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                              step < orbit.current_cycle || orbit.status === "COMPLETED"
                                ? "bg-[var(--orbit-brand)] border-[var(--orbit-brand)] text-white shadow-[0_0_12px_rgba(124,110,247,0.3)]"
                                : step === orbit.current_cycle
                                  ? "bg-[var(--orbit-bg-card)] border-[var(--orbit-brand)] text-[var(--orbit-brand-light)] shadow-[0_0_20px_rgba(124,110,247,0.4)] ring-2 ring-[var(--orbit-brand)]/20"
                                  : "bg-[var(--orbit-bg-elevated)] border-[var(--orbit-border)] text-[var(--orbit-text-muted)]"
                            }`}
                          >
                            {step < orbit.current_cycle || orbit.status === "COMPLETED" ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              step
                            )}
                          </div>
                          <span className={`text-[11px] font-medium ${step === orbit.current_cycle ? 'text-[var(--orbit-brand-light)]' : 'text-[var(--orbit-text-muted)]'}`}>
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
            <section className="relative overflow-hidden rounded-2xl border border-[var(--orbit-border)] bg-[var(--orbit-bg-card)] p-6 transition-colors hover:border-[var(--orbit-border-hover)]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-base font-semibold flex items-center gap-2.5 text-white">
                  <div className="w-7 h-7 rounded-lg bg-[var(--orbit-brand-bg)] flex items-center justify-center ring-1 ring-[var(--orbit-brand-border)]/50">
                    <Users className="h-3.5 w-3.5 text-[var(--orbit-brand-light)]" />
                  </div>
                  Crew Status
                </h2>
                <span className="text-xs text-[var(--orbit-text-muted)] font-medium">
                  {orbit.status === 'ACTIVE' ? `${numDeposited} of ${targetDeposits} deposited` : 'N/A'}
                </span>
              </div>

              <div className="space-y-3">
                {crew.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] hover:border-[var(--orbit-border-hover)] transition-all duration-200 hover:bg-[var(--color-orbit-mist-900)]/50 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--orbit-brand-bg)] flex items-center justify-center text-[var(--orbit-brand-light)] font-bold text-sm ring-1 ring-[var(--orbit-brand-border)]/50 shrink-0">
                        {member.avatar}
                      </div>
                      <span className="font-medium text-sm text-[var(--orbit-text-primary)]">
                        {member.name}
                      </span>
                    </div>
                    {orbit.status === "ACTIVE" && (
                      <div className="flex items-center gap-2">
                        {member.status === "Recipient" ? (
                          <span className="text-[11px] font-semibold text-[var(--orbit-brand-light)] bg-[var(--orbit-brand-bg)] px-2.5 py-1 rounded-full ring-1 ring-[var(--orbit-brand-border)] flex items-center gap-1">
                            <Wallet className="h-3 w-3" /> Receiving
                          </span>
                        ) : member.status === "Deposited" ? (
                          <span className="text-[11px] font-semibold text-[var(--orbit-success)] bg-[var(--orbit-success-bg)] px-2.5 py-1 rounded-full ring-1 ring-[var(--orbit-success-border)] flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Deposited
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-[var(--orbit-warning)] bg-[var(--orbit-warning-bg)] px-2.5 py-1 rounded-full ring-1 ring-[var(--orbit-warning-border)] flex items-center gap-1">
                            <CircleDashed className="h-3 w-3" /> Pending
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
            <section className="relative overflow-hidden rounded-2xl border border-[var(--orbit-brand-border)]/50 bg-gradient-to-b from-[var(--orbit-brand-bg)] via-[var(--orbit-bg-card)] to-[var(--orbit-bg-card)] p-6" style={{ animation: 'glow-pulse 6s ease-in-out infinite' }}>
              {/* Decorative glow */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 bg-[var(--orbit-brand)]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 text-center pb-6 border-b border-[var(--orbit-border)]">
                <h2 className="text-base font-semibold mb-1.5 text-white">
                  Your Deposit
                </h2>
                <p className="text-xs text-[var(--orbit-text-muted)] mb-5">
                  {orbit.status === "ACTIVE" ? `Cycle ${orbit.current_cycle}` : "Orbit not active"}
                </p>
                <div className="text-4xl font-bold tracking-tight text-[var(--orbit-text-primary)] mb-6 font-mono">
                  {orbit.deposit_amount}{" "}
                  <span className="text-base font-medium text-[var(--orbit-text-muted)]">
                    USDC
                  </span>
                </div>
                
                {orbit.status === "ACTIVE" ? (
                  isRecipientThisCycle ? (
                    <div className="p-4 bg-[var(--orbit-brand-bg)] border border-[var(--orbit-brand-border)] rounded-xl flex items-center justify-center gap-2.5 text-[var(--orbit-brand-light)] text-sm font-semibold text-center leading-relaxed">
                      <Wallet className="h-5 w-5 shrink-0" />
                      <span>You are receiving this cycle's pool!<br/>No deposit required.</span>
                    </div>
                  ) : !hasDeposited ? (
                    <button 
                      onClick={handleDeposit}
                      disabled={isProcessing}
                      className="orbit-btn-primary w-full justify-center py-3.5 text-sm rounded-lg shadow-lg shadow-[var(--orbit-brand)]/25 disabled:opacity-50 hover:shadow-[var(--orbit-brand)]/35 transition-shadow"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      {isProcessing ? "Processing..." : `Deposit ${orbit.deposit_amount} USDC`}
                    </button>
                  ) : (
                    <div className="p-3.5 bg-[var(--orbit-success-bg)] border border-[var(--orbit-success)]/15 rounded-xl flex items-center justify-center gap-2 text-[var(--orbit-success)] text-sm font-semibold">
                      <CheckCircle2 className="h-5 w-5" />
                      You have deposited for this cycle.
                    </div>
                  )
                ) : orbit.status === "COMPLETED" ? (
                  <div className="p-3.5 bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] rounded-xl text-sm text-[var(--orbit-text-secondary)]">
                    Orbit is completed. No more deposits needed!
                  </div>
                ) : (
                  <button disabled className="orbit-btn-neutral w-full justify-center py-3.5 opacity-50 cursor-not-allowed rounded-lg text-sm">
                    Waiting for Orbit to Start
                  </button>
                )}
              </div>
              <div className="relative z-10 pt-4 text-center">
                <p className="text-[11px] text-[var(--orbit-text-muted)] flex items-center justify-center gap-1.5">
                  <Trophy className="h-3 w-3 text-[var(--orbit-brand-light)]" />
                  On-time deposits boost your Orbit Score.
                </p>
              </div>
            </section>

            {/* Activity History */}
            <section className="relative overflow-hidden rounded-2xl border border-[var(--orbit-border)] bg-[var(--orbit-bg-card)] p-6 flex flex-col transition-colors hover:border-[var(--orbit-border-hover)]">
              <h2 className="text-base font-semibold mb-6 shrink-0 text-white flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[var(--orbit-brand-bg)] flex items-center justify-center ring-1 ring-[var(--orbit-brand-border)]/50">
                  <Activity className="h-3.5 w-3.5 text-[var(--orbit-brand-light)]" />
                </div>
                Activity History
              </h2>
              
              {recentHistory.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-[var(--orbit-text-secondary)]">No activity yet.</p>
                  <p className="text-xs text-[var(--orbit-text-muted)] mt-1">Events will appear here as they happen.</p>
                </div>
              ) : (
                <div className="space-y-4 relative">
                  {/* Timeline line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-[var(--orbit-border)] via-[var(--orbit-border)] to-transparent pointer-events-none" />
                  
                  {recentHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative flex items-start gap-4 pl-2"
                    >
                      <div
                        className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 relative z-10 ring-2 ring-[var(--orbit-bg-card)] ${item.isRelease ? "bg-[var(--orbit-success-bg)]" : "bg-[var(--orbit-brand-bg)]"}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${item.isRelease ? "bg-[var(--orbit-success)]" : "bg-[var(--orbit-brand)]"}`} />
                      </div>
                      <div className="flex-1 min-w-0 p-3 rounded-xl bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] hover:border-[var(--orbit-border-hover)] transition-colors">
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
              )}

              {history.length > 4 && (
                <button 
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="w-full mt-6 py-2.5 text-xs font-medium text-[var(--orbit-text-secondary)] hover:text-white border border-[var(--orbit-border)] rounded-lg hover:bg-[var(--color-orbit-mist-900)]/50 hover:border-[var(--orbit-border-hover)] transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  View All Activity ({history.length})
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Full History Modal */}
      {isHistoryModalOpen && (
        <div className="orbit-modal-overlay">
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setIsHistoryModalOpen(false)}
          />
          <div className="orbit-modal-panel max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[var(--orbit-border)] shrink-0">
              <h2 className="text-lg font-semibold text-white">Full Activity History</h2>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[var(--color-orbit-mist-900)] hover:bg-[var(--color-orbit-mist-800)] flex items-center justify-center text-[var(--orbit-text-secondary)] hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4 relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-[var(--orbit-border)] via-[var(--orbit-border)] to-transparent pointer-events-none" />
                
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative flex items-start gap-4 pl-2"
                  >
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 relative z-10 ring-2 ring-[var(--color-orbit-void-600)] ${item.isRelease ? "bg-[var(--orbit-success-bg)]" : "bg-[var(--orbit-brand-bg)]"}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${item.isRelease ? "bg-[var(--orbit-success)]" : "bg-[var(--orbit-brand)]"}`} />
                    </div>
                    <div className="flex-1 min-w-0 p-3.5 rounded-xl bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)]">
                      <p
                        className={`text-sm font-medium mb-1 ${item.isRelease ? "text-[var(--orbit-success)]" : "text-[var(--orbit-text-primary)]"}`}
                      >
                        {item.action}
                      </p>
                      <time className="text-[11px] text-[var(--orbit-text-muted)]">
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
        onSave={handleSaveOrder}
        isReadOnly={orbit.status !== "FORMING" && orbit.status !== "READY"}
      />

      {/* Confetti Celebration */}
      {showConfetti && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <Confetti width={width} height={height} recycle={false} numberOfPieces={800} gravity={0.15} />
          <div className="pointer-events-auto orbit-modal-panel border-[var(--orbit-border-strong)] p-10 flex flex-col items-center" style={{ maxWidth: '28rem' }}>
            {/* Radial glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-radial from-[var(--orbit-brand)]/20 to-transparent rounded-full blur-2xl pointer-events-none" />
            <h2 className="text-3xl font-bold orbit-gradient-text mb-4 text-center relative z-10 flex items-center gap-2.5 justify-center">
              <Trophy className="w-8 h-8 text-yellow-500 animate-bounce" /> Congratulations!
            </h2>
            <p className="text-[var(--orbit-text-primary)] text-xl mb-8 font-medium relative z-10">
              {celebrationMessage}
            </p>
            <button 
              onClick={async () => {
                setShowConfetti(false);
                const highestCompletedCycle = orbit.status === "COMPLETED" ? orbit.num_members : orbit.current_cycle - 1;
                await celebrateCycleAction(orbit.id, userId, highestCompletedCycle);
                fetchData();
              }}
              className="orbit-btn-primary px-10 py-3 text-lg rounded-lg shadow-lg shadow-[var(--orbit-brand)]/25 relative z-10"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

