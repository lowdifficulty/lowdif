/** Optional filler rows if live data is sparse — primary data comes from seed. */

export interface DemoLeaderboardRow {
  id: string;
  name: string;
  avatarUrl: string;
  score: number;
}

export const DEMO_LISTENER_LEADERBOARD: DemoLeaderboardRow[] = [];

export const DEMO_ARTIST_LEADERBOARD: DemoLeaderboardRow[] = [];

export function mergeLeaderboardRows(
  live: DemoLeaderboardRow[],
  demo: DemoLeaderboardRow[],
  formatScore: (score: number) => string
) {
  const liveNames = new Set(live.map((row) => row.name.toLowerCase()));
  const demoOnly = demo.filter((row) => !liveNames.has(row.name.toLowerCase()));

  return [...live, ...demoOnly]
    .sort((a, b) => b.score - a.score)
    .map((row, index) => ({
      rank: index + 1,
      id: row.id,
      name: row.name,
      avatarUrl: row.avatarUrl,
      score: row.score,
      scoreLabel: formatScore(row.score),
    }));
}
