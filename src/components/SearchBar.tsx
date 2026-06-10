"use client";

interface SearchBarProps {
  query: string;
  genre: string;
  onQueryChange: (value: string) => void;
  onGenreChange: (value: string) => void;
}

const GENRES = [
  "All",
  "Electronic",
  "Hip-Hop",
  "Ambient",
  "Rock",
  "Pop",
  "Jazz",
  "Lo-Fi",
];

export function SearchBar({
  query,
  genre,
  onQueryChange,
  onGenreChange,
}: SearchBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ld-text-muted">
          ⌕
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search tracks, artists, genres..."
          className="ld-input py-3 pl-11"
        />
      </div>
      <select
        value={genre}
        onChange={(e) => onGenreChange(e.target.value)}
        className="ld-input w-full sm:w-auto"
      >
        {GENRES.map((g) => (
          <option key={g} value={g === "All" ? "" : g}>
            {g}
          </option>
        ))}
      </select>
    </div>
  );
}
