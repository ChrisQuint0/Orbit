"use client";

import { useState } from "react";
import { 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  Users, 
  Flame, 
  Sparkles, 
  Award, 
  Download, 
  Share2, 
  Eye, 
  Activity, 
  TrendingUp, 
  Trophy, 
  AlertTriangle,
  QrCode,
  Check,
  Plus,
  LogIn
} from "lucide-react";

export default function OrbitScorePage() {
  // Toggle for demonstrating the empty state
  const [hasActivity, setHasActivity] = useState(true);

  const MOCK = {
    score: 96,
    tier: "Community Leader",
    reliabilityRate: "98%",
    totalDeposits: 24,
    completedOrbits: 5,
    missedPayments: 1,
    breakdown: [
      { title: "On-Time Contributions", points: "+40", type: "positive" },
      { title: "Completed Orbits", points: "+25", type: "positive" },
      { title: "Community Participation", points: "+20", type: "positive" },
      { title: "Successful Releases", points: "+15", type: "positive" },
      { title: "Missed Contributions", points: "-4", type: "negative" }
    ],
    badges: [
      { id: "b1", name: "Reliable Saver", desc: "Maintained on-time deposits across multiple cycles.", earned: true, Icon: ShieldCheck },
      { id: "b2", name: "Orbit Finisher", desc: "Successfully completed an Orbit.", earned: true, Icon: CheckCircle2 },
      { id: "b3", name: "Community Builder", desc: "Created and filled an Orbit.", earned: true, Icon: Users },
      { id: "b4", name: "Trusted Contributor", desc: "Maintained a high reliability rate.", earned: true, Icon: Award },
      { id: "b5", name: "Consistency Champion", desc: "Awarded for consecutive on-time contributions.", earned: false, Icon: Flame },
      { id: "b6", name: "Founding Member", desc: "Awarded for joining early Orbits.", earned: false, Icon: Sparkles }
    ],
    passport: {
      name: "Chris",
      memberSince: "March 2026",
      status: "Verified",
      id: "ORB-2026-001"
    },
    timeline: [
      { text: "Achieved Community Leader Tier", time: "1 week ago" },
      { text: "Completed Factory Crew Orbit", time: "2 weeks ago" },
      { text: "Reached Orbit Score 90", time: "1 month ago" },
      { text: "Earned Reliable Saver Badge", time: "2 months ago" },
      { text: "Created Weekend Fund Orbit", time: "3 months ago" }
    ],
    trustInsights: [
      "100% of recent contributions completed on time.",
      "Successfully participated in 5 completed Orbits.",
      "Created 2 community savings circles.",
      "Maintained excellent reliability over the last 6 months."
    ]
  };

  if (!hasActivity) {
    return (
      <div className="min-h-screen bg-[var(--orbit-bg-app)] text-[var(--orbit-text-primary)] p-6 md:p-10 font-sans flex flex-col">
        <div className="mx-auto max-w-4xl w-full flex-grow flex flex-col justify-center items-center py-20 px-4">
          <div className="w-24 h-24 rounded-full bg-[var(--orbit-bg-elevated)] flex items-center justify-center mb-6 shadow-inner">
            <Star className="text-[var(--orbit-text-muted)] w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No reputation data yet.</h2>
          <p className="text-[var(--orbit-text-secondary)] text-center max-w-md mb-8">
            Your reputation is built through consistent contributions, completed Orbits, and community trust. Join or create an Orbit to begin building your Orbit Score.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => setHasActivity(true)} className="orbit-btn-primary py-3 px-8 text-base">
              <Plus className="h-4 w-4 mr-2 inline" /> Create Orbit
            </button>
            <button onClick={() => setHasActivity(true)} className="orbit-btn-secondary py-3 px-8 text-base bg-[var(--orbit-bg-card)]">
              <LogIn className="h-4 w-4 mr-2 inline" /> Join Orbit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--orbit-bg-app)] text-[var(--orbit-text-primary)] p-6 md:p-10 font-sans pb-24">
      <div className="mx-auto max-w-6xl">
        
        {/* Page Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center justify-center md:justify-start gap-3">
            <Star className="h-8 w-8 text-[var(--orbit-brand-light)]" fill="currentColor" />
            Orbit Score
          </h1>
          <p className="text-[var(--orbit-text-secondary)] mt-2 max-w-2xl text-sm md:text-base">
            Your reputation is built through consistent contributions, completed Orbits, and community trust. It reflects how consistently you honor commitments to your community.
          </p>
        </div>

        {/* Orbit Passport (Centerpiece) */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--orbit-bg-card)] to-[var(--orbit-bg-app)] border border-[var(--orbit-brand-border)] shadow-[0_10px_40px_rgba(124,110,247,0.15)] p-1">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--orbit-brand)]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--orbit-success)]/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>
            
            <div className="relative bg-[var(--orbit-bg-sidebar)]/80 backdrop-blur-sm rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
              
              {/* Score Highlight */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="relative w-36 h-36 flex items-center justify-center rounded-full bg-[var(--orbit-bg-elevated)] border-4 border-[var(--orbit-brand)] shadow-[0_0_30px_rgba(124,110,247,0.3)]">
                  <div className="absolute inset-2 border-2 border-dashed border-[var(--orbit-brand)]/30 rounded-full animate-spin-slow"></div>
                  <div className="text-center">
                    <span className="block text-5xl font-black text-white">{MOCK.score}</span>
                    <span className="block text-[10px] uppercase tracking-widest text-[var(--orbit-brand-light)] font-bold mt-1">Score</span>
                  </div>
                </div>
                <div className="mt-4 px-4 py-1.5 rounded-full bg-[var(--orbit-brand-bg)] border border-[var(--orbit-brand)]/30 text-[var(--orbit-brand-light)] text-sm font-semibold tracking-wide">
                  {MOCK.tier}
                </div>
              </div>

              {/* Passport Details */}
              <div className="flex-1 w-full flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-6 pb-6 border-b border-[var(--orbit-border)]">
                  <div className="text-center md:text-left mb-4 md:mb-0">
                    <h2 className="text-2xl font-bold text-white mb-1 flex items-center justify-center md:justify-start gap-2">
                      {MOCK.passport.name}
                      <ShieldCheck className="h-5 w-5 text-[var(--orbit-success)]" />
                    </h2>
                    <p className="text-xs text-[var(--orbit-text-muted)] uppercase tracking-wider">
                      Passport ID: <span className="font-mono text-[var(--orbit-text-secondary)]">{MOCK.passport.id}</span>
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-1 shrink-0 shadow-md">
                    <QrCode className="text-black w-full h-full" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--orbit-text-secondary)] uppercase tracking-wider mb-1">Reliability</span>
                    <span className="text-lg font-bold text-white">{MOCK.reliabilityRate}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--orbit-text-secondary)] uppercase tracking-wider mb-1">Completed</span>
                    <span className="text-lg font-bold text-white">{MOCK.completedOrbits}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--orbit-text-secondary)] uppercase tracking-wider mb-1">Contributions</span>
                    <span className="text-lg font-bold text-white">{MOCK.totalDeposits}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--orbit-text-secondary)] uppercase tracking-wider mb-1">Member Since</span>
                    <span className="text-sm font-bold text-white mt-0.5">{MOCK.passport.memberSince}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--orbit-text-secondary)] uppercase tracking-wider shrink-0">Earned Badges:</span>
                  <div className="flex flex-wrap gap-2">
                    {MOCK.badges.filter(b => b.earned).map(badge => (
                      <div key={badge.id} className="w-6 h-6 rounded-full bg-[var(--orbit-bg-elevated)] flex items-center justify-center border border-[var(--orbit-border)] tooltip-trigger" title={badge.name}>
                        <badge.Icon className="w-3.5 h-3.5 text-[var(--orbit-brand-light)]" />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
          
          {/* Passport Actions */}
          <div className="flex flex-wrap justify-center md:justify-end gap-3 mt-4">
            <button className="orbit-btn-secondary flex items-center gap-2 py-2">
              <Download className="w-4 h-4" /> Download
            </button>
            <button className="orbit-btn-secondary flex items-center gap-2 py-2">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button className="orbit-btn-neutral flex items-center gap-2 py-2 border border-[var(--orbit-border)] bg-[var(--orbit-bg-app)]">
              <Eye className="w-4 h-4" /> View Public Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Reputation Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="orbit-card bg-[var(--orbit-bg-sidebar)] border-[var(--orbit-border)] flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2 text-[var(--orbit-text-secondary)]">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-semibold">Reliability Rate</span>
                </div>
                <div className="text-3xl font-bold text-[var(--orbit-success)] mb-1">{MOCK.reliabilityRate}</div>
                <p className="text-[11px] text-[var(--orbit-text-muted)]">Percentage of contributions made on time.</p>
              </div>
              
              <div className="orbit-card bg-[var(--orbit-bg-sidebar)] border-[var(--orbit-border)] flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2 text-[var(--orbit-text-secondary)]">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-semibold">Total Deposits</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{MOCK.totalDeposits}</div>
                <p className="text-[11px] text-[var(--orbit-text-muted)]">Total successful contributions made.</p>
              </div>
              
              <div className="orbit-card bg-[var(--orbit-bg-sidebar)] border-[var(--orbit-border)] flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2 text-[var(--orbit-text-secondary)]">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-semibold">Completed Orbits</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{MOCK.completedOrbits}</div>
                <p className="text-[11px] text-[var(--orbit-text-muted)]">Savings circles successfully completed.</p>
              </div>
              
              <div className="orbit-card bg-[var(--orbit-bg-sidebar)] border-[var(--orbit-border)] flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2 text-[var(--orbit-text-secondary)]">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider font-semibold">Missed Payments</span>
                </div>
                <div className="text-3xl font-bold text-[var(--orbit-danger)] mb-1">{MOCK.missedPayments}</div>
                <p className="text-[11px] text-[var(--orbit-text-muted)]">Contributions missed or completed late.</p>
              </div>
            </div>

            {/* Achievement Badges Section */}
            <section className="orbit-card">
              <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
                <Award className="h-5 w-5 text-[var(--orbit-brand-light)]" />
                Achievement Badges
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MOCK.badges.map((badge) => (
                  <div key={badge.id} className={`group flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${badge.earned ? 'bg-[var(--orbit-bg-elevated)] border-[var(--orbit-border)] hover:border-[var(--orbit-brand)] hover:shadow-[0_0_20px_rgba(124,110,247,0.15)] hover:-translate-y-1' : 'bg-transparent border-dashed border-[var(--orbit-border)] opacity-60 grayscale'}`}>
                    <div className={`relative w-12 h-12 rounded-full shrink-0 flex items-center justify-center transition-all duration-300 ${badge.earned ? 'bg-[var(--orbit-brand-bg)] border-2 border-[var(--orbit-brand)]/50 shadow-[0_0_15px_rgba(124,110,247,0.4)] group-hover:shadow-[0_0_25px_rgba(124,110,247,0.7)]' : 'bg-[var(--orbit-bg-sidebar)] border border-[var(--orbit-border)]'}`}>
                      <badge.Icon className={`w-6 h-6 transition-all duration-300 ${badge.earned ? 'text-[var(--orbit-brand-light)] drop-shadow-[0_0_8px_rgba(124,110,247,0.8)] group-hover:drop-shadow-[0_0_12px_rgba(124,110,247,1)]' : 'text-[var(--orbit-text-muted)]'}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                        {badge.name}
                        {badge.earned && <CheckCircle2 className="w-3 h-3 text-[var(--orbit-success)]" />}
                      </h3>
                      <p className="text-xs text-[var(--orbit-text-secondary)] leading-relaxed">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Orbit Score Breakdown */}
            <section className="orbit-card">
              <h2 className="text-lg font-medium mb-6">Score Breakdown</h2>
              <div className="space-y-3">
                {MOCK.breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)]">
                    <span className="text-sm font-medium text-[var(--orbit-text-primary)]">{item.title}</span>
                    <span className={`text-sm font-bold ${item.type === 'positive' ? 'text-[var(--orbit-success)]' : 'text-[var(--orbit-danger)]'}`}>
                      {item.points} Points
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--orbit-border)] flex justify-between items-center">
                <span className="text-xs text-[var(--orbit-text-muted)] uppercase tracking-wider font-semibold">Total Orbit Score</span>
                <span className="text-xl font-bold text-white">{MOCK.score}</span>
              </div>
            </section>

          </div>

          <div className="space-y-8">
            
            {/* Community Trust Section */}
            <section className="orbit-card bg-gradient-to-br from-[var(--orbit-success-bg)]/50 to-[var(--orbit-bg-card)] border-[var(--orbit-success)]/20">
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[var(--orbit-success)]" />
                Community Trust
              </h2>
              <div className="mb-6">
                <span className="text-xs uppercase tracking-wider text-[var(--orbit-text-secondary)] font-semibold mb-1 block">Trust Score</span>
                <span className="text-2xl font-bold text-[var(--orbit-success)]">High</span>
              </div>
              <ul className="space-y-3">
                {MOCK.trustInsights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[var(--orbit-success)] shrink-0 mt-0.5" />
                    <span className="text-xs text-[var(--orbit-text-secondary)] leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Reputation Timeline */}
            <section className="orbit-card">
              <h2 className="text-lg font-medium mb-6">Reputation Timeline</h2>
              <div className="space-y-5 relative before:absolute before:inset-0 before:left-[11px] before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[var(--orbit-brand-border)] before:to-transparent">
                {MOCK.timeline.map((item, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 z-10">
                    <div className="w-6 h-6 rounded-full bg-[var(--orbit-bg-elevated)] border-2 border-[var(--orbit-brand-border)] shrink-0 flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-[var(--orbit-brand)]"></div>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium mb-1">{item.text}</p>
                      <time className="text-[10px] text-[var(--orbit-text-muted)] uppercase tracking-wider font-semibold">{item.time}</time>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Public Reputation Preview */}
            <section className="orbit-card opacity-80 hover:opacity-100 transition-opacity">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--orbit-text-secondary)] mb-4">External Preview</h2>
              <div className="bg-[var(--orbit-bg-elevated)] rounded-xl p-5 border border-[var(--orbit-border)] shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--orbit-brand-light)] to-[var(--orbit-brand)] flex items-center justify-center text-white font-bold">
                    {MOCK.passport.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{MOCK.passport.name}</h3>
                    <span className="text-[10px] text-[var(--orbit-success)] flex items-center gap-1 font-semibold uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" /> {MOCK.passport.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center border-t border-[var(--orbit-border)] pt-4">
                  <div>
                    <div className="text-sm font-bold text-white">{MOCK.score}</div>
                    <div className="text-[9px] uppercase tracking-wider text-[var(--orbit-text-secondary)]">Score</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{MOCK.reliabilityRate}</div>
                    <div className="text-[9px] uppercase tracking-wider text-[var(--orbit-text-secondary)]">Reliable</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{MOCK.badges.filter(b => b.earned).length}</div>
                    <div className="text-[9px] uppercase tracking-wider text-[var(--orbit-text-secondary)]">Badges</div>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
