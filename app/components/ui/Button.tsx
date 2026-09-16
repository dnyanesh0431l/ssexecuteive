"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[#B80A0B] text-white hover:bg-[#9C0909] focus-visible:ring-[#B80A0B]/40",
  secondary:
    "bg-[#1845D6] text-white hover:bg-[#1438B3] focus-visible:ring-[#1845D6]/40",
  outline:
    "border border-[#E5E5E5] bg-white text-black hover:bg-[#F6F6F6] focus-visible:ring-black/15",
  ghost:
    "text-black/70 hover:bg-[#F6F6F6] hover:text-black focus-visible:ring-black/15",
  danger:
    "border border-[#B80A0B]/30 bg-white text-[#B80A0B] hover:bg-[rgba(184,10,11,0.06)] focus-visible:ring-[#B80A0B]/40",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-3 text-[13px]",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-11 gap-2 px-5 text-sm",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    icon,
    className,
    children,
    disabled,
    type = "button",
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex select-none items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
});