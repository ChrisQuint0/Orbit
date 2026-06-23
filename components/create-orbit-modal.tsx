"use client";

import { useState } from "react";
import { X, Calendar, Users, CircleDollarSign, Clock, Tag, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { createOrbitAction } from "@/app/actions/orbit";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface CreateOrbitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOrbitModal({ isOpen, onClose }: CreateOrbitModalProps) {
  const [step, setStep] = useState<"form" | "summary" | "success">("form");
  const [orbitName, setOrbitName] = useState("");
  const [crewMembers, setCrewMembers] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [frequency, setFrequency] = useState("Weekly");
  const [startDate, setStartDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  if (!isOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("summary");
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg("You must be logged in to create an orbit.");
        setIsSubmitting(false);
        return;
      }

      const res = await createOrbitAction({
        userId: user.id,
        name: orbitName,
        depositAmount: Number(depositAmount),
        numMembers: Number(crewMembers),
        frequency: frequency,
        startDate: startDate,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to create orbit.");
      } else {
        setStep("success");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state on close
    setTimeout(() => {
      setStep("form");
      setOrbitName("");
      setCrewMembers("");
      setDepositAmount("");
      setFrequency("Weekly");
      setStartDate("");
    }, 200);
    onClose();
    // Refresh the router if we are on the orbits page
    router.refresh();
  };

  const totalPool = (Number(depositAmount) * (Number(crewMembers) - 1)) || 0;
  const durationCycles = Number(crewMembers) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div
        className="absolute inset-0 bg-[var(--color-orbit-void-950)]/70 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-[500px] rounded-2xl bg-gradient-to-b from-[var(--color-orbit-void-600)] to-[var(--color-orbit-void-700)] border border-[var(--orbit-border-strong)] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6),0_8px_20px_-8px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top brand line indicator */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--orbit-brand)] to-transparent" />
        
        {/* Background spotlight shine */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-[var(--orbit-brand)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-[var(--orbit-border)]/50 px-6 py-4 relative z-10">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {step === "form" ? "Create new Orbit" : step === "summary" ? "Review Orbit Specifications" : "Orbit Created Successfully"}
            </h2>
            {step === "form" && <p className="text-xs text-[var(--orbit-text-secondary)] mt-0.5">Set up your decentralized savings circle parameters.</p>}
          </div>
          <button
            onClick={handleClose}
            className="orbit-icon-btn rounded-full hover:bg-[var(--orbit-danger-bg)] hover:text-[var(--orbit-danger)] hover:border-[var(--orbit-danger-border)] transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "form" && (
          <form onSubmit={handleNext} className="p-6 relative z-10">
            <div className="flex flex-col gap-5">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--orbit-text-muted)]">Orbit Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--orbit-text-muted)] group-focus-within:text-[var(--orbit-brand-light)] transition-colors"><Tag className="h-4 w-4" /></div>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., Factory Crew Savings" 
                    value={orbitName} 
                    onChange={(e) => setOrbitName(e.target.value)} 
                    className="w-full bg-[var(--orbit-bg-app)]/80 border border-[var(--orbit-border)] hover:border-[var(--orbit-border-hover)] focus:border-[var(--orbit-brand)]/80 focus:ring-1 focus:ring-[var(--orbit-brand)]/40 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-[var(--orbit-text-muted)] focus:outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--orbit-text-muted)]">No. of crew members</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--orbit-text-muted)] group-focus-within:text-[var(--orbit-brand-light)] transition-colors"><Users className="h-4 w-4" /></div>
                    <input 
                      type="number" 
                      min="2" 
                      max="50" 
                      required 
                      placeholder="5" 
                      value={crewMembers} 
                      onChange={(e) => setCrewMembers(e.target.value)} 
                      className="w-full bg-[var(--orbit-bg-app)]/80 border border-[var(--orbit-border)] hover:border-[var(--orbit-border-hover)] focus:border-[var(--orbit-brand)]/80 focus:ring-1 focus:ring-[var(--orbit-brand)]/40 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-[var(--orbit-text-muted)] focus:outline-none transition-all font-mono" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--orbit-text-muted)]">Deposit amount (USDC)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--orbit-text-muted)] group-focus-within:text-[var(--orbit-brand-light)] transition-colors"><CircleDollarSign className="h-4 w-4" /></div>
                    <input 
                      type="number" 
                      min="1" 
                      required 
                      placeholder="10" 
                      value={depositAmount} 
                      onChange={(e) => setDepositAmount(e.target.value)} 
                      className="w-full bg-[var(--orbit-bg-app)]/80 border border-[var(--orbit-border)] hover:border-[var(--orbit-border-hover)] focus:border-[var(--orbit-brand)]/80 focus:ring-1 focus:ring-[var(--orbit-brand)]/40 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-[var(--orbit-text-muted)] focus:outline-none transition-all font-mono" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--orbit-text-muted)]">Contribution Frequency</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--orbit-text-muted)] group-focus-within:text-[var(--orbit-brand-light)] transition-colors"><Clock className="h-4 w-4" /></div>
                  <select 
                    value={frequency} 
                    onChange={(e) => setFrequency(e.target.value)} 
                    className="w-full appearance-none bg-[var(--orbit-bg-app)]/80 border border-[var(--orbit-border)] hover:border-[var(--orbit-border-hover)] focus:border-[var(--orbit-brand)]/80 focus:ring-1 focus:ring-[var(--orbit-brand)]/40 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none transition-all"
                  >
                    <option value="Weekly" className="bg-[var(--color-orbit-void-700)]">Weekly</option>
                    <option value="Bi-weekly" className="bg-[var(--color-orbit-void-700)]">Bi-weekly</option>
                    <option value="Monthly" className="bg-[var(--color-orbit-void-700)]">Monthly</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-[var(--orbit-text-muted)]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--orbit-text-muted)]">Cycle start date</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--orbit-text-muted)] group-focus-within:text-[var(--orbit-brand-light)] transition-colors"><Calendar className="h-4 w-4" /></div>
                  <input 
                    type="date" 
                    required 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="w-full bg-[var(--orbit-bg-app)]/80 border border-[var(--orbit-border)] hover:border-[var(--orbit-border-hover)] focus:border-[var(--orbit-brand)]/80 focus:ring-1 focus:ring-[var(--orbit-brand)]/40 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none transition-all color-scheme-dark" 
                    style={{ colorScheme: "dark" }} 
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-[var(--orbit-border)]/50">
              <button type="button" onClick={handleClose} className="orbit-btn-neutral px-5 rounded-xl h-10 text-xs font-bold uppercase tracking-wider">Cancel</button>
              <button type="submit" className="orbit-btn-primary px-6 h-10 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2">Next <ArrowRight size={14}/></button>
            </div>
          </form>
        )}

        {step === "summary" && (
          <div className="p-6 relative z-10">
            <div className="bg-[var(--color-orbit-void-900)]/80 border border-[var(--orbit-border)] rounded-xl p-5 mb-5 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--orbit-brand)] to-transparent opacity-80" />
              
              {errorMsg && (
                <div className="mb-4 p-3.5 rounded-lg bg-[var(--orbit-danger-bg)] border border-[var(--orbit-danger-border)] text-xs font-semibold text-[var(--orbit-danger)]">
                  {errorMsg}
                </div>
              )}
              
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-[var(--orbit-border)]/40 pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--orbit-text-secondary)] font-mono">Orbit Name</span>
                  <span className="text-sm font-semibold text-white">{orbitName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[var(--orbit-border)]/40 pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--orbit-text-secondary)] font-mono">Members</span>
                  <span className="text-sm font-semibold text-white font-mono">{crewMembers}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[var(--orbit-border)]/40 pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--orbit-text-secondary)] font-mono">Deposit Amount</span>
                  <span className="text-sm font-bold text-[var(--orbit-brand-light)] font-mono">{depositAmount} USDC</span>
                </div>
                <div className="flex justify-between items-center border-b border-[var(--orbit-border)]/40 pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--orbit-text-secondary)] font-mono">Frequency</span>
                  <span className="text-sm font-semibold text-white">{frequency}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[var(--orbit-border)]/40 pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--orbit-text-secondary)] font-mono">Duration</span>
                  <span className="text-sm font-semibold text-white font-mono">{durationCycles} Cycles</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--orbit-text-secondary)] font-mono">Total Pool</span>
                  <span className="text-lg font-black text-white font-mono">{totalPool} USDC</span>
                </div>
              </div>

              {/* Dynamic Exemption Rule Reminder */}
              {Number(crewMembers) > 1 && Number(depositAmount) > 0 && (
                <div className="mt-4 p-3.5 bg-[var(--orbit-brand-bg)] border border-[var(--orbit-brand-border)]/50 rounded-xl text-xs flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-[var(--orbit-brand-light)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <p className="text-[var(--orbit-text-secondary)] leading-relaxed">
                    <span className="font-semibold text-white">Dynamic Exemption Rule:</span> In each cycle, the cycle recipient is exempted from contributing. Only <span className="font-bold text-white font-mono">{Number(crewMembers) - 1}</span> active contributors will pay <span className="font-bold text-[var(--orbit-brand-light)] font-mono">{depositAmount} USDC</span> each, totaling <span className="font-bold text-white font-mono">{totalPool} USDC</span>.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between pt-4 border-t border-[var(--orbit-border)]/50">
              <button type="button" onClick={() => setStep("form")} className="orbit-btn-neutral px-5 h-10 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5"><ArrowLeft size={14}/> Back</button>
              <button 
                type="button" 
                onClick={handleCreate} 
                disabled={isSubmitting} 
                className="orbit-btn-primary px-6 h-10 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 hover:shadow-[0_0_20px_rgba(124,110,247,0.25)] active:scale-98 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" /> Creating...
                  </>
                ) : (
                  "Confirm & Create"
                )}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="p-8 md:p-10 flex flex-col items-center text-center relative z-10">
            {/* Spinning/pulsing verified seal ring */}
            <div className="relative w-20 h-20 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full border border-dashed border-[var(--orbit-success)]/40 pointer-events-none animate-spin" style={{ animationDuration: '10s' }} />
              <div className="absolute inset-1.5 rounded-full bg-[var(--orbit-success-bg)] flex items-center justify-center border border-[var(--orbit-success-border)] shadow-[0_0_20px_rgba(36,166,136,0.2)]">
                <svg className="w-8 h-8 text-[var(--orbit-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Orbit Established</h2>
            <p className="text-sm text-[var(--orbit-text-secondary)] mb-8 leading-relaxed max-w-sm">
              <span className="font-bold text-white">{orbitName}</span> has been successfully registered. You can now invite members using your secure invite credentials.
            </p>
            <button onClick={handleClose} className="w-full orbit-btn-primary py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-[0_0_20px_rgba(124,110,247,0.25)] hover:scale-[1.01] active:scale-98 transition-all">Go to Orbit View</button>
          </div>
        )}
      </div>
    </div>
  );
}
