"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { CONTINENTS } from "@/lib/continents";
import type {
  CountryFeature,
  GeoCollection,
  Place,
  Selection,
} from "@/lib/types";
import type { Focus } from "./GlobeCanvas";
import PlaceSearch from "./PlaceSearch";
import RegionPanel from "./RegionPanel";
import { useNews } from "./useNews";

const GlobeCanvas = dynamic(() => import("./GlobeCanvas"), { ssr: false });

const HOME_VIEW: Focus = { lat: 20, lng: 78, altitude: 2.05 };

/** If the intro's "done" event is missed, mount the globe anyway after this. */
const GLOBE_FAILSAFE_MS = 4000;

function placeSelection(place: Place): Selection {
  const isCity = place.kind === "city" && place.country;
  return {
    query: isCity ? `${place.name} ${place.country}` : place.name,
    label: isCity ? `${place.name}, ${place.country}` : place.name,
    continent: place.continent,
    lat: place.lat,
    lng: place.lng,
    iso: place.iso,
  };
}

export default function GlobeStage() {
  const [geo, setGeo] = useState<GeoCollection | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<CountryFeature | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [focus, setFocus] = useState<Focus | null>(null);
  const [globeReady, setGlobeReady] = useState(false);

  const news = useNews();
  const loadNews = news.load;
  const panel = useRef<HTMLDivElement | null>(null);

  // Hold the WebGL globe until the intro has finished, so the two never fight
  // for the GPU.
  useEffect(() => {
    const onDone = () => setGlobeReady(true);
    window.addEventListener("pd:intro-done", onDone, { once: true });
    const failsafe = window.setTimeout(onDone, GLOBE_FAILSAFE_MS);
    return () => {
      window.removeEventListener("pd:intro-done", onDone);
      window.clearTimeout(failsafe);
    };
  }, []);

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
        if (alive) setGeoError("The globe data didn't load. Reload to try again.");
      });
    return () => {
      alive = false;
    };
  }, []);

  const select = useCallback(
    (next: Selection, altitude: number) => {
      setSelection(next);
      void loadNews(next.query);
      setFocus({ lat: next.lat, lng: next.lng, altitude });
      window.setTimeout(() => {
        panel.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 140);
    },
    [loadNews],
  );

  const pickCountry = useCallback(
    ({ properties: p }: CountryFeature) =>
      select(
        { query: p.name, label: p.name, continent: p.continent, lat: p.lat, lng: p.lng, iso: p.iso },
        1.5,
      ),
    [select],
  );

  const pickContinent = (name: string) => {
    const target = CONTINENTS.find((c) => c.name === name);
    if (!target) return;
    select(
      { query: target.name, label: target.name, continent: target.name, lat: target.lat, lng: target.lng },
      2,
    );
  };

  const pickPlace = (place: Place) =>
    select(placeSelection(place), place.kind === "city" ? 1.05 : 1.5);

  const reset = () => {
    setSelection(null);
    news.clear();
    setFocus(HOME_VIEW);
  };

  // Only a selected *continent* tints its whole landmass. Hovering highlights
  // the single country under the pointer, which is what people expect.
  const activeContinent =
    selection && !selection.iso ? selection.continent : null;

  return (
    <>
      <section id="globe" className="flex flex-col">
        <div className="relative h-[clamp(320px,54svh,620px)]">
          <div className="absolute inset-0">
            {globeReady ? (
              <GlobeCanvas
                geo={geo}
                activeContinent={activeContinent}
                hoveredIso={hovered?.properties.iso ?? null}
                selectedIso={selection?.iso ?? null}
                focus={focus}
                onHover={setHovered}
                onPick={pickCountry}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="globe-skeleton" />
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-5 pb-8 pt-1 lg:px-8 lg:pb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <h1 className="display max-w-[16ch] text-[clamp(2.1rem,4.2vw,3.3rem)]">
              Decoding the world, one story at a time.
            </h1>

            <div className="w-full max-w-sm">
              <PlaceSearch places={places} onPick={pickPlace} />

              <div className="mt-4 flex flex-wrap gap-2">
                {CONTINENTS.map((continent) => {
                  const active = selection?.continent === continent.name;
                  return (
                    <button
                      key={continent.name}
                      type="button"
                      aria-pressed={active}
                      onClick={() => pickContinent(continent.name)}
                      className={`rounded-full border px-3 py-1 text-[0.6875rem] uppercase tracking-[0.1em] transition-colors ${
                        active
                          ? "border-saffron-deep bg-saffron/50 text-saffron-ink"
                          : "border-line text-ink-soft hover:border-ink/30 hover:text-ink"
                      }`}
                    >
                      {continent.name}
                    </button>
                  );
                })}
              </div>

              <p
                className={`mt-3 min-h-[1rem] text-[0.6875rem] uppercase tracking-[0.14em] ${
                  geoError ? "text-hot" : "text-ink-soft"
                }`}
              >
                {geoError ??
                  (hovered
                    ? `${hovered.properties.name} · ${hovered.properties.continent}`
                    : "Or tap any country on the globe")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div ref={panel}>
        {selection && (
          <RegionPanel
            selection={selection}
            items={news.items}
            status={news.status}
            error={news.error}
            onRefresh={() => void news.load(selection.query)}
            onReset={reset}
          />
        )}
      </div>
    </>
  );
}
