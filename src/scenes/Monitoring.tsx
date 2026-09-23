import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { clamp, easeInOut, easeOut, prog, useSceneFade } from '../components/kit'
import { C, FONT } from '../theme'

/**
 * Continuous monitoring, sixteen seconds: five entities, into Finance, into one
 * control, into one exception — and the AI drafting the rationale the auditor
 * then owns.
 *
 * Every figure is the monitoring engine's own output for the demo population
 * (computeHub over DEMO_DATA, 30-day window to 22 Sep 2026): the entity KPIs and
 * their movements, the four Finance controls' daily run strips, fin-02's flags
 * and review marks, and exception AP-2026-1111 as the product shows it. Drawn
 * natively so each layer can open out of the one before it.
 */

// ---------------------------------------------------------------------------
// The engine's figures
// ---------------------------------------------------------------------------

type Dir = 'up' | 'down' | 'same'
interface Move {
  now: number
  change: number
  dir: Dir
  adverse: boolean
}
const mv = (now: number, change: number, adverse = change > 0): Move => ({
  now,
  change: Math.abs(change),
  dir: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
  adverse,
})

const ENTITIES = [
  { name: 'Finance', universe: 23, flagged: 3, found: mv(24, 17), confirmed: mv(6, 5) },
  { name: 'Payroll & HR', universe: 14, flagged: 1, found: mv(14, 0), confirmed: mv(5, 1) },
  { name: 'Procurement', universe: 19, flagged: 2, found: mv(48, -2), confirmed: mv(12, -3) },
  { name: 'IT & Access', universe: 31, flagged: 1, found: mv(9, 8), confirmed: mv(6, 6) },
  { name: 'Treasury', universe: 9, flagged: 4, found: mv(6, -4), confirmed: mv(1, -6) },
]

const FINANCE_KPIS: Array<{ m: Move; label: string; unit?: string }> = [
  { m: mv(0, 0), label: 'zero-tolerance breaches' },
  { m: mv(0, 0), label: 'recurred after remediation' },
  { m: mv(6, 5), label: 'confirmed and unresolved' },
  { m: mv(3, 3), label: 'awaiting investigation or review' },
  { m: mv(0, 0), label: 'controls not tested' },
  { m: mv(13, 13), label: 'oldest unreviewed exception', unit: 'days' },
]

const CONTROLS = [
  {
    kind: 'TOLERANCE',
    name: 'Payment approved above the approver’s delegated limit',
    series: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 2, 1, 1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    found: 14,
    outstanding: 3,
    confirmed: 5,
    flags: ['ABOVE EXPECTED BAND', 'REVIEW OVERDUE'],
  },
  {
    kind: 'TOLERANCE',
    name: 'Payment raised and approved by the same user',
    series: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    found: 6,
    outstanding: 0,
    confirmed: 1,
    flags: ['ABOVE EXPECTED BAND'],
  },
  {
    kind: 'TOLERANCE',
    name: 'Single authoriser above the dual-authorisation threshold',
    series: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    found: 4,
    outstanding: 0,
    confirmed: 0,
    flags: ['ABOVE EXPECTED BAND'],
  },
  {
    kind: 'ZERO TOLERANCE',
    name: 'Payment released with no approval record',
    series: new Array(30).fill(0) as number[],
    found: 0,
    outstanding: 0,
    confirmed: 0,
    flags: [] as string[],
  },
]

// fin-02's review marks, in the engine's order.
const MARKS: Array<'reviewed' | 'returned' | 'raised'> = [
  ...(new Array(10).fill('reviewed') as 'reviewed'[]),
  'returned',
  'returned',
  'raised',
  'reviewed',
]

// Drafted from AP-2026-1111's own facts, as the product's "Draft with AI" is
// scoped to do: it restates the evidence and the reviewer's point, and leaves
// the evidence reference, owner and date to the auditor.
const DRAFT =
  'The approver’s delegated limit on 8 Sep 2026 was £25,000 against a payment of £58,250 — more than twice the limit. ' +
  'The earlier data-defect conclusion was returned because it cited no comparison to source. ' +
  'On the evidence recorded, this is an approval above delegated authority: confirmed, open.'

// ---------------------------------------------------------------------------
// Timing
// ---------------------------------------------------------------------------

const T = {
  tiles: 20,
  toFinance: 112, // click
  finance: 118,
  toControl: 214, // click
  control: 220,
  toException: 322, // click
  exception: 328,
  draft: 396, // click
  typeFrom: 402,
  typeTo: 452,
}

// Stage.
const X0 = 120
const W = 1680
const TOP = 250

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

const ARROW: Record<Dir, string> = { up: '↑', down: '↓', same: '→' }
const moveHue = (m: Move) => (m.dir === 'same' ? C.soft : m.adverse ? C.exceptionRed : C.assureBright)
const moveWord = (m: Move) => (m.dir === 'same' ? 'unchanged' : `${m.dir} ${m.change}`)

const MoveTag: React.FC<{ m: Move; size: number }> = ({ m, size }) => (
  <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: size * 0.3, fontSize: size }}>
    <span style={{ color: moveHue(m), fontWeight: 700 }}>{ARROW[m.dir]}</span>
    <span style={{ color: C.text, fontWeight: 600 }}>{moveWord(m)}</span>
  </span>
)

const Chip: React.FC<{ text: string; tone?: 'amber' | 'red'; size?: number; style?: React.CSSProperties }> = ({
  text,
  tone = 'amber',
  size = 17,
  style,
}) => {
  const hue = tone === 'amber' ? C.exception : C.exceptionRed
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        border: `1.5px solid ${hue}AA`,
        background: `${hue}1A`,
        color: '#fff',
        fontFamily: FONT.mono,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '0.12em',
        padding: `${size * 0.4}px ${size * 0.75}px`,
        borderRadius: 5,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <span style={{ width: size * 0.45, height: size * 0.45, borderRadius: '50%', background: hue }} />
      {text}
    </span>
  )
}

/** The cursor, travelling a path of waypoints and pressing at each click. */
const Cursor: React.FC<{ frame: number; path: Array<{ f: number; x: number; y: number }>; clicks: number[] }> = ({
  frame,
  path,
  clicks,
}) => {
  let x = path[0].x
  let y = path[0].y
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]
    const b = path[i + 1]
    if (frame >= a.f) {
      const t = prog(frame, a.f, b.f, easeInOut)
      x = a.x + (b.x - a.x) * t
      y = a.y + (b.y - a.y) * t
    }
  }
  const pressed = clicks.some(c => frame >= c && frame < c + 5)
  const visible = prog(frame, path[0].f - 8, path[0].f) * (1 - prog(frame, path[path.length - 1].f + 14, path[path.length - 1].f + 24))
  return (
    <>
      {clicks.map(c => {
        const r = prog(frame, c, c + 22, easeOut)
        return frame >= c && frame < c + 22 ? (
          <div
            key={c}
            style={{
              position: 'absolute',
              left: x - 22,
              top: y - 22,
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: `3px solid ${C.assureBright}`,
              transform: `scale(${0.4 + r * 1.8})`,
              opacity: 1 - r,
            }}
          />
        ) : null
      })}
      <svg
        width={34}
        height={40}
        viewBox="0 0 17 20"
        style={{
          position: 'absolute',
          left: x - 3,
          top: y - 2,
          opacity: visible,
          transform: `scale(${pressed ? 0.88 : 1})`,
          transformOrigin: '0 0',
          filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.7))',
        }}
      >
        <path d="M1,1 L1,16 L5,12 L8,19 L10.5,18 L7.5,11 L13,11 Z" fill="#fff" stroke="#000" strokeWidth="1.1" />
      </svg>
    </>
  )
}

/** Mono eyebrow, then a headline that swaps word-by-word as the camera goes deeper. */
const HEADLINES: Array<{ at: number; text: string }> = [
  { at: 0, text: 'Every control. Every day.' },
  { at: T.finance + 4, text: 'Into any entity.' },
  { at: T.control + 4, text: 'Into any control.' },
  { at: T.exception + 4, text: 'Into the transaction itself.' },
  { at: T.draft - 6, text: 'AI drafts. The auditor decides.' },
]

const Header: React.FC<{ frame: number }> = ({ frame }) => {
  const crumbs = [
    { at: 0, text: 'Continuous monitoring' },
    { at: T.finance, text: 'Finance' },
    { at: T.control, text: 'Delegated limit' },
    { at: T.exception, text: 'AP-2026-1111' },
  ]
  return (
    <div style={{ position: 'absolute', left: X0, top: 64, width: W }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontFamily: FONT.mono,
          fontSize: 21,
          letterSpacing: '0.26em',
          textTransform: 'uppercase',
          color: C.assureBright,
        }}
      >
        <span style={{ width: 46 * prog(frame, 0, 20), height: 2, background: C.assureBright }} />
        {crumbs.map((c, i) => {
          const p = prog(frame, c.at, c.at + 12)
          return p > 0 ? (
            <span key={i} style={{ opacity: p, color: i === 0 ? C.assureBright : C.text, whiteSpace: 'nowrap' }}>
              {i > 0 && <span style={{ color: C.soft, marginRight: 16 }}>›</span>}
              {c.text}
            </span>
          ) : null
        })}
      </div>
      <div style={{ position: 'relative', height: 90, marginTop: 18 }}>
        {HEADLINES.map((h, hi) => {
          const next = HEADLINES[hi + 1]
          const out = next ? prog(frame, next.at - 6, next.at + 4) : 0
          if (frame < h.at || out >= 1) return null
          return (
            <div
              key={hi}
              style={{
                position: 'absolute',
                inset: 0,
                fontFamily: FONT.display,
                fontWeight: 700,
                fontSize: 70,
                lineHeight: 1.04,
                letterSpacing: '-0.025em',
                color: '#fff',
                opacity: 1 - out,
                transform: `translateY(${-out * 24}px)`,
                whiteSpace: 'nowrap',
              }}
            >
              {h.text.split(' ').map((w, i) => {
                const p = prog(frame, h.at + i * 3, h.at + 14 + i * 3)
                return (
                  <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
                    <span style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 105}%)`, opacity: p }}>
                      {w}&nbsp;
                    </span>
                  </span>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --- Layer 1: the five entities ---------------------------------------------

const TILE_W = 304
const TILE_GAP = 40
const TILE_H = 440
const TILE_Y = 330
const tileX = (i: number) => (1920 - (5 * TILE_W + 4 * TILE_GAP)) / 2 + i * (TILE_W + TILE_GAP)

const Tiles: React.FC<{ frame: number }> = ({ frame }) => {
  const leave = prog(frame, T.toFinance + 2, T.finance + 14, easeInOut)
  if (leave >= 1) return null
  return (
    <>
      {ENTITIES.map((e, i) => {
        const inP = prog(frame, T.tiles + i * 5, T.tiles + 22 + i * 5)
        const isFin = i === 0
        const hover = isFin ? prog(frame, T.toFinance - 16, T.toFinance - 4) : 0
        const count = (m: Move) => Math.round(m.now * prog(frame, T.tiles + 10 + i * 5, T.tiles + 46 + i * 5))
        return (
          <div
            key={e.name}
            style={{
              position: 'absolute',
              left: tileX(i),
              top: TILE_Y + (1 - inP) * 40,
              width: TILE_W,
              height: TILE_H,
              opacity: inP * (isFin ? 1 - prog(frame, T.finance, T.finance + 10) : 1 - leave),
              transform: isFin ? `scale(${1 + hover * 0.03 + leave * 0.12})` : `translateY(${leave * 40}px)`,
              background: C.ink,
              border: `1.5px solid ${isFin ? `rgba(25,201,180,${0.2 + hover * 0.8})` : C.hair}`,
              borderRadius: 12,
              padding: '30px 28px',
              boxSizing: 'border-box',
              boxShadow: isFin && hover > 0 ? `0 0 ${50 * hover}px ${C.assure}44` : 'none',
            }}
          >
            <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 34, color: '#fff' }}>{e.name}</div>
            <div style={{ fontFamily: FONT.mono, fontSize: 15, color: C.soft, marginTop: 8, whiteSpace: 'nowrap' }}>
              4 of {e.universe} controls monitored
            </div>
            {(
              [
                [e.found, 'found · 30 days'],
                [e.confirmed, 'confirmed & unresolved'],
              ] as const
            ).map(([m, label], k) => (
              <div key={k} style={{ marginTop: k === 0 ? 34 : 22 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, fontFamily: FONT.mono }}>
                  <span style={{ fontSize: 64, fontWeight: 600, color: '#fff', lineHeight: 1 }}>{count(m)}</span>
                  <span style={{ opacity: prog(frame, T.tiles + 40 + i * 5, T.tiles + 52 + i * 5) }}>
                    <MoveTag m={m} size={22} />
                  </span>
                </div>
                <div style={{ fontFamily: FONT.sans, fontSize: 19, color: C.soft, marginTop: 6 }}>{label}</div>
              </div>
            ))}
            <div style={{ position: 'absolute', left: 28, bottom: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
              {[0, 1, 2, 3].map(k => (
                <span
                  key={k}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: k < e.flagged ? C.exception : C.assure,
                    opacity: prog(frame, T.tiles + 30 + i * 5 + k * 3, T.tiles + 38 + i * 5 + k * 3),
                  }}
                />
              ))}
              <span style={{ fontFamily: FONT.mono, fontSize: 16, color: C.soft, marginLeft: 8 }}>
                {e.flagged} of 4 flagged
              </span>
            </div>
          </div>
        )
      })}
    </>
  )
}

// --- Layer 2: Finance, opened ------------------------------------------------

const Spark: React.FC<{ series: number[]; w: number; h: number; draw: number; flagged: boolean }> = ({
  series,
  w,
  h,
  draw,
  flagged,
}) => {
  const max = 3
  const pts = series.map((v, i) => [(i / (series.length - 1)) * w, h - 3 - (v / max) * (h - 8)] as const)
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const hue = flagged ? C.exception : C.assure
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id={`sp-${series.join('')}-${w}`}>
          <rect x={-2} y={-10} width={(w + 4) * draw} height={h + 20} />
        </clipPath>
      </defs>
      <line x1={0} x2={w} y1={h * 0.62} y2={h * 0.62} stroke={C.assure} strokeWidth={2} strokeDasharray="6 5" opacity={0.7} />
      <g clipPath={`url(#sp-${series.join('')}-${w})`}>
        <path d={`${d} L${w},${h} L0,${h} Z`} fill={hue} opacity={0.22} />
        <path d={d} fill="none" stroke={hue} strokeWidth={3} strokeLinejoin="round" />
      </g>
    </svg>
  )
}

const FinancePanel: React.FC<{ frame: number }> = ({ frame }) => {
  const inP = prog(frame, T.finance, T.finance + 20)
  const leave = prog(frame, T.toControl + 2, T.control + 12, easeInOut)
  if (inP <= 0 || leave >= 1) return null
  const rowIn = (k: number) => prog(frame, T.finance + 24 + k * 6, T.finance + 40 + k * 6)
  const hover = prog(frame, T.toControl - 16, T.toControl - 4)
  return (
    <div
      style={{
        position: 'absolute',
        left: X0,
        top: TOP,
        width: W,
        opacity: inP * (1 - leave),
        transform: `scale(${0.96 + inP * 0.04 + leave * 0.03})`,
        transformOrigin: '10% 30%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 18 }}>
        <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 44, color: '#fff' }}>Finance</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 21, color: C.soft }}>4 of 23 controls monitored</span>
        <span style={{ marginLeft: 'auto', fontFamily: FONT.mono, fontSize: 21, color: C.soft }}>3 of 4 flagged</span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          background: C.ink,
          border: `1.5px solid ${C.hair}`,
          borderRadius: 12,
          padding: '26px 30px',
          marginBottom: 20,
        }}
      >
        {FINANCE_KPIS.map((k, i) => {
          const p = prog(frame, T.finance + 8 + i * 3, T.finance + 22 + i * 3)
          return (
            <div key={i} style={{ opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, fontFamily: FONT.mono }}>
                <span style={{ fontSize: 56, fontWeight: 600, color: '#fff', lineHeight: 1 }}>
                  {Math.round(k.m.now * prog(frame, T.finance + 10, T.finance + 34))}
                </span>
                {k.unit && <span style={{ fontSize: 22, color: C.soft }}>{k.unit}</span>}
                <MoveTag m={k.m} size={21} />
              </div>
              <div style={{ fontFamily: FONT.sans, fontSize: 18, color: C.soft, marginTop: 10, lineHeight: 1.25, paddingRight: 16 }}>
                {k.label}
              </div>
            </div>
          )
        })}
      </div>
      {CONTROLS.map((c, k) => {
        const p = rowIn(k)
        const flagged = c.flags.length > 0
        const isTarget = k === 0
        return (
          <div
            key={k}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 30,
              height: 104,
              marginBottom: 12,
              padding: '0 30px',
              background: C.ink,
              border: `1.5px solid ${isTarget ? `rgba(25,201,180,${0.15 + hover * 0.85})` : C.hair}`,
              borderLeft: `5px solid ${flagged ? C.exception : C.ink3}`,
              borderRadius: 10,
              opacity: p,
              transform: `translateX(${(1 - p) * 40}px)`,
              boxShadow: isTarget && hover > 0 ? `0 0 ${40 * hover}px ${C.assure}40` : 'none',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: '0.18em', color: C.soft }}>
                FINANCE · {c.kind}
              </div>
              <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 27, color: '#fff', marginTop: 8, whiteSpace: 'nowrap' }}>
                {c.name}
              </div>
            </div>
            <Spark series={c.series} w={210} h={62} draw={prog(frame, T.finance + 34 + k * 6, T.finance + 64 + k * 6)} flagged={flagged} />
            <div style={{ width: 330, textAlign: 'right', fontFamily: FONT.mono, whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: 30, fontWeight: 600, color: '#fff' }}>
                {c.found} <span style={{ fontSize: 18, fontWeight: 400, color: C.soft }}>found</span>
              </div>
              <div style={{ fontSize: 16, color: C.soft, marginTop: 4 }}>
                {c.outstanding} outstanding · {c.confirmed} confirmed
              </div>
            </div>
            <div style={{ width: 280, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              {flagged ? (
                c.flags.map((f, fi) => (
                  <Chip key={f} text={f} size={15} style={{ opacity: prog(frame, T.finance + 50 + k * 6 + fi * 5, T.finance + 58 + k * 6 + fi * 5) }} />
                ))
              ) : (
                <span style={{ fontFamily: FONT.mono, fontSize: 17, color: C.soft }}>no flag raised</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// --- Layer 3: the control ---------------------------------------------------

const CHART = { x: 60, y: 150, w: 820, h: 300 }

const ControlCard: React.FC<{ frame: number }> = ({ frame }) => {
  const inP = prog(frame, T.control, T.control + 18)
  if (inP <= 0) return null
  const dim = prog(frame, T.exception, T.exception + 16) * 0.55
  const draw = prog(frame, T.control + 10, T.control + 50, easeInOut)
  const series = CONTROLS[0].series
  const pts = series.map((v, i) => ({
    x: CHART.x + (i / (series.length - 1)) * CHART.w,
    y: CHART.y + CHART.h - (v / 3) * CHART.h,
    v,
  }))
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const barP = prog(frame, T.control + 28, T.control + 64, easeOut)
  const hover = prog(frame, T.toException - 16, T.toException - 4)
  const fig = (at: number) => prog(frame, T.control + at, T.control + at + 20)
  return (
    <div
      style={{
        position: 'absolute',
        left: X0,
        top: TOP,
        width: W,
        height: 780,
        background: C.ink,
        border: `1.5px solid ${C.hair}`,
        borderLeft: `6px solid ${C.exception}`,
        borderRadius: 14,
        opacity: inP,
        transform: `translateY(${(1 - inP) * 40}px)`,
        filter: `brightness(${1 - dim})`,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', left: 60, top: 40 }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 17, letterSpacing: '0.18em', color: C.soft }}>FINANCE · TOLERANCE</div>
        <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 38, color: '#fff', marginTop: 10 }}>
          Payment approved above the approver’s delegated limit
        </div>
      </div>
      {/* Daily run strip — the engine's own thirty runs. */}
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={960} height={780}>
        <defs>
          <linearGradient id="cm-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.exception} stopOpacity={0.55} />
            <stop offset="1" stopColor={C.exception} stopOpacity={0.04} />
          </linearGradient>
          <clipPath id="cm-draw">
            <rect x={CHART.x - 10} y={0} width={(CHART.w + 20) * draw} height={780} />
          </clipPath>
        </defs>
        {[0, 3].map(v => (
          <g key={v}>
            <line
              x1={CHART.x}
              x2={CHART.x + CHART.w}
              y1={CHART.y + CHART.h - (v / 3) * CHART.h}
              y2={CHART.y + CHART.h - (v / 3) * CHART.h}
              stroke={C.hair}
            />
            <text x={CHART.x - 18} y={CHART.y + CHART.h - (v / 3) * CHART.h + 6} fill={C.soft} fontFamily={FONT.mono} fontSize={17} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        <g clipPath="url(#cm-draw)">
          <path d={`${d} L${CHART.x + CHART.w},${CHART.y + CHART.h} L${CHART.x},${CHART.y + CHART.h} Z`} fill="url(#cm-area)" />
          <path d={d} fill="none" stroke={C.exception} strokeWidth={4} strokeLinejoin="round" />
          {pts
            .filter(p => p.v > 0)
            .map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={7} fill={C.ink} stroke={C.exception} strokeWidth={3} />
            ))}
        </g>
        <text x={CHART.x} y={CHART.y + CHART.h + 36} fill={C.soft} fontFamily={FONT.mono} fontSize={17}>
          29 days ago
        </text>
        <text x={CHART.x + CHART.w} y={CHART.y + CHART.h + 36} fill={C.text} fontFamily={FONT.mono} fontSize={17} textAnchor="end">
          today
        </text>
      </svg>
      {/* 30-day total against the expected band. */}
      <div style={{ position: 'absolute', left: CHART.x, top: 560, width: CHART.w, opacity: prog(frame, T.control + 22, T.control + 34) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT.mono, fontSize: 19, letterSpacing: '0.14em', color: C.soft }}>
          <span>30-DAY TOTAL</span>
          <span>EXPECTED ≤ 5</span>
        </div>
        <div style={{ position: 'relative', height: 22, marginTop: 14, borderRadius: 11, background: C.bg, border: `1.5px solid ${C.hair}` }}>
          <div
            style={{
              position: 'absolute',
              left: 4,
              top: 4,
              bottom: 4,
              width: `calc(${(14 / 16) * 100 * barP}% - 8px)`,
              borderRadius: 8,
              background: barP * 14 > 5 ? C.exception : C.assure,
            }}
          />
          <div style={{ position: 'absolute', left: `${(5 / 16) * 100}%`, top: -8, bottom: -8, width: 3, background: C.assureBright }} />
        </div>
        <div style={{ fontFamily: FONT.mono, fontSize: 20, color: C.text, marginTop: 16 }}>
          found {Math.round(14 * barP)} · expected ≤ 5 · 2,268 payments tested
        </div>
      </div>
      {/* Right column: the flags, the three figures, the review state. */}
      <div style={{ position: 'absolute', left: 990, top: 150, width: 630 }}>
        {[
          ['ABOVE EXPECTED BAND', '14 found against the 5 this control’s own history leads us to expect in 30 days.'],
          ['REVIEW OVERDUE', '3 awaiting investigation or review; the oldest was raised 13 days ago.'],
        ].map(([t, body], i) => {
          const p = prog(frame, T.control + 18 + i * 8, T.control + 30 + i * 8)
          return (
            <div
              key={t}
              style={{
                background: `${C.exception}14`,
                borderLeft: `4px solid ${C.exception}`,
                borderRadius: 6,
                padding: '16px 20px',
                marginBottom: 14,
                opacity: p,
                transform: `translateX(${(1 - p) * 30}px)`,
              }}
            >
              <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 18, letterSpacing: '0.12em', color: '#fff' }}>{t}</div>
              <div style={{ fontFamily: FONT.sans, fontSize: 19, color: C.text, marginTop: 8, lineHeight: 1.35 }}>{body}</div>
            </div>
          )
        })}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginTop: 20 }}>
          {(
            [
              ['FOUND', 14, 'no human action reduces this', 36],
              ['OUTSTANDING', 3, 'not yet investigated and reviewed', 42],
              ['CONFIRMED', 5, '£620,400, confirmed real, still open', 48],
            ] as const
          ).map(([label, n, sub, at]) => (
            <div key={label} style={{ opacity: fig(at) }}>
              <div style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: '0.16em', color: C.soft }}>{label}</div>
              <div style={{ fontFamily: FONT.mono, fontSize: 52, fontWeight: 600, color: '#fff', marginTop: 6 }}>
                {Math.round(n * fig(at))}
              </div>
              <div style={{ fontFamily: FONT.sans, fontSize: 17, color: C.soft, lineHeight: 1.3 }}>{sub}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 26, fontFamily: FONT.mono, fontSize: 16, letterSpacing: '0.16em', color: C.soft }}>REVIEW STATE</div>
        <div style={{ display: 'flex', gap: 7, marginTop: 12 }}>
          {MARKS.map((m, i) => (
            <span
              key={i}
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                boxSizing: 'border-box',
                background: m === 'reviewed' ? C.assure : m === 'returned' ? C.exceptionRed : 'transparent',
                border: m === 'raised' ? `2.5px solid ${C.text}` : 'none',
                opacity: prog(frame, T.control + 50 + i * 1.2, T.control + 56 + i * 1.2),
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: 'inline-block',
            marginTop: 30,
            padding: '16px 24px',
            border: `2px solid ${C.assureBright}`,
            borderRadius: 8,
            background: `rgba(25,201,180,${0.06 + hover * 0.18})`,
            fontFamily: FONT.mono,
            fontSize: 18,
            whiteSpace: 'nowrap',
            color: C.assureBright,
            opacity: prog(frame, T.control + 58, T.control + 70),
            transform: `scale(${frame >= T.toException && frame < T.toException + 5 ? 0.96 : 1})`,
          }}
        >
          Which transaction fired, and why — 14 exceptions →
        </div>
      </div>
    </div>
  )
}

// --- Layer 4: the exception, and the AI draft --------------------------------

const DRAWER = { x: 520, w: 1280 }

const ExceptionDrawer: React.FC<{ frame: number }> = ({ frame }) => {
  const inP = prog(frame, T.exception, T.exception + 20, easeOut)
  if (inP <= 0) return null
  const hist = [
    ['RAISED BY A RUN', 'Monitoring engine · 10 Sep 05:30', null],
    ['INVESTIGATION STARTED', 'Aoife Brennan, entity controls auditor · 11 Sep', null],
    ['DISPOSITION', 'Aoife Brennan · “not an exception — data defect”', null],
    ['RETURNED', 'Callum Reid, reviewer · 13 Sep', 'No comparison to source is cited. Re-perform it before concluding a data defect.'],
  ] as const
  const chars = Math.floor(DRAFT.length * prog(frame, T.typeFrom, T.typeTo, x => x))
  const typing = frame >= T.typeFrom && frame < T.typeTo + 20
  const caretOn = typing && Math.floor(frame / 6) % 2 === 0
  const btnHover = prog(frame, T.draft - 14, T.draft - 4)
  const drafted = prog(frame, T.typeTo, T.typeTo + 10)
  return (
    <div
      style={{
        position: 'absolute',
        left: DRAWER.x + (1 - inP) * 700,
        top: TOP - 10,
        width: DRAWER.w,
        height: 730,
        background: C.ink2,
        border: `1.5px solid ${C.hair}`,
        borderLeft: `6px solid ${C.exceptionRed}`,
        borderRadius: 14,
        boxShadow: '-40px 0 90px rgba(0,0,0,0.65)',
        padding: '32px 44px',
        boxSizing: 'border-box',
        opacity: inP,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
        <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 30, color: '#fff' }}>AP-2026-1111</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 30, color: '#fff' }}>£58,250</span>
        <span style={{ fontFamily: FONT.sans, fontSize: 20, color: C.soft }}>raised 10 Sep 2026</span>
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: FONT.mono,
            fontSize: 16,
            letterSpacing: '0.06em',
            color: C.text,
            background: C.bg,
            padding: '6px 12px',
            borderRadius: 4,
          }}
        >
          returned by the reviewer
        </span>
      </div>
      <div style={{ marginTop: 24, opacity: prog(frame, T.exception + 10, T.exception + 22) }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 16, letterSpacing: '0.16em', color: C.soft }}>WHAT THE RUN SAW — RE-PERFORMABLE EVIDENCE</div>
        <div style={{ fontFamily: FONT.sans, fontSize: 23, color: C.text, marginTop: 8, lineHeight: 1.35 }}>
          Approved by a user whose delegated limit on 8 Sep was <b style={{ color: '#fff' }}>£25,000</b>, against a payment of{' '}
          <b style={{ color: '#fff' }}>£58,250</b>.
        </div>
      </div>
      <div style={{ marginTop: 24, fontFamily: FONT.mono, fontSize: 16, letterSpacing: '0.16em', color: C.soft, opacity: prog(frame, T.exception + 14, T.exception + 24) }}>
        HISTORY
      </div>
      {hist.map(([k, who, note], i) => {
        const p = prog(frame, T.exception + 18 + i * 8, T.exception + 30 + i * 8)
        const red = k === 'RETURNED'
        return (
          <div
            key={k}
            style={{
              marginTop: 10,
              paddingLeft: 18,
              borderLeft: `3px solid ${red ? C.exceptionRed : C.hair}`,
              opacity: p,
              transform: `translateY(${(1 - p) * 10}px)`,
            }}
          >
            <div style={{ fontFamily: FONT.mono, fontSize: 18, color: C.text }}>
              <span style={{ color: red ? C.exceptionRed : '#fff', fontWeight: 600, letterSpacing: '0.06em' }}>{k}</span>
              <span style={{ color: C.soft }}> · {who}</span>
            </div>
            {note && <div style={{ fontFamily: FONT.sans, fontSize: 19, color: C.text, marginTop: 4 }}>{note}</div>}
          </div>
        )
      })}
      <div style={{ marginTop: 26, fontFamily: FONT.mono, fontSize: 16, letterSpacing: '0.16em', color: C.soft, opacity: prog(frame, T.exception + 46, T.exception + 56) }}>
        YOUR RATIONALE — THE COMMENT A REVIEWER READS
      </div>
      <div
        style={{
          marginTop: 10,
          height: 170,
          background: C.bg,
          border: `1.5px solid ${typing || drafted > 0 ? C.assureBright : C.hair}`,
          borderRadius: 8,
          padding: '16px 20px',
          boxSizing: 'border-box',
          fontFamily: FONT.sans,
          fontSize: 21,
          lineHeight: 1.45,
          color: chars > 0 ? '#fff' : C.soft,
          opacity: prog(frame, T.exception + 48, T.exception + 58),
          boxShadow: typing ? `0 0 40px ${C.assure}33` : 'none',
        }}
      >
        {chars > 0 ? DRAFT.slice(0, chars) : 'What you looked at, what you concluded, and why.'}
        {caretOn && <span style={{ display: 'inline-block', width: 3, height: 24, background: C.assureBright, marginLeft: 2, verticalAlign: -4 }} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 18, opacity: prog(frame, T.exception + 52, T.exception + 62) }}>
        <div
          style={{
            position: 'relative',
            padding: '14px 24px',
            border: `2px solid ${C.assureBright}`,
            borderRadius: 8,
            background: `rgba(25,201,180,${0.06 + btnHover * 0.2})`,
            fontFamily: FONT.mono,
            fontSize: 21,
            color: C.assureBright,
            transform: `scale(${frame >= T.draft && frame < T.draft + 5 ? 0.95 : 1})`,
            whiteSpace: 'nowrap',
          }}
        >
          {frame >= T.draft && frame < T.typeTo ? 'Drafting…' : 'Draft with AI'}
        </div>
        <div style={{ fontFamily: FONT.sans, fontSize: 18, color: C.soft, lineHeight: 1.35 }}>
          {drafted > 0 ? (
            <span style={{ color: C.text, opacity: drafted }}>
              Written by AI from this exception’s own facts. The evidence reference, owner and date stay with the auditor.
            </span>
          ) : (
            'Drafts the rationale only, from this exception’s own facts.'
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------

export const Monitoring: React.FC = () => {
  const frame = useCurrentFrame()
  const fade = useSceneFade(12, 14)
  // A slow push across the whole scene, so nothing is ever quite still.
  const push = interpolate(frame, [0, 480], [1, 1.035], clamp)
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fade }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 30% 20%, ${C.assure}14 0%, transparent 55%)`,
        }}
      />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: '50% 60%' }}>
        <Tiles frame={frame} />
        <FinancePanel frame={frame} />
        <ControlCard frame={frame} />
        <ExceptionDrawer frame={frame} />
        <Cursor
          frame={frame}
          path={[
            { f: 72, x: 1300, y: 980 },
            { f: T.toFinance - 6, x: tileX(0) + 230, y: TILE_Y + 60 },
            { f: T.finance + 60, x: tileX(0) + 230, y: TILE_Y + 60 },
            { f: T.toControl - 6, x: 620, y: 536 },
            { f: T.control + 60, x: 620, y: 536 },
            { f: T.toException - 6, x: 1500, y: 928 },
            { f: T.exception + 50, x: 1500, y: 928 },
            { f: T.draft - 6, x: 676, y: 876 },
            { f: T.draft + 30, x: 676, y: 876 },
          ]}
          clicks={[T.toFinance, T.toControl, T.toException, T.draft]}
        />
      </AbsoluteFill>
      <Header frame={frame} />
    </AbsoluteFill>
  )
}
