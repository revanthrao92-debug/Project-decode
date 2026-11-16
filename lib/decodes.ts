import type { DecodeCard } from "./types";

/**
 * Placeholder copy. Each card becomes an MDX file in `content/decodes/<slug>.mdx`
 * in phase B — the shape here already matches that frontmatter.
 */
export const decodes: DecodeCard[] = [
  {
    slug: "chip-export-bans",
    title: "Why chip export bans move faster than trade talks",
    dek: "A single lithography machine can reroute a decade of foreign policy. Here's the mechanism, stripped of the noise.",
    section: "Tech & AI",
    format: "Explainer",
    minutes: 6,
  },
  {
    slug: "rupee-strong-currency-cost",
    title: "The rupee, the dollar, and the quiet cost of a strong currency",
    dek: "Everyone wants a strong currency until they run the arithmetic on exports, debt and remittances.",
    section: "Finance",
    format: "By the numbers",
    minutes: 8,
  },
  {
    slug: "choke-points",
    title: "How a strait becomes a choke point",
    dek: "Sixteen miles of water, a trillion dollars of trade and one very expensive insurance premium.",
    section: "Geopolitics",
    format: "Timeline",
    minutes: 5,
  },
  {
    slug: "strategic-autonomy",
    title: "What 'strategic autonomy' actually buys you",
    dek: "The phrase is everywhere. The trade-offs behind it rarely are.",
    section: "World",
    format: "Deep dive",
    minutes: 12,
  },
  {
    slug: "mrna-pipeline",
    title: "The mRNA pipeline, decoded",
    dek: "From a sequence on a screen to a vial in an arm, in nine steps and five acronyms you'll never fear again.",
    section: "Science",
    format: "Glossary",
    minutes: 7,
  },
  {
    slug: "the-fab-rush",
    title: "Why every country suddenly wants a fab",
    dek: "A semiconductor plant is a decade-long bet on water, power and patience. The incentives tell you who's serious.",
    section: "Tech & AI",
    format: "Explainer",
    minutes: 6,
  },
  {
    slug: "subsidy-race",
    title: "Who actually pays for a subsidy race",
    dek: "Two governments promise the same factory. Only one of them is doing the arithmetic honestly.",
    section: "Finance",
    format: "By the numbers",
    minutes: 9,
  },
  {
    slug: "non-alignment-maps",
    title: "The new non-alignment, explained in four maps",
    dek: "Nobody calls it that anymore, but the voting records say otherwise.",
    section: "Geopolitics",
    format: "Deep dive",
    minutes: 11,
  },
  {
    slug: "language-supply-chain",
    title: "How a language becomes a supply chain",
    dek: "Subtitles, dubbing and the invisible economics behind what you stream on a Friday night.",
    section: "Culture",
    format: "Explainer",
    minutes: 7,
  },
  {
    slug: "satellite-border",
    title: "What a satellite constellation does to a border",
    dek: "Coverage maps look neutral. The orbits behind them are anything but.",
    section: "World",
    format: "Timeline",
    minutes: 8,
  },
  {
    slug: "ageing-workforce",
    title: "The arithmetic of an ageing workforce",
    dek: "Three numbers explain almost every pension argument you'll hear this decade.",
    section: "Finance",
    format: "By the numbers",
    minutes: 6,
  },
  {
    slug: "antibiotic-clock",
    title: "Why antibiotics run out before we notice",
    dek: "The pipeline is empty and the incentives point the wrong way. Here's the mechanism, not the panic.",
    section: "Science",
    format: "Explainer",
    minutes: 9,
  },
  {
    slug: "shipping-insurance",
    title: "The insurance premium that predicts a conflict",
    dek: "Underwriters price risk before diplomats admit there is any. Watch the premium, not the statement.",
    section: "Geopolitics",
    format: "By the numbers",
    minutes: 7,
  },
  {
    slug: "monsoon-data",
    title: "What a monsoon forecast is really telling you",
    dek: "A percentage that decides planting, prices and power. Decoded line by line.",
    section: "Science",
    format: "Glossary",
    minutes: 6,
  },
  {
    slug: "bond-warning",
    title: "The bond market's quiet warning system",
    dek: "Yields move before ministers speak. Here's what the curve is saying and why it's usually right.",
    section: "Finance",
    format: "By the numbers",
    minutes: 7,
  },
  {
    slug: "insurance-price",
    title: "Why insurance is the most honest price in the world",
    dek: "Nobody argues with an underwriter. That's exactly why their numbers are worth reading.",
    section: "Finance",
    format: "Explainer",
    minutes: 6,
  },
  {
    slug: "ai-inference-cost",
    title: "What an AI model actually costs to run",
    dek: "Training gets the headlines. The bill that compounds every month is inference.",
    section: "Tech & AI",
    format: "By the numbers",
    minutes: 8,
  },
  {
    slug: "spectrum-auction",
    title: "The spectrum auction nobody watches",
    dek: "Air gets valued in billions, and the result quietly sets your phone bill for a decade.",
    section: "Tech & AI",
    format: "Explainer",
    minutes: 7,
  },
  {
    slug: "data-centre-water",
    title: "Why data centres follow water",
    dek: "The map of the internet is drawn by cooling costs, not by ambition.",
    section: "Tech & AI",
    format: "Timeline",
    minutes: 5,
  },
];

export const lead = decodes[0];
export const rail = decodes.slice(1, 4);
export const latest = decodes.slice(4, 10);

const used = new Set([lead, ...rail, ...latest].map((card) => card.slug));

/** Section rows must never repeat a story already shown higher up the page. */
export function bySection(section: string, count = 3): DecodeCard[] {
  return decodes
    .filter((card) => card.section === section && !used.has(card.slug))
    .slice(0, count);
}
