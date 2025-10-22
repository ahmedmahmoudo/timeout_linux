import { Link } from "@tanstack/react-router";
import { Keyboard, Plus, Settings as SettingsIcon } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { breaks } from "../../data/breaks";
import { cn } from "../../lib/cn";
import { effects, palette, radii, states } from "../../theme/tokens";
import { Text } from "../ui/Text";

export function Sidebar() {
  return (
    <aside
      className={cn(
        "relative flex flex-col gap-8 p-10",
        palette.background.surfaceMuted,
        "backdrop-blur-xl"
      )}
    >
      <div className="absolute inset-0" aria-hidden>
        <div
          className={cn(
            "absolute -top-16 -right-24 h-56 w-56 rounded-full blur-3xl",
            palette.glow.emerald
          )}
        />
        <div
          className={cn(
            "absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl",
            palette.glow.sky
          )}
        />
        <div className={cn("absolute inset-0", palette.background.surfaceOverlay)} />
      </div>

      <header className="relative flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Text as="h1" variant="title">
            Breaks
          </Text>
          <Text as="p" variant="body" className="max-w-xs text-sm">
            Keep your cadence visible and add new breaks as you refine your flow.
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
          Add Break
        </Link>
      </header>

      <section className="relative">
        <ul className="space-y-3">
          {breaks.map((item) => (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 transition",
                palette.background.surfaceOverlay,
                states.surfaceHover
              )}
            >
              <span
                className="h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden
              />
              <div className="flex flex-col">
                <Text as="span" variant="label">
                  {item.name}
                </Text>
                <Text as="span" variant="muted">
                  due in {item.dueIn}
                </Text>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className={cn("h-px w-full border-t", palette.border.default)} aria-hidden />

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

function SidebarNavLink({ to, label, icon: IconComponent }: SidebarNavLinkProps) {
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
