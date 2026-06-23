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
  X,
  Camera,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toPng } from 'html-to-image';
import { uploadUserAvatarAction } from "@/app/actions/user";
import { OrbitLoader } from "@/components/orbit-loader";

export default function OrbitScorePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalPaid: 0, totalMissed: 0, completedOrbits: 0, createdOrbits: 0 });
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const credRef = useRef<HTMLDivElement>(null);

  // Badge Modal State
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  // 3D Card Hover State
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({});
  const [copied, setCopied] = useState(false);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = x / rect.width - 0.5;
    const yc = y / rect.height - 0.5;
    
    const rotateX = -yc * 8;
    const rotateY = xc * 8;
    
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTiltStyle({
      transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`,
      transition: "transform 0.1s ease-out, box-shadow 0.1s ease-out",
      boxShadow: `${-xc * 20}px ${-yc * 20}px 35px rgba(0, 0, 0, 0.6), 0 0 50px rgba(124, 110, 247, 0.15)`
    });

    setGlareStyle({
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%), linear-gradient(135deg, rgba(124, 110, 247, 0.05) 0%, rgba(36, 166, 136, 0.05) 100%)`,
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: "transform 0.5s ease, box-shadow 0.5s ease",
      boxShadow: "0 10px 40px rgba(124, 110, 247, 0.12)"
    });
    setGlareStyle({
      opacity: 0,
      transition: "opacity 0.5s ease"
    });
  };

  const handleCopyWallet = () => {
    if (!profile?.stellar_wallet_pubkey) return;
    navigator.clipboard.writeText(profile.stellar_wallet_pubkey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const handleDownloadCred = async () => {
    if (!credRef.current) return;
    try {
      // Temporarily flatten card just in case mouse hover is still active
      const originalTransform = credRef.current.style.transform;
      credRef.current.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      
      const dataUrl = await toPng(credRef.current, { cacheBust: true, pixelRatio: 2 });
      
      // Restore original transform
      credRef.current.style.transform = originalTransform;

      const link = document.createElement('a');
      link.download = `Orbit-Cred-${profile?.full_name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download Orbit Cred:', err);
    }
  };

  if (loading) {
    return <OrbitLoader text="Syncing Orbit Cred..." />;
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
  const credId = profile.id ? `ORB-CRED-${profile.id.substring(0, 8).toUpperCase()}` : "ORB-CRED-00000000";

  // Badges Logic (Calculated dynamically)
  const BADGE_DEFINITIONS = [
    { id: "b1", name: "Reliable Saver", desc: "Awarded for making 10 on-time deposits.", icon: ShieldCheck, required: 10, current: stats.totalPaid },
    { id: "b2", name: "Orbit Finisher", desc: "Successfully complete your first Orbit.", icon: CheckCircle2, required: 1, current: stats.completedOrbits },
    { id: "b3", name: "Community Builder", desc: "Create and fill an Orbit.", icon: Users, required: 1, current: stats.createdOrbits },
    { id: "b4", name: "Consistency Champion", desc: "Make 5 on-time deposits.", icon: Flame, required: 5, current: stats.totalPaid },
    { id: "b5", name: "Trusted Contributor", desc: "Make 20 on-time deposits.", icon: Award, required: 20, current: stats.totalPaid },
    { id: "b6", name: "Founding Member", desc: "Join your first Orbit.", icon: Sparkles, required: 1, current: (stats.totalPaid > 0 ? 1 : 0) } 
  ];

  const earnedBadgesCount = BADGE_DEFINITIONS.filter(b => b.current >= b.required).length;

  return (
    <div className="min-h-screen bg-[var(--orbit-bg-app)] text-[var(--orbit-text-primary)] p-6 md:p-10 font-sans pb-24">
      <div className="mx-auto max-w-6xl">
        
        {/* Page Header */}
        <div className="mb-10 text-center md:text-left" style={{ animation: 'fade-in-up 0.4s ease-out forwards' }}>
          <h1 className="text-3xl font-bold tracking-tight orbit-gradient-text flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--orbit-brand-bg)] flex items-center justify-center ring-1 ring-[var(--orbit-brand-border)]/50">
              <Star className="h-5 w-5 text-[var(--orbit-brand-light)]" fill="currentColor" />
            </div>
            Orbit Cred
          </h1>
          <p className="text-[var(--orbit-text-secondary)] mt-2 max-w-2xl text-sm">
            Your portable reputation profile on Orbit. Build your score and Community Trust Level through consistent participation.
          </p>
        </div>

        {/* Orbit Cred (Centerpiece) */}
        <div className="mb-12" style={{ animation: 'fade-in-up 0.5s ease-out forwards', animationDelay: '0.05s', animationFillMode: 'backwards' }}>
          
          {/* 3D Perspective Card Wrapper */}
          <div 
            className="w-full relative" 
            style={{ perspective: '1200px' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Card to capture for PNG */}
            <div 
              ref={credRef} 
              style={tiltStyle}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-orbit-void-700)] via-[var(--color-orbit-void-800)] to-[var(--color-orbit-void-950)] border border-[var(--orbit-brand-border)] shadow-[0_15px_45px_rgba(0,0,0,0.4)] p-[1px] transition-all duration-300 ease-out"
            >
              {/* Dynamic Glare Overlay */}
              <div 
                className="absolute inset-0 pointer-events-none z-10 opacity-0 transition-opacity duration-300" 
                style={glareStyle}
              />
              
              {/* Cosmic Constellation Background */}
              <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
                <svg className="w-full h-full" viewBox="0 0 800 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Concentric orbital paths */}
                  <circle cx="85%" cy="15%" r="140" stroke="url(#orbit-grad-1)" strokeWidth="1" fill="none" strokeDasharray="3 6" />
                  <circle cx="85%" cy="15%" r="220" stroke="url(#orbit-grad-2)" strokeWidth="0.75" fill="none" />
                  <circle cx="85%" cy="15%" r="300" stroke="url(#orbit-grad-1)" strokeWidth="0.5" fill="none" strokeDasharray="12 6" />
                  
                  {/* Grid Lines */}
                  <path d="M 0,40 L 800,40 M 0,90 L 800,90 M 0,140 L 800,140 M 0,190 L 800,190 M 0,240 L 800,240" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" />
                  <path d="M 100,0 L 100,300 M 220,0 L 220,300 M 340,0 L 340,300 M 460,0 L 460,300 M 580,0 L 580,300 M 700,0 L 700,300" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.5" />
                  
                  <defs>
                    <linearGradient id="orbit-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7c6ef7" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#24a688" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="orbit-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#24a688" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#7c6ef7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Decorative Card Header line */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--orbit-brand)] to-transparent opacity-80" />

              {/* Card Contents */}
              <div className="relative z-10 bg-[var(--color-orbit-void-950)]/70 backdrop-blur-md rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                
                {/* Left Area: Biometric Scan & Avatar */}
                <div className="flex flex-col items-center justify-center shrink-0">
                  {/* Photo frame with scanner scan-line */}
                  <div className="relative group w-36 h-36 rounded-2xl bg-[var(--orbit-bg-elevated)] border-2 border-[var(--orbit-brand)]/40 shadow-[0_0_25px_rgba(124,110,247,0.15)] flex items-center justify-center overflow-hidden ring-4 ring-[var(--orbit-brand)]/5 orbit-avatar-scan">
                    
                    {/* Corner brackets for high-tech biometric look */}
                    <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[var(--orbit-brand-light)]/80 pointer-events-none" />
                    <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[var(--orbit-brand-light)]/80 pointer-events-none" />
                    <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[var(--orbit-brand-light)]/80 pointer-events-none" />
                    <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[var(--orbit-brand-light)]/80 pointer-events-none" />

                    <img 
                      src={profile.avatar_url || "/orbi_official.png"} 
                      alt="Profile" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      crossOrigin="anonymous" 
                    />
                    
                    {/* Hover Upload Overlay */}
                    <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity cursor-pointer z-20" onClick={() => fileInputRef.current?.click()}>
                      {isUploading ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-white" />
                          <span className="text-[10px] text-white font-medium">Update Photo</span>
                        </>
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                  </div>
                  
                  {/* Trust Level Tag with neon dot */}
                  <div className="mt-4 px-4 py-1.5 rounded-full bg-[var(--orbit-brand-bg)] border border-[var(--orbit-brand-border)] text-[var(--orbit-brand-light)] text-[11px] font-bold tracking-wide text-center flex items-center gap-1.5 shadow-[0_0_12px_rgba(124,110,247,0.1)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--orbit-brand)] animate-pulse" />
                    {trustLevel}
                  </div>
                  
                  <span className="mt-2 text-[8px] font-mono tracking-widest text-[var(--orbit-text-muted)] uppercase">PHOTO ID SECURE</span>
                </div>

                {/* Right Area: Identity Visa Details */}
                <div className="flex-1 w-full flex flex-col justify-between">
                  
                  {/* Row 1: Header tags */}
                  <div className="flex flex-col sm:flex-row justify-between items-center border-b border-[var(--orbit-border)]/50 pb-4 mb-4 gap-2">
                    <div className="flex flex-col items-center sm:items-start">
                      <span className="text-[9px] font-mono tracking-widest text-[var(--orbit-text-muted)] uppercase">ORBIT IDENTITY PROTOCOL</span>
                      <span className="text-[9px] font-mono tracking-widest text-[var(--orbit-success)] uppercase flex items-center gap-1 mt-0.5">
                        <span className="w-1 h-1 rounded-full bg-[var(--orbit-success)]" /> SECURE STATUS: STELLAR ENCRYPTED
                      </span>
                    </div>
                    
                    {/* Card metallic chip */}
                    <div className="hidden sm:block">
                      <svg className="w-11 h-8 rounded opacity-80" viewBox="0 0 100 75" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="75" rx="8" fill="url(#chip-grad)" />
                        <path d="M 0,25 H 35 V 50 H 0 M 100,25 H 65 V 50 H 100 M 35,0 V 25 M 35,50 V 75 M 65,0 V 25 M 65,50 V 75 M 50,25 V 50" stroke="#101018" strokeWidth="2.5" strokeLinecap="round" />
                        <rect x="42" y="32" width="16" height="11" rx="2" fill="url(#chip-center)" stroke="#101018" strokeWidth="1.5" />
                        <defs>
                          <linearGradient id="chip-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f3d075" />
                            <stop offset="30%" stopColor="#ffd875" />
                            <stop offset="50%" stopColor="#9a815a" />
                            <stop offset="70%" stopColor="#ffd875" />
                            <stop offset="100%" stopColor="#d1a63c" />
                          </linearGradient>
                          <linearGradient id="chip-center" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffd875" />
                            <stop offset="100%" stopColor="#c8942b" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>

                  {/* Row 2: Name, Serial Number, Score Seal */}
                  <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start mb-6 gap-6">
                    <div className="text-center lg:text-left flex-1">
                      <h2 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center justify-center lg:justify-start gap-2">
                        {profile.full_name}
                        {trustLevel !== "Newcomer" && (
                          <div className="w-5 h-5 rounded-full bg-[var(--orbit-success-bg)] border border-[var(--orbit-success-border)] flex items-center justify-center">
                            <ShieldCheck className="h-3.5 w-3.5 text-[var(--orbit-success)]" />
                          </div>
                        )}
                      </h2>
                      
                      {/* Document ID */}
                      <p className="text-[10px] font-mono text-[var(--orbit-text-muted)] tracking-wider">
                        SERIAL: <span className="text-[var(--orbit-brand-light)] font-bold">{credId}</span>
                      </p>
                      
                      {/* Wallet public key with copy button */}
                      <div className="inline-flex items-center gap-1.5 mt-2 bg-[var(--orbit-bg-app)]/60 px-2.5 py-1 rounded-md border border-[var(--orbit-border)]/50 text-[10px] font-mono text-[var(--orbit-text-secondary)] hover:text-white transition-colors cursor-pointer group/wallet" onClick={handleCopyWallet}>
                        <span>WALLET: {shortWallet}</span>
                        <span className="text-[8px] bg-[var(--orbit-bg-elevated)] px-1 py-0.5 rounded text-[var(--orbit-text-muted)] uppercase tracking-wide group-hover/wallet:text-[var(--orbit-brand-light)]">
                          {copied ? "Copied!" : "Copy"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Glowing Biometric Score Seal */}
                    <div className="relative flex flex-col items-center justify-center bg-gradient-to-b from-[var(--color-orbit-void-600)] to-[var(--color-orbit-void-850)] border border-[var(--orbit-brand-border)] rounded-full w-24 h-24 shadow-[0_0_30px_rgba(124,110,247,0.22)] ring-4 ring-[var(--orbit-brand)]/5 group/seal">
                      {/* Inner dashed ring spinning */}
                      <div className="absolute inset-1 rounded-full border border-dashed border-[var(--orbit-brand)]/30 pointer-events-none" style={{ animation: 'spin-slow 20s linear infinite' }} />
                      <div className="absolute inset-2.5 rounded-full bg-[var(--color-orbit-void-950)]/90 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white font-mono tracking-tighter leading-none">{profile.orbit_score}</span>
                        <span className="text-[8px] uppercase tracking-widest text-[var(--orbit-brand-light)] font-black mt-1">SCORE</span>
                      </div>
                      
                      {/* Radial shine light */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none opacity-0 group-hover/seal:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>

                  {/* Row 3: Metrics grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
                    {[
                      { label: "On-Time Contribs", value: stats.totalPaid, color: "text-[var(--orbit-success)]" },
                      { label: "Total Contributions", value: stats.totalPaid + stats.totalMissed, color: "text-white" },
                      { label: "Badges Earned", value: earnedBadgesCount, color: "text-white" },
                      { label: "Member Since", value: memberSinceDate, color: "text-[var(--orbit-brand-light)]", isDate: true },
                    ].map((stat, i) => (
                      <div key={i} className="flex flex-col bg-[var(--orbit-bg-app)]/40 rounded-xl p-3 border border-[var(--orbit-border)]/40 hover:bg-[var(--orbit-bg-app)]/80 hover:border-[var(--orbit-brand)]/20 transition-all duration-300">
                        <span className="text-[9px] text-[var(--orbit-text-muted)] uppercase tracking-wider mb-1 font-semibold">{stat.label}</span>
                        <span className={`${stat.isDate ? 'text-xs' : 'text-lg'} font-bold ${stat.color} font-mono tracking-tight`}>{stat.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Row 4: Miniature earned badges row */}
                  {earnedBadgesCount > 0 && (
                    <div className="flex items-center gap-3 pt-4 border-t border-[var(--orbit-border)]/50">
                      <span className="text-[9px] text-[var(--orbit-text-muted)] uppercase tracking-widest font-mono shrink-0">ACTIVE CREDENTIALS:</span>
                      <div className="flex flex-wrap gap-2">
                        {BADGE_DEFINITIONS.filter(b => b.current >= b.required).map(badge => (
                          <div key={badge.id} className="w-8 h-8 rounded-full bg-[var(--orbit-brand-bg)] border border-[var(--orbit-brand-border)] flex items-center justify-center shadow-[0_0_10px_rgba(124,110,247,0.15)] hover:border-[var(--orbit-brand-light)] hover:shadow-[0_0_15px_rgba(124,110,247,0.3)] hover:scale-105 transition-all cursor-pointer" title={badge.name} onClick={() => setSelectedBadge(badge)}>
                            <badge.icon className="w-4 h-4 text-[var(--orbit-brand-light)]" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={handleDownloadCred} className="orbit-btn-secondary flex items-center gap-2 py-2 rounded-lg text-xs hover:border-[var(--orbit-brand)] hover:text-white transition-colors duration-300">
              <Download className="w-3.5 h-3.5 text-[var(--orbit-brand-light)]" /> Download Cred Card
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" style={{ animation: 'fade-in-up 0.5s ease-out forwards', animationDelay: '0.1s', animationFillMode: 'backwards' }}>
          
          {/* Achievement Badges Section */}
          <section className="relative overflow-hidden rounded-2xl border border-[var(--orbit-border)] bg-[var(--orbit-bg-card)] p-6 transition-colors hover:border-[var(--orbit-border-hover)]">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-[var(--orbit-brand)]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-base font-semibold flex items-center gap-2.5 text-white">
                <div className="w-7 h-7 rounded-lg bg-[var(--orbit-brand-bg)] flex items-center justify-center ring-1 ring-[var(--orbit-brand-border)]/50">
                  <Award className="h-3.5 w-3.5 text-[var(--orbit-brand-light)]" />
                </div>
                Achievement Credentials
              </h2>
              <span className="text-[10px] font-mono bg-[var(--orbit-brand-bg)] px-2.5 py-0.5 rounded-full border border-[var(--orbit-brand-border)] text-[var(--orbit-brand-light)] font-bold uppercase tracking-wider">
                {earnedBadgesCount} / {BADGE_DEFINITIONS.length} Earned
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
              {BADGE_DEFINITIONS.map((badge) => {
                const isEarned = badge.current >= badge.required;
                return (
                  <button 
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`orbit-shimmer text-left group flex items-start gap-3.5 p-4 rounded-xl border transition-all duration-300 outline-none ${
                      isEarned 
                        ? 'bg-gradient-to-b from-[var(--orbit-bg-elevated)] to-[var(--color-orbit-void-700)] border-[var(--orbit-border)] hover:border-[var(--orbit-brand)]/40 hover:shadow-[0_4px_20px_rgba(124,110,247,0.08)] hover:-translate-y-0.5 cursor-pointer' 
                        : 'bg-transparent border-dashed border-[var(--orbit-border)]/60 opacity-45 hover:opacity-75 hover:border-[var(--orbit-border-hover)] cursor-pointer'
                    }`}
                  >
                    <div className={`relative w-11 h-11 rounded-xl shrink-0 flex items-center justify-center transition-all duration-300 ${
                      isEarned 
                        ? 'bg-gradient-to-br from-[#1a1635] to-[var(--color-orbit-void-800)] ring-1 ring-[var(--orbit-brand)]/35 shadow-[0_0_12px_rgba(124,110,247,0.2)] orbit-medal-unlocked' 
                        : 'bg-[var(--orbit-bg-app)]/50 ring-1 ring-[var(--orbit-border)]'
                    }`}>
                      <badge.icon className={`w-5 h-5 transition-all duration-300 ${isEarned ? 'text-[var(--orbit-brand-light)]' : 'text-[var(--orbit-text-muted)]'}`} />
                      {!isEarned && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--orbit-bg-elevated)] border border-[var(--orbit-border)] flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-[var(--orbit-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white mb-0.5 flex items-center gap-1.5">
                        {badge.name}
                        {isEarned && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--orbit-success)] shrink-0" />}
                      </h3>
                      <p className="text-[11px] text-[var(--orbit-text-muted)] line-clamp-1">{badge.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Reputation Timeline */}
          <section className="relative overflow-hidden rounded-2xl border border-[var(--orbit-border)] bg-[var(--orbit-bg-card)] p-6 flex flex-col h-[500px] transition-colors hover:border-[var(--orbit-border-hover)]">
            <h2 className="text-base font-semibold mb-6 shrink-0 flex items-center gap-2.5 text-white">
              <div className="w-7 h-7 rounded-lg bg-[var(--orbit-brand-bg)] flex items-center justify-center ring-1 ring-[var(--orbit-brand-border)]/50">
                <Activity className="h-3.5 w-3.5 text-[var(--orbit-brand-light)]" />
              </div>
              Reputation Ledger
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-[var(--orbit-brand)] via-[var(--orbit-success)] to-transparent pointer-events-none" />
              
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[var(--orbit-text-secondary)]">No score history yet.</p>
                  <p className="text-xs text-[var(--orbit-text-muted)] mt-1">Score changes will appear here.</p>
                </div>
              ) : (
                history.map((entry) => {
                  const isPositive = entry.score_change > 0;
                  const isNegative = entry.score_change < 0;
                  return (
                    <div key={entry.id} className="relative flex items-start gap-4 z-10">
                      <div className="relative z-10 w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1 border bg-[var(--color-orbit-void-900)] border-[var(--orbit-border)]">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          isPositive ? 'bg-[var(--orbit-success)] animate-pulse shadow-[0_0_8px_var(--orbit-success)]' : 
                          isNegative ? 'bg-[var(--orbit-danger)] animate-pulse shadow-[0_0_8px_var(--orbit-danger)]' : 
                          'bg-[var(--orbit-brand)] shadow-[0_0_8px_var(--orbit-brand)]'
                        }`} />
                      </div>
                      <div className="flex-1 bg-gradient-to-b from-[var(--orbit-bg-elevated)] to-[var(--color-orbit-void-700)] border border-[var(--orbit-border)] hover:border-[var(--orbit-brand-border)] hover:shadow-[0_4px_12px_rgba(124,110,247,0.04)] rounded-xl p-4 transition-all duration-300">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-xs text-white font-semibold tracking-wide">{entry.event_type}</p>
                          <span className={`text-xs font-black font-mono px-2 py-0.5 rounded ${
                            isPositive ? 'bg-[var(--orbit-success-bg)] text-[var(--orbit-success)] border border-[var(--orbit-success-border)]' : 
                            isNegative ? 'bg-[var(--orbit-danger-bg)] text-[var(--orbit-danger)] border border-[var(--orbit-danger-border)]' : 
                            'bg-[var(--color-orbit-void-950)] text-[var(--orbit-text-secondary)] border border-[var(--orbit-border)]'
                          }`}>
                            {isPositive ? '+' : ''}{entry.score_change}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <time className="text-[var(--orbit-text-muted)] font-medium">
                            {new Date(entry.created_at).toLocaleString()}
                          </time>
                          <span className="text-[var(--orbit-text-muted)]">
                            LEDGER: <span className="text-[var(--orbit-text-secondary)] font-bold font-mono">{entry.previous_score} → {entry.new_score}</span>
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
        <div className="orbit-modal-overlay" onClick={() => setSelectedBadge(null)}>
          <div className="orbit-modal-panel max-w-md relative overflow-hidden" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            
            {/* Top decorative gradient line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--orbit-brand)] via-[var(--orbit-brand-light)] to-[var(--orbit-success)]" />

            {/* Glowing background spotlight beam behind the medal */}
            <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--orbit-brand)]/15 rounded-full blur-3xl pointer-events-none" />

            <button onClick={() => setSelectedBadge(null)} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[var(--color-orbit-void-900)] border border-[var(--orbit-border)] hover:bg-[var(--color-orbit-void-500)] flex items-center justify-center text-[var(--orbit-text-secondary)] hover:text-white transition-colors cursor-pointer z-20">
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex flex-col items-center text-center mt-6 pt-4 px-6 pb-6 relative z-10">
              {/* Spinning/floating display container for the medal */}
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-6 relative ${
                selectedBadge.current >= selectedBadge.required 
                  ? 'bg-gradient-to-br from-[#1a1635] to-[var(--color-orbit-void-700)] border-2 border-[var(--orbit-brand)]/60 shadow-[0_0_35px_rgba(124,110,247,0.3)] orbit-medal-unlocked' 
                  : 'bg-[var(--orbit-bg-app)]/80 border-2 border-dashed border-[var(--orbit-border)]'
              }`}>
                <selectedBadge.icon className={`w-12 h-12 ${selectedBadge.current >= selectedBadge.required ? 'text-[var(--orbit-brand-light)]' : 'text-[var(--orbit-text-muted)]'}`} />
                {selectedBadge.current < selectedBadge.required && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
                    <svg className="w-6 h-6 text-[var(--orbit-text-muted)]/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-black text-white mb-2 tracking-tight">{selectedBadge.name}</h2>
              <p className="text-sm text-[var(--orbit-text-secondary)] mb-6 max-w-sm">{selectedBadge.desc}</p>
              
              <div className="w-full bg-[var(--color-orbit-void-950)]/80 border border-[var(--orbit-border)]/80 rounded-xl p-5 shadow-inner">
                <div className="flex justify-between items-center mb-3 text-xs font-semibold uppercase tracking-wider font-mono">
                  <span className="text-[var(--orbit-text-muted)]">Progress Tracker</span>
                  <span className="text-[var(--orbit-brand-light)] font-black">{Math.min(selectedBadge.current, selectedBadge.required)} / {selectedBadge.required}</span>
                </div>
                <div className="w-full h-2.5 bg-[var(--orbit-bg-app)] rounded-full overflow-hidden p-[1px] border border-[var(--orbit-border)]/30">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--orbit-brand)] to-[var(--orbit-brand-light)] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(124,110,247,0.5)]"
                    style={{ width: `${Math.min(100, (selectedBadge.current / selectedBadge.required) * 100)}%` }}
                  />
                </div>
                {selectedBadge.current >= selectedBadge.required ? (
                  <div className="mt-4 text-[11px] font-black text-[var(--orbit-success)] flex items-center justify-center gap-2 uppercase tracking-widest font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--orbit-success)] animate-ping" />
                    Credential Unlocked
                  </div>
                ) : (
                  <div className="mt-4 text-[11px] font-bold text-[var(--orbit-text-muted)] flex items-center justify-center gap-1.5 uppercase tracking-widest font-mono">
                    Locked — Keep Contributing
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
