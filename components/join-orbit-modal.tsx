"use client";

import { useState } from "react";
import { X, KeyRound, ArrowRight, Loader2 } from "lucide-react";
import { joinOrbitAction } from "@/app/actions/orbit";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface JoinOrbitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinOrbitModal({ isOpen, onClose }: JoinOrbitModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    setErrorMsg("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg("You must be logged in to join an orbit.");
        setIsJoining(false);
        return;
      }

      const res = await joinOrbitAction({
        userId: user.id,
        inviteCode: inviteCode.trim(),
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to join orbit.");
      } else {
        // Success
        onClose();
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div 
        className="absolute inset-0 bg-[var(--color-orbit-void-950)]/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-[420px] rounded-2xl bg-gradient-to-b from-[var(--color-orbit-void-600)] to-[var(--color-orbit-void-700)] border border-[var(--orbit-border-strong)] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6),0_8px_20px_-8px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top brand line indicator */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--orbit-brand)] to-transparent" />
        
        {/* Spotlight decoration glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[var(--orbit-brand)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-[var(--orbit-border)]/50 px-6 py-4 relative z-10">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Join Crew Orbit
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="orbit-icon-btn rounded-full hover:bg-[var(--orbit-danger-bg)] hover:text-[var(--orbit-danger)] hover:border-[var(--orbit-danger-border)] transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="p-6 relative z-10">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-[var(--orbit-danger-bg)] border border-[var(--orbit-danger-border)] text-xs font-semibold text-[var(--orbit-danger)] tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--orbit-danger)] shrink-0 animate-pulse" />
              {errorMsg}
            </div>
          )}
          
          <p className="text-xs text-[var(--orbit-text-secondary)] mb-6 leading-relaxed">
            Enter the 6-character cryptographic invite code to establish connection with your crew's savings circle.
          </p>

          <div className="flex flex-col gap-2 mb-6">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--orbit-text-muted)]">Secure Invite Key</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--orbit-text-muted)] group-focus-within:text-[var(--orbit-brand-light)] transition-colors">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="Ex. 8A3D9C"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full bg-[var(--orbit-bg-app)]/80 border border-[var(--orbit-border)] hover:border-[var(--orbit-border-hover)] focus:border-[var(--orbit-brand)]/80 focus:ring-1 focus:ring-[var(--orbit-brand)]/40 rounded-xl py-3 pl-11 pr-3 text-sm text-center text-white placeholder-[var(--orbit-text-muted)] focus:outline-none transition-all font-mono font-black tracking-widest uppercase select-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isJoining || !inviteCode.trim()} 
            className="w-full orbit-btn-primary py-3.5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer hover:shadow-[0_0_20px_rgba(124,110,247,0.25)] hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
          >
            {isJoining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" /> Connecting...
              </>
            ) : (
              <>
                Confirm Join <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
