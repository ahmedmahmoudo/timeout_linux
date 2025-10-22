import { Outlet } from "@tanstack/react-router";
import { cn } from "../../lib/cn";
import { effects, palette } from "../../theme/tokens";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  return (
    <main
      className={cn(
        "min-h-screen w-full",
        palette.background.page,
        palette.text.page
      )}
    >
      <section
        className={cn(
          "grid min-h-screen w-full gap-px border backdrop-blur-xl",
          "md:grid-cols-[360px_1fr]",
          palette.border.default,
          palette.background.surface,
          effects.shellShadow
        )}
      >
        <Sidebar />
        <div className={cn("flex flex-col", palette.background.surfaceDeep)}>
          <Outlet />
        </div>
      </section>
    </main>
  );
}
