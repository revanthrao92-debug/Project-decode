import { NextResponse, type NextRequest } from "next/server";
import { fetchNews, type NewsItem } from "@/lib/news";

type Entry = { at: number; items: NewsItem[] };

/** Small in-process cache so repeat taps on the same place don't refetch. */
const cache = new Map<string, Entry>();
const TTL = 10 * 60 * 1000;

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
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=600" } },
    );
  }

  try {
    const items = await fetchNews(q, 9);
    cache.set(key, { at: Date.now(), items });

    // keep the map from growing forever
    if (cache.size > 200) {
      for (const [k, v] of cache) {
        if (Date.now() - v.at > TTL) cache.delete(k);
      }
    }

    return NextResponse.json(
      { q, items, cached: false },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=600" } },
    );
  } catch (error) {
    console.error("news lookup failed", error);
    return NextResponse.json(
      { error: "Couldn't reach the news desk. Try another place." },
      { status: 502 },
    );
  }
}
