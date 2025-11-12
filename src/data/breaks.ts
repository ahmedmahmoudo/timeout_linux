export type BreakAppearance = {
  theme: string;
  background_color: [number, number, number];
  show_skip_controls: boolean;
};

export type BreakAppearanceUpdate = Partial<BreakAppearance>;

export const defaultBreakAppearance: BreakAppearance = {
  theme: "default",
  background_color: [15, 23, 42],
  show_skip_controls: true,
};

export type BreakSummary = {
  id: string;
  name: string;
  every: number;
  duration: number;
  color: [number, number, number];
  remaning: number;
  run_time?: number | null;
  is_running?: boolean | null;
  is_paused?: boolean | null;
  is_preview?: boolean | null;
  shortcut?: string | null;
  description?: string | null;
  appearance: BreakAppearance;
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
  appearance?: BreakAppearanceUpdate;
};
