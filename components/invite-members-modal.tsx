"use client";

import { useState } from "react";
import { X, Copy, Users, CheckCircle2 } from "lucide-react";

interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orbitName: string;
  joinedMembers: number;
  totalMembers: number;
  inviteCode?: string;
}

export function InviteMembersModal({ isOpen, onClose, orbitName, joinedMembers, totalMembers, inviteCode }: InviteMembersModalProps) {
  const [copied, setCopied] = useState(false);
  const displayCode = inviteCode || "------";

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progressPercentage = (joinedMembers / totalMembers) * 100;
  const missingMembers = totalMembers - joinedMembers;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-[var(--color-orbit-void-950)]/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-[440px] rounded-2xl bg-gradient-to-b from-[var(--color-orbit-void-600)] to-[var(--color-orbit-void-700)] border border-[var(--orbit-border-strong)] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6),0_8px_20px_-8px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top neon indicator */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--orbit-brand)] to-transparent" />
        
        {/* Spotlight decoration glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--orbit-brand)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-[var(--orbit-border)]/50 px-6 py-4 relative z-10">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Invite Members</h2>
          </div>
          <button 
            onClick={onClose} 
            className="orbit-icon-btn rounded-full hover:bg-[var(--orbit-danger-bg)] hover:text-[var(--orbit-danger)] hover:border-[var(--orbit-danger-border)] transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 relative z-10">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--orbit-brand-bg)] border border-[var(--orbit-brand-border)] flex items-center justify-center mb-3.5 shadow-lg">
              <Users className="text-[var(--orbit-brand-light)] animate-pulse" size={20} />
            </div>
            <h3 className="font-bold text-lg text-white mb-1 tracking-tight">{orbitName}</h3>
            <p className="text-xs text-[var(--orbit-text-secondary)]">Invite your crew members to complete the circle registration.</p>
          </div>

          <div className="bg-[var(--color-orbit-void-900)] border border-[var(--orbit-border)] rounded-xl p-4.5 mb-6">
            <div className="flex justify-between items-end mb-2.5 font-mono">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--orbit-text-secondary)]">Membership Progress</span>
              <span className="text-xs font-black text-white">{joinedMembers} / {totalMembers} Joined</span>
            </div>
            
            <div className="w-full h-2.5 bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)]/30 rounded-full overflow-hidden p-[1px] mb-3">
              <div 
                className="h-full bg-gradient-to-r from-[var(--orbit-brand-light)] to-[var(--orbit-brand)] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(124,110,247,0.3)]" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            <p className="text-[11px] font-semibold text-[var(--orbit-brand-light)] uppercase tracking-wider">
              Waiting for {missingMembers} more {missingMembers === 1 ? 'member' : 'members'}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--orbit-text-muted)]">Secure Invite Key</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-[var(--orbit-bg-app)]/85 border border-[var(--orbit-border)] rounded-xl py-3 px-4 text-center text-lg tracking-[0.2em] text-[var(--orbit-brand-light)] font-mono font-black overflow-hidden whitespace-nowrap text-ellipsis uppercase shadow-inner">
                {displayCode}
              </div>
              <button 
                onClick={handleCopy} 
                className="bg-[var(--orbit-bg-elevated)] hover:bg-[var(--orbit-brand-bg)] border border-[var(--orbit-border)] hover:border-[var(--orbit-brand-border)] text-white hover:text-[var(--orbit-brand-light)] px-5 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-sm active:scale-95"
                title="Copy Invite Key"
              >
                {copied ? <CheckCircle2 size={16} className="text-[var(--orbit-success)] animate-bounce" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
