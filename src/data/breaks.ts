export type BreakSummary = {
  id: string;
  name: string;
  dueIn: string;
  color: string;
};

export const breaks: BreakSummary[] = [
  {
    id: "micro",
    name: "Micro Break",
    dueIn: "5 minutes",
    color: "#38bdf8",
  },
  {
    id: "stretch",
    name: "Stretch Session",
    dueIn: "20 minutes",
    color: "#f97316",
  },
  {
    id: "deep-rest",
    name: "Deep Rest",
    dueIn: "1 hour",
    color: "#a855f7",
  },
];
