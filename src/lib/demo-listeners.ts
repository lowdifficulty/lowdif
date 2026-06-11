/** Demo listener accounts — seeded for leaderboard and stats UI. */

export interface DemoListenerSeed {
  name: string;
  email: string;
  avatarUrl: string;
  /** Total LOWDIF mined (listener share). */
  tokensMined: number;
}

export function listenerEmailFromName(name: string): string {
  if (name === "Matthew") return "listener@lowdif.com";
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `listener-${slug}@lowdif.com`;
}

export const DEMO_LISTENERS: DemoListenerSeed[] = [
  {
    name: "Matthew",
    email: "listener@lowdif.com",
    avatarUrl: "/covers/midnight-frequency.jpg",
    tokensMined: 52,
  },
  {
    name: "Maya Chen",
    email: listenerEmailFromName("Maya Chen"),
    avatarUrl: "/covers/lunar-cache.jpg",
    tokensMined: 47,
  },
  {
    name: "Jordan Keys",
    email: listenerEmailFromName("Jordan Keys"),
    avatarUrl: "/covers/neon-drift.jpg",
    tokensMined: 38.5,
  },
  {
    name: "Riley Ortiz",
    email: listenerEmailFromName("Riley Ortiz"),
    avatarUrl: "/covers/echo-chamber.jpg",
    tokensMined: 31,
  },
  {
    name: "Samira Holt",
    email: listenerEmailFromName("Samira Holt"),
    avatarUrl: "/covers/crystal-protocol.jpg",
    tokensMined: 26.5,
  },
  {
    name: "Alex Mercer",
    email: listenerEmailFromName("Alex Mercer"),
    avatarUrl: "/covers/pulse-runner.jpg",
    tokensMined: 19,
  },
  {
    name: "Chris Vale",
    email: listenerEmailFromName("Chris Vale"),
    avatarUrl: "/covers/ghost-signal.jpg",
    tokensMined: 12,
  },
  {
    name: "Tessa Wu",
    email: listenerEmailFromName("Tessa Wu"),
    avatarUrl: "/covers/static-bloom.jpg",
    tokensMined: 9.5,
  },
  {
    name: "Eli Park",
    email: listenerEmailFromName("Eli Park"),
    avatarUrl: "/covers/voltage-dreams.jpg",
    tokensMined: 6,
  },
  {
    name: "Zoe Finch",
    email: listenerEmailFromName("Zoe Finch"),
    avatarUrl: "/covers/soft-voltage.jpg",
    tokensMined: 4,
  },
];
