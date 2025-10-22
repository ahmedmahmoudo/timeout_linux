import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MutableRefObject,
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../lib/cn";
import { effects, palette, radii } from "../../theme/tokens";

type PopoverContextValue = {
  open: boolean;
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  triggerRef: MutableRefObject<HTMLElement | null>;
  contentRef: MutableRefObject<HTMLDivElement | null>;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);

type PopoverProps = {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export function Popover({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;

  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const currentOpen = isControlled ? open : uncontrolledOpen;

  const setOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(currentOpen) : value;
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [currentOpen, isControlled, onOpenChange]
  );

  const contextValue = useMemo(
    () => ({
      open: currentOpen,
      setOpen,
      triggerRef,
      contentRef,
    }),
    [currentOpen, setOpen]
  );

  return (
    <PopoverContext.Provider value={contextValue}>
      <div className={cn("relative inline-block", className)}>{children}</div>
    </PopoverContext.Provider>
  );
}

function usePopoverContext(component: string) {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Popover>`);
  }
  return context;
}

type PopoverTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ className, onClick, ...props }, ref) => {
    const { open, setOpen, triggerRef } = usePopoverContext("PopoverTrigger");

    return (
      <button
        type="button"
        aria-expanded={open}
        ref={(node) => {
          triggerRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        onClick={(event) => {
          onClick?.(event);
          setOpen((prev) => !prev);
        }}
        className={className}
        {...props}
      />
    );
  }
);

PopoverTrigger.displayName = "PopoverTrigger";

type PopoverContentProps = HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end";
  sideOffset?: number;
};

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = "start", sideOffset = 8, children, ...props }, ref) => {
    const { open, setOpen, triggerRef, contentRef } = usePopoverContext("PopoverContent");

    useEffect(() => {
      if (!open) {
        return;
      }

      const handlePointerDown = (event: MouseEvent | TouchEvent) => {
        const target = event.target as Node | null;
        const contentEl = contentRef.current;
        const triggerEl = triggerRef.current;

        if (!contentEl || !triggerEl) {
          return;
        }

        if (
          contentEl.contains(target) ||
          triggerEl.contains(target) ||
          target === contentEl ||
          target === triggerEl
        ) {
          return;
        }

        setOpen(false);
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("touchstart", handlePointerDown);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("mousedown", handlePointerDown);
        document.removeEventListener("touchstart", handlePointerDown);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [open, setOpen, contentRef, triggerRef]);

    if (!open) {
      return null;
    }

    const alignmentClass =
      align === "center" ? "left-1/2 -translate-x-1/2" : align === "end" ? "right-0" : "left-0";

    return (
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn(
          "absolute z-50 min-w-[12rem] top-full",
          alignmentClass,
          "border shadow-lg backdrop-blur-xl",
          palette.border.default,
          palette.background.surfaceSolid,
          radii.xl,
          effects.focusRing,
          className
        )}
        style={{ marginTop: sideOffset }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PopoverContent.displayName = "PopoverContent";

export function usePopoverControls() {
  return usePopoverContext("usePopoverControls");
}
