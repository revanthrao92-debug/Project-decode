// Generates public/geo/countries.json (GeoJSON, 110m) and public/geo/places.json
// so the globe never needs to fetch a third-party CDN at runtime.
import fs from "node:fs";
import path from "node:path";
import { feature } from "topojson-client";
import worldCountries from "world-countries";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "public", "geo");
fs.mkdirSync(outDir, { recursive: true });

const topo = JSON.parse(
  fs.readFileSync(path.join(root, "node_modules/world-atlas/countries-110m.json"), "utf8"),
);

const geo = feature(topo, topo.objects.countries);

function continentOf(region, subregion) {
  if (region === "Africa") return "Africa";
  if (region === "Europe") return "Europe";
  if (region === "Asia") return "Asia";
  if (region === "Oceania") return "Oceania";
  if (region === "Americas") {
    if (["South America"].includes(subregion)) return "South America";
    return "North America";
  }
  return null;
}

const byNumeric = new Map();
for (const c of worldCountries) {
  if (c.ccn3) byNumeric.set(String(c.ccn3).padStart(3, "0"), c);
}

const features = geo.features
  .map((f) => {
    const c = byNumeric.get(String(f.id).padStart(3, "0"));
    if (!c) return null;
    const continent = continentOf(c.region, c.subregion);
    if (!continent) return null;
    return {
      type: "Feature",
      id: c.cca3,
      properties: {
        name: c.name.common,
        official: c.name.official,
        iso: c.cca3,
        continent,
        lat: c.latlng[0],
        lng: c.latlng[1],
      },
      geometry: f.geometry,
    };
  })
  .filter(Boolean);

fs.writeFileSync(
  path.join(outDir, "countries.json"),
  JSON.stringify({ type: "FeatureCollection", features }),
);

const places = [];
for (const c of worldCountries) {
  const continent = continentOf(c.region, c.subregion);
  if (!continent) continue;
  places.push({
    name: c.name.common,
    iso: c.cca3,
    kind: "country",
    lat: c.latlng[0],
    lng: c.latlng[1],
    continent,
  });
  if (c.capital?.length) {
    places.push({
      name: c.capital[0],
      iso: c.cca3,
      kind: "city",
      lat: c.latlng[0],
      lng: c.latlng[1],
      continent,
      country: c.name.common,
    });
  }
}

fs.writeFileSync(path.join(outDir, "places.json"), JSON.stringify(places));

const size = (p) => (fs.statSync(p).size / 1024).toFixed(0) + " KB";
console.log(
  `countries: ${features.length}/${geo.features.length} (${size(path.join(outDir, "countries.json"))})  places: ${places.length} (${size(path.join(outDir, "places.json"))})`,
);
