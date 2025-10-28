import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { effects, palette, radii } from "../../theme/tokens";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "w-full resize-y border px-3 py-2 text-sm transition",
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
  )
);

Textarea.displayName = "Textarea";
