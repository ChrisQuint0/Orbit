"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, User } from "lucide-react";

export default function LoginPage() {
  const { login, ready, authenticated } = usePrivy();
  const router = useRouter();

  // Toggle between Sign In and Sign Up modes
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (ready && authenticated) {
      router.push("/dashboard");
    }
  }, [ready, authenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // TODO: Implement Privy email/password signup
        // Then save `fullName` to your Supabase 'users' table
        console.log("Signing up with:", { fullName, email, password });
      } else {
        // TODO: Implement Privy email/password login
        console.log("Logging in with:", { email, password });
      }

      // Simulate front-end login success
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--orbit-bg-app)] p-4">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-20">
        <div className="h-[40vh] w-[40vh] rounded-full bg-[var(--orbit-brand)] blur-[100px]"></div>
      </div>

      {/* Main Authentication Card */}
      <div className="orbit-card relative z-10 w-full max-w-md flex-col p-orbit-8 backdrop-blur-xl bg-[var(--orbit-bg-card)]/90 shadow-2xl">
        {/* Header */}
        <div className="mb-orbit-8 text-center">
          <img 
            src="/orbit_logo.png" 
            alt="Orbit Logo" 
            className="mx-auto mb-orbit-4 h-16 w-16 object-contain" 
          />
          <h1 className="mb-orbit-1 text-2xl font-semibold tracking-tight text-[var(--orbit-text-primary)]">
            {isSignUp ? "Create your Orbit account" : "Welcome back to Orbit"}
          </h1>
          <p className="text-sm text-[var(--orbit-text-secondary)]">
            {isSignUp
              ? "Build savings and reputation together."
              : "Enter your details to sign in."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-orbit-4">
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

        {/* Divider */}
        <div className="my-orbit-6 flex items-center gap-4">
          <div className="h-[1px] flex-1 bg-[var(--orbit-border)]"></div>
          <span className="text-xs text-[var(--orbit-text-muted)] uppercase tracking-wider font-medium">
            or
          </span>
          <div className="h-[1px] flex-1 bg-[var(--orbit-border)]"></div>
        </div>

        {/* Google Fallback */}
        <button
          type="button"
          onClick={login}
          disabled={isLoading}
          className="orbit-btn-neutral flex w-full items-center justify-center gap-3 py-3 text-[14px] text-[var(--orbit-text-primary)] disabled:opacity-50"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Toggle State Footer */}
        <div className="mt-orbit-6 text-center text-sm text-[var(--orbit-text-secondary)]">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-[var(--orbit-brand-light)] hover:text-[var(--orbit-brand)] hover:underline transition-colors"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z"
        fill="#4285F4"
      />
      <path
        d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.64 12 18.64C9.14 18.64 6.71 16.71 5.84 14.09H2.18V16.93C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.07H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.93L5.84 14.09Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.36C13.62 5.36 15.06 5.92 16.21 7.01L19.36 3.86C17.45 2.09 14.97 1 12 1C7.7 1 3.99 3.47 2.18 7.07L5.84 9.91C6.71 7.29 9.14 5.36 12 5.36Z"
        fill="#EA4335"
      />
    </svg>
  );
}
