"use client";

import { useState } from "react";
import { X, Calendar, Users, CircleDollarSign, Clock, Tag } from "lucide-react";

interface CreateOrbitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOrbitModal({ isOpen, onClose }: CreateOrbitModalProps) {
  const [orbitName, setOrbitName] = useState("");
  const [crewMembers, setCrewMembers] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [frequency, setFrequency] = useState("Weekly");
  const [startDate, setStartDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Connect to Supabase and initialize Soroban contract
    console.log({
      orbitName,
      crewMembers,
      depositAmount,
      frequency,
      startDate,
    });

    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--color-orbit-void-950)]/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[500px] rounded-[var(--radius-orbit-xl)] bg-[var(--orbit-bg-card)] border border-[var(--orbit-border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--orbit-border)] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--orbit-text-primary)]">
              Create a new Orbit
            </h2>
            <p className="text-sm text-[var(--orbit-text-secondary)]">
              Set up your community savings circle.
            </p>
          </div>
          <button
            onClick={onClose}
            className="orbit-icon-btn rounded-full hover:bg-[var(--orbit-danger-bg)] hover:text-[var(--orbit-danger)] hover:border-[var(--orbit-danger-border)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col gap-5">
            {/* Orbit Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--orbit-text-secondary)]">
                Orbit name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--orbit-text-muted)]">
                  <Tag className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g., Factory Crew Orbit"
                  value={orbitName}
                  onChange={(e) => setOrbitName(e.target.value)}
                  className="w-full bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-[var(--radius-orbit-md)] py-2.5 pl-9 pr-3 text-sm text-[var(--orbit-text-primary)] placeholder-[var(--orbit-text-muted)] focus:outline-none focus:border-[var(--orbit-brand)] focus:ring-1 focus:ring-[var(--orbit-brand)] transition-all"
                />
              </div>
            </div>

            {/* Side-by-side: Crew Members & Deposit Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--orbit-text-secondary)]">
                  No. of crew members
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--orbit-text-muted)]">
                    <Users className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    required
                    placeholder="5"
                    value={crewMembers}
                    onChange={(e) => setCrewMembers(e.target.value)}
                    className="w-full bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-[var(--radius-orbit-md)] py-2.5 pl-9 pr-3 text-sm text-[var(--orbit-text-primary)] placeholder-[var(--orbit-text-muted)] focus:outline-none focus:border-[var(--orbit-brand)] focus:ring-1 focus:ring-[var(--orbit-brand)] transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--orbit-text-secondary)]">
                  Deposit amount (USDC)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--orbit-text-muted)]">
                    <CircleDollarSign className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="10"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-[var(--radius-orbit-md)] py-2.5 pl-9 pr-3 text-sm text-[var(--orbit-text-primary)] placeholder-[var(--orbit-text-muted)] focus:outline-none focus:border-[var(--orbit-brand)] focus:ring-1 focus:ring-[var(--orbit-brand)] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Frequency */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--orbit-text-secondary)]">
                Frequency
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--orbit-text-muted)]">
                  <Clock className="h-4 w-4" />
                </div>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full appearance-none bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-[var(--radius-orbit-md)] py-2.5 pl-9 pr-10 text-sm text-[var(--orbit-text-primary)] focus:outline-none focus:border-[var(--orbit-brand)] focus:ring-1 focus:ring-[var(--orbit-brand)] transition-all"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-weekly">Bi-weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[var(--orbit-text-muted)]">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Cycle Start Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--orbit-text-secondary)]">
                Cycle start date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--orbit-text-muted)]">
                  <Calendar className="h-4 w-4" />
                </div>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-[var(--radius-orbit-md)] py-2.5 pl-9 pr-3 text-sm text-[var(--orbit-text-primary)] focus:outline-none focus:border-[var(--orbit-brand)] focus:ring-1 focus:ring-[var(--orbit-brand)] transition-all color-scheme-dark"
                  style={{ colorScheme: "dark" }} // Ensures the browser's native date picker matches the dark theme
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-[var(--orbit-border)]">
            <button
              type="button"
              onClick={onClose}
              className="orbit-btn-neutral px-5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="orbit-btn-primary px-6"
            >
              {isSubmitting ? "Creating..." : "Create Orbit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
