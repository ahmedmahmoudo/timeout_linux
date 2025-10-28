import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/cn";
import { palette, radii } from "../../theme/tokens";

export type SegmentedTabOption<Value extends string> = {
  value: Value;
  label: string;
};

type SegmentedTabsProps<Value extends string> = {
  options: Array<SegmentedTabOption<Value>>;
  activeValue: Value;
  onChange: (value: Value) => void;
  className?: string;
};

export function SegmentedTabs<Value extends string>({
  options,
  activeValue,
  onChange,
  className,
}: SegmentedTabsProps<Value>) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div
      role="tablist"
      className={cn(
        "flex w-full max-w-md items-center border p-1",
        "overflow-hidden text-sm font-medium relative",
        palette.border.default,
        palette.background.surfaceOverlay,
        radii.full,
        className
      )}
    >
      {options.map((option) => {
        const isActive = option.value === activeValue;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            type="button"
            className={cn(
              "relative flex-1 overflow-hidden rounded-full px-3 py-2 transition-colors duration-200",
              radii.full,
              isActive ? palette.accent.text : palette.text.secondary
            )}
            onClick={() => {
              if (!isActive) {
                onChange(option.value);
              }
            }}
          >
            <span className="relative flex w-full justify-center py-2">
              <AnimatePresence>
                {isActive ? (
                  <motion.span
                    layoutId="segmented-tab-indicator"
                    className={cn(
                      "absolute inset-0 rounded-full",
                      palette.accent.surface
                    )}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 340, damping: 26 }}
                  />
                ) : null}
              </AnimatePresence>
              <span className="relative z-10">{option.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
