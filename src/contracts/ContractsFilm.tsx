import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion'
import { Fonts } from '../fonts'
import { Atmosphere, Kicker, Lockup, PulseDot, easeInOut, prog, useSceneFade } from '../components/kit'
import { C, FONT } from '../theme'
import { ANSWER, COUNTS, DOCS, PARTIES, PRECEDENCE, PROVISIONS, QUESTION, inForce, type Doc, type Version } from './data'

/**
 * A film about one idea: many contract documents, read in the right order,
 * become one living document of the terms in force, which people and AI agents
 * can both ask questions of.
 *
 * Silent by design (no licensed track is required to render it): feed video
 * often plays muted, so every scene carries its message in text.
 */
export const CSCENES = {
  hook: { from: 0, duration: 150 }, //       0–5s
  order: { from: 150, duration: 300 }, //    5–15s
  supersede: { from: 450, duration: 330 }, // 15–26s
  living: { from: 780, duration: 270 }, //   26–35s
  ask: { from: 1050, duration: 300 }, //     35–45s
  close: { from: 1350, duration: 165 }, //   45–50.5s
} as const
export const CTOTAL = 1515

const SERVICE_LINE = 'We build practical analytics and AI solutions for internal audit and compliance teams'

const usePortrait = () => {
  const { width, height } = useVideoConfig()
  return height > width
}

export const ContractsFilm: React.FC<{ coverLead?: number }> = ({ coverLead = 0 }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Fonts />
    {coverLead > 0 && (
      <Sequence durationInFrames={coverLead}>
        <Hook hold />
      </Sequence>
    )}
    <Sequence from={coverLead}>
      <Sequence from={CSCENES.hook.from} durationInFrames={CSCENES.hook.duration}>
        <Hook />
      </Sequence>
      <Sequence from={CSCENES.order.from} durationInFrames={CSCENES.order.duration}>
        <Order />
      </Sequence>
      <Sequence from={CSCENES.supersede.from} durationInFrames={CSCENES.supersede.duration}>
        <Supersede />
      </Sequence>
      <Sequence from={CSCENES.living.from} durationInFrames={CSCENES.living.duration}>
        <Living />
      </Sequence>
      <Sequence from={CSCENES.ask.from} durationInFrames={CSCENES.ask.duration}>
        <Ask />
      </Sequence>
      <Sequence from={CSCENES.close.from} durationInFrames={CSCENES.close.duration}>
        <Close />
      </Sequence>
      <Atmosphere />
      <DemoLabel />
    </Sequence>
  </AbsoluteFill>
)

const DemoLabel: React.FC = () => {
  const frame = useCurrentFrame()
  const portrait = usePortrait()
  const from = CSCENES.order.from
  const to = CSCENES.close.from
  const o = prog(frame, from + 10, from + 30) * (1 - prog(frame, to - 20, to))
  return (
    <div
      style={{
        position: 'absolute',
        right: portrait ? 0 : 36,
        left: portrait ? 0 : undefined,
        textAlign: portrait ? 'center' : 'right',
        bottom: 26,
        fontFamily: FONT.mono,
        fontSize: 15,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: C.soft,
        opacity: 0.8 * o,
      }}
    >
      Demonstration data · invented organisations
    </div>
  )
}

/* ------------------------------------------------------------------ kit */

const KIND_COLOUR: Record<Doc['kind'], string> = {
  Agreement: C.paperBlue,
  Schedule: C.paperSoft,
  Amendment: C.paperGreen,
  'Side letter': C.paperAmber,
  Email: C.paperRed,
}

/** A PDF as a small cream page: kind, title, date, and a few ruled lines. */
const Page: React.FC<{ doc: Doc; w: number }> = ({ doc, w }) => {
  const h = w * 1.3
  return (
    <div
      style={{
        width: w,
        height: h,
        background: C.paper,
        borderRadius: 6,
        padding: w * 0.09,
        boxShadow: '0 18px 40px rgba(0,0,0,0.55)',
        display: 'flex',
        flexDirection: 'column',
        gap: w * 0.045,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          alignSelf: 'flex-start',
          fontFamily: FONT.mono,
          fontSize: w * 0.062,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#fff',
          background: KIND_COLOUR[doc.kind],
          padding: `${w * 0.015}px ${w * 0.04}px`,
          borderRadius: 3,
        }}
      >
        {doc.kind}
      </div>
      <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: w * 0.085, lineHeight: 1.12, color: C.paperText }}>
        {doc.title}
      </div>
      <div style={{ fontFamily: FONT.mono, fontSize: w * 0.06, color: C.paperSoft }}>{doc.date}</div>
      {[0.92, 0.8, 0.88, 0.7, 0.84, 0.6].map((l, i) => (
        <div key={i} style={{ height: w * 0.022, width: `${l * 100}%`, background: C.paperRule, borderRadius: 2 }} />
      ))}
    </div>
  )
}

const Stage: React.FC<{ children: React.ReactNode; inF?: number; outF?: number; hold?: boolean }> = ({ children, inF = 12, outF = 14, hold = false }) => {
  const fade = useSceneFade(inF, outF)
  return <AbsoluteFill style={{ background: C.bg, opacity: hold ? 1 : fade }}>{children}</AbsoluteFill>
}

/* ------------------------------------------------------------------ 1. hook */

const Hook: React.FC<{ hold?: boolean }> = ({ hold = false }) => {
  const live = useCurrentFrame()
  const frame = hold ? COVER_AT : live
  const portrait = usePortrait()
  const w = portrait ? 190 : 210
  const spread = portrait ? 120 : 190
  return (
    <Stage inF={1} hold={hold}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 62%, ${C.assure}1f 0%, transparent 45%)` }} />
      <div style={{ position: 'absolute', top: portrait ? 90 : 70, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Lockup scale={0.6} start={hold ? -200 : 0} tagline={false} trackFrom={0.3} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: portrait ? 230 : 180,
          left: 60,
          right: 60,
          textAlign: 'center',
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: portrait ? 76 : 84,
          lineHeight: 1.05,
          letterSpacing: '-0.025em',
          color: '#fff',
          opacity: prog(frame, 8, 26),
          transform: `translateY(${(1 - prog(frame, 8, 30)) * 30}px)`,
        }}
      >
        Which terms are<br />actually in force?
      </div>
      {/* Six PDFs land in a loose fan: the pile everyone has, and nobody wants to read again. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: portrait ? 640 : 520, height: w * 1.3, display: 'flex', justifyContent: 'center' }}>
        {DOCS.map((d, i) => {
          const p = prog(frame, 30 + i * 9, 52 + i * 9)
          const mid = (DOCS.length - 1) / 2
          const x = (i - mid) * spread * 0.62
          const rot = (i - mid) * 5
          return (
            <div
              key={d.id}
              style={{
                position: 'absolute',
                transform: `translate(${x}px, ${(1 - p) * -260 + Math.abs(i - mid) * 14}px) rotate(${rot * p}deg)`,
                opacity: p,
              }}
            >
              <Page doc={d} w={w} />
            </div>
          )
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: portrait ? 150 : 70,
          textAlign: 'center',
          fontFamily: FONT.mono,
          fontSize: portrait ? 24 : 24,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: C.soft,
          opacity: prog(frame, 92, 110),
        }}
      >
        Agreements · amendments · side letters · emails
      </div>
    </Stage>
  )
}

/* ------------------------------------------------------------------ 2. order */

const Order: React.FC = () => {
  const frame = useCurrentFrame()
  const portrait = usePortrait()
  const pad = portrait ? 70 : 120
  return (
    <Stage>
      <div style={{ position: 'absolute', left: pad, right: pad, top: portrait ? 110 : 90 }}>
        <Kicker eyebrow="Read in order" headline="Every document. In its place" size={portrait ? 70 : 76} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: pad,
          right: pad,
          top: portrait ? 380 : 330,
          display: 'flex',
          flexDirection: portrait ? 'column' : 'row',
          gap: portrait ? 40 : 70,
        }}
      >
        {/* The timeline: each document in date order, the email flagged. */}
        <div style={{ flex: portrait ? undefined : 1.35, display: 'flex', flexDirection: 'column', gap: portrait ? 12 : 14 }}>
          {DOCS.map((d, i) => {
            const p = prog(frame, 30 + i * 10, 48 + i * 10)
            const flag = !d.binding ? prog(frame, 150, 168) : 0
            return (
              <div
                key={d.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 22,
                  padding: '14px 22px',
                  borderRadius: 10,
                  background: C.ink,
                  border: `1px solid ${flag ? C.exception : C.hair}`,
                  opacity: p,
                  transform: `translateX(${(1 - p) * -40}px)`,
                }}
              >
                <span style={{ fontFamily: FONT.mono, fontSize: 21, color: C.soft, width: 150, flex: 'none' }}>{d.date}</span>
                <span
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 16,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#fff',
                    background: KIND_COLOUR[d.kind],
                    padding: '4px 10px',
                    borderRadius: 4,
                    width: 150,
                    textAlign: 'center',
                    flex: 'none',
                  }}
                >
                  {d.kind}
                </span>
                <span style={{ fontFamily: FONT.sans, fontWeight: 500, fontSize: 25, color: C.text, flex: 1 }}>
                  {d.title}
                  {!d.binding && (
                    <span style={{ display: 'block', fontFamily: FONT.mono, fontSize: 17, color: C.exception, opacity: flag, marginTop: 4 }}>
                      {d.note}
                    </span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
        {/* The precedence ladder, taken from the agreement itself. */}
        <div
          style={{
            flex: portrait ? undefined : 1,
            alignSelf: 'flex-start',
            padding: '26px 30px',
            borderRadius: 14,
            border: `1px solid ${C.assure}66`,
            background: `${C.assure}12`,
            opacity: prog(frame, 100, 120),
            transform: `translateY(${(1 - prog(frame, 100, 124)) * 24}px)`,
          }}
        >
          <div style={{ fontFamily: FONT.mono, fontSize: 18, letterSpacing: '0.24em', textTransform: 'uppercase', color: C.assureBright }}>
            Order of precedence · clause 1.4
          </div>
          <div style={{ display: 'flex', flexDirection: portrait ? 'row' : 'column', flexWrap: 'wrap', gap: portrait ? 14 : 16, marginTop: 20 }}>
            {PRECEDENCE.map((t, i) => {
              const p = prog(frame, 116 + i * 8, 130 + i * 8)
              return (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: p }}>
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: C.assure,
                      color: '#fff',
                      fontFamily: FONT.display,
                      fontWeight: 700,
                      fontSize: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 'none',
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: portrait ? 25 : 28, color: '#fff' }}>{t}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Stage>
  )
}

/* ------------------------------------------------------------------ 3. supersede */

const STATUS_STYLE: Record<Version['status'], { colour: string; label: string }> = {
  superseded: { colour: C.soft, label: 'Superseded' },
  'in force': { colour: C.assureBright, label: 'In force' },
  'not applied': { colour: C.exception, label: 'Not applied' },
}

/** One clause's history: each version arrives, and the one it replaces is struck through. */
const ClauseCard: React.FC<{ index: number; start: number; compact: boolean }> = ({ index, start, compact }) => {
  const frame = useCurrentFrame()
  const p = PROVISIONS[index]
  const appear = prog(frame, start, start + 16)
  // Versions arrive in the order the documents were read; the in-force one last.
  const order = [...p.versions].sort((a, b) => rank(a) - rank(b))
  return (
    <div
      style={{
        borderRadius: 14,
        background: C.ink,
        border: `1px solid ${C.hair}`,
        padding: compact ? '20px 26px' : '24px 30px',
        opacity: appear,
        transform: `translateY(${(1 - appear) * 30}px)`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: compact ? 32 : 34, color: '#fff' }}>{p.topic}</span>
        <span style={{ fontFamily: FONT.mono, fontSize: 19, color: C.soft }}>{p.clause}</span>
      </div>
      {order.map((v, i) => {
        const at = start + 14 + i * 26
        const vin = prog(frame, at, at + 14)
        // A version is struck when the version that replaces it arrives. An
        // email that was never binding is struck as soon as it is read, and is
        // never shown as in force, not even for a frame.
        const inForceAt = start + 14 + (order.length - 1) * 26
        const struck =
          v.status === 'superseded' ? prog(frame, inForceAt + 4, inForceAt + 16) : v.status === 'not applied' ? prog(frame, at + 12, at + 24) : 0
        const shown: Version['status'] = v.status === 'superseded' && struck === 0 ? 'in force' : v.status
        const st = STATUS_STYLE[shown]
        return (
          <div
            key={v.doc + v.text}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              padding: '9px 0',
              borderTop: i === 0 ? 'none' : `1px solid ${C.hair}`,
              opacity: vin * (1 - struck * 0.45),
              transform: `translateX(${(1 - vin) * 30}px)`,
            }}
          >
            <span style={{ fontFamily: FONT.sans, fontSize: 22, color: C.soft, width: compact ? 340 : 300, flex: 'none', whiteSpace: 'nowrap' }}>
              {v.doc} {v.ref && <span style={{ fontFamily: FONT.mono, fontSize: 18 }}>· {v.ref}</span>}
            </span>
            <span style={{ flex: 1 }}>
            <span style={{ position: 'relative', display: 'inline-block', fontFamily: FONT.display, fontWeight: 700, fontSize: compact ? 30 : 32, color: '#fff' }}>
              {v.text}
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '52%',
                  height: 3,
                  width: `${struck * 100}%`,
                  maxWidth: '100%',
                  background: v.status === 'not applied' ? C.exception : C.soft,
                }}
              />
            </span>
            </span>
            <span
              style={{
                fontFamily: FONT.mono,
                fontSize: 16,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: st.colour,
                border: `1px solid ${st.colour}`,
                borderRadius: 999,
                padding: '4px 12px',
                flex: 'none',
              }}
            >
              {st.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const rank = (v: Version) => (v.status === 'in force' ? 2 : v.status === 'not applied' ? 1 : 0)

const Supersede: React.FC = () => {
  const portrait = usePortrait()
  const pad = portrait ? 70 : 120
  return (
    <Stage>
      <div style={{ position: 'absolute', left: pad, right: pad, top: portrait ? 110 : 80 }}>
        <Kicker eyebrow="Supersession" headline="Every amendment applied. Every answer sourced" size={portrait ? 66 : 70} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: pad,
          right: pad,
          top: portrait ? 400 : 300,
          display: 'grid',
          gridTemplateColumns: portrait ? '1fr' : '1fr 1fr',
          gap: portrait ? 22 : 26,
          alignItems: 'start',
        }}
      >
        <ClauseCard index={1} start={34} compact={!portrait} />
        <ClauseCard index={0} start={portrait ? 130 : 60} compact={!portrait} />
        <ClauseCard index={2} start={portrait ? 190 : 120} compact={!portrait} />
      </div>
    </Stage>
  )
}

/* ------------------------------------------------------------------ 4. living document */

const Living: React.FC = () => {
  const frame = useCurrentFrame()
  const portrait = usePortrait()
  const pad = portrait ? 70 : 120
  const paperIn = prog(frame, 30, 52)
  const stats: Array<[number, string]> = [
    [COUNTS.documents, 'documents read'],
    [COUNTS.provisions, 'provisions in force'],
    [COUNTS.superseded, 'superseded'],
    [COUNTS.notApplied, 'not applied'],
  ]
  return (
    <Stage>
      <div style={{ position: 'absolute', left: pad, right: pad, top: portrait ? 110 : 80 }}>
        <Kicker eyebrow="The living document" headline="The terms in force. One view" size={portrait ? 70 : 74} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: pad,
          right: pad,
          top: portrait ? 370 : 290,
          background: C.paper,
          borderRadius: 10,
          padding: portrait ? '30px 34px' : '30px 40px',
          boxShadow: '0 30px 70px rgba(0,0,0,0.6)',
          opacity: paperIn,
          transform: `translateY(${(1 - paperIn) * 40}px)`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `2px solid ${C.paperText}`, paddingBottom: 12 }}>
          <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: portrait ? 28 : 30, color: C.paperText }}>Current terms</span>
          <span style={{ fontFamily: FONT.mono, fontSize: 17, color: C.paperSoft }}>{PARTIES}</span>
        </div>
        {PROVISIONS.map((p, i) => {
          const v = inForce(p)
          const r = prog(frame, 50 + i * 9, 66 + i * 9)
          return (
            <div
              key={p.topic}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: portrait ? '13px 0' : '11px 0',
                borderBottom: `1px solid ${C.paperRule}`,
                opacity: r,
              }}
            >
              <span style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: portrait ? 23 : 24, color: C.paperText, width: portrait ? 270 : 330, flex: 'none' }}>
                {p.topic}
              </span>
              <span style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: portrait ? 25 : 27, color: C.paperText, flex: 1 }}>{v.text}</span>
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: portrait ? 15 : 16,
                  color: C.paperGreen,
                  border: `1px solid ${C.paperGreen}`,
                  borderRadius: 4,
                  padding: '3px 9px',
                  whiteSpace: 'nowrap',
                  flex: 'none',
                }}
              >
                {v.doc}
                {v.ref ? ` · ${v.ref}` : ''}
              </span>
            </div>
          )
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: pad,
          right: pad,
          top: portrait ? 880 : 800,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 20,
          opacity: prog(frame, 120, 140),
        }}
      >
        {stats.map(([n, label]) => (
          <div key={label} style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: portrait ? 52 : 56, color: label === 'not applied' ? C.exception : C.assureBright }}>{n}</div>
            <div style={{ fontFamily: FONT.mono, fontSize: portrait ? 15 : 17, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.soft }}>{label}</div>
          </div>
        ))}
      </div>
    </Stage>
  )
}

/* ------------------------------------------------------------------ 5. ask */

const Ask: React.FC = () => {
  const frame = useCurrentFrame()
  const portrait = usePortrait()
  const pad = portrait ? 70 : 220
  const typed = Math.floor(QUESTION.length * prog(frame, 40, 90, x => x))
  const thinking = frame > 92 && frame < 112
  const ans = prog(frame, 112, 130)
  return (
    <Stage>
      <div style={{ position: 'absolute', left: pad, right: pad, top: portrait ? 110 : 80 }}>
        <Kicker eyebrow="A knowledge layer for AI" headline="Ask it like you’d ask a colleague" size={portrait ? 62 : 70} />
      </div>
      <div style={{ position: 'absolute', left: pad, right: pad, top: portrait ? 390 : 330, display: 'flex', flexDirection: 'column', gap: 30 }}>
        <div
          style={{
            alignSelf: 'flex-end',
            maxWidth: '85%',
            background: C.ink3,
            border: `1px solid ${C.hair}`,
            borderRadius: '22px 22px 6px 22px',
            padding: '20px 26px',
            fontFamily: FONT.sans,
            fontSize: portrait ? 30 : 30,
            color: '#fff',
            opacity: prog(frame, 30, 40),
          }}
        >
          {QUESTION.slice(0, typed)}
          {typed < QUESTION.length && <span style={{ opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }}>|</span>}
        </div>
        {thinking && (
          <div style={{ display: 'flex', gap: 10, paddingLeft: 10 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: C.assure, opacity: 0.4 + 0.6 * Math.abs(Math.sin((frame + i * 5) / 5)) }} />
            ))}
          </div>
        )}
        <div
          style={{
            alignSelf: 'flex-start',
            maxWidth: '92%',
            background: C.ink,
            border: `1px solid ${C.assure}55`,
            borderRadius: '22px 22px 22px 6px',
            padding: '24px 28px',
            opacity: ans,
            transform: `translateY(${(1 - ans) * 24}px)`,
          }}
        >
          <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: portrait ? 38 : 38, color: C.assureBright }}>{ANSWER.lead}</div>
          <div style={{ marginTop: 12, fontFamily: FONT.sans, fontSize: portrait ? 25 : 25, lineHeight: 1.4, color: C.text }}>{ANSWER.body}</div>
          <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {ANSWER.sources.map((s, i) => (
              <span
                key={s}
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 17,
                  color: C.assureBright,
                  border: `1px solid ${C.assure}88`,
                  borderRadius: 999,
                  padding: '5px 13px',
                  opacity: prog(frame, 140 + i * 8, 152 + i * 8),
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: FONT.sans,
            fontSize: portrait ? 26 : 26,
            color: C.soft,
            textAlign: 'center',
            opacity: prog(frame, 200, 220),
          }}
        >
          The same current view people use, and AI agents can rely on
        </div>
      </div>
    </Stage>
  )
}

/* ------------------------------------------------------------------ 6. close */

const Close: React.FC = () => {
  const frame = useCurrentFrame()
  const portrait = usePortrait()
  const fade = useSceneFade(12, 1)
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fade }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, ${C.assure}26 0%, transparent 40%)`, opacity: prog(frame, 10, 60) }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ height: portrait ? 118 : 134, display: 'flex', alignItems: 'center' }}>
          <Lockup scale={portrait ? 0.9 : 1.05} start={6} trackFrom={portrait ? 0.26 : 0.55} />
        </div>
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
            opacity: prog(frame, 50, 66),
            transform: `translateY(${(1 - prog(frame, 50, 70)) * 18}px)`,
          }}
        >
          {SERVICE_LINE}
        </div>
        <div
          style={{
            marginTop: 44,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontFamily: FONT.mono,
            fontSize: portrait ? 30 : 32,
            letterSpacing: '0.04em',
            color: C.text,
            opacity: prog(frame, 72, 88),
          }}
        >
          <PulseDot size={12} appear={72} />
          krealsolutions.co.uk
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

/* ------------------------------------------------------------------ cover */

/** The cover is the opening question over the pile of documents, with the brand above it. */
export const COVER_AT = 120

export const ContractsCover: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Fonts />
    <Hook hold />
    <Atmosphere />
  </AbsoluteFill>
)
