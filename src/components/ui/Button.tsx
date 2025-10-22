import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { effects, palette, radii, states } from "../../theme/tokens";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const baseStyles = cn(
  "inline-flex items-center justify-center gap-2",
  "text-sm font-medium transition",
  radii.xl,
  effects.focusRing
);

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2",
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    "border",
    palette.border.accent,
    palette.accent.surface,
    palette.accent.text,
    palette.accent.surfaceHover
  ),
  secondary: cn(
    "border",
    palette.border.strong,
    palette.background.surfaceMuted,
    palette.text.primary,
    states.accentBorderHover,
    states.accentTextHover
  ),
  ghost: cn(
    "border",
    "border-transparent",
    "bg-transparent",
    palette.text.secondary,
    states.accentBorderHover,
    states.accentTextHover
  ),
};

export function Button({
  className,
  variant = "secondary",
  size = "md",
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...rest}
    />
  );
}
