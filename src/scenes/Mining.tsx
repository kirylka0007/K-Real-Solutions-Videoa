import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import data from '../data/p2p.json'
import { Count, Kicker, clamp, easeInOut, prog, useSceneFade } from '../components/kit'
import { C, FONT } from '../theme'

/**
 * Process mining, eighteen seconds.
 *
 * The map is not a screenshot. It is drawn from the engine's own output for the
 * Procure-to-Pay demo population — ten activities, twenty transitions, 2,671
 * events — exported by `scripts/export-pm.ts` in the process mining repo, so
 * every node, every edge weight and every figure on screen is the product's.
 * Drawn natively because the thing worth showing is the map *assembling* from
 * the log and the traffic *moving* through it, and a still cannot do either.
 *
 * Then the findings arrive, and each one lights the activity it is about.
 */

type Node = (typeof data.nodes)[number]
type Edge = (typeof data.edges)[number]

const happy = new Set(data.happyPath)
const maxDepth = Math.max(...data.nodes.map(n => n.depth))
const maxFreq = Math.max(...data.edges.map(e => e.freq))

/** Off-path activities alternate either side of the happy path, by depth. */
const offSide: Record<string, 1 | -1> = {}
data.nodes
  .filter(n => !happy.has(n.label))
  .sort((a, b) => a.depth - b.depth)
  .forEach((n, i) => (offSide[n.label] = i % 2 === 0 ? 1 : -1))

const byLabel = new Map(data.nodes.map(n => [n.label, n]))

type Pt = { x: number; y: number }
type Bez = [Pt, Pt, Pt, Pt]

/**
 * The map's geometry for a frame shape. Landscape runs the process left to
 * right; the 4:5 portrait runs it top to bottom, which is what the extra height
 * is for — the same map, turned, rather than the landscape one shrunk.
 */
interface Geometry {
  posOf: (n: Node) => Pt
  curveOf: (e: Edge) => Bez | null
}

const geometry = (portrait: boolean): Geometry => {
  // Flow axis (along the process) and cross axis (to the side of it).
  const [flowFrom, flowTo, mid, off] = portrait ? [400, 1180, 540, 290] : [150, 1770, 620, 175]
  const posOf = (n: Node): Pt => {
    const along = flowFrom + (n.depth / maxDepth) * (flowTo - flowFrom)
    const across = happy.has(n.label) ? mid : mid + off * offSide[n.label]
    return portrait ? { x: across, y: along } : { x: along, y: across }
  }
  // Every edge as a cubic, so a particle's position can be computed rather than measured.
  const curveOf = (e: Edge): Bez | null => {
    const a = byLabel.get(e.from)
    const b = byLabel.get(e.to)
    if (!a || !b || e.from === e.to) return null
    const p0 = posOf(a)
    const p3 = posOf(b)
    const acrossOf = (p: Pt) => (portrait ? p.x : p.y)
    const alongOf = (p: Pt) => (portrait ? p.y : p.x)
    if (e.back) {
      // Rework runs back against the flow: arc it well clear of the main line,
      // on the side its off-path end sits.
      const span = Math.abs(alongOf(p3) - alongOf(p0))
      const size = Math.min(portrait ? 200 : Infinity, 150 + span * 0.18)
      const lift = size * (acrossOf(p0) > mid || acrossOf(p3) > mid ? 1 : -1)
      return portrait
        ? [p0, { x: p0.x + lift, y: p0.y }, { x: p3.x + lift, y: p3.y }, p3]
        : [p0, { x: p0.x, y: p0.y + lift }, { x: p3.x, y: p3.y + lift }, p3]
    }
    if (portrait) {
      const dy = (p3.y - p0.y) * 0.45
      return [p0, { x: p0.x, y: p0.y + dy }, { x: p3.x, y: p3.y - dy }, p3]
    }
    const dx = (p3.x - p0.x) * 0.45
    return [p0, { x: p0.x + dx, y: p0.y }, { x: p3.x - dx, y: p3.y }, p3]
  }
  return { posOf, curveOf }
}

const LANDSCAPE = geometry(false)
const PORTRAIT = geometry(true)

const bez = ([p0, p1, p2, p3]: Bez, t: number): Pt => {
  const u = 1 - t
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  }
}
const pathD = ([p0, p1, p2, p3]: Bez) =>
  `M${p0.x},${p0.y} C${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`

/** When each piece of the map arrives. */
const BUILD = 34
const STEP = 9
const nodeAt = (n: Node) => BUILD + n.depth * STEP
const edgeAt = (e: Edge) =>
  BUILD + Math.max(byLabel.get(e.from)?.depth ?? 0, byLabel.get(e.to)?.depth ?? 0) * STEP + 5

/** The three findings shown, and the activity each one is about. */
const FINDINGS = [
  { f: data.findings[0], node: 'Payment Block Removed', at: 352 },
  { f: data.findings[1], node: 'Vendor Bank Details Changed', at: 398 },
  { f: data.findings[3], node: 'Goods Receipt Posted', at: 444 },
]
const PANEL_AT = 300

const money = (n: number) =>
  n >= 1e6 ? `£${(n / 1e6).toFixed(1)}m` : `£${Math.round(n).toLocaleString('en-GB')}`

export const Mining: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const portrait = height > width
  const { posOf, curveOf } = portrait ? PORTRAIT : LANDSCAPE
  const fade = useSceneFade()

  // Beat C: the map steps back to the left to make room for the findings.
  const aside = prog(frame, PANEL_AT - 10, PANEL_AT + 26, easeInOut)
  // Landscape: beside a 780px panel the map has ~1,000px; 0.57 fits its full
  // width (nodes included) with a margin. Portrait: the upright map takes a
  // ~460px left column beside a 520px panel.
  const mapScale = 1 - aside * (portrait ? 0.38 : 0.43)
  const mapShiftX = -aside * (portrait ? 278 : 414)
  const mapShiftY = aside * (portrait ? -10 : 40)

  const lit = (label: string) =>
    FINDINGS.some(x => x.node === label && frame >= x.at) ? 1 : 0

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fade, overflow: 'hidden' }}>
      {/* Faint engineering grid: this is a system at work, not a slide. */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.hair} 1px, transparent 1px), linear-gradient(90deg, ${C.hair} 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          opacity: 0.18 * prog(frame, 0, 40),
          maskImage: 'radial-gradient(ellipse at 50% 55%, black 30%, transparent 75%)',
        }}
      />

      {/* A: the claim. Leaves once the map has made it for itself. */}
      <div
        style={{
          position: 'absolute',
          left: portrait ? 60 : 150,
          right: portrait ? 60 : undefined,
          top: portrait ? 90 : 96,
          opacity: 1 - prog(frame, 150, 176),
          transform: `translateY(${-prog(frame, 150, 176) * 30}px)`,
        }}
      >
        <Kicker eyebrow="Process mining" headline="Every transaction. Not a sample" start={4} size={portrait ? 70 : 76} />
      </div>

      {/* B: the figures, straight off the engine. */}
      <div
        style={{
          position: 'absolute',
          left: portrait ? 60 : 150,
          right: portrait ? 60 : 150,
          top: portrait ? 80 : 110,
          display: 'flex',
          flexWrap: 'wrap',
          columnGap: portrait ? 56 : 64,
          rowGap: 34,
          opacity: prog(frame, 168, 190) * (1 - aside * 0.0),
          transform: `translateY(${(1 - prog(frame, 168, 196)) * 24}px)`,
        }}
      >
        {[
          { v: <Count to={data.kpis.transactions} start={172} />, l: 'transactions tested', c: '#fff' },
          { v: <Count to={data.kpis.events} start={176} />, l: 'events in the log', c: '#fff' },
          { v: <Count to={data.kpis.value} start={180} format={money} />, l: 'population value', c: '#fff' },
          { v: <Count to={data.kpis.atRisk} start={196} />, l: 'transactions at risk', c: C.exceptionRed },
          { v: <Count to={data.kpis.valueAtRisk} start={200} format={money} />, l: 'value at risk', c: C.exception },
        ].map((k, i) => (
          <div key={i} style={{ opacity: prog(frame, 170 + i * 5, 186 + i * 5) }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: portrait ? 60 : 64, color: k.c, lineHeight: 1 }}>
              {k.v}
            </div>
            <div
              style={{
                marginTop: 10,
                fontFamily: FONT.mono,
                fontSize: portrait ? 15 : 17,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: C.soft,
              }}
            >
              {k.l}
            </div>
          </div>
        ))}
      </div>

      {/* The map. */}
      <svg
        width={width}
        height={height}
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${mapShiftX}px, ${mapShiftY}px) scale(${mapScale})`,
          transformOrigin: '50% 58%',
        }}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges, drawn on. */}
        {data.edges.map((e, i) => {
          const c = curveOf(e)
          if (!c) return null
          const t = prog(frame, edgeAt(e), edgeAt(e) + 18)
          const w = 1.4 + (e.freq / maxFreq) * 6
          const colour = e.back ? C.exceptionRed : C.assure
          return (
            <path
              key={i}
              d={pathD(c)}
              pathLength={1}
              fill="none"
              stroke={colour}
              strokeOpacity={e.back ? 0.75 : 0.42}
              strokeWidth={w}
              strokeLinecap="round"
              strokeDasharray={e.back ? '0.012 0.012' : '1 1'}
              strokeDashoffset={e.back ? -frame * 0.002 : 1 - t}
              style={{ opacity: e.back ? t : 1 }}
            />
          )
        })}

        {/* Traffic: particles in proportion to how often each transition was taken. */}
        {data.edges.map((e, i) => {
          const c = curveOf(e)
          if (!c) return null
          const start = edgeAt(e) + 14
          if (frame < start) return null
          const n = Math.max(1, Math.round((e.freq / maxFreq) * 5))
          const speed = 70 // frames to traverse
          return Array.from({ length: n }, (_, k) => {
            const t = (((frame - start) / speed + k / n) % 1 + 1) % 1
            const p = bez(c, t)
            return (
              <circle
                key={`${i}-${k}`}
                cx={p.x}
                cy={p.y}
                r={e.back ? 5 : 4}
                fill={e.back ? C.exceptionRed : C.assureBright}
                opacity={Math.sin(t * Math.PI) * 0.95}
                filter="url(#glow)"
              />
            )
          })
        })}

        {/* Activities. */}
        {data.nodes.map(n => {
          const { x, y } = posOf(n)
          const s = spring({ frame: frame - nodeAt(n), fps, config: { damping: 13, mass: 0.55 } })
          const hot = lit(n.label)
          // A lit activity grows as the map shrinks, so its name stays readable.
          const pulse = hot ? (1 + 0.08 * Math.sin(frame / 4)) * (1 + aside * 0.4) : 1
          const onPath = happy.has(n.label)
          const w = 168
          const h = 70
          const stroke = hot ? C.exceptionRed : onPath ? C.assure : C.soft
          const dim = aside > 0 && !hot ? 1 - aside * 0.35 : 1
          return (
            <g key={n.id} transform={`translate(${x}, ${y}) scale(${s * pulse})`} opacity={dim}>
              {hot ? (
                <rect
                  x={-w / 2 - 10}
                  y={-h / 2 - 10}
                  width={w + 20}
                  height={h + 20}
                  rx={18}
                  fill="none"
                  stroke={C.exceptionRed}
                  strokeWidth={3}
                  opacity={0.35 + 0.35 * Math.sin(frame / 4)}
                  filter="url(#glow)"
                />
              ) : null}
              <rect
                x={-w / 2}
                y={-h / 2}
                width={w}
                height={h}
                rx={12}
                fill={hot ? '#2A1210' : C.ink2}
                stroke={stroke}
                strokeWidth={hot ? 2.6 : 1.6}
              />
              <foreignObject x={-w / 2 + 8} y={-h / 2 + 7} width={w - 16} height={h - 14}>
                <div
                  style={{
                    fontFamily: FONT.sans,
                    fontWeight: 600,
                    fontSize: 15,
                    lineHeight: 1.15,
                    color: '#fff',
                    textAlign: 'center',
                  }}
                >
                  {n.label}
                </div>
                <div
                  style={{
                    marginTop: 3,
                    fontFamily: FONT.mono,
                    fontSize: 12,
                    color: hot ? C.exceptionRed : C.soft,
                    textAlign: 'center',
                  }}
                >
                  {n.freq.toLocaleString('en-GB')}
                </div>
              </foreignObject>
            </g>
          )
        })}
      </svg>

      {/* A caption under the map while it builds, naming what the red is. */}
      <div
        style={{
          position: 'absolute',
          left: portrait ? 60 : 150,
          bottom: portrait ? 64 : 92,
          fontFamily: FONT.mono,
          fontSize: portrait ? 16 : 19,
          letterSpacing: '0.12em',
          color: C.soft,
          opacity: prog(frame, 150, 170) * (1 - aside),
          display: 'flex',
          flexDirection: portrait ? 'column' : 'row',
          gap: portrait ? 10 : 36,
        }}
      >
        <span>
          <span style={{ color: C.assureBright }}>━</span>&nbsp; the documented path
        </span>
        <span>
          <span style={{ color: C.exceptionRed }}>━</span>&nbsp; rework — the process running backwards
        </span>
      </div>

      {/* C: the findings. */}
      <FindingsPanel frame={frame} portrait={portrait} />
    </AbsoluteFill>
  )
}

const SEV: Record<string, { label: string; colour: string }> = {
  critical: { label: 'CRITICAL', colour: C.exceptionRed },
  high: { label: 'HIGH', colour: C.exception },
  medium: { label: 'MEDIUM', colour: C.exception },
}

const FindingsPanel: React.FC<{ frame: number; portrait: boolean }> = ({ frame, portrait }) => {
  const enter = prog(frame, PANEL_AT, PANEL_AT + 24)
  const scanning = frame >= PANEL_AT + 6 && frame < FINDINGS[0].at
  const scanP = prog(frame, PANEL_AT + 6, FINDINGS[0].at)
  return (
    <div
      style={{
        position: 'absolute',
        top: portrait ? 330 : 250,
        right: portrait ? 30 : 60,
        width: portrait ? 530 : 780,
        opacity: enter,
        transform: `translateX(${(1 - enter) * 80}px)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
        <Sparkle frame={frame} />
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: portrait ? 19 : 22,
            letterSpacing: '0.3em',
            color: C.assureBright,
            whiteSpace: 'nowrap',
          }}
        >
          AI FINDINGS
        </div>
        <div style={{ flex: 1, height: 1, background: C.hair }} />
        <div style={{ fontFamily: FONT.mono, fontSize: portrait ? 14 : 16, color: C.soft, whiteSpace: 'nowrap' }}>
          {scanning ? `reading ${Math.round(scanP * 2671).toLocaleString('en-GB')} events…` : '398 transactions · 9 tests'}
        </div>
      </div>

      {/* The scan: a bar that fills while the population is read. */}
      <div
        style={{
          height: 3,
          background: C.hair,
          borderRadius: 2,
          overflow: 'hidden',
          marginBottom: 26,
          opacity: 1 - prog(frame, FINDINGS[0].at, FINDINGS[0].at + 10),
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${scanP * 100}%`,
            background: `linear-gradient(90deg, ${C.assure}, ${C.assureBright})`,
            boxShadow: `0 0 16px ${C.assureBright}`,
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: portrait ? 14 : 18 }}>
        {FINDINGS.map(({ f, at }, i) => {
          const p = prog(frame, at, at + 16)
          if (frame < at) return null
          const sev = SEV[f.severity] ?? SEV.medium
          const chars = Math.round(prog(frame, at + 2, at + 22) * f.title.length)
          return (
            <div
              key={i}
              style={{
                opacity: p,
                transform: `translateY(${(1 - p) * 26}px)`,
                background: `linear-gradient(90deg, ${sev.colour}1c, ${C.ink}cc 40%)`,
                border: `1px solid ${sev.colour}55`,
                borderLeft: `4px solid ${sev.colour}`,
                borderRadius: 12,
                padding: portrait ? '16px 20px' : '20px 26px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: portrait ? 'wrap' : 'nowrap' }}>
                <span
                  style={{
                    fontFamily: FONT.mono,
                    fontWeight: 600,
                    fontSize: 15,
                    letterSpacing: '0.18em',
                    color: sev.colour,
                  }}
                >
                  {sev.label}
                </span>
                <span
                  style={{
                    fontFamily: FONT.display,
                    fontWeight: 700,
                    fontSize: portrait ? 29 : 33,
                    lineHeight: 1.15,
                    color: '#fff',
                    // Portrait: the title takes its own line under severity and value.
                    order: portrait ? 3 : 0,
                    flexBasis: portrait ? '100%' : 'auto',
                  }}
                >
                  {f.title.slice(0, chars)}
                  <span style={{ opacity: chars < f.title.length ? 1 : 0, color: C.assureBright }}>▍</span>
                </span>
                <span style={{ flex: 1 }} />
                {f.valueAtRisk ? (
                  <span
                    style={{
                      fontFamily: FONT.display,
                      fontWeight: 700,
                      fontSize: portrait ? 29 : 33,
                      color: sev.colour,
                      opacity: prog(frame, at + 16, at + 26),
                    }}
                  >
                    {money(f.valueAtRisk)}
                  </span>
                ) : null}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontFamily: FONT.sans,
                  fontSize: portrait ? 18 : 21,
                  lineHeight: 1.35,
                  color: C.text,
                  opacity: prog(frame, at + 14, at + 28),
                }}
              >
                {f.condition}
              </div>
            </div>
          )
        })}
      </div>

      {/* The line that lands it. */}
      <div
        style={{
          marginTop: portrait ? 22 : 30,
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: portrait ? 30 : 34,
          color: '#fff',
          opacity: prog(frame, 492, 510),
          transform: `translateY(${(1 - prog(frame, 492, 514)) * 16}px)`,
        }}
      >
        Found on the whole population.
        <span style={{ display: 'block', color: C.assureBright }}>Not on a sample of 25</span>
      </div>
    </div>
  )
}

/** A four-point sparkle that turns while the model works. */
const Sparkle: React.FC<{ frame: number }> = ({ frame }) => {
  const rot = interpolate(frame, [PANEL_AT, PANEL_AT + 200], [0, 180], clamp)
  return (
    <svg width={34} height={34} viewBox="-12 -12 24 24" style={{ transform: `rotate(${rot}deg)` }}>
      <path
        d="M0,-11 C1.2,-3 3,-1.2 11,0 C3,1.2 1.2,3 0,11 C-1.2,3 -3,1.2 -11,0 C-3,-1.2 -1.2,-3 0,-11Z"
        fill={C.assureBright}
      />
    </svg>
  )
}
