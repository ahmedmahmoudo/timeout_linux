import { Link, useLocation, useRouter } from "@tanstack/react-router";
import {
  Keyboard,
  Play,
  Plus,
  RotateCcw,
  Settings as SettingsIcon,
  Trash,
} from "lucide-react";
import {
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
  type SVGProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";
import { effects, palette, radii, states } from "../../theme/tokens";
import { Text } from "../ui/Text";
import { useBreaks } from "../../hooks/useBreaks";
import { formatDuration, intervalToDuration } from "date-fns";
import type { BreakSummary } from "../../data/breaks";

export function Sidebar() {
  const { breaks, deleteBreak, startBreak, skipBreak } = useBreaks();
  const pathname = useLocation().pathname;
  const [contextMenu, setContextMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && menuRef.current?.contains(target)) {
        return;
      }
      closeContextMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeContextMenu();
      }
    };

    const handleViewportChange = () => {
      closeContextMenu();
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [contextMenu, closeContextMenu]);

  const handleContextMenu = useCallback(
    (event: ReactMouseEvent<HTMLElement>, id: string) => {
      event.preventDefault();

      const menuWidth = 192;
      const menuHeight = 132;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const clampedX = Math.min(event.clientX, viewportWidth - menuWidth);
      const clampedY = Math.min(event.clientY, viewportHeight - menuHeight);

      setContextMenu({ id, x: clampedX, y: clampedY });
    },
    [],
  );

  const handleStartBreak = useCallback(
    (id: string) => {
      closeContextMenu();
      startBreak(id);
    },
    [closeContextMenu, startBreak],
  );

  const handleSkipBreak = useCallback(
    (id: string) => {
      closeContextMenu();
      skipBreak(id);
    },
    [closeContextMenu, skipBreak],
  );

  const handleDeleteBreak = useCallback(
    (id: string) => {
      closeContextMenu();
      deleteBreak(id);

      router.navigate({ to: "/" });
    },
    [deleteBreak, closeContextMenu, router],
  );

  const getDuration = (seconds: number) => {
    const duration = intervalToDuration({ start: 0, end: seconds * 1000 });

    return formatDuration(duration, {
      format: ["days", "hours", "minutes", "seconds"],
      delimiter: " and ",
    });
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col gap-8 p-10",
        palette.background.surfaceMuted,
      )}
    >
      <header className="relative flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Text as="h1" variant="title">
            Breaks
          </Text>
          <Text as="p" variant="body" className="max-w-xs text-sm">
            Keep your cadence visible and add new breaks as you refine your
            flow.
          </Text>
        </div>
        <Link
          to="/breaks/new"
          className={cn(
            "inline-flex items-center justify-center gap-2 text-sm font-medium transition",
            "px-3 py-1 text-xs",
            "border",
            palette.border.accent,
            palette.accent.surface,
            palette.accent.text,
            palette.accent.surfaceHover,
            radii.xl,
            effects.focusRing,
          )}
        >
          <Plus className="h-4 w-4" />
        </Link>
      </header>

      <section className="relative">
        <ul className="flex flex-col gap-3">
          {breaks.map((item) => (
            <Break
              key={item.id}
              item={item}
              active={pathname === `/break/${item.id}`}
              getDuration={getDuration}
              onContextMenu={(event) => handleContextMenu(event, item.id)}
            />
          ))}
        </ul>
      </section>

      <div
        className={cn("h-px w-full border-t", palette.border.default)}
        aria-hidden
      />

      <nav className="relative space-y-2">
        <SidebarNavLink to="/settings" icon={SettingsIcon} label="Settings" />
        <SidebarNavLink to="/shortcuts" icon={Keyboard} label="Shortcuts" />
      </nav>

      {contextMenu
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              className={cn(
                "fixed z-50 min-w-[12rem] overflow-hidden border shadow-xl backdrop-blur-xl",
                palette.border.default,
                palette.background.surfaceSolid,
                radii.xl,
              )}
              style={{ top: contextMenu.y, left: contextMenu.x }}
            >
              <button
                type="button"
                onClick={() => handleStartBreak(contextMenu.id)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-400 transition",
                  "hover:bg-emerald-500/10",
                  effects.focusRing,
                )}
              >
                <Play className="h-4 w-4" aria-hidden />
                Start break
              </button>
              <button
                type="button"
                onClick={() => handleSkipBreak(contextMenu.id)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-sky-400 transition",
                  "hover:bg-sky-500/10",
                  effects.focusRing,
                )}
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Skip break
              </button>
              <button
                type="button"
                onClick={() => handleDeleteBreak(contextMenu.id)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 transition",
                  "hover:bg-red-500/10",
                  effects.focusRing,
                )}
              >
                <Trash className="h-4 w-4" aria-hidden />
                Delete break
              </button>
            </div>,
            document.body,
          )
        : null}
    </aside>
  );
}

type BreakProps = {
  item: BreakSummary;
  active: boolean;
  getDuration: (seconds: number) => string;
  onContextMenu: (event: ReactMouseEvent<HTMLElement>) => void;
};

function Break({ item, active, getDuration, onContextMenu }: BreakProps) {
  return (
    <li className="relative list-none" onContextMenu={onContextMenu}>
      <Link
        to={`/break/$id`}
        params={{ id: item.id }}
        onContextMenu={onContextMenu}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2 transition",
          "cursor-pointer",
          states.surfaceHover,
          active ? "bg-neutral-800" : palette.background.surfaceOverlay,
        )}
      >
        <span
          className="h-3.5 w-3.5 rounded-full"
          style={{
            backgroundColor: `rgb(${item.color.join(",")})`,
          }}
          aria-hidden
        />
        <div className="flex flex-col">
          <Text as="span" variant="label">
            {item.name}
          </Text>
          {item.remaning ? (
            <Text as="span" variant="muted">
              due in {getDuration(item.remaning)}
            </Text>
          ) : (
            <Text as="span" variant="muted">
              Done
            </Text>
          )}
        </div>
      </Link>
    </li>
  );
}

type SidebarNavLinkProps = {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

function SidebarNavLink({
  to,
  label,
  icon: IconComponent,
}: SidebarNavLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
        palette.background.surfaceOverlay,
        palette.text.secondary,
        states.surfaceHover,
      )}
      activeProps={{
        className: cn(palette.text.primary),
      }}
    >
      <IconComponent className="h-4 w-4" aria-hidden />
      <span className="flex-1">{label}</span>
    </Link>
  );
}
