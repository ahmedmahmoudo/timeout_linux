import { Link, useLocation } from "@tanstack/react-router";
import { Keyboard, Plus, Settings as SettingsIcon } from "lucide-react";
import { type ComponentType, type SVGProps } from "react";
import { cn } from "../../lib/cn";
import { effects, palette, radii, states } from "../../theme/tokens";
import { Text } from "../ui/Text";
import { useBreaks } from "../../hooks/useBreaks";
import { formatDuration, intervalToDuration } from "date-fns";

export function Sidebar() {
  const { breaks } = useBreaks();
  const pathname = useLocation().pathname;

  const getDuration = (seconds: number) => {
    const duration = intervalToDuration({ start: 0, end: seconds * 1000 });

    return formatDuration(duration, {
      format: ["days", "hours", "minutes", "seconds"],
      delimiter: " and ",
    });
  };

  console.log(pathname);
  return (
    <aside
      className={cn(
        "relative flex flex-col gap-8 p-10",
        palette.background.surfaceMuted
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
            effects.focusRing
          )}
        >
          <Plus className="h-4 w-4" />
        </Link>
      </header>

      <section className="relative">
        <ul className="flex flex-col gap-3">
          {breaks.map((item) => (
            <Link key={item.id} to={`/break/$id`} params={{ id: item.id }}>
              <li
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition",
                  states.surfaceHover,
                  pathname === `/break/${item.id}`
                    ? "bg-neutral-800"
                    : palette.background.surfaceOverlay
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
              </li>
            </Link>
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
    </aside>
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
        states.surfaceHover
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
