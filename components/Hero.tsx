"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LogoIntro from "./LogoIntro";
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

export default function Hero() {
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
      panel.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
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
    setFocus({ lat: 20, lng: 78, altitude: 2.3 });
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
    <section className="mx-auto w-full max-w-6xl px-5 pt-8 lg:px-8 lg:pt-14">
      <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-10">
        <div className="order-2 lg:order-1">
          <LogoIntro />

          <h1 className="display mt-7 max-w-[15ch] text-[clamp(2.35rem,4.6vw,3.55rem)]">
            Decoding the world, one story at a time.
          </h1>

          <p className="mt-5 max-w-md text-[0.975rem] leading-relaxed text-ink-soft">
            Pick a country on the globe — or search for one — and see what&apos;s
            moving there right now. No noise, no hot takes. Just what happened,
            why it matters, and what to watch next.
          </p>

          <div className="relative mt-7 max-w-md">
            <label htmlFor="place-search" className="label">
              Search a place
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2.5 focus-within:border-brand-deep">
              <SearchIcon />
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
                onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)}
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

          <div className="mt-6 flex flex-wrap gap-2">
            {CONTINENTS.map((continent) => {
              const active = selection?.continent === continent.name;
              return (
                <button
                  key={continent.name}
                  type="button"
                  onClick={() => pickContinent(continent.name)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
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
        </div>

        <div className="relative order-1 lg:order-2">
          <div className="relative mx-auto h-[44vh] min-h-[300px] w-full max-w-[560px] lg:h-[540px]">
            <GlobeCanvas
              geo={geo}
              activeContinent={activeContinent}
              selectedIso={selection?.iso ?? null}
              focus={focus}
              onHover={setHovered}
              onPick={pickCountry}
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
              <span className="rounded-full border border-line bg-paper/85 px-3 py-1 text-[0.6875rem] text-ink-soft backdrop-blur-sm">
                {hovered
                  ? `${hovered.properties.name} · ${hovered.properties.continent}`
                  : "Tap a country, drag to spin"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div ref={panel} className="mt-6 lg:mt-10">
        {selection && (
          <div className="rounded-2xl border border-line bg-white/60 p-5 lg:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="label flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-hot opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-hot" />
                  </span>
                  Hot right now
                </p>
                <h2 className="display mt-2 text-3xl lg:text-4xl">
                  {selection.label}
                </h2>
                {selection.label !== selection.continent && (
                  <p className="mt-1 text-xs uppercase tracking-widest text-ink-soft">
                    {selection.continent}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void load(selection)}
                  className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-ink/30 hover:text-ink"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-ink/30 hover:text-ink"
                >
                  Back to globe
                </button>
              </div>
            </div>

            <div className="mt-6" aria-live="polite">
              {status === "loading" && <PanelSkeleton />}

              {status === "error" && (
                <p className="rounded-xl border border-hot/30 bg-hot/5 p-4 text-sm text-ink-soft">
                  {error}
                </p>
              )}

              {status === "done" && items.length === 0 && (
                <p className="rounded-xl border border-line bg-paper p-4 text-sm text-ink-soft">
                  Nothing fresh for {selection.label} in the last two days. Try a
                  whole continent instead.
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
                          <span className="mt-1.5 block text-[0.6875rem] uppercase tracking-widest text-ink-soft">
                            {item.source}
                            {item.published ? ` · ${timeAgo(item.published)}` : ""}
                          </span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PanelSkeleton() {
  return (
    <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <li key={index} className="border-t border-line py-4">
          <div className="h-3 w-full animate-pulse rounded bg-line" />
          <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-line/70" />
        </li>
      ))}
    </ul>
  );
}

function SearchIcon() {
  return (
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
  );
}
