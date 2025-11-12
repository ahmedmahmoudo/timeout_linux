export type BreakSummary = {
  id: string;
  name: string;
  every: number;
  duration: number;
  color: number[];
  remaning: number;
  run_time?: number | null;
  is_running?: boolean | null;
  is_paused?: boolean | null;
  shortcut?: string | null;
  description?: string | null;
};

export type BreakUpdatePayload = {
  id: string;
  name?: string;
  every?: number;
  duration?: number;
  color?: [number, number, number];
  remaning?: number;
  shortcut?: string | null;
  description?: string | null;
};
