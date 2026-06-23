"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, PlusCircle, Users, Wallet, CheckCircle2, ChevronRight, X, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { addFundsToWallet } from "@/app/actions/wallet";
import { OrbitLoader } from "@/components/orbit-loader";

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [totalSaved, setTotalSaved] = useState(0);

  const [walletBalance, setWalletBalance] = useState(0);
  const [activeOrbits, setActiveOrbits] = useState(0);
  const [achievements, setAchievements] = useState(0);
  const [isFundingOpen, setIsFundingOpen] = useState(false);
  const [fundingStep, setFundingStep] = useState<"amount" | "checkout" | "processing" | "success">("amount");
  const [fundingAmount, setFundingAmount] = useState<number>(0);
  const [activeOrbitsList, setActiveOrbitsList] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/?auth=open");
        return;
      }

      // Fetch user profile
      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setWalletBalance(Number(profileData.wallet_balance) || 0);
      }

      // Fetch active orbits count and data
      const { data: userMemberships } = await supabase
        .from("orbit_members")
        .select("orbit_id, payout_order")
        .eq("user_id", user.id);

      if (userMemberships && userMemberships.length > 0) {
        const orbitIds = userMemberships.map(m => m.orbit_id);
        
        const { data: orbitsData } = await supabase
          .from("orbits")
          .select("*")
          .in("id", orbitIds)
          .neq("status", "COMPLETED")
          .order("created_at", { ascending: false });

        setActiveOrbits(orbitsData ? orbitsData.length : 0);

        if (orbitsData && orbitsData.length > 0) {
          const activeIds = orbitsData.map(o => o.id);
          
          const { data: depositsData } = await supabase
            .from("deposits")
            .select("orbit_id, cycle_number, status, user_id, due_date")
            .in("orbit_id", activeIds);

          const formatted = orbitsData.map(orbit => {
            const membership = userMemberships.find(m => m.orbit_id === orbit.id);
            const total = orbit.num_members;
            const targetDeposits = total - 1;
            const pool = Number(orbit.deposit_amount) * targetDeposits;
            
            const currentDeposits = (depositsData || []).filter(d => d.orbit_id === orbit.id && d.cycle_number === orbit.current_cycle);
            const numDeposited = currentDeposits.filter(d => d.status === "PAID").length;
            
            const myDeposit = currentDeposits.find(d => d.user_id === user.id);
            const isRecipient = membership?.payout_order === orbit.current_cycle;
            const hasDeposited = isRecipient || (myDeposit && myDeposit.status === "PAID");
            
            const progressPercent = Math.max(0, Math.min(100, Math.round((numDeposited / targetDeposits) * 100)));

            return {
              id: orbit.id,
              name: orbit.name,
              cycle: orbit.current_cycle,
              totalCycles: total,
              poolAmount: pool,
              numDeposited,
              targetDeposits,
              progressPercent,
              hasDeposited,
              isRecipient,
              dueDate: myDeposit?.due_date || null,
            };
          });
          
          setActiveOrbitsList(formatted.slice(0, 2));
        } else {
          setActiveOrbitsList([]);
        }
      } else {
        setActiveOrbits(0);
        setActiveOrbitsList([]);
      }

      // Calculate Total Saved
      const { data: myDeposits } = await supabase
        .from("deposits")
        .select("amount")
        .eq("user_id", user.id)
        .eq("status", "PAID");

      const calculatedTotalSaved = myDeposits?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      setTotalSaved(calculatedTotalSaved);

      // Fetch activity feed
      const { data: activityData } = await supabase
        .from("activity_feed")
        .select(`
          id,
          action_type,
          message,
          created_at,
          orbits ( name ),
          users ( full_name )
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (activityData) {
        setActivities(activityData);
      }

      // Fetch achievements count
      const { count: badgeCount } = await supabase
        .from("user_badges")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);

      setAchievements(badgeCount || 0);

      setIsPageLoading(false);
    }
    loadData();
  }, [router]);

  if (isPageLoading) {
    return <OrbitLoader text="Syncing Dashboard Workspace..." />;
  }

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getActivityIcon = (type: string, name?: string) => {
    if (type === 'PAYOUT') return <CheckCircle2 className="text-[var(--orbit-success)]" size={18} />;
    if (type === 'JOINED' || type === 'CREATED') return <Users className="text-[var(--orbit-warning)]" size={18} />;
    const initial = name ? name.charAt(0).toUpperCase() : 'O';
    return <span className="text-sm font-bold text-[var(--orbit-brand-light)]">{initial}</span>;
  };

  const getActivityBg = (type: string) => {
    if (type === 'PAYOUT') return "bg-[var(--orbit-success-bg)]";
    if (type === 'JOINED' || type === 'CREATED') return "bg-[var(--orbit-warning-bg)]";
    return "bg-[var(--orbit-brand-bg)]";
  };

  const openFundingModal = () => {
    setFundingStep("amount");
    setFundingAmount(0);
    setIsFundingOpen(true);
  };

  const closeFundingModal = () => setIsFundingOpen(false);

  const handleAmountSelect = (amount: number) => {
    setFundingAmount(amount);
    setFundingStep("checkout");
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFundingStep("processing");

    // Pseudo loading delay for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 1500));

    const res = await addFundsToWallet(profile.id, fundingAmount);
    if (res.success) {
      setWalletBalance(res.newBalance ?? 0);
      setFundingStep("success");
    } else {
      alert("Failed to add funds. Please try again.");
      setFundingStep("checkout");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning,";
    if (hour < 18) return "Good afternoon,";
    return "Good evening,";
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-6xl mx-auto w-full relative">
      
      {/* ── Guidance Banner ── */}
      {walletBalance === 0 ? (
        <div 
          className="relative rounded-xl p-[1px] overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--color-orbit-violet-600), var(--color-orbit-violet-900), var(--color-orbit-void-700))' }}
        >
          <div className="bg-[var(--orbit-bg-card)] rounded-[11px] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ animation: 'fade-in-up 0.5s ease-out forwards' }}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[var(--orbit-brand-bg)] flex items-center justify-center shrink-0 ring-1 ring-[var(--orbit-brand-border)]" style={{ boxShadow: '0 0 16px rgba(124, 110, 247, 0.2)' }}>
                <AlertCircle className="text-[var(--orbit-brand-light)]" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Your wallet is ready.</h3>
                <p className="text-xs text-[var(--orbit-text-secondary)] mt-0.5">Add funds to start contributing to savings circles.</p>
              </div>
            </div>
            <button onClick={openFundingModal} className="orbit-btn-primary px-5 py-2.5 text-sm shrink-0 rounded-lg shadow-lg shadow-[var(--orbit-brand)]/20 hover:shadow-[var(--orbit-brand)]/30 transition-shadow">
              Add Funds
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : activeOrbits === 0 ? (
        <div 
          className="relative rounded-xl p-[1px] overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--color-orbit-teal-600), var(--color-orbit-teal-900), var(--color-orbit-void-700))' }}
        >
          <div className="bg-[var(--orbit-bg-card)] rounded-[11px] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ animation: 'fade-in-up 0.5s ease-out forwards' }}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[var(--orbit-success-bg)] flex items-center justify-center shrink-0 ring-1 ring-[var(--orbit-success-border)]" style={{ boxShadow: '0 0 16px rgba(90, 206, 167, 0.15)' }}>
                <CheckCircle2 className="text-[var(--orbit-success)]" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">You are ready to start saving with others.</h3>
                <p className="text-xs text-[var(--orbit-text-secondary)] mt-0.5">Create or join an Orbit.</p>
              </div>
            </div>
            <div className="flex gap-2.5 shrink-0">
              <button onClick={() => router.push("/orbits?action=create")} className="orbit-btn-primary px-4 py-2.5 text-sm rounded-lg shadow-lg shadow-[var(--orbit-brand)]/20">Create Orbit</button>
              <button onClick={() => router.push("/orbits?action=join")} className="orbit-btn-secondary px-4 py-2.5 text-sm rounded-lg">Join Orbit</button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Greeting ── */}
      <div className="flex flex-col gap-1" style={{ animation: 'fade-in-up 0.4s ease-out forwards' }}>
        <p className="text-sm font-medium text-[var(--orbit-text-secondary)] tracking-wide">
          {getGreeting()}
        </p>
        <h1 className="text-3xl sm:text-4xl leading-tight font-bold orbit-gradient-text">
          {profile?.full_name ? profile.full_name.split(' ')[0] : 'Member'}
        </h1>
        <p className="text-sm text-[var(--orbit-text-muted)] mt-0.5">Here's your savings overview.</p>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5" style={{ animation: 'fade-in-up 0.5s ease-out forwards', animationDelay: '0.05s', animationFillMode: 'backwards' }}>
        
        {/* Wallet Balance — primary stat */}
        <div className="orbit-shimmer group relative overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[148px] border border-[var(--orbit-brand-border)] bg-gradient-to-br from-[var(--orbit-brand-bg)] via-[var(--orbit-bg-card)] to-[var(--orbit-bg-card)]" style={{ animation: 'glow-pulse 4s ease-in-out infinite' }}>
          {/* Accent top bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--color-orbit-violet-500)] via-[var(--color-orbit-violet-400)] to-transparent" />
          {/* Glow orb */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--orbit-brand)]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[var(--orbit-brand)]/20 transition-colors duration-700" />
          
          <div className="relative z-10 p-5 pb-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--orbit-brand-light)] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--orbit-brand-light)] animate-pulse shadow-[0_0_8px_var(--orbit-brand-light)]" />
              Wallet Balance
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-white font-mono">{walletBalance.toLocaleString("en-US", {minimumFractionDigits: 2})}</span>
              <span className="text-sm font-semibold text-[var(--orbit-brand-light)] opacity-80">USDC</span>
            </div>
          </div>
          
          <div className="relative z-10 px-5 pb-4 pt-3 flex justify-end">
            {walletBalance === 0 ? (
              <button onClick={openFundingModal} className="flex items-center gap-1.5 bg-[var(--orbit-brand-light)] text-black px-3.5 py-1.5 rounded-full text-xs font-semibold hover:bg-white transition-colors shadow-sm">
                <Wallet size={12} />
                Add Funds
              </button>
            ) : (
              <button onClick={openFundingModal} className="flex items-center gap-1 text-xs font-medium text-[var(--orbit-brand-light)] hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/5">
                <PlusCircle size={13} />
                Top up
              </button>
            )}
          </div>
        </div>

        {/* Active Orbits */}
        <div className="orbit-shimmer group relative overflow-hidden rounded-xl border border-[var(--orbit-border)] bg-[var(--orbit-bg-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--orbit-brand-border)] min-h-[148px]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--color-orbit-violet-400)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[var(--orbit-brand)]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[var(--orbit-brand)]/10 transition-colors duration-700" />
          <div className="relative z-10 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--orbit-text-secondary)] mb-3">
              Active Orbits
            </div>
            <div className="text-4xl font-bold tracking-tight text-[var(--orbit-text-primary)] group-hover:text-[var(--orbit-brand-light)] transition-colors font-mono">{activeOrbits}</div>
            <p className="text-[11px] text-[var(--orbit-text-muted)] mt-3">{activeOrbits === 0 ? 'No active circles' : `${activeOrbits} circle${activeOrbits > 1 ? 's' : ''} running`}</p>
          </div>
        </div>

        {/* Orbit Score */}
        <div className="orbit-shimmer group relative overflow-hidden rounded-xl border border-[var(--orbit-border)] bg-[var(--orbit-bg-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--orbit-success-border)] min-h-[148px]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--orbit-success)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[var(--orbit-success)]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[var(--orbit-success)]/10 transition-colors duration-700" />
          <div className="relative z-10 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--orbit-text-secondary)] mb-3">
              Orbit Score
            </div>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold tracking-tight text-[var(--orbit-success)] font-mono">{profile?.orbit_score || 0}</span>
              {/* Mini score ring */}
              <svg className="w-8 h-8 -rotate-90 opacity-50 group-hover:opacity-80 transition-opacity" viewBox="0 0 36 36">
                <circle className="stroke-[var(--color-orbit-mist-800)]" strokeWidth="3" cx="18" cy="18" r="14" fill="transparent" />
                <circle className="stroke-[var(--orbit-success)]" strokeWidth="3" strokeLinecap="round" cx="18" cy="18" r="14" fill="transparent" strokeDasharray="88" strokeDashoffset={88 - (88 * (profile?.orbit_score || 0) / 100)} />
              </svg>
            </div>
            <p className="text-[11px] text-[var(--orbit-text-muted)] mt-3">{profile?.tier || 'Newcomer'}</p>
          </div>
        </div>

        {/* Total Saved */}
        <div className="orbit-shimmer group relative overflow-hidden rounded-xl border border-[var(--orbit-border)] bg-[var(--orbit-bg-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--orbit-border-hover)] min-h-[148px]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--color-orbit-mist-400)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--orbit-text-secondary)] mb-3 flex items-center gap-2">
              Total Saved
              {totalSaved > 0 && (
                <span className="text-[9px] font-bold text-[var(--orbit-success)] bg-[var(--orbit-success-bg)] px-1.5 py-0.5 rounded-full">↑</span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-[var(--orbit-text-primary)] group-hover:text-white transition-colors font-mono">{totalSaved}</span>
              <span className="text-sm font-semibold text-[var(--orbit-text-muted)]">USDC</span>
            </div>
            <p className="text-[11px] text-[var(--orbit-text-muted)] mt-3">Lifetime contributions</p>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="flex flex-col gap-4" style={{ animation: 'fade-in-up 0.5s ease-out forwards', animationDelay: '0.1s', animationFillMode: 'backwards' }}>
        <h3 className="orbit-eyebrow text-[11px] tracking-widest text-[var(--orbit-text-muted)]">QUICK ACTIONS</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/orbits?action=create" className="orbit-shimmer flex items-center gap-4 bg-[var(--orbit-bg-card)] border border-[var(--orbit-border)] hover:border-[var(--orbit-brand-border)] p-5 rounded-xl transition-all duration-300 group text-left shadow-sm hover:shadow-lg hover:shadow-[var(--orbit-brand)]/5 hover:-translate-y-0.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-orbit-violet-600)]/30 to-[var(--orbit-brand-bg)] flex items-center justify-center shrink-0 group-hover:from-[var(--color-orbit-violet-600)]/50 transition-all duration-300 ring-1 ring-[var(--orbit-brand-border)]/50">
              <PlusCircle className="text-[var(--orbit-brand-light)]" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white">Create Orbit</h4>
              <p className="text-xs text-[var(--orbit-text-secondary)] mt-0.5">Start a new savings circle.</p>
            </div>
            <ChevronRight size={16} className="text-[var(--orbit-text-muted)] group-hover:text-[var(--orbit-brand-light)] group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
          
          <Link href="/orbits?action=join" className="orbit-shimmer flex items-center gap-4 bg-[var(--orbit-bg-card)] border border-[var(--orbit-border)] hover:border-[var(--orbit-brand-border)] p-5 rounded-xl transition-all duration-300 group text-left shadow-sm hover:shadow-lg hover:shadow-[var(--orbit-brand)]/5 hover:-translate-y-0.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-orbit-void-400)]/50 to-[var(--color-orbit-void-500)]/50 flex items-center justify-center shrink-0 group-hover:from-[var(--color-orbit-violet-600)]/30 group-hover:to-[var(--orbit-brand-bg)] transition-all duration-300 ring-1 ring-[var(--orbit-border)]/50 group-hover:ring-[var(--orbit-brand-border)]/50">
              <Users className="text-[var(--orbit-text-primary)] group-hover:text-[var(--orbit-brand-light)] transition-colors" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white">Join Orbit</h4>
              <p className="text-xs text-[var(--orbit-text-secondary)] mt-0.5">Join with an invite link.</p>
            </div>
            <ChevronRight size={16} className="text-[var(--orbit-text-muted)] group-hover:text-[var(--orbit-brand-light)] group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          <button onClick={openFundingModal} className="orbit-shimmer flex items-center gap-4 bg-[var(--orbit-bg-card)] border border-[var(--orbit-border)] hover:border-[var(--orbit-brand-border)] p-5 rounded-xl transition-all duration-300 group text-left shadow-sm hover:shadow-lg hover:shadow-[var(--orbit-brand)]/5 hover:-translate-y-0.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-orbit-void-400)]/50 to-[var(--color-orbit-void-500)]/50 flex items-center justify-center shrink-0 group-hover:from-[var(--color-orbit-violet-600)]/30 group-hover:to-[var(--orbit-brand-bg)] transition-all duration-300 ring-1 ring-[var(--orbit-border)]/50 group-hover:ring-[var(--orbit-brand-border)]/50">
              <Wallet className="text-[var(--orbit-text-primary)] group-hover:text-[var(--orbit-brand-light)] transition-colors" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white">Add Funds</h4>
              <p className="text-xs text-[var(--orbit-text-secondary)] mt-0.5">Top up your wallet balance.</p>
            </div>
            <ChevronRight size={16} className="text-[var(--orbit-text-muted)] group-hover:text-[var(--orbit-brand-light)] group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-2" style={{ animation: 'fade-in-up 0.5s ease-out forwards', animationDelay: '0.15s', animationFillMode: 'backwards' }}>
        {/* ── Main Content Column ── */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          
          {/* Active Orbits Section */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="orbit-eyebrow text-[11px] tracking-widest text-[var(--orbit-text-muted)]">
                ACTIVE ORBITS
              </h3>
              {activeOrbits > 0 && (
                <a href="/orbits" className="text-xs font-medium text-[var(--orbit-brand-light)] hover:text-white transition-colors flex items-center gap-1 group">
                  View all
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}
            </div>

            {activeOrbits === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-[var(--orbit-bg-card)] border border-[var(--orbit-border)] rounded-2xl border-dashed relative overflow-hidden">
                {/* Subtle decorative elements */}
                <div className="absolute top-6 right-8 w-20 h-20 bg-[var(--orbit-brand)]/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-6 left-8 w-16 h-16 bg-[var(--orbit-success)]/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="w-16 h-16 rounded-2xl bg-[var(--orbit-bg-elevated)] flex items-center justify-center mb-5 ring-1 ring-[var(--orbit-border)]" style={{ animation: 'float-subtle 4s ease-in-out infinite' }}>
                  <Users className="text-[var(--orbit-text-muted)]" size={28} />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">You haven't joined any Orbit yet.</h4>
                <p className="text-sm text-[var(--orbit-text-secondary)] text-center max-w-sm mb-7 leading-relaxed">
                  Create your first savings circle or join one using an invite link to start saving with others.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => router.push("/orbits?action=create")} className="orbit-btn-primary text-sm px-6 py-2.5 rounded-lg shadow-lg shadow-[var(--orbit-brand)]/15">Create Orbit</button>
                  <button onClick={() => router.push("/orbits?action=join")} className="orbit-btn-secondary text-sm px-6 py-2.5 rounded-lg">Join Orbit</button>
                </div>
              </div>
            ) : activeOrbitsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-[var(--orbit-bg-card)] border border-[var(--orbit-border)] rounded-2xl relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-[var(--orbit-bg-elevated)] flex items-center justify-center mb-5 ring-1 ring-[var(--orbit-border)]" style={{ animation: 'float-subtle 4s ease-in-out infinite' }}>
                  <AlertCircle className="text-[var(--orbit-text-muted)]" size={28} />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">No Active Orbits yet</h4>
                <p className="text-sm text-[var(--orbit-text-secondary)] text-center max-w-sm mb-7 leading-relaxed">
                  Your joined orbits are currently waiting for members or pending start. Check 'My Orbits' to manage them.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => router.push("/orbits")} className="orbit-btn-primary text-sm px-6 py-2.5 rounded-lg shadow-lg shadow-[var(--orbit-brand)]/15">Go to My Orbits</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {activeOrbitsList.map((orbit, index) => (
                  <div key={orbit.id} className={`orbit-shimmer group relative rounded-2xl overflow-hidden transition-all duration-300 border bg-gradient-to-b from-[var(--orbit-bg-card)] to-[var(--color-orbit-void-800)] ${!orbit.hasDeposited ? 'border-[var(--orbit-warning-border)]/50 hover:border-[var(--orbit-warning-border)] hover:shadow-xl hover:shadow-[var(--orbit-warning)]/5' : 'border-[var(--orbit-border)] hover:border-[var(--orbit-brand-border)] hover:shadow-xl hover:shadow-[var(--orbit-brand)]/5'}`}>
                    {/* Accent left bar */}
                    <div className={`absolute top-0 left-0 w-[3px] h-full ${!orbit.hasDeposited ? 'bg-gradient-to-b from-[var(--orbit-warning)] to-[var(--orbit-warning)]/30' : 'bg-gradient-to-b from-[var(--orbit-brand)] to-[var(--orbit-brand)]/30'}`} />
                    {/* Background gradient mesh */}
                    <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity duration-700 ${!orbit.hasDeposited ? 'bg-[var(--orbit-warning)]/10' : 'bg-[var(--orbit-brand)]/10'}`} />
                    
                    <div className="relative z-10 p-6 flex flex-col gap-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className={`font-semibold text-lg text-white transition-colors ${!orbit.hasDeposited ? 'group-hover:text-[var(--orbit-warning)]' : 'group-hover:text-[var(--orbit-brand-light)]'}`}>
                            {orbit.name}
                          </h4>
                          <p className="text-xs text-[var(--orbit-text-secondary)] mt-1.5 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1">Cycle {orbit.cycle}/{orbit.totalCycles}</span>
                            <span className="text-[var(--orbit-text-muted)]">•</span>
                            <span>{orbit.totalCycles} members</span>
                          </p>
                        </div>
                        <button onClick={() => router.push(`/orbits/${orbit.id}`)} className="orbit-btn-neutral rounded-full px-4 py-1.5 text-xs font-semibold active:scale-95 transition-all hover:bg-[var(--orbit-brand-bg)] hover:text-[var(--orbit-brand-light)] hover:border-[var(--orbit-brand-border)]">
                          Open <ArrowRight size={13} className="inline ml-1" />
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="h-[0.5px] bg-[var(--orbit-border)]" />

                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-[var(--orbit-text-secondary)]">
                          Pool: <span className="text-white font-semibold text-sm font-mono">{orbit.poolAmount} USDC</span>
                        </span>
                        {orbit.isRecipient ? (
                          <span className="text-[11px] font-semibold text-[var(--orbit-brand-light)] bg-[var(--orbit-brand-bg)] px-3 py-1.5 rounded-full ring-1 ring-[var(--orbit-brand-border)] flex items-center gap-1.5">
                            <CheckCircle2 size={12} />
                            Receiving
                          </span>
                        ) : orbit.hasDeposited ? (
                          <span className="text-[11px] font-semibold text-[var(--orbit-success)] bg-[var(--orbit-success-bg)] px-3 py-1.5 rounded-full ring-1 ring-[var(--orbit-success)]/20 flex items-center gap-1.5">
                            <CheckCircle2 size={12} />
                            Deposited
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-[var(--orbit-warning)] bg-[var(--orbit-warning-bg)] px-3 py-1.5 rounded-full flex items-center gap-2 ring-1 ring-[var(--orbit-warning-border)] whitespace-nowrap">
                            <span className="relative flex h-2 w-2">
                              <span className="w-2 h-2 rounded-full bg-[var(--orbit-warning)] animate-ping absolute inset-0" />
                              <span className="w-2 h-2 rounded-full bg-[var(--orbit-warning)] relative" />
                            </span>
                            Deposit Due
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="orbit-progress-track mb-2.5 h-1.5 bg-[var(--color-orbit-mist-800)]/60 rounded-full overflow-hidden">
                          <div
                            className={`orbit-progress-fill rounded-full h-full relative ${!orbit.hasDeposited ? 'bg-[var(--orbit-warning)]' : 'bg-gradient-to-r from-[var(--orbit-brand)] to-[var(--orbit-brand-light)]'}`}
                            style={{ width: `${orbit.progressPercent}%`, transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
                          >
                            {/* Glowing leading edge */}
                            <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${!orbit.hasDeposited ? 'bg-[var(--orbit-warning)] shadow-[0_0_8px_var(--orbit-warning)]' : 'bg-[var(--orbit-brand-light)] shadow-[0_0_8px_var(--orbit-brand-light)]'}`} />
                          </div>
                        </div>
                        <p className="text-[11px] font-medium text-[var(--orbit-text-secondary)]">
                          {orbit.numDeposited} of {orbit.targetDeposits} deposits funded
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Activity Feed ── */}
          <div className="flex flex-col gap-5">
            <h3 className="orbit-eyebrow text-[11px] tracking-widest text-[var(--orbit-text-muted)]">
              RECENT ACTIVITY
            </h3>
            <div className="bg-[var(--orbit-bg-card)] border border-[var(--orbit-border)] rounded-2xl overflow-hidden">
              {activities.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-[var(--orbit-text-secondary)]">No recent activity yet.</p>
                  <p className="text-xs text-[var(--orbit-text-muted)] mt-1">Activity from your orbits will show up here.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[31px] top-4 bottom-4 w-[1px] bg-gradient-to-b from-[var(--orbit-border)] via-[var(--orbit-border)] to-transparent pointer-events-none" />
                  
                  {activities.map((activity, idx) => (
                    <div key={activity.id} className={`flex items-center gap-4 px-4 py-3.5 hover:bg-[var(--color-orbit-mist-900)]/50 transition-colors relative ${idx !== activities.length - 1 ? '' : ''}`}>
                      <div className={`w-10 h-10 rounded-full ${getActivityBg(activity.action_type)} flex items-center justify-center shrink-0 relative z-10 ring-2 ring-[var(--orbit-bg-card)]`}>
                        {getActivityIcon(activity.action_type, activity.users?.full_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{activity.message}</p>
                        <p className="text-[11px] text-[var(--orbit-text-muted)] mt-0.5 flex items-center gap-1.5">
                          <span className="text-[var(--orbit-text-secondary)]">{activity.orbits?.name || 'Orbit'}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(activity.created_at)}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Side Column ── */}
        <div className="flex flex-col gap-8">
          {/* Orbit Score Preview Card */}
          <div className="flex flex-col gap-5">
            <h3 className="orbit-eyebrow text-[11px] tracking-widest text-[var(--orbit-text-muted)]">
              YOUR REPUTATION
            </h3>
            <div className="bg-[var(--orbit-bg-card)] border border-[var(--orbit-border)] rounded-2xl p-6 relative overflow-hidden flex flex-col items-center text-center group hover:border-[var(--orbit-success-border)]/50 transition-colors duration-500">
              {/* Decorative glows */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--orbit-success)]/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none group-hover:bg-[var(--orbit-success)]/10 transition-colors duration-700" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--orbit-brand)]/5 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />
              
              {/* Score ring */}
              <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
                {/* Radial glow behind score */}
                <div className="absolute inset-4 rounded-full bg-[var(--orbit-success)]/5 blur-xl pointer-events-none" />
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle className="stroke-[var(--color-orbit-mist-800)]" strokeWidth="6" cx="50" cy="50" r="40" fill="transparent" />
                  <circle
                    className="stroke-[var(--orbit-success)]"
                    strokeWidth="6"
                    strokeLinecap="round"
                    cx="50" cy="50" r="40"
                    fill="transparent"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * (profile?.orbit_score || 0) / 100)}
                    style={{ animation: 'score-ring-fill 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards', filter: 'drop-shadow(0 0 4px rgba(90, 206, 167, 0.3))' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-[var(--orbit-success)] font-mono">{profile?.orbit_score || 0}</span>
                </div>
              </div>

              {/* Tier badge */}
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[var(--orbit-success-bg)] to-transparent px-3 py-1 rounded-full ring-1 ring-[var(--orbit-success-border)] mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--orbit-success)]" />
                <span className="text-sm font-bold text-white">{profile?.tier || 'Newcomer'}</span>
              </div>
              <p className="text-xs text-[var(--orbit-text-secondary)] mb-6">Build your reputation with on-time deposits.</p>

              <div className="w-full grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[var(--orbit-bg-app)] rounded-xl p-3.5 text-center border border-[var(--orbit-border)] hover:border-[var(--orbit-border-hover)] transition-colors">
                  <div className="text-[11px] text-[var(--orbit-text-muted)] mb-1.5 font-medium">Reliability</div>
                  <div className="text-lg font-bold text-white font-mono">{profile?.reliability_rate || 100}%</div>
                </div>
                <div className="bg-[var(--orbit-bg-app)] rounded-xl p-3.5 text-center border border-[var(--orbit-border)] hover:border-[var(--orbit-border-hover)] transition-colors">
                  <div className="text-[11px] text-[var(--orbit-text-muted)] mb-1.5 font-medium">Achievements</div>
                  <div className="text-lg font-bold text-white font-mono">{achievements}</div>
                </div>
              </div>

              <Link href="/score" className="w-full orbit-btn-secondary py-3 flex items-center justify-center gap-2 group/link rounded-lg hover:bg-[var(--orbit-success-bg)] hover:border-[var(--orbit-success-border)] hover:text-[var(--orbit-success)] transition-all">
                View Full Orbit Score
                <ChevronRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Funding Modal ── */}
      {isFundingOpen && (
        <div className="orbit-modal-overlay">
          <div className="orbit-modal-panel">
            {/* Decorative glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-[var(--orbit-brand)]/10 rounded-full blur-3xl pointer-events-none" />
            
            <button onClick={closeFundingModal} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[var(--color-orbit-mist-900)] hover:bg-[var(--color-orbit-mist-800)] flex items-center justify-center text-[var(--orbit-text-secondary)] hover:text-white transition-colors z-10">
              <X size={16} />
            </button>
            
            {fundingStep === "amount" && (
              <div className="p-6 md:p-8 relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-orbit-violet-600)]/30 to-[var(--orbit-brand-bg)] ring-1 ring-[var(--orbit-brand-border)] mb-6" style={{ boxShadow: '0 0 20px rgba(124, 110, 247, 0.15)' }}>
                  <Wallet className="text-[var(--orbit-brand-light)]" size={22} />
                </div>
                <h2 className="text-xl font-bold text-white mb-1.5">Add Funds</h2>
                <p className="text-sm text-[var(--orbit-text-secondary)] mb-8">Select an amount to top up your wallet.</p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[50, 100, 250, 500].map(amount => (
                    <button 
                      key={amount}
                      onClick={() => handleAmountSelect(amount)}
                      className="group/amt border border-[var(--orbit-border)] hover:border-[var(--orbit-brand-border)] bg-[var(--orbit-bg-app)] hover:bg-[var(--orbit-brand-bg)] text-white py-4 rounded-xl font-semibold transition-all duration-200 flex flex-col items-center hover:shadow-lg hover:shadow-[var(--orbit-brand)]/10 hover:-translate-y-0.5 active:scale-[0.97]"
                    >
                      <span className="text-xl font-mono group-hover/amt:text-[var(--orbit-brand-light)] transition-colors">{amount}</span>
                      <span className="text-[11px] text-[var(--orbit-text-muted)] group-hover/amt:text-[var(--orbit-brand-light)]/70 transition-colors mt-0.5">USDC</span>
                    </button>
                  ))}
                </div>
                
                <div className="mt-4">
                  <label className="text-[11px] text-[var(--orbit-text-secondary)] font-medium mb-2 block uppercase tracking-wider">Custom Amount</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-[var(--orbit-brand)] focus:ring-1 focus:ring-[var(--orbit-brand)]/30 transition-all pl-16 font-mono text-lg"
                      onChange={(e) => setFundingAmount(Number(e.target.value))}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--orbit-brand-light)]">USDC</span>
                  </div>
                  <button onClick={() => fundingAmount > 0 && handleAmountSelect(fundingAmount)} className={`w-full orbit-btn-primary py-3.5 mt-4 rounded-lg text-sm ${fundingAmount === 0 ? 'opacity-40 cursor-not-allowed' : 'shadow-lg shadow-[var(--orbit-brand)]/20'}`}>Continue</button>
                </div>
              </div>
            )}

            {fundingStep === "checkout" && (
              <div className="p-6 md:p-8 relative">
                <h2 className="text-xl font-bold text-white mb-1.5">Checkout</h2>
                <p className="text-sm text-[var(--orbit-text-secondary)] mb-6">You are funding <span className="font-bold text-white font-mono">{fundingAmount} USDC</span></p>
                
                <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-[11px] text-[var(--orbit-text-secondary)] font-medium mb-1.5 block uppercase tracking-wider">Cardholder Name</label>
                    <input required type="text" defaultValue={profile?.full_name || ""} className="w-full bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--orbit-brand)] focus:ring-1 focus:ring-[var(--orbit-brand)]/30 transition-all" />
                  </div>
                  <div>
                    <label className="text-[11px] text-[var(--orbit-text-secondary)] font-medium mb-1.5 block uppercase tracking-wider">Card Number</label>
                    <input required type="text" defaultValue="4242 4242 4242 4242" className="w-full bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-xl py-3 px-4 text-white font-mono focus:outline-none focus:border-[var(--orbit-brand)] focus:ring-1 focus:ring-[var(--orbit-brand)]/30 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[var(--orbit-text-secondary)] font-medium mb-1.5 block uppercase tracking-wider">Expiry</label>
                      <input required type="text" defaultValue="12/28" className="w-full bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-xl py-3 px-4 text-white font-mono focus:outline-none focus:border-[var(--orbit-brand)] focus:ring-1 focus:ring-[var(--orbit-brand)]/30 transition-all" />
                    </div>
                    <div>
                      <label className="text-[11px] text-[var(--orbit-text-secondary)] font-medium mb-1.5 block uppercase tracking-wider">CVV</label>
                      <input required type="text" defaultValue="123" className="w-full bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-xl py-3 px-4 text-white font-mono focus:outline-none focus:border-[var(--orbit-brand)] focus:ring-1 focus:ring-[var(--orbit-brand)]/30 transition-all" />
                    </div>
                  </div>
                  
                  <button type="submit" className="w-full orbit-btn-primary py-3.5 mt-2 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-[var(--orbit-brand)]/20 text-sm">
                    Pay {fundingAmount} USDC <ArrowRight size={16} />
                  </button>
                  <button type="button" onClick={() => setFundingStep("amount")} className="w-full text-xs text-[var(--orbit-text-secondary)] hover:text-white transition-colors mt-1 py-2">← Back to amounts</button>
                </form>
              </div>
            )}

            {fundingStep === "processing" && (
              <div className="p-6 md:p-12 flex flex-col items-center text-center justify-center min-h-[340px] relative">
                {/* Pulsing ring */}
                <div className="relative w-20 h-20 mb-8">
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--orbit-brand)]/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full border-2 border-[var(--orbit-brand)]/30 animate-ping" style={{ animationDelay: '0.3s' }} />
                  <div className="w-full h-full rounded-full bg-[var(--orbit-brand-bg)] flex items-center justify-center ring-1 ring-[var(--orbit-brand-border)]">
                    <Loader2 className="w-10 h-10 text-[var(--orbit-brand-light)] animate-spin" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Processing Payment</h2>
                <p className="text-sm text-[var(--orbit-text-secondary)]">Securing your funds on the network...</p>
              </div>
            )}

            {fundingStep === "success" && (
              <div className="p-6 md:p-10 flex flex-col items-center text-center relative overflow-hidden">
                {/* Radial burst */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-[var(--orbit-success)]/10 to-transparent rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 rounded-full bg-[var(--orbit-success)]/10 animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="w-full h-full rounded-full bg-[var(--orbit-success)]/15 flex items-center justify-center ring-2 ring-[var(--orbit-success)]/30" style={{ boxShadow: '0 0 40px rgba(90, 206, 167, 0.3)' }}>
                    <CheckCircle2 className="text-[var(--orbit-success)] w-12 h-12" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Funds Added Successfully</h2>
                <p className="text-sm text-[var(--orbit-text-secondary)] mb-8">
                  Your wallet has been topped up with <span className="font-bold text-[var(--orbit-success)] font-mono">{fundingAmount} USDC</span>.
                </p>
                <button onClick={() => window.location.reload()} className="w-full orbit-btn-primary py-3.5 rounded-lg shadow-lg shadow-[var(--orbit-brand)]/20 hover:shadow-[var(--orbit-brand)]/30 transition-all text-sm">Return to Dashboard</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

