import { useState, type FormEvent } from "react";
import { DurationField } from "../components/form/DurationField";
import type { DurationValue } from "../components/form/DurationField";
import { ColorPicker } from "../components/ui/ColorPicker";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Text } from "../components/ui/Text";
import { invoke } from "@tauri-apps/api/core";
import { hexToRgb } from "../lib/colors";
import { useRouter } from "@tanstack/react-router";
import { timeUnitOptions } from "../lib/time";

type BreakFormErrors = {
  name?: string;
  breakFor?: string;
  every?: string;
  color?: string;
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
  const router = useRouter();

  const clearError = (key: keyof BreakFormErrors) => {
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const validateDuration = (
    value: DurationValue,
    type: "breakFor" | "every",
  ) => {
    if (value.amount <= 0) {
      return type === "breakFor"
        ? "Break duration must be greater than zero."
        : "Frequency must be greater than zero.";
    }
    return undefined;
  };

  const amountInSeconds = (value: DurationValue) => {
    switch (value.unit) {
      case "seconds": {
        return value.amount;
      }
      case "minutes": {
        return value.amount * 60;
      }
      case "hours": {
        return value.amount * 60 * 60;
      }
      case "days": {
        return value.amount * 60 * 60 * 24;
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

    const rgbColor = hexToRgb(color);
    if (!rgbColor) {
      nextErrors.color = "Choose a valid hex color.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    // Convert durations to seconds
    const durationInSeconds = amountInSeconds(breakFor);
    const everyInSeconds = amountInSeconds(every);

    const id = await invoke<string>("add_break", {
      break_to_add: {
        name,
        every: everyInSeconds,
        duration: durationInSeconds,
        color: rgbColor,
        remaning: everyInSeconds,
      },
    });

    // Reset
    setName("");
    setColor("#ef4444");
    setBreakFor({ amount: 10, unit: "minutes" });
    setEvery({ amount: 1, unit: "hours" });

    // Go to the break page
    router.navigate({ to: "/break/$id", params: { id } });
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
            <div className="space-y-1">
              <ColorPicker
                value={color}
                onChange={(next) => {
                  setColor(next);
                  clearError("color");
                }}
                label="Choose break color"
              />
              {errors.color ? (
                <Text as="p" variant="error" role="alert">
                  {errors.color}
                </Text>
              ) : null}
            </div>
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
