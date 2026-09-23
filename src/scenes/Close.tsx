import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'
import { Lockup, PulseDot, easeInOut, prog, useSceneFade } from '../components/kit'
import { C, CTA, FONT } from '../theme'

/**
 * Six seconds. The three tools named once, the brand, what we do for clients,
 * and the one thing to do next — worded as the site words it, with the address in full so it can be
 * typed from a phone held up to a screen.
 */
const TOOLS = ['Process mining', 'Board papers', 'Continuous monitoring']

/** What K Real Solutions does, in one line: the service behind the three demos. */
const SERVICE_LINE = 'We build practical analytics and AI solutions for internal audit and compliance teams'

export const Close: React.FC = () => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()
  // Portrait: the three names stack, since one line of them is wider than the frame.
  const portrait = height > width
  const fade = useSceneFade(12, 1)
  const toolsOut = prog(frame, 46, 56, easeInOut)
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fade }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 46%, ${C.assure}26 0%, transparent 40%)`,
          opacity: prog(frame, 50, 100),
        }}
      />
      {/* The three, in one line, then they make way for the mark. */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 - toolsOut }}>
        <div
          style={{
            display: 'flex',
            flexDirection: portrait ? 'column' : 'row',
            alignItems: 'center',
            gap: portrait ? 18 : 34,
          }}
        >
          {TOOLS.map((t, i) => {
            const p = prog(frame, 4 + i * 6, 18 + i * 6)
            return (
              <div key={t} style={{ display: 'flex', flexDirection: portrait ? 'column' : 'row', alignItems: 'center', gap: portrait ? 18 : 34 }}>
                {i > 0 && <span style={{ width: 10, height: 10, borderRadius: '50%', background: C.assure, opacity: p }} />}
                <span
                  style={{
                    fontFamily: FONT.display,
                    fontWeight: 700,
                    fontSize: 58,
                    letterSpacing: '-0.02em',
                    color: '#fff',
                    opacity: p,
                    transform: `translateY(${(1 - p) * 24}px)`,
                    display: 'inline-block',
                  }}
                >
                  {t}
                </span>
              </div>
            )
          })}
        </div>
      </AbsoluteFill>
      {/* The mark, what we do, and the one thing to do next — one centred column. */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ height: portrait ? 118 : 134, display: 'flex', alignItems: 'center' }}>
          {frame >= 50 && <Lockup scale={portrait ? 0.9 : 1.05} start={50} trackFrom={portrait ? 0.26 : 0.55} />}
        </div>
        {/*
          The line that turns three demos into an offer: without it a viewer can
          leave thinking "interesting software" and never learn that the work is
          something they can hire us to build for their own organisation.
        */}
        <div
          style={{
            marginTop: portrait ? 44 : 40,
            maxWidth: portrait ? 900 : 1560,
            textAlign: 'center',
            fontFamily: FONT.sans,
            fontWeight: 500,
            fontSize: portrait ? 38 : 36,
            lineHeight: 1.3,
            color: C.text,
            opacity: prog(frame, 94, 110),
            transform: `translateY(${(1 - prog(frame, 94, 114)) * 18}px)`,
          }}
        >
          {SERVICE_LINE}
        </div>
        <div
          style={{
            marginTop: portrait ? 56 : 48,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '24px 44px',
            borderRadius: 999,
            background: C.assure,
            color: '#fff',
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 40,
            letterSpacing: '-0.01em',
            opacity: prog(frame, 110, 126),
            transform: `translateY(${(1 - prog(frame, 110, 130)) * 24}px)`,
            boxShadow: `0 0 ${60 + 20 * Math.sin(frame / 8)}px ${C.assure}66`,
          }}
        >
          {CTA.label}
          <span style={{ display: 'inline-block', transform: `translateX(${Math.sin(frame / 7) * 4}px)` }}>→</span>
        </div>
        <div
          style={{
            marginTop: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontFamily: FONT.mono,
            fontSize: portrait ? 27 : 30,
            letterSpacing: '0.04em',
            color: C.text,
            opacity: prog(frame, 120, 136),
          }}
        >
          <PulseDot size={12} appear={120} />
          {CTA.url}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
