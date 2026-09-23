# K Real Solutions — video

Promotional films for the Innovation Lab, built with [Remotion](https://remotion.dev):
React components rendered to video, frame by frame, through headless Chromium.

## Why Remotion rather than an editor

The products being advertised are React and Tailwind applications, so the film
can mount the real components instead of animating screenshots of them — the
charts in the video are the charts, rendering real data, and text stays vector
sharp at any output size.

More practically: the products change. A hand-edited cut is stale the day
something ships; this one is re-rendered with a command. And one set of
components renders to every aspect ratio the platforms want, rather than each
cut being maintained by hand.

Remotion is free for individuals and organisations under four people. Above
that it needs a company licence.

## Running it

```bash
npm install
npm run studio          # interactive preview and scrubbing
npm run render          # render a composition to out/
```

Rendering needs a Chromium that still supports old-headless mode. Remotion will
fetch its own if none is configured; where a machine already carries
Playwright's `headless_shell`, `remotion.config.ts` points at that instead
rather than downloading a second browser. Override with
`REMOTION_BROWSER_EXECUTABLE`.

## What is in here

- `src/theme.ts` — the palette, taken from the products' own `globals.css`, and
  the film's timeline in frames. Changing a scene's length here moves
  everything downstream of it.
- `src/fonts.tsx` — Archivo and IBM Plex, loaded from `public/fonts`, because the
  render browser here has no internet and a web-font request would silently
  fall back.
- `src/data/p2p.json` — the process mining engine's output for its
  Procure-to-Pay demo population: map, KPIs, findings.
- `src/scenes/` — one file per scene: `Open` (brand), `Mining` (process map and
  AI findings), `Papers` (risk register transformed into the orbital chart),
  `Monitoring` (entities → Finance → one control → one exception, with the AI
  draft), `Close` (request access).
- `reference/` — captures of the live products that the native scenes were
  measured from. Not used in the render.

## On the figures

Every figure is the products' own output over their demonstration populations:
invented organisations, real arithmetic. Process mining figures come from its
P2P demo extract; board papers from the portal's Appendix B rows; continuous
monitoring from `computeHub` over its demo data, 30-day window to 22 Sep 2026.
They are never a client's data, and a corner label says so on screen for as
long as a product is shown.

The AI rationale typed in the monitoring scene is written to the scope of the
product's "Draft with AI" (the exception's own facts only), not captured from a
live model call.
