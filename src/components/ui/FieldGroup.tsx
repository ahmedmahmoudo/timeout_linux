import { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Text } from "./Text";

type FieldGroupProps = {
  id: string;
  label: string;
  helperText?: string;
  children: ReactNode;
};

export function FieldGroup({
  id,
  label,
  helperText,
  children,
}: FieldGroupProps) {
  return (
    <div className="space-y-2">
      <Text as="label" htmlFor={id} variant="label" className="block">
        {label}
      </Text>
      {children}
      {helperText ? (
        <Text as="p" variant="muted" className={cn("text-xs text-neutral-400")}>
          {helperText}
        </Text>
      ) : null}
    </div>
  );
}
