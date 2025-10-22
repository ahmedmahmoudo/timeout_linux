import { useState, type FormEvent } from "react";
import { DurationField } from "../components/form/DurationField";
import type {
  DurationValue,
  TimeUnitOption,
} from "../components/form/DurationField";
import { ColorPicker } from "../components/ui/ColorPicker";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Text } from "../components/ui/Text";

const timeUnitOptions: TimeUnitOption[] = [
  { value: "seconds", label: "Seconds" },
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
];

type BreakFormErrors = {
  name?: string;
  breakFor?: string;
  every?: string;
};

export function AddBreakPage() {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#ef4444");
  const [breakFor, setBreakFor] = useState<DurationValue>({
    amount: 10,
    unit: "minutes",
  });
  const [every, setEvery] = useState<DurationValue>({
    amount: 1,
    unit: "hours",
  });
  const [errors, setErrors] = useState<BreakFormErrors>({});

  const clearError = (key: keyof BreakFormErrors) => {
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const validateDuration = (value: DurationValue, type: "breakFor" | "every") => {
    if (value.amount === "" || Number(value.amount) <= 0) {
      return type === "breakFor"
        ? "Break duration must be greater than zero."
        : "Frequency must be greater than zero.";
    }
    return undefined;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: BreakFormErrors = {};

    if (!name.trim()) {
      nextErrors.name = "Break name is required.";
    }

    const breakForError = validateDuration(breakFor, "breakFor");
    if (breakForError) {
      nextErrors.breakFor = breakForError;
    }

    const everyError = validateDuration(every, "every");
    if (everyError) {
      nextErrors.every = everyError;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    // TODO: Connect to backend/system once available.
    console.table({
      name,
      color,
      breakFor,
      every,
    });
  };

  return (
    <div className="flex h-full flex-col gap-6 p-10">
      <header className="space-y-2">
        <Text as="h2" variant="subtitle">
          Add Break
        </Text>
        <Text as="p" variant="body" className="max-w-lg">
          Configure timing, duration, and color for a new restorative break.
        </Text>
      </header>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-2 flex max-w-xl flex-col gap-6"
      >
        <div className="space-y-2">
          <Text as="label" variant="label" className="block">
            Break details
          </Text>
          <div className="flex items-center gap-4">
            <ColorPicker
              value={color}
              onChange={setColor}
              label="Choose break color"
            />
            <Input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                clearError("name");
              }}
              placeholder="Break name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "break-name-error" : undefined}
            />
          </div>
          {errors.name ? (
            <Text as="p" id="break-name-error" variant="error" role="alert">
              {errors.name}
            </Text>
          ) : null}
        </div>

        <DurationField
          label="Break for"
          value={breakFor}
          onChange={(next) => {
            setBreakFor(next);
            clearError("breakFor");
          }}
          unitOptions={timeUnitOptions}
          helperText="How long each break lasts."
          error={errors.breakFor}
        />

        <DurationField
          label="Every"
          value={every}
          onChange={(next) => {
            setEvery(next);
            clearError("every");
          }}
          unitOptions={timeUnitOptions}
          helperText="How often the break repeats."
          error={errors.every}
        />

        <Button type="submit" variant="primary" className="self-start">
          Add Break
        </Button>
      </form>
    </div>
  );
}
