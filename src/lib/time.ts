import {
  DurationValue,
  TimeUnitOption,
} from "../components/form/DurationField";

export const timeUnitOptions: TimeUnitOption[] = [
  { value: "seconds", label: "Seconds" },
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
];

export function durationValueToSeconds(value: DurationValue): number {
  switch (value.unit) {
    case "seconds":
      return value.amount;
    case "minutes":
      return value.amount * 60;
    case "hours":
      return value.amount * 60 * 60;
    case "days":
      return value.amount * 60 * 60 * 24;
    default:
      return value.amount;
  }
}

export function secondsToDurationValue(seconds: number): DurationValue {
  if (seconds % (60 * 60 * 24) === 0) {
    return { amount: seconds / (60 * 60 * 24), unit: "days" };
  }

  if (seconds % (60 * 60) === 0) {
    return { amount: seconds / (60 * 60), unit: "hours" };
  }

  if (seconds % 60 === 0) {
    return { amount: seconds / 60, unit: "minutes" };
  }

  return { amount: seconds, unit: "seconds" };
}

export function durationValuesEqual(
  a: DurationValue,
  b: DurationValue,
): boolean {
  return a.amount === b.amount && a.unit === b.unit;
}
