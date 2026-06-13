import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-orbit-violet-300">
        — {eyebrow}
      </span>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-orbit-mist-50 sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 leading-relaxed text-[var(--orbit-text-secondary)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
