import { readFileSync } from "node:fs";
import path from "node:path";
import type { StoryImage } from "./rss";

/**
 * Finds an openly licensed, topic-related picture for a headline via Openverse
 * (keyless; 20 requests/min and 200/day anonymous, so we search sparingly and
 * remember answers). Only licences that allow commercial reuse are accepted,
 * and the caller must show the credit that comes back with the image.
 *
 * Tiers, first hit wins:
 *   2. two or three headline keywords, at least two must match the picture
 *   3. a country or capital named in the headline
 *   4. a plain, concrete topic word (climate, traffic, robots ...)
 * The caller adds tier 5 (bundled fallback) when this returns null.
 */

const API = "https://api.openverse.org/v1/images/";
const LICENCES = "cc0,pdm,by,by-sa";
const LICENCE_LABEL: Record<string, string> = {
  cc0: "CC0",
  pdm: "Public domain",
  by: "CC BY",
  "by-sa": "CC BY-SA",
};

const STOP = new Set(
  (
    "a an the of in on at to for from by with and or but as is are was were be been being " +
    "after before over under into out up down off about amid against among between during " +
    "says say said new news latest first second third more most less how why what who when where " +
    "will would could should may might must can has have had having not no yes it its this that these those " +
    "seeks seek set sets plans plan puts put gets get take takes taken make makes made ahead " +
    "alleged allegedly year years day days week weeks month months"
  ).split(" "),
);

/** Stories where a random stock photo would be wrong or insensitive. */
const SENSITIVE =
  /\b(arrest|arrested|rape|raped|minor|murder|killed|kills|dead|death|dies|died|abuse|assault|suicide|court|sentenced|jail|bulldozed|attack|attacked|shot|shooting|victim|accused|coup)\b/i;

/** Results we never want, whatever the query. */
const UNWANTED =
  /\b(selfie|portrait|nude|naked|sex|sexual|sexy|teen|porn|erotic|fetish|lingerie|bikini|bride|wedding|cosplay|gore|corpse|blood|dead|body|bodies|victim|violence|weapon|gun)\b/i;

/**
 * Plain, concrete topics that are safe to search on their own. Anything else
 * needs at least two headline keywords to match, because a lone abstract word
 * ("positions", "decisive") can pull in unrelated or unsuitable pictures.
 */
const SAFE_TOPICS = new Set(
  (
    "climate weather cyclone hurricane typhoon flood floods drought monsoon wildfire earthquake " +
    "students university campus school classroom hospital doctors farmers farming agriculture " +
    "airport aircraft airline aviation railway train metro highway traffic ports shipping tanker " +
    "economy inflation currency banking bank market markets stocks trade tariffs exports imports " +
    "oil petroleum energy electricity power solar nuclear satellite rocket spacecraft telescope " +
    "robots robotics computer software cybersecurity internet smartphone telecom semiconductor chips " +
    "refugees border parliament election elections ballot museum temple festival " +
    "railways factory manufacturing mining steel cement housing vaccine " +
    "pollution forest wildlife river ocean coast island tourism"
  ).split(" "),
);

/** Demonyms and abbreviations that stand for a country in headlines. */
const ALIASES: Record<string, string> = {
  indian: "India",
  chinese: "China",
  russian: "Russia",
  american: "United States",
  "u.s.": "United States",
  us: "United States",
  british: "United Kingdom",
  uk: "United Kingdom",
  iranian: "Iran",
  israeli: "Israel",
  pakistani: "Pakistan",
  saudi: "Saudi Arabia",
  egyptian: "Egypt",
  turkish: "Türkiye",
  turkiye: "Türkiye",
  turkey: "Türkiye",
  french: "France",
  german: "Germany",
  japanese: "Japan",
  ukrainian: "Ukraine",
  uae: "United Arab Emirates",
  nepali: "Nepal",
  bangladeshi: "Bangladesh",
};

type Hit = {
  title?: string;
  url: string;
  creator?: string;
  license: string;
  license_url?: string;
  foreign_landing_url?: string;
  width?: number;
  height?: number;
  tags?: { name?: string }[];
  source?: string;
};

const memo = new Map<string, Hit[]>();
let exhausted = false;

// Cache the parsed list, not a promise: a "use cache" scope may not await a
// promise that was created outside it.
let placeNames: string[] | null = null;
function loadPlaces(): string[] {
  if (placeNames) return placeNames;
  try {
    const raw = readFileSync(
      path.join(process.cwd(), "public", "geo", "places.json"),
      "utf8",
    );
    placeNames = (JSON.parse(raw) as { name: string; kind: string }[])
      // Countries first, so "India" wins over a city that shares a word.
      .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "country" ? -1 : 1))
      .map((p) => p.name)
      .filter((n) => n.length > 3);
  } catch {
    placeNames = [];
  }
  return placeNames;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The first country or capital named in a headline, if any. The result is
 * always a name that exists in places.json, so the globe can find it.
 */
export function placeFromTitle(title: string): string | null {
  const names = loadPlaces();
  const lower = ` ${title.toLowerCase().replace(/[^\p{L}0-9.\s]/gu, " ")} `;
  for (const [alias, place] of Object.entries(ALIASES)) {
    if (lower.includes(` ${alias} `) && names.includes(place)) return place;
  }
  for (const name of names) {
    if (new RegExp(`\\b${escapeRegExp(name)}\\b`, "u").test(title)) return name;
  }
  return null;
}

const TOPIC_LABEL: Record<string, string> = {
  cyclone: "Weather", hurricane: "Weather", typhoon: "Weather", monsoon: "Weather",
  weather: "Weather", flood: "Weather", floods: "Weather", drought: "Weather",
  climate: "Climate", pollution: "Climate", wildfire: "Climate",
  students: "Education", university: "Education", campus: "Education", school: "Education",
  hospital: "Health", doctors: "Health", vaccine: "Health",
  farmers: "Agriculture", farming: "Agriculture", agriculture: "Agriculture",
  airport: "Transport", aircraft: "Transport", airline: "Transport", aviation: "Transport",
  railway: "Transport", railways: "Transport", train: "Transport", metro: "Transport",
  traffic: "Transport", highway: "Transport", ports: "Trade", shipping: "Trade",
  economy: "Economy", inflation: "Economy", currency: "Economy", market: "Markets",
  markets: "Markets", stocks: "Markets", bank: "Banking", banking: "Banking",
  trade: "Trade", tariffs: "Trade", exports: "Trade", imports: "Trade",
  oil: "Energy", petroleum: "Energy", energy: "Energy", electricity: "Energy",
  power: "Energy", solar: "Energy", nuclear: "Energy",
  satellite: "Space", rocket: "Space", spacecraft: "Space", telescope: "Space",
  robots: "AI", robotics: "AI", software: "Tech", cybersecurity: "Cyber",
  internet: "Tech", smartphone: "Tech", telecom: "Tech", semiconductor: "Tech", chips: "Tech",
  refugees: "Migration", border: "Migration",
  parliament: "Politics", election: "Politics", elections: "Politics", ballot: "Politics",
};

/** A short topic label for a headline, or null if none is clear. */
export function topicFromTitle(title: string): string | null {
  for (const raw of title.split(/\s+/)) {
    const word = raw.replace(/[^\p{L}]/gu, "").toLowerCase();
    if (TOPIC_LABEL[word]) return TOPIC_LABEL[word];
  }
  return null;
}

export function keywords(title: string): string[] {
  const words = title
    .replace(/[’']s\b/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

  // Capitalised words (places, bodies, products) carry the most meaning.
  const proper = words.filter(
    (w, i) =>
      i > 0 && w.length > 2 && /^[A-Z]/.test(w) && !STOP.has(w.toLowerCase()),
  );
  const common = words.filter(
    (w) => !STOP.has(w.toLowerCase()) && w.length > 3 && !proper.includes(w),
  );
  const first =
    words[0] && words[0].length > 2 && !STOP.has(words[0].toLowerCase())
      ? [words[0]]
      : [];
  return [...new Set([...first, ...proper, ...common].map((w) => w.toLowerCase()))];
}

async function search(query: string): Promise<Hit[]> {
  const cached = memo.get(query);
  if (cached) return cached;


  const params = new URLSearchParams({
    q: query,
    license: LICENCES,
    mature: "false",
    source: "wikimedia,nasa,flickr",
    page_size: "20",
  });
  const res = await fetch(`${API}?${params}`, {
    headers: { "User-Agent": "ProjectDecode/1.0 (news site; image lookup)" },
    cache: "no-store",
    signal: AbortSignal.timeout(6_000),
  });
  if (res.status === 429) {
    exhausted = true;
    return [];
  }
  if (!res.ok) return [];
  const body = (await res.json()) as { results?: Hit[] };
  const hits = body.results ?? [];
  memo.set(query, hits);
  return hits;
}

const textOf = (h: Hit) =>
  `${h.title ?? ""} ${(h.tags ?? []).map((t) => t.name).join(" ")}`;

function pickBest(
  hits: Hit[],
  words: string[],
  need: number,
  exclude: Set<string>,
): Hit | null {
  const scored = hits
    .filter(
      (h) =>
        h.url?.startsWith("https://") &&
        !exclude.has(h.url) &&
        LICENCE_LABEL[h.license] &&
        (h.width ?? 0) >= 600 &&
        !UNWANTED.test(textOf(h)),
    )
    .map((h) => {
      const text = textOf(h).toLowerCase();
      const matches = words.filter((w) =>
        new RegExp(`\\b${escapeRegExp(w.replace(/[^a-z0-9]/g, ""))}`).test(text),
      ).length;
      const wide = h.width && h.height && h.width >= h.height * 1.2 ? 1 : 0;
      return { h, matches, score: matches * 3 + wide };
    })
    // The query's own keywords must appear in the picture's title or tags,
    // or it is just a guess.
    .filter((s) => s.matches >= need)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.h ?? null;
}

const toImage = (hit: Hit): StoryImage => ({
  url: hit.url,
  alt: hit.title?.slice(0, 120),
  credit: hit.creator || hit.source || "Unknown author",
  licence: LICENCE_LABEL[hit.license],
  licenceUrl: hit.license_url,
  pageUrl: hit.foreign_landing_url,
  illustrative: true,
});

/**
 * `exclude` holds image URLs already used on the page, so no picture repeats.
 * `deadline` is a timestamp after which no further searches are started, so a
 * caller with its own time budget (the prerendered homepage) can give up and
 * use bundled pictures instead of waiting on the network.
 * Returns null when nothing relevant and safe was found.
 */
export async function findRelatedImage(
  title: string,
  exclude: Set<string> = new Set(),
  deadline = Number.POSITIVE_INFINITY,
): Promise<StoryImage | null> {
  if (exhausted || SENSITIVE.test(title)) return null;

  const words = keywords(title);
  const place = placeFromTitle(title);
  const concepts = title
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}]/gu, "").toLowerCase())
    .filter((w) => SAFE_TOPICS.has(w));

  const attempts = [
    ...new Set([
      words.slice(0, 3).join(" "),
      words.slice(0, 2).join(" "),
      ...(place ? [place.toLowerCase()] : []),
      ...concepts.slice(0, 2),
    ]),
  ].filter(Boolean);

  for (const query of attempts) {
    if (exhausted || Date.now() > deadline) return null;
    try {
      const parts = query.split(" ");
      const hit = pickBest(
        await search(query),
        parts,
        Math.min(2, parts.length),
        exclude,
      );
      if (hit) return toImage(hit);
    } catch {
      // timeout or network blip: try the next tier
    }
  }
  return null;
}
