import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { palette, radii } from "../../theme/tokens";

type IconVariant = "accent" | "surface";

type IconSize = "md" | "lg";

type IconProps = {
  variant?: IconVariant;
  size?: IconSize;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

const variantStyles: Record<IconVariant, string> = {
  accent: cn(
    "border",
    palette.border.accent,
    palette.accent.surface,
    palette.accent.text
  ),
  surface: cn("border", palette.border.default, palette.background.surfaceMuted),
};

const sizeStyles: Record<IconSize, string> = {
  md: "h-12 w-12",
  lg: "h-14 w-14",
};

export function Icon({
  className,
  variant = "accent",
  size = "md",
  children,
  ...rest
}: IconProps) {
  return (
    <div
      className={cn(
        "grid place-items-center text-lg",
        radii.xxl,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
