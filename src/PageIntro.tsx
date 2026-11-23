import { AbsoluteFill } from 'remotion'
import { Fonts } from './fonts'
import { Atmosphere, Lockup } from './components/kit'
import { C, FONT } from './theme'

/**
 * A still for the company page's first photo post: who we are, what we do and
 * for whom, in the site's own words. No product figures, so nothing to label
 * as demonstration data.
 */
const SERVICE_LINE = 'We build practical analytics and AI solutions for internal audit and compliance teams'

const OFFER: Array<[string, string]> = [
  ['Process mining', 'How your processes really run, from the records they leave behind'],
  ['Whole-population testing', 'Controls tested on every transaction, not a sample'],
  ['Continuous monitoring', 'Tests that keep running as indicators the business owns'],
  ['AI for assurance', 'Agreements, contracts and board papers turned into sourced answers'],
]

export const PageIntro: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Fonts />
    <AbsoluteFill style={{ background: `radial-gradient(circle at 80% 8%, ${C.assure}2e 0%, transparent 42%)` }} />
    <div style={{ position: 'absolute', left: 80, right: 80, top: 90 }}>
      <Lockup scale={0.72} start={-200} />
    </div>
    <div style={{ position: 'absolute', left: 80, right: 80, top: 270 }}>
      <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 76, lineHeight: 1.08, letterSpacing: '-0.03em', color: '#fff' }}>
        Every process mapped.
        <br />
        <span style={{ color: C.assureBright }}>Every control tested</span>
      </div>
      <div style={{ marginTop: 34, fontFamily: FONT.sans, fontWeight: 500, fontSize: 34, lineHeight: 1.35, color: C.text, maxWidth: 880 }}>
        {SERVICE_LINE}
      </div>
    </div>
    <div style={{ position: 'absolute', left: 80, right: 80, top: 640, display: 'flex', flexDirection: 'column', gap: 0 }}>
      {OFFER.map(([title, line]) => (
        <div key={title} style={{ display: 'flex', gap: 26, alignItems: 'baseline', padding: '22px 0', borderTop: `1px solid ${C.hair}` }}>
          <span style={{ width: 14, height: 14, borderRadius: '50%', background: C.assure, flex: 'none', transform: 'translateY(-4px)' }} />
          <div>
            <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 34, color: '#fff' }}>{title}</div>
            <div style={{ marginTop: 6, fontFamily: FONT.sans, fontSize: 25, color: C.soft }}>{line}</div>
          </div>
        </div>
      ))}
    </div>
    <div
      style={{
        position: 'absolute',
        left: 80,
        right: 80,
        bottom: 70,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: FONT.mono,
        fontSize: 24,
        color: C.text,
      }}
    >
      <span>krealsolutions.co.uk</span>
      <span style={{ color: C.soft, letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: 18 }}>Edinburgh · FCCA-led</span>
    </div>
    <Atmosphere />
  </AbsoluteFill>
)
