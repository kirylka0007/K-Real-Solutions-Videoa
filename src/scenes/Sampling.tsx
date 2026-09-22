import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { C } from '../theme'
import { buildLayout, POPULATION, SAMPLE_SIZE, WITH_FAILURE, NEVER_EXAMINED } from '../lib/figures'

/**
 * The opening argument, made entirely in geometry.
 *
 * Every transaction in the demonstration population is one mark. The film does
 * not describe sampling and then assert a conclusion — it draws the sample and
 * lets the viewer watch most of the population go dark. The number that lands
 * is the one nobody says out loud: the marks still lit at the end of the beat.
 *
 * Nothing here is placed by hand. The layout comes from `buildLayout`, which is
 * seeded and carries exactly the six failures a 25-item sample is expected to
 * find, so the picture is the arithmetic rather than an illustration of it.
 */

const LAYOUT = buildLayout()

/** Beat boundaries, in frames from the start of the scene (30fps). */
const B = {
  fadeIn: [0, 45],
  failures: [60, 120],
  sample: [165, 225],
  dim: [270, 330],
  /**
   * The strongest second in the film, and it only exists because the dim beat
   * revealed it: once the unsampled population goes dark, the failures inside
   * it go dark too. That is precisely the auditor's position — the exceptions
   * you did not draw are not merely unexamined, they are invisible, and you
   * cannot know how many there are. So they surface here, briefly, burning in
   * the dark: 98 failures less the 6 the sample drew.
   */
  missed: [345, 400],
  all: [430, 490],
} as const

export const Sampling: React.FC = () => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()

  // Columns follow the frame's own proportions, so the grid reads as a block
  // rather than a letterbox in 16:9 and a column in 4:5.
  const cols = Math.round(Math.sqrt(POPULATION * (width / height)))
  const rows = Math.ceil(POPULATION / cols)

  const appear = interpolate(frame, B.fadeIn, [0, 1], { extrapolateRight: 'clamp' })
  const failure = interpolate(frame, B.failures, [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const sample = interpolate(frame, B.sample, [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const dim = interpolate(frame, B.dim, [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  // Rises, holds, and is still lit when the population comes back — the missed
  // failures do not politely disappear before the resolution arrives.
  const missed = interpolate(frame, [B.missed[0], B.missed[1], B.all[0]], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const all = interpolate(frame, B.all, [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const gap = Math.round(width * 0.006)
  const cell = Math.floor((width * 0.76 - gap * (cols - 1)) / cols)

  return (
    <div
      style={{
        flex: 1,
        background: C.ink,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: height * 0.05,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
          gridAutoRows: `${cell}px`,
          gap,
        }}
      >
        {Array.from({ length: POPULATION }, (_, i) => {
          const failed = LAYOUT.failed[i]
          const sampled = LAYOUT.sampled[i]

          // Marks arrive in a soft diagonal sweep rather than all at once, so
          // the eye reads a population being assembled, not a texture appearing.
          const delay = ((i % cols) + Math.floor(i / cols)) / (cols + rows)
          const born = interpolate(appear, [delay * 0.6, delay * 0.6 + 0.4], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })

          // A mark the sample never drew goes dark, then comes back when the
          // whole population is tested. Sampled marks never dim: they are the
          // only ones anybody looked at.
          // A failure nobody sampled climbs back out of the dark on its own.
          const resurfaced = failed && !sampled ? missed * (1 - all) : 0
          const darkness = sampled ? 0 : dim * (1 - all) * (1 - resurfaced)
          const base = failed ? C.critical : C.accent
          const colour = failed && failure > 0 ? C.critical : C.accent

          return (
            <div
              key={i}
              style={{
                borderRadius: cell * 0.22,
                background: colour,
                // Failures only take their colour once that beat runs; before
                // it, the population is undifferentiated on purpose.
                opacity:
                  born *
                  (failed ? 0.35 + 0.65 * failure : 0.35 + 0.65 * Math.max(all, 0.55)) *
                  (1 - darkness * 0.93),
                outline: sampled && sample > 0 ? `${Math.max(2, cell * 0.14)}px solid ${C.text}` : 'none',
                outlineOffset: Math.max(1, cell * 0.12),
                transform: `scale(${0.7 + 0.3 * born + (sampled ? sample * 0.12 : 0)})`,
              }}
            />
          )
        })}
      </div>

      <Caption
        frame={frame}
        lines={[
          { at: [10, 70], text: `${POPULATION} transactions`, tone: C.text },
          { at: [75, 160], text: `${WITH_FAILURE} failed a control`, tone: C.critical },
          { at: [175, 265], text: `a ${SAMPLE_SIZE}-item sample finds ${LAYOUT.foundBySample}`, tone: C.text },
          { at: [280, 340], text: `${NEVER_EXAMINED} never examined`, tone: C.muted },
          { at: [350, 425], text: `${WITH_FAILURE - LAYOUT.foundBySample} you would not have found`, tone: C.critical },
          { at: [435, 540], text: 'test all of them', tone: C.accentText },
        ]}
        width={width}
      />
    </div>
  )
}

/**
 * One line at a time, in the frame's own rhythm.
 *
 * LinkedIn autoplays muted, so the on-screen line has to carry the argument on
 * its own — the voiceover is warmth, not information. Each line holds until the
 * next earns its place.
 */
const Caption: React.FC<{
  frame: number
  width: number
  lines: { at: readonly [number, number]; text: string; tone: string }[]
}> = ({ frame, lines, width }) => (
  <div style={{ height: width * 0.06, display: 'flex', alignItems: 'center' }}>
    {lines.map(line => {
      const [from, to] = line.at
      const o = interpolate(frame, [from, from + 12, to - 12, to], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
      if (o <= 0) return null
      return (
        <span
          key={line.text}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            textAlign: 'center',
            color: line.tone,
            fontSize: width * 0.042,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            opacity: o,
            transform: `translateY(${(1 - o) * width * 0.008}px)`,
          }}
        >
          {line.text}
        </span>
      )
    })}
  </div>
)
