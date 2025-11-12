import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type {
  BreakAppearanceUpdate,
  BreakSummary,
  BreakUpdatePayload,
} from "../../../data/breaks";
import { FieldGroup } from "../../ui/FieldGroup";
import { Select } from "../../ui/Select";
import { Button } from "../../ui/Button";
import { ColorPicker } from "../../ui/ColorPicker";
import { Checkbox } from "../../ui/Checkbox";
import { hexToRgb, rgbToHex } from "../../../lib/colors";

type BreakAppearanceTabProps = {
  brek: BreakSummary;
  onUpdate: (payload: BreakUpdatePayload) => void;
};

const themeOptions = [{ value: "default", label: "Default" }];

export function BreakAppearanceTab({ brek, onUpdate }: BreakAppearanceTabProps) {
  const [theme, setTheme] = useState(brek.appearance.theme);
  const [backgroundHex, setBackgroundHex] = useState(
    rgbToHex(brek.appearance.background_color)
  );
  const [showSkip, setShowSkip] = useState(brek.appearance.show_skip_controls);
  const [previewing, setPreviewing] = useState(false);

  const backgroundColorKey = brek.appearance.background_color.join(",");

  useEffect(() => {
    setTheme(brek.appearance.theme);
    setBackgroundHex(rgbToHex(brek.appearance.background_color));
    setShowSkip(brek.appearance.show_skip_controls);
  }, [
    brek.id,
    brek.appearance.theme,
    brek.appearance.show_skip_controls,
    backgroundColorKey,
  ]);

  useEffect(() => {
    const appearanceUpdate: BreakAppearanceUpdate = {};

    if (theme !== brek.appearance.theme) {
      appearanceUpdate.theme = theme;
    }

    const backgroundRgb = hexToRgb(backgroundHex);
    if (
      backgroundRgb &&
      !arraysEqual(backgroundRgb, brek.appearance.background_color)
    ) {
      appearanceUpdate.background_color = backgroundRgb;
    }

    if (showSkip !== brek.appearance.show_skip_controls) {
      appearanceUpdate.show_skip_controls = showSkip;
    }

    if (Object.keys(appearanceUpdate).length === 0) {
      return;
    }

    onUpdate({
      id: brek.id,
      appearance: appearanceUpdate,
    });
  }, [
    theme,
    backgroundHex,
    showSkip,
    brek.id,
    brek.appearance.theme,
    brek.appearance.show_skip_controls,
    backgroundColorKey,
    onUpdate,
  ]);

  const handlePreview = async () => {
    try {
      setPreviewing(true);
      await invoke("preview_break", { id: brek.id });
    } catch (error) {
      console.error("Failed to preview break appearance", error);
    } finally {
      setPreviewing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FieldGroup
        id="appearance-theme"
        label="Theme"
        helperText="Pick a presentation style for this break."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            value={theme}
            onChange={setTheme}
            options={themeOptions}
            className="flex-1"
            ariaLabel="Break theme"
          />
          <Button
            type="button"
            onClick={handlePreview}
            disabled={previewing}
          >
            {previewing ? "Opening…" : "Preview"}
          </Button>
        </div>
      </FieldGroup>

      <FieldGroup
        id="appearance-background-color"
        label="Background color"
        helperText="Controls the overlay backdrop shown during the break."
      >
        <ColorPicker
          value={backgroundHex}
          onChange={setBackgroundHex}
          label="Choose overlay background"
        />
      </FieldGroup>

      <div className="h-px w-full bg-white/10" aria-hidden />

      <Checkbox
        id="appearance-show-skip"
        checked={showSkip}
        onChange={(event) => setShowSkip(event.target.checked)}
        label="Show skip button"
        helperText="When disabled, the break overlay hides the Skip action so users must wait for the timer or close it manually."
      />
    </div>
  );
}

function arraysEqual(
  a: [number, number, number],
  b: [number, number, number]
) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
