import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button variants mapped to Orbit brand tokens.
 * Primary gets a violet glow + lift on hover for premium feel.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-orbit-md font-semibold outline-none select-none transition-all duration-200 ease-orbit-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-orbit-violet-500 text-white shadow-[0_0_20px_rgba(124,110,247,0.25)] hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_0_30px_rgba(124,110,247,0.4)]",
        ghost:
          "border border-[var(--orbit-brand-border)] bg-[var(--orbit-brand-bg)] text-orbit-violet-300 hover:-translate-y-0.5 hover:border-orbit-violet-400/40 hover:bg-[rgba(124,110,247,0.18)]",
        neutral:
          "border border-[var(--orbit-border-hover)] bg-transparent text-[var(--orbit-text-secondary)] hover:-translate-y-0.5 hover:border-[var(--orbit-border-strong)] hover:bg-orbit-mist-900 hover:text-orbit-mist-50 hover:shadow-sm",
        link: "bg-transparent p-0 text-[var(--orbit-text-secondary)] underline-offset-4 hover:text-orbit-mist-50 hover:underline",
      },
      size: {
        default: "h-9 px-4 text-[13px]",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-sm",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
