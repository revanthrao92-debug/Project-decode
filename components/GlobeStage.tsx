"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CONTINENTS, timeAgo } from "@/lib/continents";
import type {
  CountryFeature,
  GeoCollection,
  Place,
  Selection,
} from "@/lib/types";
import type { NewsItem } from "@/lib/news";
import type { Focus } from "./GlobeCanvas";

const GlobeCanvas = dynamic(() => import("./GlobeCanvas"), { ssr: false });

/** There is no sport section on this site, so keep it out of globe results. */
const SPORTS_FILTER =
  "-cricket -football -soccer -tennis -olympics -badminton";

type Status = "idle" | "loading" | "done" | "error";

export default function GlobeStage() {
  const [geo, setGeo] = useState<GeoCollection | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [hovered, setHovered] = useState<CountryFeature | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [focus, setFocus] = useState<Focus | null>(null);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const panel = useRef<HTMLDivElement | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch("/geo/countries.json").then((r) => r.json()),
      fetch("/geo/places.json").then((r) => r.json()),
    ])
      .then(([countries, placeList]) => {
        if (!alive) return;
        setGeo(countries as GeoCollection);
        setPlaces(placeList as Place[]);
      })
      .catch(() => {
        if (alive) setError("The globe data didn't load. Reload to try again.");
      });
    return () => {
      alive = false;
    };
  }, []);

  const load = useCallback(async (next: Selection) => {
    setSelection(next);
    setStatus("loading");
    setItems([]);
    setError(null);
    const id = ++requestId.current;

    try {
      const res = await fetch(
        `/api/news?q=${encodeURIComponent(`${next.query} ${SPORTS_FILTER}`)}`,
      );
      const payload = await res.json();
      if (id !== requestId.current) return;
      if (!res.ok) throw new Error(payload?.error ?? "Something went wrong.");
      setItems((payload.items ?? []) as NewsItem[]);
      setStatus("done");
    } catch (err) {
      if (id !== requestId.current) return;
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
      setStatus("error");
    }
  }, []);

  const revealPanel = () => {
    window.setTimeout(() => {
      panel.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 140);
  };

  const pickCountry = (feature: CountryFeature) => {
    const { name, continent, lat, lng, iso } = feature.properties;
    void load({ query: name, label: name, continent, lat, lng, iso });
    setFocus({ lat, lng, altitude: 1.5 });
    revealPanel();
  };

  const pickContinent = (name: string) => {
    const target = CONTINENTS.find((c) => c.name === name);
    if (!target) return;
    void load({
      query: target.name,
      label: target.name,
      continent: target.name,
      lat: target.lat,
      lng: target.lng,
    });
    setFocus({ lat: target.lat, lng: target.lng, altitude: 2 });
    revealPanel();
  };

  const pickPlace = (place: Place) => {
    const label =
      place.kind === "city" && place.country
        ? `${place.name}, ${place.country}`
        : place.name;
    const search =
      place.kind === "city" && place.country
        ? `${place.name} ${place.country}`
        : place.name;

    void load({
      query: search,
      label,
      continent: place.continent,
      lat: place.lat,
      lng: place.lng,
      iso: place.iso,
    });
    setFocus({
      lat: place.lat,
      lng: place.lng,
      altitude: place.kind === "city" ? 1.05 : 1.5,
    });
    setQuery("");
    setSearchOpen(false);
    revealPanel();
  };

  const reset = () => {
    requestId.current++;
    setSelection(null);
    setItems([]);
    setStatus("idle");
    setError(null);
    setFocus({ lat: 20, lng: 78, altitude: 2.05 });
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return [];
    return places
      .filter((p) => p.name.toLowerCase().includes(q))
      .map((p) => ({
        place: p,
        rank:
          (p.name.toLowerCase().startsWith(q) ? 0 : 20) +
          (p.kind === "country" ? 0 : 6) +
          Math.min(p.name.length, 15),
      }))
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 7)
      .map((r) => r.place);
  }, [places, query]);

  const activeContinent = selection
    ? selection.continent
    : (hovered?.properties.continent ?? null);

  return (
    <>
      <section id="globe" className="flex flex-col">
        <div className="relative h-[clamp(320px,54svh,620px)]">
          <div className="absolute inset-0">
            <GlobeCanvas
              geo={geo}
              activeContinent={activeContinent}
              selectedIso={selection?.iso ?? null}
              focus={focus}
              onHover={setHovered}
              onPick={pickCountry}
            />
          </div>

        </div>

        <div className="mx-auto w-full max-w-6xl px-5 pb-8 pt-1 lg:px-8 lg:pb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <h1 className="display max-w-[16ch] text-[clamp(2.1rem,4.2vw,3.3rem)]">
              Decoding the world, one story at a time.
            </h1>

            <div className="w-full max-w-sm">
              <div className="relative">
                <label htmlFor="place-search" className="label">
                  Search a place
                </label>
                <div className="mt-2 flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2.5 focus-within:border-brand-deep">
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    className="h-4 w-4 shrink-0 text-ink-soft"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m16.5 16.5 4 4" strokeLinecap="round" />
                  </svg>
                  <input
                    id="place-search"
                    type="text"
                    value={query}
                    placeholder="Tokyo, Kenya, Brazil…"
                    autoComplete="off"
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    onBlur={() =>
                      window.setTimeout(() => setSearchOpen(false), 120)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && results[0]) {
                        event.preventDefault();
                        pickPlace(results[0]);
                      }
                      if (event.key === "Escape") setSearchOpen(false);
                    }}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft/60"
                  />
                </div>

                {searchOpen && results.length > 0 && (
                  <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-line bg-white shadow-[0_18px_40px_-24px_rgba(21,24,28,0.45)]">
                    {results.map((place) => (
                      <li key={`${place.kind}-${place.name}-${place.iso}`}>
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => pickPlace(place)}
                          className="flex w-full items-baseline justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-paper-2"
                        >
                          <span>{place.name}</span>
                          <span className="text-[0.6875rem] uppercase tracking-widest text-ink-soft">
                            {place.kind === "city" ? place.country : "country"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {CONTINENTS.map((continent) => {
                  const active = selection?.continent === continent.name;
                  return (
                    <button
                      key={continent.name}
                      type="button"
                      onClick={() => pickContinent(continent.name)}
                      className={`rounded-full border px-3 py-1 text-[0.6875rem] uppercase tracking-[0.1em] transition-colors ${
                        active
                          ? "border-brand-deep bg-brand/20 text-brand-deep"
                          : "border-line text-ink-soft hover:border-ink/30 hover:text-ink"
                      }`}
                    >
                      {continent.name}
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 min-h-[1rem] text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft">
                {hovered
                  ? `${hovered.properties.name} · ${hovered.properties.continent}`
                  : "Or tap any country on the globe"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div ref={panel}>
        {selection && (
          <section className="border-y border-line bg-paper-2/60">
            <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="label flex items-center gap-2 text-hot">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-hot opacity-70" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-hot" />
                    </span>
                    Hot right now
                  </p>
                  <h2 className="display mt-1.5 text-[clamp(1.9rem,3.6vw,2.8rem)]">
                    {selection.label}
                  </h2>
                  {selection.label !== selection.continent && (
                    <p className="mt-0.5 text-[0.6875rem] uppercase tracking-[0.16em] text-ink-soft">
                      {selection.continent}
                    </p>
                  )}
                </div>

                <div className="mt-2 flex w-full items-center gap-2 sm:mt-0 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => void load(selection)}
                    className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-xs text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
                  >
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-xs text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
                  >
                    Back to globe
                  </button>
                </div>
              </div>

              <div className="mt-6" aria-live="polite">
                {status === "loading" && (
                  <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <li key={index} className="border-t border-line py-4">
                        <div className="h-3 w-full animate-pulse rounded bg-line" />
                        <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-line/70" />
                      </li>
                    ))}
                  </ul>
                )}

                {status === "error" && (
                  <p className="rounded-xl border border-hot/30 bg-hot/5 p-4 text-sm text-ink-soft">
                    {error}
                  </p>
                )}

                {status === "done" && items.length === 0 && (
                  <p className="text-sm text-ink-soft">
                    Nothing fresh for {selection.label} in the last two days. Try
                    a whole continent instead.
                  </p>
                )}

                {status === "done" && items.length > 0 && (
                  <ol className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item, index) => (
                      <li key={item.url} className="border-t border-line py-4">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex gap-3"
                        >
                          <span className="mt-0.5 text-[0.6875rem] tabular-nums text-ink-soft/70">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span>
                            <span className="block text-[0.95rem] font-medium leading-snug underline-offset-4 group-hover:underline">
                              {item.title}
                            </span>
                            <span className="mt-1.5 block text-[0.6875rem] uppercase tracking-[0.14em] text-ink-soft">
                              {item.source}
                              {item.published
                                ? ` · ${timeAgo(item.published)}`
                                : ""}
                            </span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
