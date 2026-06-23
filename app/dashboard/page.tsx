"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, PlusCircle, Users, Wallet, CheckCircle2, ChevronRight, X, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [walletBalance, setWalletBalance] = useState(0);
  const [activeOrbits, setActiveOrbits] = useState(0);
  const [achievements, setAchievements] = useState(0);
  const [isFundingOpen, setIsFundingOpen] = useState(false);
  const [fundingStep, setFundingStep] = useState<"amount" | "checkout" | "success">("amount");
  const [fundingAmount, setFundingAmount] = useState<number>(0);

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

      // Fetch active orbits count
      const { count } = await supabase
        .from("orbit_members")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id);

      setActiveOrbits(count || 0);

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
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--orbit-brand)]" />
      </div>
    );
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

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFundingStep("success");
    setWalletBalance((prev) => prev + fundingAmount);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning,";
    if (hour < 18) return "Good afternoon,";
    return "Good evening,";
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 lg:p-10 max-w-6xl mx-auto w-full relative">
      
      {/* Guidance Banner */}
      {walletBalance === 0 ? (
        <div className="bg-gradient-to-r from-[var(--orbit-brand)]/20 to-[var(--orbit-brand)]/5 border border-[var(--orbit-brand)]/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-lg gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-[var(--orbit-brand-light)] shrink-0" size={24} />
            <div>
              <h3 className="text-sm font-semibold text-white">Your wallet is ready.</h3>
              <p className="text-xs text-[var(--orbit-text-secondary)] mt-0.5">Add funds to start contributing.</p>
            </div>
          </div>
          <button onClick={openFundingModal} className="orbit-btn-primary px-5 py-2 text-sm shrink-0">Add Funds</button>
        </div>
      ) : activeOrbits === 0 ? (
        <div className="bg-gradient-to-r from-[var(--orbit-success)]/20 to-[var(--orbit-success)]/5 border border-[var(--orbit-success)]/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-lg gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-[var(--orbit-success)] shrink-0" size={24} />
            <div>
              <h3 className="text-sm font-semibold text-white">You are ready to start saving with others.</h3>
              <p className="text-xs text-[var(--orbit-text-secondary)] mt-0.5">Create or join an Orbit.</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="orbit-btn-primary px-4 py-2 text-sm">Create Orbit</button>
            <button className="orbit-btn-secondary px-4 py-2 text-sm">Join Orbit</button>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[var(--orbit-warning)] animate-pulse shrink-0"></div>
            <div>
              <h3 className="text-sm font-semibold text-white">Your next contribution is due soon.</h3>
              <p className="text-xs text-[var(--orbit-text-secondary)] mt-0.5">Keep your Orbit Score high.</p>
            </div>
          </div>
          <button className="orbit-btn-secondary px-4 py-2 text-sm bg-white/5 border-white/10 hover:bg-white/10 shrink-0">View Orbit</button>
        </div>
      )}

      {/* Greeting */}
      <div className="flex flex-col gap-1">
        <h1 className="text-sm font-medium text-[var(--orbit-text-secondary)]">
          {getGreeting()}
        </h1>
        <h2 className="text-3xl sm:text-4xl leading-tight font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
          {profile?.full_name ? profile.full_name.split(' ')[0] : 'Member'}
        </h2>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Wallet Balance (Most Important) */}
        <div className="orbit-stat-card group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg border-[var(--orbit-brand-border)] bg-gradient-to-br from-[var(--orbit-brand-bg)] to-[var(--orbit-bg-card)] ring-1 ring-[var(--orbit-brand)]/30 flex flex-col justify-between min-h-[140px]">
          <div className="absolute inset-0 bg-gradient-to-tl from-[var(--orbit-brand)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--orbit-brand-light)] mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--orbit-brand-light)] animate-pulse shadow-[0_0_8px_var(--orbit-brand-light)]"></span>
              Wallet Balance
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-4xl font-bold tracking-tight text-white">{walletBalance.toLocaleString("en-US", {minimumFractionDigits: 2})}</span>
              <span className="text-sm font-semibold text-[var(--orbit-brand-light)]">USDC</span>
            </div>
          </div>
          {walletBalance === 0 ? (
            <div className="relative z-10 mt-3 flex items-center justify-between gap-2">
              <p className="text-[11px] text-[var(--orbit-brand-light)]/80 leading-tight">Add funds to start contributing to an Orbit.</p>
              <button onClick={openFundingModal} className="shrink-0 bg-[var(--orbit-brand-light)] text-black px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-white transition-colors shadow-sm">
                Add Funds
              </button>
            </div>
          ) : (
            <div className="relative z-10 mt-3 flex justify-end">
               <button onClick={openFundingModal} className="text-xs font-medium text-[var(--orbit-brand-light)] hover:text-white transition-colors">
                 + Top up
               </button>
            </div>
          )}
        </div>

        <div className="orbit-stat-card group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg min-h-[140px]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--orbit-brand-bg)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--orbit-text-secondary)] mb-2">
              Active Orbits
            </div>
            <div className="text-3xl font-bold tracking-tight text-[var(--orbit-text-primary)] group-hover:text-[var(--orbit-brand-light)] transition-colors">{activeOrbits}</div>
          </div>
        </div>

        <div className="orbit-stat-card group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg min-h-[140px]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--orbit-success-bg)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--orbit-text-secondary)] mb-2">
              Orbit Score
            </div>
            <div className="text-3xl font-bold tracking-tight text-[var(--orbit-success)] group-hover:text-[var(--orbit-success)] transition-colors">{profile?.orbit_score || 0}</div>
          </div>
        </div>

        <div className="orbit-stat-card group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg min-h-[140px]">
          <div className="absolute inset-0 bg-gradient-to-tl from-[var(--orbit-bg-elevated)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--orbit-text-secondary)] mb-2">
              Total Saved
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight text-[var(--orbit-text-primary)]">{profile?.total_saved || 0}</span>
              <span className="text-sm font-semibold text-[var(--orbit-text-secondary)]">USDC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col gap-4">
        <h3 className="orbit-eyebrow text-xs tracking-widest text-[var(--orbit-text-muted)]">QUICK ACTIONS</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-4 bg-[var(--orbit-bg-card)] border border-[var(--orbit-border)] hover:border-[var(--orbit-brand-border)] p-4 rounded-xl transition-all group text-left shadow-sm hover:shadow-md hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-full bg-[var(--orbit-brand-bg)] flex items-center justify-center shrink-0 group-hover:bg-[var(--orbit-brand)]/30 transition-colors">
              <PlusCircle className="text-[var(--orbit-brand-light)]" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Create Orbit</h4>
              <p className="text-xs text-[var(--orbit-text-secondary)] mt-0.5">Start a new community savings circle.</p>
            </div>
          </button>
          
          <button className="flex items-center gap-4 bg-[var(--orbit-bg-card)] border border-[var(--orbit-border)] hover:border-[var(--orbit-brand-border)] p-4 rounded-xl transition-all group text-left shadow-sm hover:shadow-md hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-full bg-[var(--orbit-bg-elevated)] flex items-center justify-center shrink-0 group-hover:bg-[var(--orbit-brand)]/20 transition-colors">
              <Users className="text-[var(--orbit-text-primary)] group-hover:text-[var(--orbit-brand-light)] transition-colors" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Join Orbit</h4>
              <p className="text-xs text-[var(--orbit-text-secondary)] mt-0.5">Join an Orbit using an invite link.</p>
            </div>
          </button>

          <button onClick={openFundingModal} className="flex items-center gap-4 bg-[var(--orbit-bg-card)] border border-[var(--orbit-border)] hover:border-[var(--orbit-brand-border)] p-4 rounded-xl transition-all group text-left shadow-sm hover:shadow-md hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-full bg-[var(--orbit-bg-elevated)] flex items-center justify-center shrink-0 group-hover:bg-[var(--orbit-brand)]/20 transition-colors">
              <Wallet className="text-[var(--orbit-text-primary)] group-hover:text-[var(--orbit-brand-light)] transition-colors" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Add Funds</h4>
              <p className="text-xs text-[var(--orbit-text-secondary)] mt-0.5">Top up your wallet balance with USDC.</p>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-2">
        {/* Main Content Column */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          
          {/* Active Orbits Section */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="orbit-eyebrow text-xs tracking-widest text-[var(--orbit-text-muted)]">
                ACTIVE ORBITS
              </h3>
              {activeOrbits > 0 && (
                <a href="/orbits" className="text-xs font-medium text-[var(--orbit-brand-light)] hover:text-white transition-colors">
                  View all
                </a>
              )}
            </div>

            {activeOrbits === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 bg-[var(--orbit-bg-card)] border border-[var(--orbit-border)] rounded-2xl border-dashed">
                <div className="w-16 h-16 rounded-full bg-[var(--orbit-bg-elevated)] flex items-center justify-center mb-4">
                  <Users className="text-[var(--orbit-text-muted)]" size={32} />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">You haven't joined any Orbit yet.</h4>
                <p className="text-sm text-[var(--orbit-text-secondary)] text-center max-w-sm mb-6">
                  Create your first savings circle or join one using an invite link to start saving with others.
                </p>
                <div className="flex gap-3">
                  <button className="orbit-btn-primary text-sm px-6">Create Orbit</button>
                  <button className="orbit-btn-secondary text-sm px-6">Join Orbit</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                        className="orbit-progress-fill bg-gradient-to-r from-[var(--orbit-brand-light)] to-[var(--orbit-brand)] rounded-full relative h-full"
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
                {activeOrbits > 1 && (
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
                      <span className="text-xs font-semibold text-[var(--orbit-warning)] bg-[var(--orbit-warning-bg)] px-3 py-1.5 rounded-full flex items-center gap-2 ring-1 ring-[var(--orbit-warning-border)] whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--orbit-warning)] animate-ping absolute"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--orbit-warning)] relative"></span>
                        Deposit Due
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="orbit-progress-track mb-3 h-2 bg-[var(--orbit-bg-elevated)] rounded-full overflow-hidden">
                        <div
                          className="orbit-progress-fill bg-[var(--orbit-warning)] rounded-full h-full"
                          style={{ width: "0%" }}
                        ></div>
                      </div>
                      <p className="text-xs font-medium text-[var(--orbit-text-secondary)]">
                        0 of 4 members deposited
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Orbit Activity Feed */}
          <div className="flex flex-col gap-5">
            <h3 className="orbit-eyebrow text-xs tracking-widest text-[var(--orbit-text-muted)]">
              RECENT ACTIVITY
            </h3>
            <div className="bg-[var(--orbit-bg-card)] border border-[var(--orbit-border)] rounded-2xl p-2">
              {activities.length === 0 ? (
                <div className="p-6 text-center text-sm text-[var(--orbit-text-secondary)]">
                  No recent activity yet.
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-[var(--orbit-bg-elevated)] rounded-xl transition-colors">
                    <div className={`w-10 h-10 rounded-full ${getActivityBg(activity.action_type)} flex items-center justify-center shrink-0`}>
                      {getActivityIcon(activity.action_type, activity.users?.full_name)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{activity.message}</p>
                      <p className="text-xs text-[var(--orbit-text-secondary)]">
                        {activity.orbits?.name || 'Orbit'} • {formatTimeAgo(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Side Column */}
        <div className="flex flex-col gap-8">
          {/* Orbit Score Preview Card */}
          <div className="flex flex-col gap-5">
            <h3 className="orbit-eyebrow text-xs tracking-widest text-[var(--orbit-text-muted)]">
              YOUR REPUTATION
            </h3>
            <div className="orbit-card bg-[var(--orbit-bg-card)] border-[var(--orbit-border)] rounded-2xl p-6 relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--orbit-success)]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              
              <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle className="text-[var(--orbit-bg-elevated)] stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                  <circle className="text-[var(--orbit-success)] stroke-current" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="251.2" strokeDashoffset="10.048"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--orbit-success)]">
                  <span className="text-4xl font-bold">{profile?.orbit_score || 0}</span>
                </div>
              </div>

              <h4 className="text-lg font-bold text-white mb-1">{profile?.tier || 'Newcomer'}</h4>
              <p className="text-sm text-[var(--orbit-text-secondary)] mb-6">Build your reputation.</p>

              <div className="w-full grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[var(--orbit-bg-app)] rounded-xl p-3 text-center border border-[var(--orbit-border)]">
                  <div className="text-xs text-[var(--orbit-text-secondary)] mb-1">Reliability</div>
                  <div className="text-lg font-semibold text-white">{profile?.reliability_rate || 100}%</div>
                </div>
                <div className="bg-[var(--orbit-bg-app)] rounded-xl p-3 text-center border border-[var(--orbit-border)]">
                  <div className="text-xs text-[var(--orbit-text-secondary)] mb-1">Achievements</div>
                  <div className="text-lg font-semibold text-white">{achievements}</div>
                </div>
              </div>

              <button className="w-full orbit-btn-secondary py-3 flex items-center justify-center gap-2 group">
                View Full Orbit Score
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Funding Modal */}
      {isFundingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[var(--orbit-bg-card)] border border-[var(--orbit-border)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <button onClick={closeFundingModal} className="absolute top-4 right-4 text-[var(--orbit-text-secondary)] hover:text-white transition-colors z-10">
              <X size={20} />
            </button>
            
            {fundingStep === "amount" && (
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--orbit-brand-bg)] mb-6">
                  <Wallet className="text-[var(--orbit-brand-light)]" size={24} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Add Funds</h2>
                <p className="text-sm text-[var(--orbit-text-secondary)] mb-8">Select an amount to top up your wallet.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[50, 100, 250, 500].map(amount => (
                    <button 
                      key={amount}
                      onClick={() => handleAmountSelect(amount)}
                      className="border border-[var(--orbit-border)] hover:border-[var(--orbit-brand-border)] bg-[var(--orbit-bg-app)] hover:bg-[var(--orbit-brand-bg)] text-white py-4 rounded-xl font-semibold transition-colors flex flex-col items-center"
                    >
                      <span className="text-xl">{amount}</span>
                      <span className="text-xs text-[var(--orbit-brand-light)]">USDC</span>
                    </button>
                  ))}
                </div>
                
                <div className="mt-4">
                  <label className="text-xs text-[var(--orbit-text-secondary)] font-medium mb-2 block">Custom Amount</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--orbit-brand)] transition-colors pl-14"
                      onChange={(e) => setFundingAmount(Number(e.target.value))}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-[var(--orbit-brand-light)]">USDC</span>
                  </div>
                  <button onClick={() => fundingAmount > 0 && handleAmountSelect(fundingAmount)} className={`w-full orbit-btn-primary py-3 mt-4 ${fundingAmount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>Continue</button>
                </div>
              </div>
            )}

            {fundingStep === "checkout" && (
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-2">Checkout</h2>
                <p className="text-sm text-[var(--orbit-text-secondary)] mb-6">You are funding <span className="font-bold text-white">{fundingAmount} USDC</span></p>
                
                <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs text-[var(--orbit-text-secondary)] font-medium mb-1.5 block">Cardholder Name</label>
                    <input required type="text" defaultValue="Chris Quint" className="w-full bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--orbit-brand)]" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--orbit-text-secondary)] font-medium mb-1.5 block">Card Number</label>
                    <input required type="text" defaultValue="4242 4242 4242 4242" className="w-full bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-xl py-3 px-4 text-white font-mono focus:outline-none focus:border-[var(--orbit-brand)]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[var(--orbit-text-secondary)] font-medium mb-1.5 block">Expiry</label>
                      <input required type="text" defaultValue="12/28" className="w-full bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--orbit-brand)]" />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--orbit-text-secondary)] font-medium mb-1.5 block">CVV</label>
                      <input required type="text" defaultValue="123" className="w-full bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--orbit-brand)]" />
                    </div>
                  </div>
                  
                  <button type="submit" className="w-full orbit-btn-primary py-3 mt-4 flex items-center justify-center gap-2">
                    Pay {fundingAmount} USDC <ArrowRight size={16} />
                  </button>
                  <button type="button" onClick={() => setFundingStep("amount")} className="w-full text-sm text-[var(--orbit-text-secondary)] hover:text-white mt-2">Back</button>
                </form>
              </div>
            )}

            {fundingStep === "success" && (
              <div className="p-6 md:p-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-[var(--orbit-success)]/10 flex items-center justify-center mb-6">
                  <CheckCircle2 className="text-[var(--orbit-success)] w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Funds Added Successfully</h2>
                <p className="text-sm text-[var(--orbit-text-secondary)] mb-8">
                  Your wallet has been topped up with <span className="font-bold text-[var(--orbit-success)]">{fundingAmount} USDC</span>.
                </p>
                <button onClick={closeFundingModal} className="w-full orbit-btn-primary py-3">Return to Dashboard</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
