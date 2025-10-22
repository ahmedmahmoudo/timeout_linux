import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { palette, radii } from "../../theme/tokens";

type BadgeTone = "neutral" | "accent";

type BadgeProps = {
  tone?: BadgeTone;
  uppercase?: boolean;
} & HTMLAttributes<HTMLSpanElement>;

const toneStyles: Record<BadgeTone, string> = {
  neutral: cn(
    "border",
    palette.border.default,
    palette.background.surfaceOverlay,
    palette.text.muted
  ),
  accent: cn(
    "border",
    palette.border.accent,
    palette.accent.surface,
    palette.accent.text
  ),
};

export function Badge({
  className,
  tone = "neutral",
  uppercase = true,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2",
        radii.full,
        "px-3 py-1 text-xs",
        uppercase
          ? "uppercase tracking-[0.28em]"
          : "tracking-normal",
        toneStyles[tone],
        className
      )}
      {...rest}
    />
  );
}
