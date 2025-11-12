import { KeyboardEvent, useEffect, useState } from "react";
import { BreakSummary, BreakUpdatePayload } from "../../../data/breaks";
import { ColorPicker } from "../../ui/ColorPicker";
import { FieldGroup } from "../../ui/FieldGroup";
import { Input } from "../../ui/Input";
import { Textarea } from "../../ui/Textarea";
import { colorsEqual, hexToRgb, rgbToHex } from "../../../lib/colors";
import { useRecordHotkeys } from "react-hotkeys-hook";
import { Button } from "../../ui/Button";

type BreakNameTabProps = {
  brek: BreakSummary;
  onUpdate: (payload: BreakUpdatePayload) => void;
};

export function BreakNameTab({ brek, onUpdate }: BreakNameTabProps) {
  const [name, setName] = useState<string | null>(brek.name);
  const [color, setColor] = useState(rgbToHex(brek.color));
  const [shortcut, setShortcut] = useState(brek.shortcut ?? "");
  const [description, setDescription] = useState(brek.description ?? "");

  const [keys, { start: startRecording, stop: stopRecording }] =
    useRecordHotkeys(false);

  // @TODO add error handling and showing errors in UI
  useEffect(() => {
    if (!name) {
      return;
    }

    const rgbColor = hexToRgb(color);
    if (!rgbColor) {
      return;
    }

    const normalizedShortcut = shortcut.trim() === "" ? null : shortcut;
    const normalizedDescription =
      description.trim() === "" ? null : description;
    const originalColor = brek.color.slice(0, 3) as [number, number, number];

    const hasChanges =
      name !== brek.name ||
      normalizedShortcut !== (brek.shortcut ?? null) ||
      normalizedDescription !== (brek.description ?? null) ||
      !colorsEqual(rgbColor, originalColor);

    if (!hasChanges) {
      return;
    }

    const payload: BreakUpdatePayload = {
      id: brek.id,
      name,
      color: rgbColor,
      shortcut: normalizedShortcut,
      description: normalizedDescription,
    };

    onUpdate(payload);
  }, [name, color, shortcut, description, brek?.id, onUpdate]);

  useEffect(() => {
    if (keys.size === 0) {
      return;
    }

    const keysAsArray: string[] = [];
    for (const key of keys) {
      if (["enter", "backspace", "escape"].includes(key)) {
        continue;
      }
      keysAsArray.push(key);
    }

    if (keysAsArray.join("+") !== shortcut) {
      setShortcut(keysAsArray.join("+"));
    }
  }, [keys, shortcut]);

  const onKeyPressed = (e: KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", "Backspace", "Escape"].includes(e.key)) {
      e.preventDefault();
      stopRecording();
      e.currentTarget.blur();
    }
  };

  return (
    <div className="space-y-6">
      <FieldGroup
        id="break-name"
        label="Name"
        helperText="Rename this break to keep things organised."
      >
        <Input
          id="break-name"
          value={name ?? ""}
          onChange={(event) => {
            setName(event.target.value);
          }}
          placeholder="Break name"
        />
      </FieldGroup>

      <FieldGroup
        id="break-color"
        label="Color"
        helperText="Choose a color to highlight this break around the app."
      >
        <ColorPicker
          value={color}
          onChange={(next) => {
            setColor(next);
          }}
          label="Choose break color"
        />
      </FieldGroup>

      <FieldGroup
        id="break-shortcut"
        label="Shortcut"
        helperText="Assign a keyboard shortcut to quickly trigger this break."
      >
        <div className="flex items-center gap-2">
          <Input
            id="break-shortcut"
            value={shortcut}
            onChange={(event) => {
              setShortcut(event.target.value);
            }}
            placeholder="Press keys..."
            onKeyDownCapture={onKeyPressed}
            onFocus={startRecording}
            onBlur={stopRecording}
            className="flex-1"
          />
          {shortcut.trim() !== "" ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                startRecording();
                stopRecording();
                setShortcut("");
                onUpdate({
                  id: brek.id,
                  shortcut: "",
                });
              }}
              aria-label="Delete shortcut"
            >
              Delete
            </Button>
          ) : null}
        </div>
      </FieldGroup>

      <FieldGroup
        id="break-description"
        label="Description"
        helperText="Add notes or context about what this break is for."
      >
        <Textarea
          id="break-description-textarea"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
          }}
          placeholder="Describe this break..."
          rows={4}
        />
      </FieldGroup>
    </div>
  );
}
