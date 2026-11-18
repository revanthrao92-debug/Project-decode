<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# project-decode

Next.js 16 + React 19 news-decode site. Files above this line are managed by
`next dev`; everything below is ours.

## Commands

- Install: `npm ci`
- Dev: `npm run dev`
- Build: `npm run build` (also type-checks — no separate `tsc` script)
- Lint: `npm run lint`
- Rebuild geo data: `npm run geo`

There is no test runner configured. Verify changes with `npm run build` and
`npm run lint`, plus a manual check of the affected route.

## Layout

- `app/` — App Router routes (`page.tsx`, `decode/`, `section/`, `about/`, `api/`)
- `components/` — client components; `GlobeCanvas.tsx` / `GlobeStage.tsx` are
  react-globe.gl + three.js and must stay client-only (`"use client"`)
- `lib/` — data and fetching (`feeds.ts`, `news.ts`, `rss.ts`, `decodes.ts`,
  `types.ts`); server-only helpers must not be imported into client components
- `content/` — authored copy and data
- `scripts/build-geo.mjs` — generates geo/topojson data

## Conventions

- TypeScript strict; prefer named exports and explicit types over `any`
- Styling is plain CSS (`app/globals.css`) — no Tailwind, no CSS-in-JS
- Fetch data through `lib/`, not inline in components
- Next 16 APIs differ from older versions: check `node_modules/next/dist/docs/`
  before using a router/data API you are not certain about

## Cross-tool context

`.agent/state.md` holds shared git state, written by `~/.local/bin/agent-sync`
and injected automatically at session start in both OpenCode and Claude Code.
Read it before assuming the tree matches what you last saw — another agent may
have uncommitted work in progress. Do not edit it; do not commit `.agent/`.

