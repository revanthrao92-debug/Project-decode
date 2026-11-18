import { cacheLife } from "next/cache";
import { FEEDS } from "./feeds";
import { fallbackFor } from "./fallback-images";
import {
  findRelatedImage,
  placeFromTitle,
  topicFromTitle,
} from "./related-image";
import { fetchFeed, type Story } from "./rss";

export type Headlines = {
  /** ISO time this batch was fetched. */
  updated: string;
  stories: Story[];
};

/** Stories older than this are dropped. */
const MAX_AGE_DAYS = 10;

/**
 * How long the homepage may spend looking for live pictures. Next aborts a
 * `"use cache"` fill that runs too long while prerendering, so after this the
 * remaining cards get a bundled picture and the page still renders.
 */
const IMAGE_BUDGET_MS = 20_000;

/** Last good batch, so a bad refresh never blanks the page. */
let lastGood: Headlines | null = null;

const normalise = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);

const time = (story: Story) =>
  story.published ? Date.parse(story.published) : 0;

/**
 * Fetch every feed, merge, dedupe, newest first. Not cached itself: the two
 * cached entry points below each call it, so neither awaits the other's
 * in-flight cache entry (Next rejects that). One dead feed only drops its own
 * stories.
 */
async function loadHeadlines(): Promise<{ data: Headlines; fresh: boolean }> {
  const results = await Promise.allSettled(FEEDS.map((feed) => fetchFeed(feed)));
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  const seen = new Set<string>();
  const stories: Story[] = [];
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`feed ${FEEDS[index].id} failed`, result.reason);
      return;
    }
    for (const story of result.value) {
      // Old or undated items make the page look stale (some feeds are archives).
      if (!story.published || Date.parse(story.published) < cutoff) continue;
      const key = normalise(story.title);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      stories.push(story);
    }
  });
  stories.sort((a, b) => time(b) - time(a));

  if (stories.length === 0) {
    // Everything failed: show the last good batch and try again soon.
    return {
      data: lastGood ?? { updated: new Date().toISOString(), stories: [] },
      fresh: false,
    };
  }

  lastGood = { updated: new Date().toISOString(), stories };
  return { data: lastGood, fresh: true };
}

const lifetime = (fresh: boolean) =>
  fresh
    ? { stale: 300, revalidate: 8 * 60 * 60, expire: 24 * 60 * 60 }
    : { stale: 30, revalidate: 60, expire: 300 };

/** All stories, refreshed every 8 hours. Used by the section pages. */
export async function getHeadlines(): Promise<Headlines> {
  "use cache";
  const { data, fresh } = await loadHeadlines();
  cacheLife(lifetime(fresh));
  return data;
}

/** Take up to `count` stories, alternating India and world so both show up. */
function mix(all: Story[], count: number, perSource = 3): Story[] {
  // Cap each feed so one busy publisher can't crowd out the image sources.
  const taken = new Map<string, number>();
  const pool = all.filter((s) => {
    const key = s.id.split(":")[0];
    const n = taken.get(key) ?? 0;
    taken.set(key, n + 1);
    return n < perSource;
  });
  if (pool.length === 0) return [];
  const india = pool.filter((s) => s.region === "india");
  const world = pool.filter((s) => s.region === "world");
  const out: Story[] = [];
  const first = time(india[0] ?? pool[0]) >= time(world[0] ?? pool[0]) ? india : world;
  const second = first === india ? world : india;
  while (out.length < count && (first.length || second.length)) {
    const a = first.shift();
    if (a) out.push(a);
    if (out.length >= count) break;
    const b = second.shift();
    if (b) out.push(b);
    if (!a && !b) break;
  }
  return out;
}

export type Row = { section: string; stories: Story[] };

export type Layout = {
  lead: Story | null;
  rail: Story[];
  latest: Story[];
  /** Topic rows in page order: Explained, Finance, Tech & AI, Climate, Health. */
  rows: Row[];
  /** The country most in today's news, with its stories. */
  focus: { place: string; stories: Story[] } | null;
  updated: string;
};

const ROW_SECTIONS = ["Finance", "Tech & AI", "Climate & Environment", "Health"];
const GENERAL = ["World", "Geopolitics", "Science", "Culture"];

/**
 * "Explained" is a format, not a feed: stories tagged "Explained" or phrased
 * as an explainer ("Why ...", "How ...", "What to know about ...").
 */
export const isExplained = (story: Story) =>
  /\b(explained|explainer)\b|^(why|how|what)\b|\bwhat to know\b/i.test(
    story.title,
  );

/** Stories for a section page or row. "Explained" matches by title. */
export function storiesIn(section: string, stories: Story[]): Story[] {
  return section === "Explained"
    ? stories.filter(isExplained)
    : stories.filter((s) => s.section === section);
}

/** The country named in the most headlines (at least two), with its stories. */
function countryInFocus(stories: Story[], used: Set<string>): Layout["focus"] {
  const counts = new Map<string, Story[]>();
  for (const story of stories) {
    const place = placeFromTitle(story.title);
    if (!place) continue;
    counts.set(place, [...(counts.get(place) ?? []), story]);
  }
  const [best] = [...counts.entries()]
    .filter(([, list]) => list.filter((s) => !used.has(s.id)).length >= 2)
    .sort((a, b) => b[1].length - a[1].length);
  if (!best) return null;
  return {
    place: best[0],
    stories: best[1].filter((s) => !used.has(s.id)).slice(0, 4),
  };
}

/** Fill the homepage slots. A story is never used twice. */
export function layoutFrom({ stories, updated }: Headlines): Layout {
  const general = mix(
    stories.filter((s) => GENERAL.includes(s.section) && !isExplained(s)),
    10,
  );

  // A photo makes the best lead, but only if it is among the freshest.
  const leadIndex = Math.max(
    0,
    general.slice(0, 4).findIndex((s) => s.image),
  );
  const [lead = null] = general.splice(leadIndex, 1);
  const rail = general.slice(0, 3);
  const latest = general.slice(3, 9);

  const used = new Set(
    [lead, ...rail, ...latest]
      .filter((s): s is Story => s !== null)
      .map((s) => s.id),
  );

  const rows: Row[] = [];
  for (const section of ["Explained", ...ROW_SECTIONS]) {
    const picked = mix(
      storiesIn(section, stories).filter((s) => !used.has(s.id)),
      3,
      2,
    );
    for (const story of picked) used.add(story.id);
    rows.push({ section, stories: picked });
  }

  const focus = countryInFocus(stories, used);
  return { lead, rail, latest, rows, focus, updated };
}

/**
 * The homepage layout, with a picture for every card that shows art. Order of
 * preference: the publisher's own photo, a topic-matched open-licence photo
 * (specific words, then a named country, then a concrete topic), and finally a
 * bundled public-domain image for the section, so no card is ever empty. No
 * picture is used twice on the page. Same 8-hour cache as the headlines.
 */
export async function getLayout(): Promise<Layout> {
  "use cache";

  const { data, fresh } = await loadHeadlines();
  cacheLife(lifetime(fresh));
  const layout = layoutFrom(data);
  const shown = [layout.lead, ...layout.latest].filter(
    (s): s is Story => s !== null,
  );

  const used = new Set<string>();
  for (const story of shown) if (story.image) used.add(story.image.url);

  // One at a time, so the "already used" set is always up to date and we stay
  // well inside Openverse's per-minute limit.
  const deadline = Date.now() + IMAGE_BUDGET_MS;
  const images = new Map<string, NonNullable<Story["image"]>>();
  for (const story of shown) {
    if (story.image) continue;
    const image =
      (await findRelatedImage(story.title, used, deadline)) ??
      fallbackFor(story.section, story.region, used);
    used.add(image.url);
    images.set(story.id, image);
  }

  // Image plus the two small info fields (country, topic) for every card.
  const decorate = (story: Story): Story => ({
    ...story,
    image: story.image ?? images.get(story.id) ?? null,
    place: placeFromTitle(story.title) ?? undefined,
    topic: topicFromTitle(story.title) ?? undefined,
  });

  return {
    ...layout,
    lead: layout.lead ? decorate(layout.lead) : null,
    rail: layout.rail.map(decorate),
    latest: layout.latest.map(decorate),
    rows: layout.rows.map((row) => ({
      ...row,
      stories: row.stories.map(decorate),
    })),
    focus: layout.focus
      ? { ...layout.focus, stories: layout.focus.stories.map(decorate) }
      : null,
  };
}
