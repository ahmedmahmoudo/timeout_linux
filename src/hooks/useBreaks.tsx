import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { BreakSummary, BreakUpdatePayload } from "../data/breaks";

type BreaksContextValue = {
  breaks: BreakSummary[];
  refresh: () => Promise<void>;
  getBreak: (id: string) => BreakSummary | undefined;
  updateBreak: (update: BreakUpdatePayload) => Promise<BreakSummary | null>;
};

const BreaksContext = createContext<BreaksContextValue | null>(null);

export function BreaksProvider({ children }: { children: ReactNode }) {
  const [breaks, setBreaks] = useState<BreakSummary[]>([]);
  const readyRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const loaded = await invoke<BreakSummary[]>("get_breaks");
      readyRef.current = true;
      setBreaks(loaded);
    } catch (error) {
      console.error("Failed to load breaks", error);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const unlisteners: UnlistenFn[] = [];

    const setup = async () => {
      try {
        const tick = await listen<BreakSummary[]>("breaks-tick", (event) => {
          if (!readyRef.current) {
            return;
          }
          setBreaks(event.payload);
        });

        const updated = await listen<BreakSummary>("break-updated", (event) => {
          if (!readyRef.current) {
            return;
          }
          setBreaks((prev) => upsertBreak(prev, event.payload));
        });

        unlisteners.push(tick, updated);
      } catch (error) {
        console.error("Failed to bind break listeners", error);
      }
    };

    setup();

    return () => {
      unlisteners.forEach((unlisten) => {
        try {
          unlisten();
        } catch {
          // ignore
        }
      });
    };
  }, []);

  const getBreak = useCallback(
    (id: string) => breaks.find((item) => item.id === id),
    [breaks]
  );

  const updateBreak = useCallback(
    async (update: BreakUpdatePayload) => {
      setBreaks((prev) => applyPatch(prev, update));

      try {
        const payload = mapUpdatePayload(update);
        const updated = await invoke<BreakSummary>("update_break", payload);
        setBreaks((prev) => upsertBreak(prev, updated));
        return updated;
      } catch (error) {
        console.error("Failed to update break", error);
        refresh();
        return null;
      }
    },
    [refresh]
  );

  const value = useMemo<BreaksContextValue>(
    () => ({
      breaks,
      refresh,
      getBreak,
      updateBreak,
    }),
    [breaks, refresh, getBreak, updateBreak]
  );

  return (
    <BreaksContext.Provider value={value}>{children}</BreaksContext.Provider>
  );
}

export function useBreaks() {
  const context = useContext(BreaksContext);
  if (!context) {
    throw new Error("useBreaks must be used within a BreaksProvider");
  }
  return context;
}

function upsertBreak(existing: BreakSummary[], updated: BreakSummary): BreakSummary[] {
  const idx = existing.findIndex((item) => item.id === updated.id);
  if (idx === -1) {
    return [...existing, updated];
  }
  const next = [...existing];
  next[idx] = updated;
  return next;
}

function applyPatch(
  existing: BreakSummary[],
  patch: BreakUpdatePayload
): BreakSummary[] {
  const idx = existing.findIndex((item) => item.id === patch.id);
  if (idx === -1) {
    return existing;
  }

  const current = existing[idx];
  const next: BreakSummary = {
    ...current,
    ...(patch.name !== undefined ? { name: patch.name } : null),
    ...(patch.every !== undefined ? { every: patch.every } : null),
    ...(patch.duration !== undefined ? { duration: patch.duration } : null),
    ...(patch.color !== undefined ? { color: patch.color } : null),
    ...(patch.remaning !== undefined ? { remaning: patch.remaning } : null),
    ...(patch.shortcut !== undefined ? { shortcut: patch.shortcut } : null),
    ...(patch.description !== undefined
      ? { description: patch.description }
      : null),
  };

  const nextList = [...existing];
  nextList[idx] = next;
  return nextList;
}

function mapUpdatePayload(update: BreakUpdatePayload) {
  const payload: Record<string, unknown> = { payload: { id: update.id } };
  const body = payload.payload as Record<string, unknown>;

  if (update.name !== undefined) {
    body.name = update.name;
  }
  if (update.every !== undefined) {
    body.every = update.every;
  }
  if (update.duration !== undefined) {
    body.duration = update.duration;
  }
  if (update.color !== undefined) {
    body.color = update.color;
  }
  if (update.remaning !== undefined) {
    body.remaning = update.remaning;
  }
  if (update.shortcut !== undefined) {
    body.shortcut = update.shortcut;
  }
  if (update.description !== undefined) {
    body.description = update.description;
  }

  return payload;
}
