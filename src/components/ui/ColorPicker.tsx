import { useEffect, useMemo, useState, useId } from "react";
import { Palette } from "lucide-react";
import { cn } from "../../lib/cn";
import { effects, palette, states } from "../../theme/tokens";
import { Input } from "./Input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  usePopoverControls,
} from "./Popover";
import { Text } from "./Text";

const presetColors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#facc15",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#6366f1",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#64748b",
  "#475569",
  "#94a3b8",
  "#e2e8f0",
];

type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
  label?: string;
};

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const formattedValue = useMemo(() => ensureHashPrefix(value), [value]);
  const selectedColor = formattedValue;

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition",
          palette.background.surfaceOverlay,
          palette.border.default,
          palette.text.primary,
          states.surfaceHover,
          effects.focusRing
        )}
      >
        <span
          className={cn("h-8 w-8 rounded-full border", palette.border.default)}
          style={{ backgroundColor: selectedColor }}
          aria-hidden
        />
        <div className="flex flex-col text-left text-xs uppercase tracking-[0.2em]">
          <span className="text-[11px] text-slate-400">Color</span>
          <span className="text-sm normal-case tracking-normal text-slate-100">
            {formattedValue.toUpperCase()}
          </span>
        </div>
        <Palette className="ml-auto h-4 w-4 text-slate-500" aria-hidden />
      </PopoverTrigger>
      <ColorPickerContent
        draft={draft}
        setDraft={setDraft}
        onChange={onChange}
        label={label}
      />
    </Popover>
  );
}

type ColorPickerContentProps = {
  draft: string;
  setDraft: (value: string) => void;
  onChange: (color: string) => void;
  label?: string;
};

function ColorPickerContent({
  draft,
  setDraft,
  onChange,
  label,
}: ColorPickerContentProps) {
  const { setOpen } = usePopoverControls();
  const displayLabel = label ?? "Choose a color";
  const inputId = useId();

  const handleSelect = (color: string) => {
    setDraft(color);
    onChange(color);
    setOpen(false);
  };

  const handleInputChange = (next: string) => {
    const formatted = sanitizeHex(next);
    setDraft(formatted);
    if (isValidHex(formatted)) {
      onChange(formatted);
    }
  };

  return (
    <PopoverContent className="w-64 space-y-4 p-4" align="start">
      <div className="space-y-1">
        <Text as="p" variant="label">
          {displayLabel}
        </Text>
        <Text as="p" variant="muted" className="text-xs">
          Pick from presets or enter a custom hex value.
        </Text>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {presetColors.map((color) => {
          const isSelected = color.toLowerCase() === draft.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              className={cn(
                "h-8 w-8 rounded-full border transition",
                palette.border.default,
                isSelected && "ring-2 ring-emerald-400/70 ring-offset-2"
              )}
              style={{ backgroundColor: color }}
              onClick={() => handleSelect(color)}
              aria-label={`Select ${color}`}
            />
          );
        })}
      </div>

      <div className="space-y-2">
        <Text as="label" htmlFor={inputId} variant="label" className="block text-xs">
          Custom
        </Text>
        <Input
          id={inputId}
          value={draft}
          onChange={(event) => handleInputChange(event.target.value)}
          placeholder="#FD4C4C"
          maxLength={7}
        />
        {!isValidHex(draft) ? (
          <Text as="p" variant="muted" className="text-xs text-rose-400">
            Enter a valid 6-digit hex value (e.g., #FF3366).
          </Text>
        ) : null}
      </div>
    </PopoverContent>
  );
}

function sanitizeHex(value: string) {
  const trimmed = value.trim().replace(/[^0-9a-fA-F#]/g, "");
  if (trimmed.startsWith("#")) {
    return `#${trimmed.slice(1, 7)}`;
  }
  return `#${trimmed.slice(0, 6)}`;
}

function ensureHashPrefix(value: string) {
  if (!value.startsWith("#")) {
    return `#${value}`;
  }
  return value;
}

function isValidHex(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}
