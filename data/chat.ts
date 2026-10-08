export type ChatChannel = {
  id: string;
  kind: "channel" | "dm" | "trip";
  name: string;
  topic?: string;
  tripRef?: string;
};

export type ChatMessage = {
  id: string;
  channelId: string;
  author: string;
  body: string;
  createdAt: string;
};

export const TEAM_MEMBERS = [
  "Chris Baez",
  "Maria Santos",
  "Devon Cole",
  "Priya Nair",
];

export const CHANNELS: ChatChannel[] = [
  {
    id: "ch-dispatch",
    kind: "channel",
    name: "dispatch",
    topic: "Live operations — active trips and handoffs",
  },
  {
    id: "ch-ops",
    kind: "channel",
    name: "ops",
    topic: "Fleet, schedules, and coverage",
  },
  {
    id: "ch-general",
    kind: "channel",
    name: "general",
    topic: "Everything else",
  },
  { id: "dm-maria", kind: "dm", name: "Maria Santos" },
  { id: "dm-devon", kind: "dm", name: "Devon Cole" },
  {
    id: "trip-4471",
    kind: "trip",
    name: "LAX → Beverly Hills",
    tripRef: "#4471",
    topic: "Tonight 22:00 pickup — N. Ellison +1",
  },
];

export const MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    channelId: "ch-dispatch",
    author: "Maria Santos",
    body: "Heads up — 4471 passenger asked to move pickup to 22:15, updating LA now.",
    createdAt: "2026-10-08T13:02:00Z",
  },
  {
    id: "m2",
    channelId: "ch-dispatch",
    author: "Devon Cole",
    body: "Confirmed. Driver staged at LAX-it, vehicle 12.",
    createdAt: "2026-10-08T13:04:00Z",
  },
  {
    id: "m3",
    channelId: "ch-dispatch",
    author: "Chris Baez",
    body: "Copy. Flagging VIP note on the Ellison account — quiet ride preference.",
    createdAt: "2026-10-08T13:06:00Z",
  },
  {
    id: "m4",
    channelId: "trip-4471",
    author: "Maria Santos",
    body: "Pickup moved to 22:15 per passenger request.",
    createdAt: "2026-10-08T13:02:30Z",
  },
  {
    id: "m5",
    channelId: "dm-maria",
    author: "Maria Santos",
    body: "Can you cover my Sunday shift? Swapping for the 15th.",
    createdAt: "2026-10-07T19:40:00Z",
  },
];
