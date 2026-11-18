export type Region = "india" | "world";

export type Feed = {
  id: string;
  name: string;
  url: string;
  /** One of the site sections in `lib/site.ts`. */
  section: string;
  region: Region;
  /**
   * Hosts (suffix match) whose images we may show. Empty means this source is
   * text-only: headline, source and link, never a photo.
   */
  imageHosts: string[];
  /** Show the feed's own summary text. Off for publishers that don't invite it. */
  summary: boolean;
  /** Why this source is safe to show. Delete the entry if that stops being true. */
  licence: string;
};

/**
 * Every story links out to its publisher and credits it. We show headline,
 * source, date and (where allowed) a truncated feed summary. Never full text.
 * Images appear only for sources that publish them for reuse.
 */
export const FEEDS: Feed[] = [
  // ---- world ----
  {
    id: "un-news",
    name: "UN News",
    url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml",
    section: "World",
    region: "world",
    imageHosts: [],
    summary: true,
    licence: "UN content, attributed. UN photos are not cleared, so text-only.",
  },
  {
    id: "global-voices",
    name: "Global Voices",
    url: "https://globalvoices.org/feed/",
    section: "World",
    region: "world",
    imageHosts: ["globalvoices.org"],
    summary: true,
    licence: "CC BY 3.0. Attribution required.",
  },
  {
    id: "hindu-world",
    name: "The Hindu",
    url: "https://www.thehindu.com/news/international/feeder/default.rss",
    section: "Geopolitics",
    region: "world",
    imageHosts: [],
    summary: false,
    licence: "Headline and link only, with credit. No text or image reuse.",
  },
  {
    id: "nasa",
    name: "NASA",
    url: "https://www.nasa.gov/feed/",
    section: "Science",
    region: "world",
    imageHosts: ["nasa.gov"],
    summary: true,
    licence: "US government work. NASA media is generally public domain.",
  },
  // ---- india ----
  {
    id: "hindu-india",
    name: "The Hindu",
    url: "https://www.thehindu.com/news/national/feeder/default.rss",
    section: "World",
    region: "india",
    imageHosts: [],
    summary: false,
    licence: "Headline and link only, with credit. No text or image reuse.",
  },
  // ---- finance ----
  {
    id: "hindu-business",
    name: "The Hindu",
    url: "https://www.thehindu.com/business/feeder/default.rss",
    section: "Finance",
    region: "india",
    imageHosts: [],
    summary: false,
    licence: "Headline and link only, with credit. No text or image reuse.",
  },
  {
    id: "rbi",
    name: "Reserve Bank of India",
    url: "https://www.rbi.org.in/pressreleases_rss.xml",
    section: "Finance",
    region: "india",
    imageHosts: [],
    summary: false,
    licence: "Government press releases, linked and credited.",
  },
  {
    id: "fed",
    name: "Federal Reserve",
    url: "https://www.federalreserve.gov/feeds/press_all.xml",
    section: "Finance",
    region: "world",
    imageHosts: [],
    summary: false,
    licence: "US government work, public domain.",
  },
  // ---- tech ----
  {
    id: "hindu-tech",
    name: "The Hindu",
    url: "https://www.thehindu.com/sci-tech/technology/feeder/default.rss",
    section: "Tech & AI",
    region: "india",
    imageHosts: [],
    summary: false,
    licence: "Headline and link only, with credit. No text or image reuse.",
  },
  {
    id: "nist",
    name: "NIST",
    url: "https://www.nist.gov/news-events/news/rss.xml",
    section: "Tech & AI",
    region: "world",
    imageHosts: [],
    summary: true,
    licence: "US government work, public domain.",
  },
  // ---- climate and environment ----
  {
    id: "hindu-env",
    name: "The Hindu",
    url: "https://www.thehindu.com/sci-tech/energy-and-environment/feeder/default.rss",
    section: "Climate & Environment",
    region: "india",
    imageHosts: [],
    summary: false,
    licence: "Headline and link only, with credit. No text or image reuse.",
  },
  {
    id: "nasa-earth",
    name: "NASA Earth Observatory",
    url: "https://earthobservatory.nasa.gov/feeds/earth-observatory.rss",
    section: "Climate & Environment",
    region: "world",
    imageHosts: ["nasa.gov"],
    summary: true,
    licence: "US government work. NASA media is generally public domain.",
  },
  // ---- health ----
  {
    id: "hindu-health",
    name: "The Hindu",
    url: "https://www.thehindu.com/sci-tech/health/feeder/default.rss",
    section: "Health",
    region: "india",
    imageHosts: [],
    summary: false,
    licence: "Headline and link only, with credit. No text or image reuse.",
  },
];
