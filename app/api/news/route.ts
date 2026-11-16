import { NextResponse, type NextRequest } from "next/server";
import { fetchNews, type NewsItem } from "@/lib/news";

type Entry = { at: number; items: NewsItem[] };

/** Small in-process cache so repeat taps on the same place don't refetch. */
const cache = new Map<string, Entry>();
const TTL = 10 * 60 * 1000;

const MAX_ENTRIES = 200;

/** Insertion order is age order, so the first key is always the oldest. */
function remember(key: string, items: NewsItem[]) {
  cache.delete(key);
  cache.set(key, { at: Date.now(), items });
  while (cache.size > MAX_ENTRIES) {
    cache.delete(cache.keys().next().value as string);
  }
}

const CACHE_HEADERS = { "Cache-Control": "public, max-age=300, s-maxage=600" };

function sanitise(raw: string | null): string {
  if (!raw) return "";
  return raw
    .replace(/[^\p{L}\p{N}\s,'’.\-()&]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export async function GET(request: NextRequest) {
  const q = sanitise(request.nextUrl.searchParams.get("q"));

  if (q.length < 2) {
    return NextResponse.json(
      { error: "Pick a country, city or continent first." },
      { status: 400 },
    );
  }

  const key = q.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) {
    return NextResponse.json(
      { q, items: hit.items, cached: true },
      { headers: CACHE_HEADERS },
    );
  }

  try {
    const items = await fetchNews(q, 9);
    // Empty results are usually a blip upstream, so don't pin them for 10 minutes.
    if (items.length > 0) remember(key, items);

    return NextResponse.json(
      { q, items, cached: false },
      { headers: CACHE_HEADERS },
    );
  } catch (error) {
    console.error("news lookup failed", error);
    return NextResponse.json(
      { error: "Couldn't reach the news desk. Try another place." },
      { status: 502 },
    );
  }
}
