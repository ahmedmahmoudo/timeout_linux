import { useId } from "react";
import type { ChangeEvent } from "react";
import { cn } from "../../lib/cn";
import { palette } from "../../theme/tokens";
import { NumberInput } from "../ui/NumberInput";
import { Select } from "../ui/Select";
import { Text } from "../ui/Text";

export type TimeUnitOption = {
  value: string;
  label: string;
};

export type DurationValue = {
  amount: number;
  unit: string;
};

type DurationFieldProps = {
  label: string;
  value: DurationValue;
  onChange: (value: DurationValue) => void;
  unitOptions: TimeUnitOption[];
  className?: string;
  helperText?: string;
  error?: string;
};

export function DurationField({
  label,
  value,
  onChange,
  unitOptions,
  className,
  helperText,
  error,
}: DurationFieldProps) {
  const amountId = useId();
  const labelId = useId();

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextAmount = Number(event.target.value);
    if (Number.isNaN(nextAmount)) {
      return;
    }
    onChange({ ...value, amount: nextAmount });
  };

  const handleUnitChange = (nextUnit: string) => {
    onChange({ ...value, unit: nextUnit });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Text
        as="label"
        id={labelId}
        htmlFor={amountId}
        variant="label"
        className="block"
      >
        {label}
      </Text>
      <div className="flex gap-3">
        <NumberInput
          id={amountId}
          min={0}
          step="1"
          value={value.amount}
          onChange={handleAmountChange}
          className={cn(
            "w-28",
            error &&
              "border-rose-500/70 focus:border-rose-400/80 focus:ring-rose-400/40"
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${amountId}-error` : undefined}
          placeholder="0"
        />
        <Select
          value={value.unit}
          onChange={handleUnitChange}
          options={unitOptions}
          className="w-40"
          ariaLabelledBy={labelId}
          hasError={Boolean(error)}
        />
      </div>
      {error ? (
        <Text as="p" id={`${amountId}-error`} variant="error" role="alert">
          {error}
        </Text>
      ) : helperText ? (
        <Text
          as="p"
          variant="muted"
          className={cn(palette.text.secondary, "text-xs")}
        >
          {helperText}
        </Text>
      ) : null}
    </div>
  );
}
