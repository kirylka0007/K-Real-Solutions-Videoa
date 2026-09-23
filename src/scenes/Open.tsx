import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { Lockup, prog, useSceneFade, easeInOut } from '../components/kit'
import { C, FONT } from '../theme'

/**
 * Five seconds. The brand builds as it does on the site — dot first, then the
 * name — then lifts to make room for the one line that says what follows.
 *
 * No product yet, on purpose: the first thing a viewer should register is who
 * this is from, and a dashboard in the first frame would take that away.
 */
export const Open: React.FC = () => {
  const frame = useCurrentFrame()
  const fade = useSceneFade(1, 14)
  const lift = prog(frame, 70, 100, easeInOut)
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fade }}>
      {/* A slow teal bloom behind the mark, the only colour on screen. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% ${50 - lift * 12}%, ${C.assure}22 0%, transparent 38%)`,
          opacity: prog(frame, 5, 45),
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateY(${-lift * 120}px) scale(${1 - lift * 0.18})`,
        }}
      >
        <Lockup scale={1.35} start={6} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 260 }}>
        <div
          style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 74,
            letterSpacing: '-0.02em',
            color: '#fff',
            opacity: prog(frame, 86, 104),
            transform: `translateY(${(1 - prog(frame, 86, 108)) * 30}px)`,
          }}
        >
          The Innovation Lab
        </div>
        <div
          style={{
            marginTop: 20,
            fontFamily: FONT.mono,
            fontSize: 22,
            letterSpacing: '0.22em',
            color: C.soft,
            textTransform: 'uppercase',
            opacity: prog(frame, 100, 118),
          }}
        >
          Three tools, built for internal audit
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
