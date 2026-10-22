"use client";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

const VARIANT_STYLES: Record<Variant, string> = {
  primary:   "bg-[#0B5D63] text-white hover:bg-[#094D52] disabled:opacity-60",
  secondary: "border border-[#0B5D63] text-[#0B5D63] hover:bg-[#E8F2F2] disabled:opacity-60",
  ghost:     "text-[#0B5D63] hover:bg-[#E8F2F2] disabled:opacity-60",
  danger:    "bg-[#A52A1C] text-white hover:bg-[#8B2419] disabled:opacity-60",
};

const SIZE_STYLES: Record<Size, string> = {
  sm: "h-8  px-4 text-xs rounded-lg",
  md: "h-11 px-5 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B5D63] focus-visible:ring-offset-2",
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className
      )}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
);
Button.displayName = "Button";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
