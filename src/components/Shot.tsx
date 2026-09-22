import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'

/**
 * A captured product screen, framed on one region of itself and moving.
 *
 * A promotional film that shows a whole 1440px dashboard at 1080p shows
 * nothing: every label is four pixels tall and the viewer reads none of it. So
 * a shot names the rectangle of the source image it cares about, and the
 * component solves for the scale and offset that put that rectangle in the
 * frame. Moving between two rectangles gives the push, the pan, and the pull
 * back to context — without anybody hand-keying a transform.
 *
 * Rectangles are in the source image's own pixel space, which is what you read
 * off the capture, so they stay correct whatever the output resolution is.
 */

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface ShotProps {
  /** File under `public/`, e.g. `shots/pm-04-map.png`. */
  src: string
  /** Natural size of that file. */
  natural: { width: number; height: number }
  /** Region visible at the start, and at the end. */
  from: Rect
  to: Rect
  /** Frames over which the move happens. Defaults to the whole sequence. */
  move?: readonly [number, number]
}

export const Shot: React.FC<ShotProps> = ({ src, natural, from, to, move }) => {
  const frame = useCurrentFrame()
  const { width: fw, height: fh, durationInFrames } = useVideoConfig()
  const span = move ?? ([0, durationInFrames] as const)

  // Eased rather than linear: a constant-velocity push reads as a machine
  // panning, and the eye notices the start and stop more than the movement.
  const t = interpolate(frame, span, [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: x => 1 - Math.pow(1 - x, 3),
  })

  const lerp = (a: number, b: number) => a + (b - a) * t
  const rect: Rect = {
    x: lerp(from.x, to.x),
    y: lerp(from.y, to.y),
    width: lerp(from.width, to.width),
    height: lerp(from.height, to.height),
  }

  // Cover, so the named region is always fully visible and the frame is never
  // letterboxed by a region whose proportions differ from the output's.
  const scale = Math.max(fw / rect.width, fh / rect.height)
  const left = fw / 2 - (rect.x + rect.width / 2) * scale
  const top = fh / 2 - (rect.y + rect.height / 2) * scale

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Img
        src={staticFile(src)}
        style={{
          position: 'absolute',
          left,
          top,
          width: natural.width * scale,
          height: natural.height * scale,
          // The captures are already 2x; letting the browser smooth them on the
          // way down is what keeps small type legible rather than crunchy.
          imageRendering: 'auto',
        }}
      />
    </div>
  )
}
