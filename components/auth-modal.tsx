"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, Lock, User, X, AlertCircle, Copy, KeyRound, Terminal } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { setupUserWallet } from "@/app/actions/wallet";

export function AuthModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get("auth") === "open";
  
  // Toggle between Sign In and Sign Up modes
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Toast developer / demo states
  const [showToast, setShowToast] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Reset toast state when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setShowToast(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowToast(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    router.replace("/");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case "1":
            e.preventDefault();
            setEmail("cquinto.primary@gmail.com");
            setPassword("Pass1234");
            break;
          case "2":
            e.preventDefault();
            setEmail("quinto_christopher@plpasig.edu.ph");
            setPassword("Pass1234");
            break;
          case "3":
            e.preventDefault();
            setEmail("turing_alan@gmail.com");
            setPassword("Pass1234");
            break;
          case "4":
            e.preventDefault();
            setEmail("lovelace_ada@gmail.com");
            setPassword("Pass1234");
            break;
          case "5":
            e.preventDefault();
            setEmail("delacruz_juan@gmail.com");
            setPassword("Pass1234");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("cquinto.primary@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText("Pass1234");
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        console.log("Signed up:", data);

        if (data.user) {
          // Automatically set up Stellar wallet
          const walletRes = await setupUserWallet(data.user.id);
          if (!walletRes.success) {
            console.error("Wallet generation failed:", walletRes.error);
            setErrorMsg("Account created, but wallet generation failed. Please contact support.");
            setIsLoading(false);
            return;
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        console.log("Logged in:", data);
      }

      // Simulate front-end login success transition
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-20">
        <div className="h-[40vh] w-[40vh] rounded-full bg-[var(--orbit-brand)] blur-[100px]"></div>
      </div>

      {/* Main Authentication Card */}
      <div className="orbit-card relative z-10 w-full max-w-md flex-col p-orbit-8 backdrop-blur-xl bg-[var(--orbit-bg-card)]/90 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-[var(--orbit-text-secondary)] hover:bg-[var(--orbit-bg-elevated)] hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-orbit-8 text-center mt-2">
          <img 
            src="/orbit_logo.png" 
            alt="Orbit Logo" 
            className="mx-auto mb-orbit-4 h-16 w-16 object-contain" 
          />
          <h2 className="mb-orbit-1 text-2xl font-semibold tracking-tight text-[var(--orbit-text-primary)]">
            {isSignUp ? "Create your Orbit account" : "Welcome back to Orbit"}
          </h2>
          <p className="text-sm text-[var(--orbit-text-secondary)]">
            {isSignUp
              ? "Build savings and reputation together."
              : "Enter your details to sign in."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-orbit-4">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Sign Up Specific Fields */}
          {isSignUp && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--orbit-text-secondary)] pl-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--orbit-text-muted)]">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Juan Dela Cruz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-[var(--radius-orbit-md)] py-2.5 pl-10 pr-3 text-sm text-[var(--orbit-text-primary)] placeholder-[var(--orbit-text-muted)] focus:outline-none focus:border-[var(--orbit-brand)] focus:ring-1 focus:ring-[var(--orbit-brand)] transition-all"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--orbit-text-secondary)] pl-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--orbit-text-muted)]">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-[var(--radius-orbit-md)] py-2.5 pl-10 pr-3 text-sm text-[var(--orbit-text-primary)] placeholder-[var(--orbit-text-muted)] focus:outline-none focus:border-[var(--orbit-brand)] focus:ring-1 focus:ring-[var(--orbit-brand)] transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--orbit-text-secondary)] pl-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--orbit-text-muted)]">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] rounded-[var(--radius-orbit-md)] py-2.5 pl-10 pr-3 text-sm text-[var(--orbit-text-primary)] placeholder-[var(--orbit-text-muted)] focus:outline-none focus:border-[var(--orbit-brand)] focus:ring-1 focus:ring-[var(--orbit-brand)] transition-all"
              />
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="orbit-btn-primary mt-2 w-full justify-center py-3 text-[14px]"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Toggle State Footer */}
        <div className="mt-orbit-6 text-center text-sm text-[var(--orbit-text-secondary)]">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-[var(--orbit-brand-light)] hover:text-[var(--orbit-brand)] hover:underline transition-colors cursor-pointer"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </div>
      </div>

      {/* Persistent Demo Credentials Toast on Left Side */}
      {showToast && (
        <div className="fixed top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-auto z-[110] w-auto sm:w-96 bg-gradient-to-b from-[var(--color-orbit-void-600)] to-[var(--color-orbit-void-700)] border border-[var(--orbit-border-strong)] rounded-2xl shadow-2xl p-5 sm:p-6 select-none" style={{ animation: 'overlay-enter 1s ease-out forwards' }}>
          <button 
            type="button"
            onClick={() => setShowToast(false)}
            className="absolute top-4 right-4 text-[var(--orbit-text-secondary)] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[var(--orbit-brand-bg)] border border-[var(--orbit-brand-border)] flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-[var(--orbit-brand-light)]" />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Sandbox Demo Profile</h4>
          </div>
          
          <div className="text-sm text-[var(--orbit-text-secondary)] leading-relaxed mb-5 flex items-start gap-2.5">
            <Terminal className="w-4.5 h-4.5 text-[var(--orbit-brand-light)] shrink-0 mt-0.5" />
            <span>
              <span className="text-white font-semibold">Demo Account:</span> Use these credentials to explore the app without creating your own account. <span className="hidden sm:inline">Press <kbd className="bg-[var(--orbit-bg-app)] border border-[var(--orbit-border)] px-2 py-0.5 rounded text-[var(--orbit-brand-light)] font-mono text-xs font-bold">Ctrl + 1</kbd> to auto-fill the form.</span>
            </span>
          </div>

          <div className="flex flex-col gap-2.5 font-mono text-sm">
            <div className="flex justify-between items-center bg-[var(--color-orbit-void-950)] px-4 py-3 rounded-lg border border-[var(--orbit-border)]/60">
              <span className="text-xs text-[var(--orbit-text-muted)] font-bold tracking-wider">EMAIL:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white font-bold select-all">cquinto.primary@gmail.com</span>
                <button 
                  type="button"
                  onClick={handleCopyEmail} 
                  className="text-[var(--orbit-text-muted)] hover:text-white transition-colors cursor-pointer p-0.5"
                  title="Copy email"
                >
                  {copiedEmail ? <span className="text-xs uppercase font-bold text-[var(--orbit-success)]">Copied</span> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center bg-[var(--color-orbit-void-950)] px-4 py-3 rounded-lg border border-[var(--orbit-border)]/60">
              <span className="text-xs text-[var(--orbit-text-muted)] font-bold tracking-wider">PASSWORD:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white font-bold select-all">Pass1234</span>
                <button 
                  type="button"
                  onClick={handleCopyPassword} 
                  className="text-[var(--orbit-text-muted)] hover:text-white transition-colors cursor-pointer p-0.5"
                  title="Copy password"
                >
                  {copiedPassword ? <span className="text-xs uppercase font-bold text-[var(--orbit-success)]">Copied</span> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
