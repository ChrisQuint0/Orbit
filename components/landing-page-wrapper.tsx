"use client";

import { useState, useEffect } from "react";
import { OrbitLoader } from "@/components/orbit-loader";

export function LandingPageWrapper({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <OrbitLoader text="Loading Orbit Experience..." />;
  }

  return <>{children}</>;
}
