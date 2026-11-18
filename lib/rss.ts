import type { Feed, Region } from "./feeds";
import { decodeEntities, pick } from "./news";

export type StoryImage = {
  url: string;
  credit: string;
  /** Set for pictures found by topic rather than supplied by the publisher. */
  illustrative?: boolean;
  alt?: string;
  licence?: string;
  licenceUrl?: string;
  pageUrl?: string;
};

export type Story = {
  id: string;
  title: string;
  url: string;
  source: string;
  section: string;
  region: Region;
  published: string | null;
  summary: string;
  image: StoryImage | null;
  /** Country or capital the headline is about, as named in places.json. */
  place?: string;
  /** Short topic label (Climate, Trade ...) when the headline has a clear one. */
  topic?: string;
};

const USER_AGENT =
  "Mozilla/5.0 (compatible; ProjectDecodeBot/1.0; +https://projectdecode.example)";

const isWebUrl = (value: string) => /^https?:\/\//i.test(value);

function stripHtml(input: string): string {
  return decodeEntities(input.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

/** Cut at a word boundary so a summary never ends mid-word. */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max).replace(/\s+\S*$/, "");
  return `${cut}…`;
}

function hostAllowed(url: string, hosts: string[]): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "https:") return false;
    return hosts.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

function findImage(block: string, feed: Feed): StoryImage | null {
  if (feed.imageHosts.length === 0) return null;

  const candidates: string[] = [];
  const attr = /<(?:media:content|media:thumbnail|enclosure)\b[^>]*?\burl=["']([^"']+)["'][^>]*>/gi;
  for (const m of block.matchAll(attr)) {
    const type = m[0].match(/\btype=["']?([^"'\s>]+)/i)?.[1];
    if (type && !type.startsWith("image")) continue;
    candidates.push(decodeEntities(m[1]));
  }

  const html = decodeEntities(block);
  for (const m of html.matchAll(/<img\b[^>]*?\bsrc=["']([^"']+)["']/gi)) {
    candidates.push(decodeEntities(m[1]));
  }

  const url = candidates.find(
    (c) =>
      hostAllowed(c, feed.imageHosts) &&
      /\.(jpe?g|png|webp)(\?|$)/i.test(c) &&
      !/avatar|logo|icon|gravatar|sprite/i.test(c),
  );
  return url ? { url, credit: feed.name } : null;
}

export async function fetchFeed(feed: Feed, perFeed = 12): Promise<Story[]> {
  const res = await fetch(feed.url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/rss+xml, application/xml, text/xml",
    },
    redirect: "follow",
    // Our own "use cache" decides freshness; skip fetch memoisation so two
    // concurrent renders never share one in-flight promise.
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`${feed.id} returned ${res.status}`);

  const xml = await res.text();
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  const stories: Story[] = [];

  for (const block of blocks) {
    const url = pick(block, "link");
    const title = stripHtml(pick(block, "title"));
    if (!isWebUrl(url) || !title) continue;

    const rawDate = pick(block, "pubDate") || pick(block, "dc:date");
    const date = rawDate ? new Date(rawDate) : null;

    stories.push({
      id: `${feed.id}:${url}`,
      title,
      url,
      source: feed.name,
      section: feed.section,
      region: feed.region,
      published:
        date && !Number.isNaN(date.getTime()) ? date.toISOString() : null,
      summary: feed.summary
        ? truncate(stripHtml(pick(block, "description")), 200)
        : "",
      image: findImage(block, feed),
    });

    if (stories.length >= perFeed) break;
  }

  return stories;
}
