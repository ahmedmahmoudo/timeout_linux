import { useMemo, useState } from "react";
import { Text } from "../components/ui/Text";
import { useParams } from "@tanstack/react-router";
import {
  SegmentedTabs,
  type SegmentedTabOption,
} from "../components/ui/SegmentedTabs";
import { Card } from "../components/ui/Card";
import { useBreaks } from "../hooks/useBreaks";
import { BreakNameTab } from "../components/tabs/break/Name";
import { EmptyTabState } from "../components/ui/EmptyState";
import { BreakScheduleTab } from "../components/tabs/break/Schedule";

export function BreakPage() {
  const { id } = useParams({ from: "/break/$id" });
  const { getBreak, updateBreak } = useBreaks();
  const foundBreak = getBreak(id) ?? null;
  const [activeTab, setActiveTab] = useState<BreakTab>("name");

  const tabOptions: SegmentedTabOption<BreakTab>[] = useMemo(
    () => [
      { value: "name", label: "Name" },
      { value: "schedule", label: "Schedule" },
      { value: "appearance", label: "Appearance" },
    ],
    [],
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
        {activeTab === "name" && (
          <BreakNameTab brek={foundBreak} onUpdate={updateBreak} />
        )}

        {activeTab === "schedule" && (
          <BreakScheduleTab brek={foundBreak} onUpdate={updateBreak} />
        )}

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
