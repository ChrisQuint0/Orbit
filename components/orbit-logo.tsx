import Image from "next/image";

interface OrbitLogoProps {
  className?: string;
}

/**
 * Brand mark: displays the project's brand logo image.
 */
export function OrbitLogo({ className }: OrbitLogoProps) {
  return (
    <Image
      src="/orbit_logo.png"
      alt="Orbit Logo"
      width={32}
      height={32}
      className={className}
      priority
    />
  );
}
