import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppShell } from "./components/layout/AppShell";
import { HomePage } from "./pages/HomePage";
import { AddBreakPage } from "./pages/AddBreakPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ShortcutsPage } from "./pages/ShortcutsPage";

const rootRoute = createRootRoute({
  component: AppShell,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const addBreakRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/breaks/new",
  component: AddBreakPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const shortcutsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shortcuts",
  component: ShortcutsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  addBreakRoute,
  settingsRoute,
  shortcutsRoute,
]);

const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}
