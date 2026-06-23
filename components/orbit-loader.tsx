"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface OrbitLoaderProps {
  text?: string;
}

export function OrbitLoader({ text = "Loading Orbit Workspace..." }: OrbitLoaderProps) {
  const [subMessage, setSubMessage] = useState("");

  const getSubmessages = (mainText: string): string[] => {
    const textLower = mainText.toLowerCase();
    if (textLower.includes("dashboard")) {
      return [
        "Connecting to Stellar Horizon...",
        "Fetching wallet balances...",
        "Checking active group cycles...",
        "Populating financial summary..."
      ];
    }
    if (textLower.includes("orbit") || textLower.includes("crew") || textLower.includes("my orbits")) {
      return [
        "Syncing orbit metadata...",
        "Resolving release sequence...",
        "Verifying deposit cycles...",
        "Retrieving member listings..."
      ];
    }
    if (textLower.includes("score") || textLower.includes("cred") || textLower.includes("passport")) {
      return [
        "Decrypting trust records...",
        "Rebuilding credential status...",
        "Calculating contribution ratio...",
        "Loading achieved badges..."
      ];
    }
    if (textLower.includes("transaction") || textLower.includes("ledger") || textLower.includes("activity")) {
      return [
        "Querying Stellar ledger history...",
        "Retrieving payment records...",
        "Formatting transaction amounts...",
        "Verifying transaction signatures..."
      ];
    }
    return [
      "Accessing cryptographic ledger...",
      "Resolving distributed network nodes...",
      "Optimizing data streams...",
      "Verifying security certificates..."
    ];
  };

  useEffect(() => {
    const list = getSubmessages(text);
    setSubMessage(list[0]);
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % list.length;
      setSubMessage(list[index]);
    }, 1800);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="min-h-screen bg-[var(--orbit-bg-app)] flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute w-[450px] h-[450px] bg-[var(--orbit-brand)]/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Dynamic planetary orbit rings loader */}
      <div className="relative w-36 h-36 flex items-center justify-center mb-8">
        
        {/* Outer Orbit Path with glowing satellite */}
        <div className="absolute inset-0 rounded-full border border-dashed border-[var(--orbit-brand)]/20 animate-spin" style={{ animationDuration: '8s' }} />
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--orbit-brand-light)] shadow-[0_0_12px_var(--orbit-brand)] border border-white" />
        </div>

        {/* Middle Orbit Path (Reverse direction) */}
        <div className="absolute inset-4 rounded-full border border-dashed border-[var(--orbit-success)]/15 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
        <div className="absolute inset-4 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-[var(--orbit-success)] shadow-[0_0_8px_var(--orbit-success)]" />
        </div>

        {/* Inner Solid Spinning Ring */}
        <div className="absolute inset-8 rounded-full border border-transparent border-t-[var(--orbit-brand)]/40 border-b-[var(--orbit-brand)]/40 animate-spin" style={{ animationDuration: '3s' }} />

        {/* Pulsing Central Logo */}
        <div className="relative w-16 h-16 rounded-full bg-[var(--color-orbit-void-950)] border border-[var(--orbit-border)] flex items-center justify-center shadow-[0_0_30px_rgba(124,110,247,0.15)] animate-pulse">
          <Image
            src="/orbit_logo.png"
            alt="Orbit Brand Mark"
            width={38}
            height={38}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Texts */}
      <div className="text-center max-w-sm">
        <h2 className="text-sm font-bold tracking-wider text-white uppercase font-sans mb-2">
          {text}
        </h2>
        <div className="h-5 flex items-center justify-center">
          <p className="text-xs text-[var(--orbit-text-secondary)] font-mono animate-pulse">
            {subMessage}
          </p>
        </div>
      </div>
      
      {/* Bottom sliding progress bar indicator */}
      <div className="w-48 h-[2px] bg-[var(--color-orbit-mist-900)] rounded-full overflow-hidden mt-6 border border-white/5 relative">
        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-[var(--orbit-brand-light)] to-transparent w-1/2 rounded-full animate-shimmer" style={{ animation: 'shimmer 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  );
}
