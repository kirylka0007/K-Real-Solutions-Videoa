import manifest from '../../public/shots/regions.json'
import type { Rect } from '../components/Shot'

/**
 * Focal rectangles, read from the capture rather than measured by eye.
 *
 * Every rectangle in this film was originally guessed off a screenshot, and
 * every guess was wrong — one framed 219px below the process map and filled
 * two thirds of the screen with empty canvas, another blew a 40px toolbar icon
 * up to fill 1080p. The capture script now records each element's own bounds,
 * so the scenes ask the manifest instead, and a layout change moves the shot
 * with it.
 */
type Manifest = Record<string, Record<string, Rect>>

export function region(shot: string, key: string): Rect {
  const rect = (manifest as Manifest)[shot]?.[key]
  if (!rect) {
    throw new Error(
      `No region "${key}" for "${shot}". Re-run scripts/capture.mjs — a silently ` +
        `missing rectangle is how a shot ends up framing empty canvas.`,
    )
  }
  return rect
}

/** Widens a rectangle by `factor`, keeping its centre — the pull-back shot. */
export function widen(rect: Rect, factor: number): Rect {
  const width = rect.width * factor
  const height = rect.height * factor
  return {
    x: rect.x - (width - rect.width) / 2,
    y: rect.y - (height - rect.height) / 2,
    width,
    height,
  }
}

/** A rectangle around a fraction of another, anchored left — the push-in. */
export function leftPortion(rect: Rect, fraction: number): Rect {
  return { ...rect, width: rect.width * fraction, height: rect.height * fraction }
}
