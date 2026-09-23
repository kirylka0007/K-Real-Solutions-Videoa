import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { Lockup, PulseDot, easeInOut, prog, useSceneFade } from '../components/kit'
import { C, CTA, FONT } from '../theme'

/**
 * Six seconds. The three tools named once, the brand, and the one thing to do
 * next — worded as the site words it, with the address in full so it can be
 * typed from a phone held up to a screen.
 */
const TOOLS = ['Process mining', 'Board papers', 'Continuous monitoring']

export const Close: React.FC = () => {
  const frame = useCurrentFrame()
  const fade = useSceneFade(12, 1)
  const toolsOut = prog(frame, 58, 72, easeInOut)
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
          {TOOLS.map((t, i) => {
            const p = prog(frame, 4 + i * 9, 20 + i * 9)
            return (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
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
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 170 }}>
        {frame >= 64 && <Lockup scale={1.05} start={64} />}
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 190 }}>
        <div
          style={{
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
            opacity: prog(frame, 96, 112),
            transform: `translateY(${(1 - prog(frame, 96, 116)) * 24}px)`,
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
            fontSize: 30,
            letterSpacing: '0.04em',
            color: C.text,
            opacity: prog(frame, 108, 124),
          }}
        >
          <PulseDot size={12} appear={108} />
          {CTA.url}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
