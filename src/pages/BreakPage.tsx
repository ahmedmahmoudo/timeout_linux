import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Text } from "../components/ui/Text";
import { useParams } from "@tanstack/react-router";
import {
  SegmentedTabs,
  type SegmentedTabOption,
} from "../components/ui/SegmentedTabs";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { ColorPicker } from "../components/ui/ColorPicker";
import { Textarea } from "../components/ui/Textarea";
import { cn } from "../lib/cn";
import { useBreaks } from "../hooks/useBreaks";
import { hexToRgb, rgbToHex } from "../lib/colors";

export function BreakPage() {
  const { id } = useParams({ from: "/break/$id" });
  const { getBreak, updateBreak } = useBreaks();
  const foundBreak = getBreak(id) ?? null;
  const [activeTab, setActiveTab] = useState<BreakTab>("name");
  const [name, setName] = useState<string | null>(null);
  const [color, setColor] = useState("#ef4444");
  const [shortcut, setShortcut] = useState("");
  const [description, setDescription] = useState("");
  const lastSyncedBreakId = useRef<string | null>(null);

  useEffect(() => {
    if (foundBreak) {
      const isNewBreak = lastSyncedBreakId.current !== foundBreak.id;

      if (!isNewBreak) {
        return;
      }

      lastSyncedBreakId.current = foundBreak.id;

      setName((prev) => (prev === foundBreak.name ? prev : foundBreak.name));
      const nextColor = rgbToHex(foundBreak.color);
      setColor((prev) => (prev === nextColor ? prev : nextColor));
      const nextShortcut = foundBreak.shortcut ?? "";
      setShortcut((prev) => (prev === nextShortcut ? prev : nextShortcut));
      const nextDescription = foundBreak.description ?? "";
      setDescription((prev) =>
        prev === nextDescription ? prev : nextDescription
      );
    }
  }, [foundBreak]);

  useEffect(() => {
    if (!foundBreak || !name) {
      return;
    }

    const rgbColor = hexToRgb(color);
    if (!rgbColor) {
      return;
    }

    const normalizedShortcut = shortcut.trim() === "" ? null : shortcut;
    const normalizedDescription =
      description.trim() === "" ? null : description;
    const originalColor = foundBreak.color.slice(0, 3) as [
      number,
      number,
      number
    ];

    const hasChanges =
      name !== foundBreak.name ||
      normalizedShortcut !== (foundBreak.shortcut ?? null) ||
      normalizedDescription !== (foundBreak.description ?? null) ||
      !colorsEqual(rgbColor, originalColor);

    if (!hasChanges) {
      return;
    }

    const payload = {
      id: foundBreak.id,
      name,
      color: rgbColor,
      shortcut: normalizedShortcut,
      description: normalizedDescription,
    };

    updateBreak(payload);
  }, [name, color, shortcut, description, foundBreak?.id, updateBreak]);

  const tabOptions: SegmentedTabOption<BreakTab>[] = useMemo(
    () => [
      { value: "name", label: "Name" },
      { value: "schedule", label: "Schedule" },
      { value: "appearance", label: "Appearance" },
    ],
    []
  );

  if (!foundBreak) {
    return <Text>Break with {id} was not found</Text>;
  }

  return (
    <div className="flex flex-col items-center gap-8 px-6 py-10">
      <header className="flex w-full flex-col items-center gap-3">
        <Text as="h1" variant="title">
          {foundBreak.name}
        </Text>
        <SegmentedTabs
          options={tabOptions}
          activeValue={activeTab}
          onChange={setActiveTab}
        />
      </header>

      <Card className="w-full max-w-3xl">
        {activeTab === "name" ? (
          <div className="space-y-6">
            <FieldGroup
              id="break-name"
              label="Name"
              helperText="Rename this break to keep things organised."
            >
              <Input
                id="break-name"
                value={name ?? ""}
                onChange={(event) => {
                  setName(event.target.value);
                }}
                placeholder="Break name"
              />
            </FieldGroup>

            <FieldGroup
              id="break-color"
              label="Color"
              helperText="Choose a color to highlight this break around the app."
            >
              <ColorPicker
                value={color}
                onChange={(next) => {
                  setColor(next);
                }}
                label="Choose break color"
              />
            </FieldGroup>

            <FieldGroup
              id="break-shortcut"
              label="Shortcut"
              helperText="Assign a keyboard shortcut to quickly trigger this break."
            >
              <Input
                id="break-shortcut"
                value={shortcut}
                onChange={(event) => {
                  setShortcut(event.target.value);
                }}
                placeholder="Press keys..."
              />
            </FieldGroup>

            <FieldGroup
              id="break-description"
              label="Description"
              helperText="Add notes or context about what this break is for."
            >
              <Textarea
                id="break-description"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                }}
                placeholder="Describe this break..."
                rows={4}
              />
            </FieldGroup>
          </div>
        ) : null}

        {activeTab === "schedule" ? (
          <EmptyTabState
            title="Schedule settings are coming soon"
            description="You’ll be able to fine-tune frequency and timing from here."
          />
        ) : null}

        {activeTab === "appearance" ? (
          <EmptyTabState
            title="Appearance controls are coming soon"
            description="Soon you’ll customise sounds, icons, and more."
          />
        ) : null}
      </Card>
    </div>
  );
}

type BreakTab = "name" | "schedule" | "appearance";

type FieldGroupProps = {
  id: string;
  label: string;
  helperText?: string;
  children: ReactNode;
};

function FieldGroup({ id, label, helperText, children }: FieldGroupProps) {
  return (
    <div className="space-y-2">
      <Text as="label" htmlFor={id} variant="label" className="block">
        {label}
      </Text>
      {children}
      {helperText ? (
        <Text as="p" variant="muted" className={cn("text-xs text-neutral-400")}>
          {helperText}
        </Text>
      ) : null}
    </div>
  );
}

type EmptyTabStateProps = {
  title: string;
  description: string;
};

function EmptyTabState({ title, description }: EmptyTabStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <Text as="h3" variant="subtitle">
        {title}
      </Text>
      <Text as="p" variant="muted" className="max-w-md text-neutral-400">
        {description}
      </Text>
    </div>
  );
}

function colorsEqual(
  a: [number, number, number],
  b: [number, number, number]
): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
