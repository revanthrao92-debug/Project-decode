export type NewsItem = {
  title: string;
  url: string;
  source: string;
  published: string | null;
};

const GOOGLE_NEWS = "https://news.google.com/rss/search";

/** There is no sport section on this site, so keep it out of every lookup. */
const SPORTS_FILTER =
  "-cricket -football -soccer -tennis -olympics -badminton";

const isWebUrl = (value: string) => /^https?:\/\//i.test(value);

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  nbsp: " ",
};

/** One pass, so `&amp;#38;` decodes to `&#38;` and not further. */
export function decodeEntities(input: string): string {
  return input.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body: string) => {
    if (body[0] !== "#") return NAMED_ENTITIES[body.toLowerCase()] ?? match;
    const hex = body[1].toLowerCase() === "x";
    const code = Number.parseInt(body.slice(hex ? 2 : 1), hex ? 16 : 10);
    return code <= 0x10ffff ? String.fromCodePoint(code) : match;
  });
}

export function pick(block: string, tag: string): string {
  const match = block.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"),
  );
  return match ? decodeEntities(match[1].replace(/<!\[CDATA\[|\]\]>/g, "")).trim() : "";
}

/**
 * Google News RSS. Keyless and queryable by place name, which is what the
 * globe needs. Swap this single function for a licensed provider later —
 * nothing outside this module knows where the stories come from.
 */
export async function fetchNews(query: string, limit = 9): Promise<NewsItem[]> {
  const params = new URLSearchParams({
    q: `${query} ${SPORTS_FILTER} when:2d`,
    hl: "en-IN",
    gl: "IN",
    ceid: "IN:en",
  });

  const res = await fetch(`${GOOGLE_NEWS}?${params.toString()}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
    next: { revalidate: 600 },
  });

  if (!res.ok) throw new Error(`News feed returned ${res.status}`);

  const xml = await res.text();
  // A consent or captcha page comes back as 200 with no feed in it.
  if (!xml.includes("<rss")) throw new Error("News feed returned no RSS");

  const blocks = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  const seen = new Set<string>();
  const items: NewsItem[] = [];

  for (const block of blocks) {
    const url = pick(block, "link");
    if (!isWebUrl(url)) continue;

    const source = pick(block, "source") || "News";
    let title = pick(block, "title");
    if (!title) continue;

    // Google News appends " - Publisher" to every headline.
    const suffix = ` - ${source}`;
    if (title.endsWith(suffix)) title = title.slice(0, -suffix.length);

    const key = title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
    if (!key || seen.has(key)) continue;
    seen.add(key);

    const rawDate = pick(block, "pubDate");
    const date = rawDate ? new Date(rawDate) : null;

    items.push({
      title,
      url,
      source,
      published:
        date && !Number.isNaN(date.getTime()) ? date.toISOString() : null,
    });

    if (items.length >= limit) break;
  }

  return items;
}
