import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { palette, radii } from "../../theme/tokens";

type CardVariant = "default" | "muted" | "gradient";

type CardProps = {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
} & HTMLAttributes<HTMLDivElement>;

const variantStyles: Record<CardVariant, string> = {
  default: cn("border", palette.border.strong, palette.background.surface),
  muted: cn("border", palette.border.default, palette.background.surfaceMuted),
  gradient: cn(
    "border",
    palette.border.strong,
    palette.background.surfaceGradient
  ),
};

const paddingStyles: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  className,
  variant = "default",
  padding = "md",
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(radii.xxl, variantStyles[variant], paddingStyles[padding], className)}
      {...rest}
    />
  );
}
