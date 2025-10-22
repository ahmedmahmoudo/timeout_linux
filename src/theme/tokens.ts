export const palette = {
  background: {
    page: "bg-gradient-to-br from-slate-950 via-slate-900 to-black",
    surface: "bg-slate-900/80",
    surfaceMuted: "bg-slate-900/60",
    surfaceOverlay: "bg-slate-900/70",
    surfaceGradient: "bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-900/80",
    surfaceDeep: "bg-slate-950/90",
    surfaceSolid: "bg-slate-900",
  },
  border: {
    default: "border-slate-800/80",
    strong: "border-slate-800/60",
    accent: "border-emerald-400/40",
  },
  divider: {
    subtle: "divide-slate-800/80",
    header: "border-slate-800/80",
  },
  text: {
    page: "text-slate-200",
    primary: "text-slate-100",
    secondary: "text-slate-500",
    muted: "text-slate-400",
    accent: "text-emerald-200",
  },
  accent: {
    surface: "bg-emerald-500/10",
    surfaceHover: "hover:bg-emerald-500/20",
    text: "text-emerald-200",
  },
  glow: {
    emerald: "bg-emerald-500/30",
    sky: "bg-sky-500/20",
  },
};

export const states = {
  surfaceHover: "hover:bg-slate-800/40",
  accentBorderHover: "hover:border-emerald-400/40",
  accentTextHover: "hover:text-emerald-200",
};

export const effects = {
  shellShadow: "shadow-[0_40px_120px_rgba(0,0,0,0.45)]",
  focusRing:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-0",
};

export const radii = {
  xl: "rounded-xl",
  xxl: "rounded-2xl",
  full: "rounded-full",
};
