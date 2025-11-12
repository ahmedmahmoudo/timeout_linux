import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { Text } from "./Text";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  helperText?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, label, helperText, className, checked, ...props }, ref) => {
    const isChecked = Boolean(checked);
    return (
      <label
        htmlFor={id}
        className={cn(
          "flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3",
          "transition focus-within:ring-2 focus-within:ring-emerald-400/40",
          className,
        )}
      >
        <span className="relative mt-0.5 inline-flex h-5 w-5 items-center justify-center">
          <input
            id={id}
            ref={ref}
            type="checkbox"
            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/20 bg-white/5"
            checked={checked}
            {...props}
          />
          <span
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center",
              "text-emerald-500",
            )}
          >
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-sm bg-emerald-400 transition",
                isChecked ? "scale-100 opacity-100" : "scale-75 opacity-0",
              )}
            />
          </span>
        </span>
        <span className="flex flex-col">
          {label ? (
            <Text as="span" variant="label">
              {label}
            </Text>
          ) : null}
          {helperText ? (
            <Text as="span" variant="muted" className="text-xs">
              {helperText}
            </Text>
          ) : null}
        </span>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
