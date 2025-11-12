import { useEffect, useState } from "react";
import { BreakSummary, BreakUpdatePayload } from "../../../data/breaks";
import { DurationField, DurationValue } from "../../form/DurationField";
import {
  durationValueToSeconds,
  secondsToDurationValue,
  timeUnitOptions,
} from "../../../lib/time";

type BreakScheduleTabProps = {
  brek: BreakSummary;
  onUpdate: (payload: BreakUpdatePayload) => void;
};

export function BreakScheduleTab({ brek, onUpdate }: BreakScheduleTabProps) {
  const [breakFor, setBreakFor] = useState<DurationValue>(
    secondsToDurationValue(brek.duration),
  );
  const [every, setEvery] = useState<DurationValue>(
    secondsToDurationValue(brek.every),
  );

  const breakForError =
    breakFor.amount <= 0
      ? "Break duration must be greater than zero."
      : undefined;
  const everyError =
    every.amount <= 0 ? "Frequency must be greater than zero." : undefined;

  useEffect(() => {
    if (breakForError || everyError) {
      return;
    }

    const durationInSeconds = durationValueToSeconds(breakFor);
    const everyInSeconds = durationValueToSeconds(every);

    const hasChanges =
      durationInSeconds !== brek.duration || everyInSeconds !== brek.every;

    if (!hasChanges) {
      return;
    }

    onUpdate({
      id: brek.id,
      duration: durationInSeconds,
      every: everyInSeconds,
    });
  }, [breakFor, every, breakForError, everyError, brek, onUpdate]);

  return (
    <div className="space-y-6">
      <DurationField
        label="Break for"
        value={breakFor}
        onChange={setBreakFor}
        unitOptions={timeUnitOptions}
        helperText="How long each break lasts."
        error={breakForError}
      />

      <DurationField
        label="Every"
        value={every}
        onChange={setEvery}
        unitOptions={timeUnitOptions}
        helperText="How often the break repeats."
        error={everyError}
      />
    </div>
  );
}
