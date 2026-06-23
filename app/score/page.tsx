"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  Users, 
  Flame, 
  Sparkles, 
  Award, 
  Download, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Upload,
  Loader2,
  X,
  Camera
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toPng } from 'html-to-image';
import { uploadUserAvatarAction } from "@/app/actions/user";

export default function OrbitScorePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalPaid: 0, totalMissed: 0, completedOrbits: 0, createdOrbits: 0 });
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const passportRef = useRef<HTMLDivElement>(null);

  // Badge Modal State
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Profile
      const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single();
      setProfile(userData);

      // Score History
      const { data: historyData } = await supabase.from("score_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setHistory(historyData || []);

      // Deposits (for stats and badges)
      const { data: deposits } = await supabase.from("deposits").select("*").eq("user_id", user.id);
      const totalPaid = deposits?.filter(d => d.status === "PAID").length || 0;
      const totalMissed = deposits?.filter(d => d.status === "MISSED").length || 0;

      // Completed Orbits (member of)
      const { data: userOrbits } = await supabase.from("orbit_members").select("orbit_id").eq("user_id", user.id);
      let completedOrbits = 0;
      let createdOrbits = 0;
      
      if (userOrbits && userOrbits.length > 0) {
        const orbitIds = userOrbits.map(o => o.orbit_id);
        const { data: orbits } = await supabase.from("orbits").select("*").in("id", orbitIds);
        completedOrbits = orbits?.filter(o => o.status === "COMPLETED").length || 0;
        createdOrbits = orbits?.filter(o => o.creator_id === user.id && o.status !== "FORMING").length || 0;
      }

      setStats({ totalPaid, totalMissed, completedOrbits, createdOrbits });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", profile.id);

      const res = await uploadUserAvatarAction(formData);
      
      if (res.success && res.avatarUrl) {
        setProfile({ ...profile, avatar_url: res.avatarUrl });
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadPassport = async () => {
    if (!passportRef.current) return;
    try {
      const dataUrl = await toPng(passportRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `Orbit-Passport-${profile?.full_name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download passport:', err);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin text-[var(--orbit-brand)]" /></div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center text-white">Profile not found.</div>;
  }

  // Derived logic
  const getTrustLevel = (score: number) => {
    if (score < 20) return "Newcomer";
    if (score < 50) return "Emerging Member";
    if (score < 100) return "Trusted Member";
    if (score < 200) return "Highly Trusted";
    return "Community Pillar";
  };

  const trustLevel = getTrustLevel(profile.orbit_score);
  const memberSinceDate = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const shortWallet = profile.stellar_wallet_pubkey ? `${profile.stellar_wallet_pubkey.substring(0,6)}...${profile.stellar_wallet_pubkey.substring(profile.stellar_wallet_pubkey.length - 4)}` : "No Wallet";

  // Badges Logic (Calculated dynamically)
  const BADGE_DEFINITIONS = [
    { id: "b1", name: "Reliable Saver", desc: "Awarded for making 10 on-time deposits.", icon: ShieldCheck, required: 10, current: stats.totalPaid },
    { id: "b2", name: "Orbit Finisher", desc: "Successfully complete your first Orbit.", icon: CheckCircle2, required: 1, current: stats.completedOrbits },
    { id: "b3", name: "Community Builder", desc: "Create and fill an Orbit.", icon: Users, required: 1, current: stats.createdOrbits },
    { id: "b4", name: "Consistency Champion", desc: "Make 5 on-time deposits.", icon: Flame, required: 5, current: stats.totalPaid },
    { id: "b5", name: "Trusted Contributor", desc: "Make 20 on-time deposits.", icon: Award, required: 20, current: stats.totalPaid },
    { id: "b6", name: "Founding Member", desc: "Join your first Orbit.", icon: Sparkles, required: 1, current: (stats.totalPaid > 0 ? 1 : 0) } // simplified
  ];

  const earnedBadgesCount = BADGE_DEFINITIONS.filter(b => b.current >= b.required).length;

  return (
    <div className="min-h-screen bg-[var(--orbit-bg-app)] text-[var(--orbit-text-primary)] p-6 md:p-10 font-sans pb-24">
      <div className="mx-auto max-w-6xl">
        
        {/* Page Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center justify-center md:justify-start gap-3">
            <Star className="h-8 w-8 text-[var(--orbit-brand-light)]" fill="currentColor" />
            Orbit Passport
          </h1>
          <p className="text-[var(--orbit-text-secondary)] mt-2 max-w-2xl text-sm md:text-base">
            Your portable identity on Orbit. Build your reputation and Community Trust Level through consistent participation.
          </p>
        </div>

        {/* Orbit Passport (Centerpiece) */}
        <div className="mb-12">
          {/* Card to capture for PNG */}
          <div ref={passportRef} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--orbit-bg-card)] to-[var(--orbit-bg-app)] border border-[var(--orbit-brand-border)] shadow-[0_10px_40px_rgba(124,110,247,0.15)] p-1">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--orbit-brand)]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--orbit-success)]/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>
            
            <div className="relative bg-[var(--orbit-bg-sidebar)]/80 backdrop-blur-sm rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
              
              {/* Left Column: Avatar & Trust Level */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="relative group w-36 h-36 rounded-full bg-[var(--orbit-bg-elevated)] border-4 border-[var(--orbit-brand)] shadow-[0_0_30px_rgba(124,110,247,0.3)] flex items-center justify-center overflow-hidden">
                  <img 
                    src={profile.avatar_url || "/orbi_official.png"} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                    crossOrigin="anonymous" 
                  />
                  
                  {/* Hover Upload Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {isUploading ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Camera className="w-8 h-8 text-white" />}
                  </div>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                </div>
                
                <div className="mt-4 px-4 py-1.5 rounded-full bg-[var(--orbit-brand-bg)] border border-[var(--orbit-brand)]/30 text-[var(--orbit-brand-light)] text-sm font-semibold tracking-wide text-center">
                  {trustLevel}
                </div>
              </div>

              {/* Right Column: Passport Details */}
              <div className="flex-1 w-full flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-6 pb-6 border-b border-[var(--orbit-border)]">
                  <div className="text-center md:text-left mb-4 md:mb-0">
                    <h2 className="text-3xl font-bold text-white mb-1 flex items-center justify-center md:justify-start gap-2">
                      {profile.full_name}
                      {trustLevel !== "Newcomer" && <ShieldCheck className="h-6 w-6 text-[var(--orbit-success)]" />}
                    </h2>
                    <p className="text-xs text-[var(--orbit-text-muted)] uppercase tracking-wider">
                      Wallet: <span className="font-mono text-[var(--orbit-text-secondary)]">{shortWallet}</span>
                    </p>
                  </div>
                  
                  {/* Orbit Score Badge */}
                  <div className="flex flex-col items-center bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-brand)]/50 rounded-xl px-6 py-3 shadow-[0_0_15px_rgba(124,110,247,0.2)]">
                    <span className="text-3xl font-black text-white">{profile.orbit_score}</span>
                    <span className="text-[10px] uppercase tracking-widest text-[var(--orbit-brand-light)] font-bold mt-1">Orbit Score</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--orbit-text-secondary)] uppercase tracking-wider mb-1">On-Time Contribs</span>
                    <span className="text-xl font-bold text-[var(--orbit-success)]">{stats.totalPaid}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--orbit-text-secondary)] uppercase tracking-wider mb-1">Total Contributions</span>
                    <span className="text-xl font-bold text-white">{stats.totalPaid + stats.totalMissed}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--orbit-text-secondary)] uppercase tracking-wider mb-1">Badges Earned</span>
                    <span className="text-xl font-bold text-white">{earnedBadgesCount}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--orbit-text-secondary)] uppercase tracking-wider mb-1">Member Since</span>
                    <span className="text-sm font-bold text-white mt-1">{memberSinceDate}</span>
                  </div>
                </div>

                {/* Earned Badges Row */}
                {earnedBadgesCount > 0 && (
                  <div className="flex items-center gap-2 pt-4 border-t border-[var(--orbit-border)]">
                    <span className="text-[10px] text-[var(--orbit-text-secondary)] uppercase tracking-wider shrink-0">Badges:</span>
                    <div className="flex flex-wrap gap-2">
                      {BADGE_DEFINITIONS.filter(b => b.current >= b.required).map(badge => (
                        <div key={badge.id} className="w-8 h-8 rounded-full bg-[var(--orbit-bg-elevated)] flex items-center justify-center border border-[var(--orbit-brand)]/30 tooltip-trigger shadow-[0_0_10px_rgba(124,110,247,0.15)]" title={badge.name}>
                          <badge.icon className="w-4 h-4 text-[var(--orbit-brand-light)]" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={handleDownloadPassport} className="orbit-btn-secondary flex items-center gap-2 py-2">
              <Download className="w-4 h-4" /> Download Passport
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Achievement Badges Section */}
          <section className="orbit-card bg-[var(--orbit-bg-sidebar)]">
            <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
              <Award className="h-5 w-5 text-[var(--orbit-brand-light)]" />
              Achievement Badges
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BADGE_DEFINITIONS.map((badge) => {
                const isEarned = badge.current >= badge.required;
                return (
                  <button 
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`text-left group flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${isEarned ? 'bg-[var(--orbit-bg-elevated)] border-[var(--orbit-border)] hover:border-[var(--orbit-brand)] hover:shadow-[0_0_20px_rgba(124,110,247,0.15)] hover:-translate-y-1' : 'bg-transparent border-dashed border-[var(--orbit-border)] opacity-60 hover:opacity-100 hover:border-[var(--orbit-border-hover)]'}`}
                  >
                    <div className={`relative w-12 h-12 rounded-full shrink-0 flex items-center justify-center transition-all duration-300 ${isEarned ? 'bg-[var(--orbit-brand-bg)] border-2 border-[var(--orbit-brand)]/50 shadow-[0_0_15px_rgba(124,110,247,0.4)]' : 'bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)]'}`}>
                      <badge.icon className={`w-6 h-6 transition-all duration-300 ${isEarned ? 'text-[var(--orbit-brand-light)] drop-shadow-[0_0_8px_rgba(124,110,247,0.8)]' : 'text-[var(--orbit-text-muted)]'}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                        {badge.name}
                        {isEarned && <CheckCircle2 className="w-3 h-3 text-[var(--orbit-success)]" />}
                      </h3>
                      <p className="text-xs text-[var(--orbit-text-secondary)] line-clamp-1">{badge.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Reputation Timeline */}
          <section className="orbit-card bg-[var(--orbit-bg-sidebar)] flex flex-col h-[500px]">
            <h2 className="text-lg font-medium mb-6 shrink-0 flex items-center gap-2">
              <Activity className="h-5 w-5 text-[var(--orbit-brand-light)]" />
              Reputation Timeline
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 relative before:absolute before:inset-0 before:left-[11px] before:h-full before:w-0.5 before:bg-[var(--orbit-border)]">
              {history.length === 0 ? (
                <div className="text-[var(--orbit-text-muted)] text-sm italic pl-8 py-4">No score history yet.</div>
              ) : (
                history.map((entry) => {
                  const isPositive = entry.score_change > 0;
                  const isNegative = entry.score_change < 0;
                  return (
                    <div key={entry.id} className="relative flex items-start gap-4 z-10">
                      <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5 ${isPositive ? 'bg-[var(--orbit-success-bg)] border-[var(--orbit-success)]' : isNegative ? 'bg-[var(--orbit-danger-bg)] border-[var(--orbit-danger)]' : 'bg-[var(--orbit-bg-elevated)] border-[var(--orbit-brand-border)]'}`}>
                        {isPositive ? <TrendingUp className="w-3 h-3 text-[var(--orbit-success)]" /> : isNegative ? <AlertTriangle className="w-3 h-3 text-[var(--orbit-danger)]" /> : <Star className="w-3 h-3 text-[var(--orbit-brand)]" />}
                      </div>
                      <div className="flex-1 bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-white font-medium">{entry.event_type}</p>
                          <span className={`text-sm font-bold ${isPositive ? 'text-[var(--orbit-success)]' : isNegative ? 'text-[var(--orbit-danger)]' : 'text-[var(--orbit-text-secondary)]'}`}>
                            {isPositive ? '+' : ''}{entry.score_change}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <time className="text-[var(--orbit-text-muted)] font-medium">
                            {new Date(entry.created_at).toLocaleString()}
                          </time>
                          <span className="text-[var(--orbit-text-secondary)]">
                            Score: <span className="text-white font-medium">{entry.previous_score} → {entry.new_score}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

        </div>
      </div>

      {/* Badge Details Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[var(--orbit-bg-card)] border border-[var(--orbit-border)] rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedBadge(null)} className="absolute top-4 right-4 text-[var(--orbit-text-muted)] hover:text-white">
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center mt-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${selectedBadge.current >= selectedBadge.required ? 'bg-[var(--orbit-brand-bg)] border-2 border-[var(--orbit-brand)]/50 shadow-[0_0_30px_rgba(124,110,247,0.3)]' : 'bg-[var(--orbit-bg-app)] border-2 border-[var(--orbit-border)]'}`}>
                <selectedBadge.icon className={`w-10 h-10 ${selectedBadge.current >= selectedBadge.required ? 'text-[var(--orbit-brand-light)]' : 'text-[var(--orbit-text-muted)]'}`} />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">{selectedBadge.name}</h2>
              <p className="text-sm text-[var(--orbit-text-secondary)] mb-6">{selectedBadge.desc}</p>
              
              <div className="w-full bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] rounded-xl p-5">
                <div className="flex justify-between items-center mb-2 text-sm font-medium">
                  <span className="text-white">Progress</span>
                  <span className="text-[var(--orbit-brand-light)]">{Math.min(selectedBadge.current, selectedBadge.required)} / {selectedBadge.required}</span>
                </div>
                <div className="w-full h-2 bg-[var(--orbit-bg-app)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--orbit-brand)] to-[var(--orbit-brand-light)] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (selectedBadge.current / selectedBadge.required) * 100)}%` }}
                  />
                </div>
                {selectedBadge.current >= selectedBadge.required && (
                  <div className="mt-4 text-xs font-bold text-[var(--orbit-success)] flex items-center justify-center gap-1 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Achievement Unlocked
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
