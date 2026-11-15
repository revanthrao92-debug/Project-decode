import type { DecodeCard } from "./types";

/**
 * Placeholder cards. Each becomes an MDX file in `content/decodes/<slug>.mdx`
 * in phase B — the shape here already matches what that frontmatter will hold.
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
    section: "Science & Health",
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
];
