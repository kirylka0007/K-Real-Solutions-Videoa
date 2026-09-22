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
- `src/lib/figures.ts` — the demonstration population and the sampling
  arithmetic the opening is built from. Seeded, so every render is identical.
- `src/scenes/` — one file per scene.

## On the figures

The numbers in the film are computed by the process mining hub over its own
demonstration extract: an invented firm, real arithmetic. They are never a
client's data, and the film says so on screen. The opening sample is
constructed to contain exactly the number of failures the arithmetic expects it
to find — not a flattering draw.
