import { ChevronsUpDown } from "lucide-react";
import { useId, useMemo } from "react";
import { cn } from "../../lib/cn";
import { effects, palette, radii, states } from "../../theme/tokens";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  usePopoverControls,
} from "./Popover";
import { Text } from "./Text";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  ariaLabelledBy?: string;
  ariaLabel?: string;
  hasError?: boolean;
};

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select",
  className,
  ariaLabelledBy,
  ariaLabel,
  hasError = false,
}: SelectProps) {
  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );
  const listboxId = useId();

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex min-w-[10rem] items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
          palette.background.surfaceOverlay,
          palette.border.default,
          palette.text.primary,
          states.surfaceHover,
          effects.focusRing,
          hasError && "border-rose-500/70 focus:border-rose-400/80 focus:ring-rose-400/40",
          className
        )}
        role="combobox"
        aria-controls={listboxId}
        aria-labelledby={ariaLabelledBy}
        aria-label={ariaLabel}
        aria-autocomplete="none"
        aria-haspopup="listbox"
        aria-invalid={hasError}
      >
        <span className={selected ? "" : "text-slate-500"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronsUpDown
          className="ml-auto h-4 w-4 text-slate-500"
          aria-hidden
        />
      </PopoverTrigger>
      <SelectOptions
        options={options}
        onChange={onChange}
        selectedValue={value}
        listboxId={listboxId}
      />
    </Popover>
  );
}

type SelectOptionsProps = {
  options: SelectOption[];
  onChange: (value: string) => void;
  selectedValue: string;
  listboxId: string;
};

function SelectOptions({
  options,
  onChange,
  selectedValue,
  listboxId,
}: SelectOptionsProps) {
  const { setOpen } = usePopoverControls();

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    setOpen(false);
  };

  return (
    <PopoverContent className="w-48 space-y-1 p-2" align="start">
      <ul
        className="max-h-60 space-y-1 overflow-y-auto"
        role="listbox"
        id={listboxId}
      >
        {options.map((option) => {
          const isActive = option.value === selectedValue;
          return (
            <li key={option.value} role="presentation">
              <button
                type="button"
                onClick={() => handleSelect(option)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm transition text-white",
                  isActive
                    ? palette.accent.surface
                    : palette.background.surface,
                  radii.xl,
                  states.surfaceHover
                )}
                role="option"
                aria-selected={isActive}
              >
                <Text as="span" variant="body" className="text-white/80">
                  {option.label}
                </Text>
              </button>
            </li>
          );
        })}
      </ul>
    </PopoverContent>
  );
}
