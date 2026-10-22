import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?:  string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#15201E]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-12 rounded-xl border px-4 text-base text-[#15201E] bg-white placeholder:text-[#9BA5A3]",
            "focus:outline-none focus:ring-2 focus:ring-[#0B5D63] focus:border-[#0B5D63]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error ? "border-red-500" : "border-[#D1D5D4]",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-[#4F5B59]">{hint}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?:  string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#15201E]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "rounded-xl border px-4 py-3 text-base text-[#15201E] bg-white placeholder:text-[#9BA5A3] resize-none",
            "focus:outline-none focus:ring-2 focus:ring-[#0B5D63] focus:border-[#0B5D63]",
            "disabled:opacity-50",
            error ? "border-red-500" : "border-[#D1D5D4]",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-[#4F5B59]">{hint}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
