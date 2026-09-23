import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { Kicker, clamp, easeInOut, easeOut, prog, useSceneFade } from '../components/kit'
import { C, FONT } from '../theme'

/**
 * Board papers, fifteen seconds: the register the committee is handed, and the
 * same eight rows becoming the picture that answers the question the register
 * never asks — which risk is closest to us?
 *
 * Both halves are drawn natively from the portal's own rows and geometry, so
 * the transformation is a transformation: each risk's reference leaves its row
 * and flies to the orbit its residual rating puts it on. Radii and angles are
 * read off the portal's rendered figure (the capture in reference/
 * bp-orbital.png) and scaled; bands run critical nearest, low furthest.
 */

type Band = 'Critical' | 'High' | 'Moderate' | 'Low'
type Assurance = 'Limited' | 'Partial' | 'Reasonable' | 'Not assessed'

interface Risk {
  ref: string
  risk: string
  short: string
  owner: string
  inherent: Band
  residual: Band
  assurance: Assurance
  movement: 'Increased' | 'Unchanged' | 'Improved'
  angle: number // degrees, 180 = far left, 0 = far right
  /** Where the label sits, when the default (outboard of the dot) would collide. */
  side?: 'above' | 'below'
}

// The eight reproduced rows of the portal's Appendix B, verbatim.
const RISKS: Risk[] = [
  { ref: 'PR01', risk: 'Privileged access to core financial systems is not restricted to authorised individuals', short: 'Privileged access', owner: 'Director of Technology', inherent: 'Critical', residual: 'Critical', assurance: 'Limited', movement: 'Increased', angle: 90, side: 'below' },
  { ref: 'PR02', risk: 'Failure of a third party to restore service within agreed recovery times', short: 'Third-party recovery', owner: 'Chief Operating Officer', inherent: 'High', residual: 'High', assurance: 'Partial', movement: 'Unchanged', angle: 131, side: 'above' },
  { ref: 'PR03', risk: 'Change to core systems is released without adequate testing or approval', short: 'Change testing', owner: 'Director of Technology', inherent: 'High', residual: 'Moderate', assurance: 'Reasonable', movement: 'Improved', angle: 151.5 },
  { ref: 'PR04', risk: 'Data used in regulatory reporting cannot be traced to source', short: 'Reporting traceability', owner: 'Finance Director', inherent: 'High', residual: 'High', assurance: 'Limited', movement: 'Unchanged', angle: 49, side: 'above' },
  { ref: 'PR05', risk: 'Client or customer records are inaccurate or incomplete', short: 'Record accuracy', owner: 'Operations Director', inherent: 'Moderate', residual: 'Moderate', assurance: 'Reasonable', movement: 'Improved', angle: 110.6 },
  { ref: 'PR06', risk: 'Models used in decision-making are not subject to independent review', short: 'Model review', owner: 'Chief Risk Officer', inherent: 'Moderate', residual: 'Low', assurance: 'Reasonable', movement: 'Improved', angle: 90 },
  { ref: 'PR07', risk: 'Supplier onboarding does not consistently evidence due diligence', short: 'Supplier diligence', owner: 'Procurement Lead', inherent: 'Moderate', residual: 'Moderate', assurance: 'Partial', movement: 'Unchanged', angle: 69.5 },
  { ref: 'PR08', risk: 'Business continuity arrangements are untested at group level', short: 'Continuity testing', owner: 'Chief Operating Officer', inherent: 'High', residual: 'Moderate', assurance: 'Not assessed', movement: 'Unchanged', angle: 28.5 },
]

// From the portal's figure, in its own pixels (1880 wide): band centre-lines and band edges.
const SRC_R: Record<Band, number> = { Critical: 227, High: 421, Moderate: 629, Low: 822 }
const SRC_RINGS = [136, 318, 525, 732, 912]

const ASSURE_COLOUR: Record<Assurance, string> = {
  Limited: C.paperRed,
  Partial: C.paperAmber,
  Reasonable: C.paperGreen,
  'Not assessed': C.paperBlue,
}
const FILL: Record<Assurance, number> = { Limited: 0.3, Partial: 0.6, Reasonable: 1, 'Not assessed': 0 }

// Stage geometry, per frame shape. Portrait keeps the same paper and the same
// orbit, re-composed: a narrower register (the four columns that carry the
// question) and the answer called out below the field rather than beside it.
interface Layout {
  paper: { x: number; y: number; w: number; h: number }
  tableTop: number // inside the paper
  rowH: number
  cols: string[]
  k: number // film scale of the portal's geometry
  cx: number
  base: number // baseline of the orbital field, inside the paper
  baseHalf: number
  callout: { x: number; y: number; w: number; h: number }
  lead: { x: number; y: number } // where the leader from PR01 turns, and ends
  kicker: { left: number; top: number; size: number }
  button: { right: number; bottom: number }
}

const LANDSCAPE: Layout = {
  paper: { x: 190, y: 230, w: 1540, h: 800 },
  tableTop: 150,
  rowH: 66,
  cols: ['7%', '37%', '17%', '9%', '9%', '11%', '10%'],
  k: 0.62,
  cx: 770,
  base: 690,
  baseHalf: 590,
  // Top right of the paper: clear of the outermost ring at that height.
  callout: { x: 1170, y: 40, w: 340, h: 150 },
  lead: { x: 1330, y: 190 },
  kicker: { left: 190, top: 70, size: 58 },
  button: { right: 230, bottom: 110 },
}

const PORTRAIT: Layout = {
  paper: { x: 40, y: 330, w: 1000, h: 960 },
  tableTop: 150,
  rowH: 82,
  cols: ['11%', '52%', '17%', '20%'],
  k: 0.5,
  cx: 500,
  base: 620,
  baseHalf: 470,
  // Below the baseline, right of the band labels.
  callout: { x: 560, y: 700, w: 400, h: 150 },
  lead: { x: 740, y: 700 },
  kicker: { left: 60, top: 64, size: 52 },
  button: { right: 90, bottom: 96 },
}

const T_BUTTON = 176
const T_CLICK = 196
const T_FLY = 206

export const Papers: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const portrait = height > width
  const L = portrait ? PORTRAIT : LANDSCAPE
  const { paper: PAPER, tableTop: TABLE_TOP, rowH: ROW_H, k: K, cx: CX, base: BASE, callout: CALLOUT } = L
  const fade = useSceneFade()

  const paperIn = spring({ frame: frame - 26, fps, config: { damping: 18, mass: 0.9 } })
  const tableOut = prog(frame, T_FLY, T_FLY + 40, easeInOut)
  const orbitIn = prog(frame, T_FLY + 14, T_FLY + 70)

  // The reader's eye, struggling down the register before the button is pressed.
  const scanRow = interpolate(frame, [70, 170], [0, 7.6], clamp)

  const pos = (r: Risk) => {
    const rad = (r.angle * Math.PI) / 180
    const R = SRC_R[r.residual] * K
    return { x: CX + Math.cos(rad) * R, y: BASE - Math.sin(rad) * R }
  }
  const header = portrait
    ? ['REF', 'PRINCIPAL RISK', 'RESIDUAL', 'ASSURANCE']
    : ['REF', 'PRINCIPAL RISK', 'OWNER', 'INHERENT', 'RESIDUAL', 'ASSURANCE', 'MOVEMENT']
  const cellsOf = (r: Risk) =>
    portrait ? ['', r.risk, r.residual, r.assurance] : ['', r.risk, r.owner, r.inherent, r.residual, r.assurance, r.movement]

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fade, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: L.kicker.left, right: L.kicker.left, top: L.kicker.top, opacity: 1 - prog(frame, T_FLY + 40, T_FLY + 60) }}>
        <Kicker eyebrow="Board papers" headline="Forty pages. One question nobody can answer" start={4} size={L.kicker.size} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: L.kicker.left,
          right: L.kicker.left,
          top: L.kicker.top + 6,
          opacity: prog(frame, T_FLY + 64, T_FLY + 84),
          transform: `translateY(${(1 - prog(frame, T_FLY + 64, T_FLY + 90)) * 20}px)`,
        }}
      >
        <Kicker eyebrow="Board papers" headline="Which risk is closest to us? Now you can see it" start={T_FLY + 62} size={L.kicker.size} />
      </div>

      {/* The paper itself, on a dark stage. */}
      <div
        style={{
          position: 'absolute',
          left: PAPER.x,
          top: PAPER.y,
          width: PAPER.w,
          height: PAPER.h,
          background: C.paper,
          borderRadius: 6,
          boxShadow: '0 40px 120px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05)',
          transform: `translateY(${(1 - paperIn) * 380}px) rotate(${(1 - paperIn) * -3}deg)`,
          overflow: 'hidden',
        }}
      >
        {/* Header, as the committee receives it. */}
        <div style={{ position: 'absolute', left: 56, top: 40, right: 56, opacity: 1 - tableOut }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT.mono, fontSize: 15, letterSpacing: '0.14em', color: C.paperSoft }}>
            <span>APPENDIX B — PRINCIPAL RISK REGISTER</span>
            <span>PAGE 23 OF 40</span>
          </div>
          <div style={{ height: 1, background: C.paperRule, margin: '14px 0 18px' }} />
          <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 22, color: C.paperText }}>
            B.1&nbsp; Principal risks and residual exposure
          </div>
        </div>

        {/* The register. */}
        <div style={{ position: 'absolute', left: 56, right: 56, top: TABLE_TOP, opacity: 1 - tableOut, filter: `blur(${tableOut * 6}px)` }}>
          <Row header cells={header} cols={L.cols} rowH={ROW_H} />
          {RISKS.map((r, i) => {
            const onIt = Math.max(0, 1 - Math.abs(scanRow - i) * 1.6)
            return (
              <div key={r.ref} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: `rgba(156,43,28,${0.07 * onIt})` }} />
                <Row cells={cellsOf(r)} cols={L.cols} rowH={ROW_H} />
              </div>
            )
          })}
        </div>

        {/* The orbital field. */}
        <svg width={PAPER.w} height={PAPER.h} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke={C.paperBlue} strokeWidth="1.4" />
            </pattern>
          </defs>
          {SRC_RINGS.map((r, i) => {
            const t = prog(frame, T_FLY + 14 + i * 5, T_FLY + 50 + i * 5)
            return (
              <path
                key={i}
                d={`M${CX - r * K},${BASE} A${r * K},${r * K} 0 0 1 ${CX + r * K},${BASE}`}
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - t}
                fill="none"
                stroke={C.paperRule}
                strokeWidth={1.6}
              />
            )
          })}
          {(Object.keys(SRC_R) as Band[]).map((b, i) => (
            <path
              key={b}
              d={`M${CX - SRC_R[b] * K},${BASE} A${SRC_R[b] * K},${SRC_R[b] * K} 0 0 1 ${CX + SRC_R[b] * K},${BASE}`}
              fill="none"
              stroke="#8FA0B5"
              strokeWidth={1.2}
              strokeDasharray="2 7"
              opacity={0.7 * prog(frame, T_FLY + 40 + i * 4, T_FLY + 60 + i * 4)}
            />
          ))}
          <line x1={CX - L.baseHalf} y1={BASE} x2={CX + L.baseHalf} y2={BASE} stroke={C.paperText} strokeWidth={2} opacity={orbitIn} />
          {(Object.keys(SRC_R) as Band[]).map(b => (
            <text
              key={b}
              x={CX - SRC_R[b] * K}
              y={BASE + 34}
              textAnchor="middle"
              style={{ fontFamily: FONT.mono, fontSize: 14, letterSpacing: '0.2em', fill: C.paperSoft }}
              opacity={prog(frame, T_FLY + 60, T_FLY + 76)}
            >
              {b.toUpperCase()}
            </text>
          ))}
          <g opacity={prog(frame, T_FLY + 50, T_FLY + 66)}>
            <rect x={CX - 100} y={BASE - 20} width={200} height={40} fill={C.paperText} />
            <text x={CX} y={BASE + 6} textAnchor="middle" style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 15, letterSpacing: '0.16em', fill: '#fff' }}>
              THE ORGANISATION
            </text>
          </g>

          {/* Each risk: starts as its row's reference, flies to its orbit. */}
          {RISKS.map((r, i) => {
            // Centred in its row. Offset and pitch are measured off rendered
            // stills (both shapes): rows repeat every ROW_H, and the first row's
            // centre sits 32px + ROW_H/2 below the table top; +6 puts the caps'
            // middle, not their baseline, on that centre.
            const from = { x: 56 + 30, y: TABLE_TOP + 32 + ROW_H * i + ROW_H / 2 + 6 }
            const to = pos(r)
            const delay = T_FLY + i * 5
            const s = spring({ frame: frame - delay, fps, config: { damping: 15, mass: 0.8 } })
            // Arc the flight upward so eight paths do not cross as one blur.
            const x = interpolate(s, [0, 1], [from.x, to.x])
            const lift = Math.sin(Math.min(1, Math.max(0, s)) * Math.PI) * -90
            const y = interpolate(s, [0, 1], [from.y, to.y]) + lift
            const settled = prog(frame, delay + 20, delay + 34)
            const colour = ASSURE_COLOUR[r.assurance]
            const rad = 21
            const fillH = rad * 2 * FILL[r.assurance]
            const labelRight = r.angle < 90 || (r.angle === 90 && r.residual === 'Low')
            return (
              <g key={r.ref} transform={`translate(${x}, ${y})`}>
                <text
                  x={0}
                  y={5}
                  textAnchor="middle"
                  style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 17, fill: C.paperText }}
                  opacity={1 - settled}
                >
                  {r.ref}
                </text>
                <g opacity={settled} transform={`scale(${0.4 + settled * 0.6})`}>
                  <clipPath id={`c-${r.ref}`}>
                    <circle r={rad} />
                  </clipPath>
                  <circle r={rad} fill={r.assurance === 'Not assessed' ? 'url(#hatch)' : '#FCFAF4'} />
                  <rect x={-rad} y={rad - fillH} width={rad * 2} height={fillH} fill={colour} clipPath={`url(#c-${r.ref})`} />
                  <circle
                    r={rad}
                    fill="none"
                    stroke={colour}
                    strokeWidth={2.4}
                    strokeDasharray={r.assurance === 'Not assessed' ? '4 3' : undefined}
                  />
                </g>
                <g opacity={prog(frame, delay + 26, delay + 40)}>
                  {(() => {
                    const lx = r.side ? 0 : labelRight ? 32 : -32
                    const anchor = r.side ? 'middle' : labelRight ? 'start' : 'end'
                    const y1 = r.side === 'above' ? -52 : r.side === 'below' ? 46 : -9
                    return (
                      <>
                        <text x={lx} y={y1} textAnchor={anchor} style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 17, fill: C.paperText }}>
                          {r.ref}
                        </text>
                        <text x={lx} y={y1 + 21} textAnchor={anchor} style={{ fontFamily: FONT.sans, fontSize: 17, fill: C.paperSoft }}>
                          {r.short}
                        </text>
                      </>
                    )
                  })()}
                </g>
              </g>
            )
          })}

          {/* The answer, called out. */}
          <g opacity={prog(frame, T_FLY + 96, T_FLY + 116)}>
            <path
              d={`M${pos(RISKS[0]).x + 28},${pos(RISKS[0]).y} L${L.lead.x},${pos(RISKS[0]).y} L${L.lead.x},${L.lead.y}`}
              fill="none"
              stroke={C.paperRed}
              strokeWidth={1.6}
              strokeDasharray="4 4"
            />
            <circle
              cx={pos(RISKS[0]).x}
              cy={pos(RISKS[0]).y}
              r={30 + 6 * Math.sin(frame / 5)}
              fill="none"
              stroke={C.paperRed}
              strokeWidth={2}
              opacity={0.55}
            />
          </g>
        </svg>

        <div
          style={{
            position: 'absolute',
            left: CALLOUT.x,
            top: CALLOUT.y,
            width: CALLOUT.w,
            opacity: prog(frame, T_FLY + 100, T_FLY + 120),
            transform: `translateY(${(1 - prog(frame, T_FLY + 100, T_FLY + 124)) * 16}px)`,
          }}
        >
          <div style={{ height: 2, background: C.paperRed, marginBottom: 12 }} />
          <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 15, letterSpacing: '0.2em', color: C.paperRed }}>
            NEAREST TO US
          </div>
          <div style={{ marginTop: 8, fontFamily: FONT.sans, fontWeight: 500, fontSize: 21, lineHeight: 1.3, color: C.paperText }}>
            PR01 · Privileged access to core financial systems
          </div>
          <div style={{ marginTop: 8, fontFamily: FONT.mono, fontSize: 13, letterSpacing: '0.14em', lineHeight: 1.6, color: C.paperSoft }}>
            CRITICAL RESIDUAL
            <br />
            LIMITED ASSURANCE · INCREASED
          </div>
        </div>
      </div>

      <TransformButton frame={frame} at={L.button} />
    </AbsoluteFill>
  )
}

const Row: React.FC<{ cells: string[]; cols: string[]; rowH: number; header?: boolean }> = ({ cells, cols, rowH, header }) => (
  <div
    style={{
      display: 'flex',
      height: header ? 38 : rowH,
      alignItems: header ? 'flex-end' : 'center',
      borderBottom: `1px solid ${header ? C.paperText : C.paperRule}`,
      paddingBottom: header ? 8 : 0,
    }}
  >
    {cells.map((c, i) => (
      <div
        key={i}
        style={{
          width: cols[i],
          paddingRight: 14,
          fontFamily: header ? FONT.mono : FONT.sans,
          fontWeight: header ? 600 : 400,
          fontSize: header ? 13 : 17,
          letterSpacing: header ? '0.12em' : 0,
          lineHeight: 1.25,
          color: C.paperText,
        }}
      >
        {c}
      </div>
    ))}
  </div>
)

/** The portal's own button, pressed. */
const TransformButton: React.FC<{ frame: number; at: { right: number; bottom: number } }> = ({ frame, at }) => {
  const shown = prog(frame, T_BUTTON, T_BUTTON + 12) * (1 - prog(frame, T_CLICK + 20, T_CLICK + 32))
  const press = frame >= T_CLICK && frame < T_CLICK + 6 ? 0.94 : 1
  const ripple = prog(frame, T_CLICK, T_CLICK + 24, easeOut)
  const cursorT = prog(frame, T_BUTTON + 2, T_CLICK - 2, easeInOut)
  return (
    <div style={{ position: 'absolute', right: at.right, bottom: at.bottom, opacity: shown }}>
      <div
        style={{
          position: 'relative',
          background: '#A5321F',
          color: '#fff',
          fontFamily: FONT.mono,
          fontWeight: 600,
          fontSize: 22,
          letterSpacing: '0.18em',
          padding: '20px 34px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          transform: `scale(${press})`,
        }}
      >
        TRANSFORM THIS PAGE
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 40,
            height: 40,
            marginLeft: -20,
            marginTop: -20,
            borderRadius: '50%',
            border: '3px solid #fff',
            transform: `scale(${ripple * 9})`,
            opacity: frame >= T_CLICK ? 1 - ripple : 0,
          }}
        />
      </div>
      <svg
        width={34}
        height={40}
        viewBox="0 0 17 20"
        style={{
          position: 'absolute',
          left: interpolate(cursorT, [0, 1], [-260, 150]),
          top: interpolate(cursorT, [0, 1], [-160, 34]),
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.6))',
        }}
      >
        <path d="M1,1 L1,16 L5,12 L8,19 L10.5,18 L7.5,11 L13,11 Z" fill="#fff" stroke="#000" strokeWidth="1.1" />
      </svg>
    </div>
  )
}
