import type { LeaderboardEntry } from "@/lib/types";

interface LeaderboardTableProps {
  title: string;
  entries: LeaderboardEntry[];
  emptyMessage: string;
}

export function LeaderboardTable({
  title,
  entries,
  emptyMessage,
}: LeaderboardTableProps) {
  return (
    <div className="ld-card overflow-hidden">
      <div className="border-b border-ld-border px-4 py-3 sm:px-6">
        <h2 className="text-sm font-bold tracking-tight text-ld-text sm:text-base">
          {title}
        </h2>
      </div>
      {entries.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-ld-text-secondary sm:px-6">
          {emptyMessage}
        </p>
      ) : (
        <ul className="divide-y divide-ld-border">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4"
            >
              <span className="w-6 shrink-0 text-xs font-bold tabular-nums text-ld-text-muted sm:w-8 sm:text-sm">
                {entry.rank}
              </span>
              <div
                className="h-10 w-10 shrink-0 bg-ld-bg-secondary bg-cover bg-center sm:h-11 sm:w-11"
                style={
                  entry.avatarUrl
                    ? { backgroundImage: `url(${entry.avatarUrl})` }
                    : undefined
                }
              >
                {!entry.avatarUrl && (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-ld-text-muted">
                    {entry.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ld-text">{entry.name}</p>
              </div>
              <p className="shrink-0 text-xs font-medium text-ld-text-secondary sm:text-sm">
                {entry.scoreLabel}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
