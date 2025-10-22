import { Text } from "../components/ui/Text";

export function ShortcutsPage() {
  return (
    <div className="flex h-full flex-col gap-4 p-10">
      <Text as="h2" variant="subtitle">
        Shortcuts
      </Text>
      <Text as="p" variant="body" className="max-w-lg">
        Review keyboard shortcuts to quickly start, pause, or adjust breaks.
      </Text>
      <Text as="p" variant="muted">
        Shortcut list coming soon.
      </Text>
    </div>
  );
}
