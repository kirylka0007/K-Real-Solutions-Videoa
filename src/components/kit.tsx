import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion'
import { C, FONT } from '../theme'

export const easeOut = Easing.bezier(0.22, 0.61, 0.36, 1) // the site's own --ease
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1)

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

/** 0→1 over [a, b] with the site's ease. */
export const prog = (frame: number, a: number, b: number, easing = easeOut) =>
  interpolate(frame, [a, b], [0, 1], { ...clamp, easing })

/**
 * The scene's own fade in and out. Every scene cuts through black, which is
 * what lets five very different screens sit in one film without a transition
 * vocabulary of their own.
 */
export const useSceneFade = (inFrames = 12, outFrames = 14) => {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  return Math.min(
    prog(frame, 0, inFrames),
    1 - prog(frame, durationInFrames - outFrames, durationInFrames, easeInOut),
  )
}

/**
 * The site's brand mark: a teal dot with a ring that breathes.
 * `.brand .dot{width:9px;...;box-shadow:0 0 0 3px rgba(18,165,148,.22);animation:beat 2s infinite}`
 * scaled up and given two expanding rings, because at film size a 3px halo is
 * invisible.
 */
export const PulseDot: React.FC<{ size: number; appear?: number }> = ({ size, appear = 0 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame: frame - appear, fps, config: { damping: 11, mass: 0.6 } })
  const ring = (offset: number) => {
    const t = ((frame - appear + offset) % 60) / 60
    return { scale: 1 + t * 1.6, opacity: frame < appear ? 0 : 0.5 * (1 - t) }
  }
  const r1 = ring(0)
  const r2 = ring(30)
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      {[r1, r2].map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `${Math.max(2, size * 0.09)}px solid ${C.assure}`,
            transform: `scale(${r.scale})`,
            opacity: r.opacity,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: C.assure,
          transform: `scale(${s})`,
          boxShadow: `0 0 ${size * 1.4}px ${C.assure}88`,
        }}
      />
    </div>
  )
}

/**
 * "K REAL SOLUTIONS" as the site sets it: letter-spaced capitals beside the dot,
 * with "Audit · Analytics · AI" in mono. `reveal` staggers the letters in from
 * a wider tracking, which is the only flourish — the mark itself stays exactly
 * as it is on the site.
 */
export const Lockup: React.FC<{ scale?: number; start?: number; tagline?: boolean }> = ({
  scale = 1,
  start = 0,
  tagline = true,
}) => {
  const frame = useCurrentFrame()
  const word = 'K REAL SOLUTIONS'
  const track = interpolate(frame, [start, start + 40], [0.55, 0.2], { ...clamp, easing: easeOut })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 26 * scale }}>
      <PulseDot size={30 * scale} appear={start} />
      <div>
        <div
          style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 64 * scale,
            letterSpacing: `${track}em`,
            color: '#fff',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {word.split('').map((ch, i) => (
            <span
              key={i}
              style={{
                opacity: prog(frame, start + 4 + i * 2, start + 16 + i * 2),
                display: 'inline-block',
                transform: `translateY(${(1 - prog(frame, start + 4 + i * 2, start + 18 + i * 2)) * 18 * scale}px)`,
              }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </div>
        {tagline && (
          <div
            style={{
              marginTop: 16 * scale,
              fontFamily: FONT.mono,
              fontSize: 19 * scale,
              letterSpacing: '0.28em',
              color: C.text,
              textTransform: 'uppercase',
              opacity: prog(frame, start + 38, start + 58),
            }}
          >
            Audit&nbsp;·&nbsp;Analytics&nbsp;·&nbsp;AI
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * A section opener: mono eyebrow, then a headline that rises word by word.
 * Kept to a handful of words — at film pace a sentence is read or it is not,
 * and a second line is usually the one nobody reads.
 */
export const Kicker: React.FC<{
  eyebrow: string
  headline: string
  start?: number
  accent?: string
  size?: number
  align?: 'left' | 'center'
}> = ({ eyebrow, headline, start = 0, accent = C.assureBright, size = 88, align = 'left' }) => {
  const frame = useCurrentFrame()
  const words = headline.split(' ')
  return (
    <div style={{ textAlign: align }}>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 22,
          letterSpacing: '0.32em',
          color: accent,
          textTransform: 'uppercase',
          opacity: prog(frame, start, start + 14),
          marginBottom: 22,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          justifyContent: align === 'center' ? 'center' : 'flex-start',
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.04,
          letterSpacing: '-0.025em',
          color: '#fff',
        }}
      >
        {words.map((w, i) => {
          const p = prog(frame, start + 6 + i * 4, start + 22 + i * 4)
          return (
            <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
              <span
                style={{
                  display: 'inline-block',
                  transform: `translateY(${(1 - p) * 105}%)`,
                  opacity: p,
                }}
              >
                {w}&nbsp;
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

/** Soft vignette and grain, laid over everything, so black reads as a stage and not as a gap. */
export const Atmosphere: React.FC = () => {
  const frame = useCurrentFrame()
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: -50,
          pointerEvents: 'none',
          opacity: 0.05,
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\' stitchTiles=\'stitch\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\'/></svg>")',
          transform: `translate(${(frame * 7) % 50}px, ${(frame * 13) % 50}px)`,
        }}
      />
    </>
  )
}

/** Counts a number up; formats as the product formats it. */
export const Count: React.FC<{
  to: number
  start: number
  dur?: number
  format?: (n: number) => string
}> = ({ to, start, dur = 36, format = n => Math.round(n).toLocaleString('en-GB') }) => {
  const frame = useCurrentFrame()
  return <>{format(to * prog(frame, start, start + dur))}</>
}
