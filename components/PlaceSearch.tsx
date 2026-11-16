"use client";

import { useMemo, useState } from "react";
import type { Place } from "@/lib/types";
import { SearchIcon } from "./icons";

const MAX_RESULTS = 7;

/** Prefix matches first, then countries before cities, then shorter names. */
function rankPlace(place: Place, q: string): number {
  const name = place.name.toLowerCase();
  return (
    (name.startsWith(q) ? 0 : 20) +
    (place.kind === "country" ? 0 : 6) +
    Math.min(name.length, 15)
  );
}

export default function PlaceSearch({
  places,
  onPick,
}: {
  places: Place[];
  onPick: (place: Place) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return places
      .filter((p) => p.name.toLowerCase().includes(q))
      .sort((a, b) => rankPlace(a, q) - rankPlace(b, q))
      .slice(0, MAX_RESULTS);
  }, [places, query]);

  const expanded = open && results.length > 0;

  const choose = (place: Place) => {
    onPick(place);
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") return setOpen(false);
    if (!results.length) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((active + step + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(results[Math.min(active, results.length - 1)]);
    }
  };

  return (
    <div className="relative">
      <label htmlFor="place-search" className="label">
        Search a place
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2.5 focus-within:border-brand-deep">
        <SearchIcon className="h-4 w-4 shrink-0 text-ink-soft" />
        <input
          id="place-search"
          type="text"
          role="combobox"
          aria-expanded={expanded}
          aria-controls="place-results"
          aria-autocomplete="list"
          aria-activedescendant={expanded ? `place-option-${active}` : undefined}
          value={query}
          placeholder="Tokyo, Kenya, Brazil…"
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft/60"
        />
      </div>

      {expanded && (
        <ul
          id="place-results"
          role="listbox"
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-line bg-white shadow-[0_18px_40px_-24px_rgba(21,24,28,0.45)]"
        >
          {results.map((place, index) => (
            <li
              key={`${place.kind}-${place.name}-${place.iso}`}
              id={`place-option-${index}`}
              role="option"
              aria-selected={index === active}
              // mousedown fires before blur, so the pick lands before the list closes
              onMouseDown={(event) => {
                event.preventDefault();
                choose(place);
              }}
              onMouseEnter={() => setActive(index)}
              className={`flex cursor-pointer items-baseline justify-between gap-3 px-4 py-2.5 text-sm ${
                index === active ? "bg-paper-2" : ""
              }`}
            >
              <span>{place.name}</span>
              <span className="text-[0.6875rem] uppercase tracking-widest text-ink-soft">
                {place.kind === "city" ? place.country : "country"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
