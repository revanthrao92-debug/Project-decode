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
| Hero, search, region panel | `components/Hero.tsx` | owns all interaction state |
| News lookup | `lib/news.ts` + `app/api/news/route.ts` | Google News RSS, 10-minute cache, deduped |
| Country borders | `public/geo/countries.json` | generated, 110m resolution, ~410 KB (~130 KB gzipped) |
| Searchable places | `public/geo/places.json` | every country plus its capital |
| Design tokens | `app/globals.css` | `@theme` block — paper, ink, brand, hot |

### Regenerating the map data

```bash
npm run geo
```

This rebuilds `public/geo/*.json` from `world-atlas` and `world-countries`. Run it
after bumping either dependency. Nothing else needs it.

### Design rules worth keeping

- **`#00D800` never carries text.** It is a fill colour only — on `#FAF9F6` it
  is about 1.5:1. Links and chips use `brand-deep` (`#0B6B2F`, 5.4:1).
- **The logo is white**, so it lives on a green tile, not on the cream page. The
  tile colour matches the source video exactly, so no keying artefacts.
- **Anton for display, Inter for everything else.** No third family.

## Content

`lib/decodes.ts` drives the homepage cards. The cards are placeholders — the
slugs match the intended MDX files in `content/decodes/`.

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
4. The real logo video, if the current one changes — the pipeline is documented
   in git history: crop the watermark, keep the green, re-encode at CRF 14.
