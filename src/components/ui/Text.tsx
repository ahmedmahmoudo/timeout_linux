import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from "react";
import { cn } from "../../lib/cn";
import { palette } from "../../theme/tokens";

type TextVariant =
  | "title"
  | "subtitle"
  | "body"
  | "muted"
  | "eyebrow"
  | "label"
  | "error";

const variantMap: Record<TextVariant, string> = {
  title: cn("text-3xl font-semibold", palette.text.primary),
  subtitle: cn("text-lg font-semibold", palette.text.primary),
  body: cn("text-sm", palette.text.secondary),
  muted: cn("text-xs", palette.text.muted),
  eyebrow: cn(
    "text-xs uppercase tracking-[0.3em]",
    palette.text.muted,
    "text-[0.7rem]"
  ),
  label: cn("text-xs font-medium", palette.text.primary),
  error: "text-xs font-medium text-rose-500",
};

export type TextProps<T extends ElementType> = {
  as?: T;
  variant?: TextVariant;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Text<T extends ElementType = "span">({
  as,
  variant = "body",
  className,
  children,
  ...rest
}: TextProps<T>) {
  const Component = (as ?? "span") as ElementType;

  return (
    <Component className={cn(variantMap[variant], className)} {...rest}>
      {children}
    </Component>
  );
}
