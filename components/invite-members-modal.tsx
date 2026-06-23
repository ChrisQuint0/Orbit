"use client";

import { useState } from "react";
import { X, Copy, Share2, Users, CheckCircle2 } from "lucide-react";

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
      <div className="relative w-full max-w-[450px] rounded-[var(--radius-orbit-xl)] bg-[var(--orbit-bg-card)] border border-[var(--orbit-border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[var(--orbit-border)] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--orbit-text-primary)]">Invite Members</h2>
          </div>
          <button onClick={onClose} className="orbit-icon-btn rounded-full hover:bg-[var(--orbit-danger-bg)] hover:text-[var(--orbit-danger)] hover:border-[var(--orbit-danger-border)]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--orbit-brand-bg)] flex items-center justify-center mb-3">
              <Users className="text-[var(--orbit-brand-light)]" size={24} />
            </div>
            <h3 className="font-bold text-lg text-white mb-1">{orbitName}</h3>
            <p className="text-sm text-[var(--orbit-text-secondary)]">Invite your crew to complete the circle.</p>
          </div>

          <div className="bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-xl p-4 mb-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-semibold text-[var(--orbit-text-secondary)] uppercase tracking-wider">Membership Progress</span>
              <span className="text-sm font-bold text-white">{joinedMembers} / {totalMembers} Joined</span>
            </div>
            <div className="orbit-progress-track mb-3 h-2 bg-[var(--orbit-bg-elevated)] rounded-full overflow-hidden">
              <div className="orbit-progress-fill bg-gradient-to-r from-[var(--orbit-brand-light)] to-[var(--orbit-brand)] rounded-full relative h-full transition-all" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <p className="text-xs font-medium text-[var(--orbit-brand-light)]">
              Waiting for {missingMembers} more {missingMembers === 1 ? 'member' : 'members'}
            </p>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <label className="text-sm font-medium text-[var(--orbit-text-secondary)]">Invite Code</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-xl py-3 px-4 text-center text-xl tracking-[0.25em] text-[var(--orbit-brand-light)] font-mono font-bold overflow-hidden whitespace-nowrap text-ellipsis uppercase">
                {displayCode}
              </div>
              <button onClick={handleCopy} className="bg-[var(--orbit-bg-elevated)] hover:bg-[var(--orbit-brand-bg)] border border-[var(--orbit-border)] hover:border-[var(--orbit-brand-border)] text-white px-5 rounded-xl transition-colors flex items-center justify-center shrink-0">
                {copied ? <CheckCircle2 size={18} className="text-[var(--orbit-success)]" /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <button className="w-full orbit-btn-secondary py-3 flex items-center justify-center gap-2">
            <Share2 size={16} /> Share via Apps
          </button>
        </div>
      </div>
    </div>
  );
}
