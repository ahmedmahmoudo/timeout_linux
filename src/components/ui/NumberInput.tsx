import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { effects, palette, radii } from "../../theme/tokens";

type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="number"
        inputMode="numeric"
        className={cn(
          "w-full border px-3 py-2 text-sm transition",
          "appearance-none",
          "no-spinner",
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

NumberInput.displayName = "NumberInput";
