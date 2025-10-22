import { Text } from "../components/ui/Text";

export function SettingsPage() {
  return (
    <div className="flex h-full flex-col gap-4 p-10">
      <Text as="h2" variant="subtitle">
        Settings
      </Text>
      <Text as="p" variant="body" className="max-w-lg">
        Tailor Timeout to match your workflow, notifications, and preferences.
      </Text>
      <Text as="p" variant="muted">
        Settings coming soon.
      </Text>
    </div>
  );
}
