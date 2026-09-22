import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { C } from '../theme'

/**
 * One line at a time, low in the frame.
 *
 * LinkedIn autoplays muted, so the on-screen line carries the argument and the
 * voiceover only carries the warmth. Lines are given explicit in and out
 * frames rather than a duration each, because the timing that matters is when
 * a line lands against the picture, not how long it happens to be.
 */
export interface Line {
  at: readonly [number, number]
  text: string
  tone?: string
}

export const Caption: React.FC<{ lines: Line[] }> = ({ lines }) => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: height * 0.07,
        // The lines stack on top of each other so they can crossfade, which
        // means they are absolutely positioned — and an absolute child with
        // neither top nor bottom set is laid out from its container's top
        // edge, so the text grew downward out of the frame. Anchoring the
        // container's height and pinning each line to its bottom keeps every
        // line inside the picture whatever its size.
        height: width * 0.075,
        display: 'flex',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {lines.map(line => {
        const [from, to] = line.at
        const o = interpolate(frame, [from, from + 10, to - 10, to], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        if (o <= 0) return null
        return (
          <span
            key={line.text}
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: `translateX(-50%) translateY(${(1 - o) * width * 0.006}px)`,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              color: line.tone ?? C.text,
              fontSize: width * 0.034,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              opacity: o,
              // The captures behind this are busy; a plate keeps the line
              // readable without dimming the product itself.
              background: 'rgba(10, 42, 38, 0.82)',
              padding: `${height * 0.014}px ${width * 0.022}px`,
              borderRadius: width * 0.008,
              backdropFilter: 'blur(6px)',
            }}
          >
            {line.text}
          </span>
        )
      })}
    </div>
  )
}
