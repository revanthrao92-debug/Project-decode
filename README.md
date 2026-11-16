# Project Decode

A brand home for Project Decode: an interactive 3D globe where every country is
clickable, and picking a place shows what its outlets have been reporting in the
last 48 hours.

Built with Next.js 16 (App Router), React 19, Tailwind v4, and `react-globe.gl`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build && npm start
```

No API keys, no database, no CMS. Clone it on any machine and it runs.

## How it works

| Piece | Where | Notes |
| --- | --- | --- |
| Globe | `components/GlobeCanvas.tsx` | three.js, lazy-loaded so it never blocks first paint |
| Globe stage, search, region panel | `components/GlobeStage.tsx` | owns all interaction state |
| Logo, as vector | `components/LogoMark.tsx` | traced from the brand video with potrace; ink or white via `currentColor` |
| Logo intro | `components/Intro.tsx` | CSS-animated dot, once per session, skippable, respects reduced-motion |
| Masthead, dateline, section nav | `components/Masthead.tsx` | the newsroom header |
| Homepage grid | `components/NewsGrid.tsx` | lead + rail, latest grid, section rows |
| Card art | `components/CardArt.tsx` | deterministic bar-motif image boxes, seeded per slug/URL |
| News lookup | `lib/news.ts` + `app/api/news/route.ts` | Google News RSS, 10-minute cache, deduped |
| Country borders | `public/geo/countries.json` | generated, 110m resolution, ~410 KB (~130 KB gzipped) |
| Searchable places | `public/geo/places.json` | every country plus its capital |
| Design tokens | `app/globals.css` | `@theme` block — paper, ink, brand, hot |

### Regenerating the logo

`LogoMark.tsx` was produced from the brand video, not typed by hand:

```bash
# 1. crop the final frame to the wordmark, drop the green and red, upscale 4x
# 2. threshold to a bitmap and trace it
potrace mark.pbm -s -o mark.svg -O 0.35 --flat -u 1
# 3. paste the path into LogoMark, scale 0.25 into a 442x188 viewBox
```

If the logo art ever changes, repeat that and swap the `d` attribute. The dot
position lives at `cx="419" cy="163"` and is animated separately.

### Regenerating the map data

```bash
npm run geo
```

This rebuilds `public/geo/*.json` from `world-atlas` and `world-countries`. Run it
after bumping either dependency. Nothing else needs it.

### Design rules worth keeping

- **`#00D800` never carries text.** It is a fill colour only — on `#FAF9F6` it
  is about 1.5:1. Links and chips use `brand-deep` (`#0B6B2F`, 5.4:1).
- **The logo is vector geometry, not a font.** `LogoMark` is a traced path from
  the brand video, so it renders identically at any size. It inherits
  `currentColor` — ink on cream, white on the green banner.
- **Anton for display, Inter for everything else.** No third family.
- **The intro is a session-scoped title card.** The red dot's entrance is a CSS
  keyframe animation in `app/globals.css` (`.logo-dot`), timed to the original
  video: fall, four decaying hops, one long arc, squash on landing. It runs on
  the compositor, so it is smooth at 60/120Hz rather than the 30fps source.
  Skippable, and skipped entirely under `prefers-reduced-motion`.
- **No story appears twice on the homepage.** `bySection()` in
  `lib/decodes.ts` excludes anything already used by the lead, rail or latest
  grid.

## Images

Every image box is drawn by `CardArt` from a hash of its seed, so it needs no
network, no storage and never 404s. That is deliberate:

- Google News RSS carries **no article images**, and its article pages embed a
  generic Google logo in `og:image` — verified, all six stories returned the
  same picture.
- Scraping the real `og:image` means downloading ~600 KB per story, then
  fetching the publisher page too. Too slow and too fragile for a tap-to-see
  globe.

**To use real photos later:** get a provider whose API returns an image URL
(NewsData.io, GNews and Bing News Search all do), add it to the item type in
`lib/news.ts`, and render it in place of `<CardArt>` in the panel. The layout
already reserves a 104×66 box per story and 16:9 boxes for cards, so nothing
reflows.

## Content

`lib/decodes.ts` drives every block on the homepage: the lead, the rail, the
latest grid and the section rows. The cards are placeholders — the slugs match
the intended MDX files in `content/decodes/`.

Phase B (real article pages) means: add `@next/mdx` or `gray-matter` + a
`[slug]` route, read frontmatter into `DecodeCard`, and swap the placeholder
array for a directory scan. Nothing in the homepage layout has to change.

## Known trade-offs

- **Google News RSS is an unofficial endpoint.** It is free and keyless, which is
  why it's here, but its terms are written for personal feed readers. For a
  commercial launch, put a licensed provider behind `lib/news.ts` — that module
  is the only place that knows where stories come from.
- **No sport anywhere.** The site has no sport section, so globe queries exclude
  cricket, football, tennis, Olympics and badminton.
- **The globe is a canvas**, so it is not screen-reader navigable. The continent
  chips and the search field are the accessible path to the same content.
- `metadataBase` in `app/layout.tsx` is a placeholder — set the real domain.

## Deploy

Push to GitHub, import to Vercel, no environment variables needed.

## To replace before launch

1. Instagram URL in `lib/site.ts` (currently a placeholder).
2. Real decode titles in `lib/decodes.ts`.
3. `metadataBase` and the OG image.
4. Nothing else — the logo is now code, so there is no video to re-encode.
