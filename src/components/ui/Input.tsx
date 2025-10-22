import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { effects, palette, radii } from "../../theme/tokens";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full border px-3 py-2 text-sm transition",
          "placeholder:text-slate-500",
          palette.background.surfaceOverlay,
          palette.border.default,
          palette.text.primary,
          radii.xl,
          effects.focusRing,
          "focus:border-emerald-400/60",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
