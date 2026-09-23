import { AbsoluteFill } from 'remotion'
import { Fonts } from './fonts'
import { Atmosphere, Lockup } from './components/kit'
import { Mining } from './scenes/Mining'
import { C, CTA, FONT } from './theme'

/**
 * The LinkedIn cover: the process mining scene at the moment its AI findings
 * are all in (rendered as a still at frame 520 of the scene), signed with the
 * brand in the empty band beneath the findings — so the thumbnail says who it
 * is from before anyone presses play.
 */
export const COVER_FRAME = 520

export const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Fonts />
    <Mining />
    <Atmosphere />
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: 1150,
        paddingTop: 34,
        borderTop: `1px solid ${C.hair}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Lockup scale={0.62} start={-200} />
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 34, color: '#fff', letterSpacing: '-0.01em' }}>
          The Innovation Lab
        </div>
        <div style={{ marginTop: 8, fontFamily: FONT.mono, fontSize: 17, color: C.assureBright }}>{CTA.url}</div>
      </div>
    </div>
    <div
      style={{
        position: 'absolute',
        right: 60,
        bottom: 22,
        fontFamily: FONT.mono,
        fontSize: 13,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: C.soft,
        opacity: 0.7,
      }}
    >
      Demonstration data · invented organisations
    </div>
  </AbsoluteFill>
)
