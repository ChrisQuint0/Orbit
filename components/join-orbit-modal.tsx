"use client";

import { useState } from "react";
import { X, KeyRound, ArrowRight } from "lucide-react";

interface JoinOrbitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinOrbitModal({ isOpen, onClose }: JoinOrbitModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  if (!isOpen) return null;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    // Simulate join action
    setTimeout(() => {
      setIsJoining(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-[var(--color-orbit-void-950)]/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-[400px] rounded-[var(--radius-orbit-xl)] bg-[var(--orbit-bg-card)] border border-[var(--orbit-border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[var(--orbit-border)] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--orbit-text-primary)]">Join an Orbit</h2>
          </div>
          <button onClick={onClose} className="orbit-icon-btn rounded-full hover:bg-[var(--orbit-danger-bg)] hover:text-[var(--orbit-danger)] hover:border-[var(--orbit-danger-border)]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="p-6">
          <p className="text-sm text-[var(--orbit-text-secondary)] mb-6">
            Enter the invite code you received to join your crew's savings circle.
          </p>
          <div className="flex flex-col gap-1.5 mb-6">
            <label className="text-sm font-medium text-[var(--orbit-text-secondary)]">Invite Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--orbit-text-muted)]">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                placeholder="Paste code here..."
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-[var(--radius-orbit-md)] py-3 pl-10 pr-3 text-sm text-[var(--orbit-text-primary)] placeholder-[var(--orbit-text-muted)] focus:outline-none focus:border-[var(--orbit-brand)] focus:ring-1 focus:ring-[var(--orbit-brand)] transition-all font-mono"
              />
            </div>
          </div>

          <button type="submit" disabled={isJoining || !inviteCode.trim()} className="w-full orbit-btn-primary py-3 flex items-center justify-center gap-2">
            {isJoining ? "Joining..." : "Join Orbit"} <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
