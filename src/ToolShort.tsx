import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { Fonts } from './fonts'
import { Atmosphere, Lockup, PulseDot, prog, useSceneFade } from './components/kit'
import { Papers } from './scenes/Papers'
import { Monitoring } from './scenes/Monitoring'
import { C, CTA, FONT, FPS, MUSIC, SCENES, type MusicId } from './theme'

/**
 * One Lab tool on its own: a three-second title, the tool's scene exactly as it
 * plays in the main film, and a close with the brand and the call to action.
 * Made for the company page's media slots, where each tool gets its own film.
 */
export type ToolId = 'papers' | 'monitoring'

const TOOL: Record<ToolId, { name: string; line: string; scene: React.FC; duration: number }> = {
  papers: {
    name: 'Board papers',
    line: 'The risk register, turned into the picture the committee needs',
    scene: Papers,
    duration: SCENES.papers.duration,
  },
  monitoring: {
    name: 'Continuous monitoring',
    line: 'Controls tested every day, with exceptions owned by the business',
    scene: Monitoring,
    duration: SCENES.monitoring.duration,
  },
}

export const INTRO = 90
export const OUTRO = 150
export const shortLength = (tool: ToolId) => INTRO + TOOL[tool].duration + OUTRO

export const ToolShort: React.FC<{ tool: ToolId; music?: MusicId }> = ({ tool, music = 'corporate' }) => {
  const t = TOOL[tool]
  const Scene = t.scene
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Fonts />
      {music !== 'none' && <Soundtrack id={music} total={shortLength(tool)} />}
      <Sequence durationInFrames={INTRO}>
        <Title name={t.name} line={t.line} />
      </Sequence>
      <Sequence from={INTRO} durationInFrames={t.duration}>
        <Scene />
      </Sequence>
      <Sequence from={INTRO + t.duration} durationInFrames={OUTRO}>
        <Outro />
      </Sequence>
      <Atmosphere />
      <DemoLabel from={INTRO} to={INTRO + t.duration} />
    </AbsoluteFill>
  )
}

const Title: React.FC<{ name: string; line: string }> = ({ name, line }) => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()
  const portrait = height > width
  const fade = useSceneFade(1, 12)
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fade, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 70 }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${C.assure}22 0%, transparent 40%)` }} />
      <Lockup scale={0.6} start={-200} tagline={false} />
      <div
        style={{
          marginTop: 60,
          fontFamily: FONT.mono,
          fontSize: 22,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: C.assureBright,
          opacity: prog(frame, 6, 20),
        }}
      >
        The Innovation Lab
      </div>
      <div
        style={{
          marginTop: 20,
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: portrait ? 84 : 96,
          letterSpacing: '-0.025em',
          color: '#fff',
          textAlign: 'center',
          opacity: prog(frame, 10, 28),
          transform: `translateY(${(1 - prog(frame, 10, 32)) * 30}px)`,
        }}
      >
        {name}
      </div>
      <div
        style={{
          marginTop: 22,
          maxWidth: portrait ? 860 : 1300,
          textAlign: 'center',
          fontFamily: FONT.sans,
          fontWeight: 500,
          fontSize: portrait ? 32 : 34,
          lineHeight: 1.3,
          color: C.text,
          textWrap: 'balance',
          opacity: prog(frame, 24, 40),
        }}
      >
        {line}
      </div>
    </AbsoluteFill>
  )
}

const SERVICE_LINE = 'We build practical analytics and AI solutions for internal audit and compliance teams'

const Outro: React.FC = () => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()
  const portrait = height > width
  const fade = useSceneFade(12, 1)
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fade, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, ${C.assure}26 0%, transparent 40%)`, opacity: prog(frame, 10, 60) }} />
      <div style={{ height: portrait ? 118 : 134, display: 'flex', alignItems: 'center' }}>
        <Lockup scale={portrait ? 0.9 : 1.05} start={6} trackFrom={portrait ? 0.26 : 0.55} />
      </div>
      <div
        style={{
          marginTop: 40,
          maxWidth: portrait ? 900 : 1560,
          textAlign: 'center',
          fontFamily: FONT.sans,
          fontWeight: 500,
          fontSize: portrait ? 38 : 36,
          lineHeight: 1.3,
          color: C.text,
          opacity: prog(frame, 44, 60),
        }}
      >
        {SERVICE_LINE}
      </div>
      <div
        style={{
          marginTop: 48,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '22px 40px',
          borderRadius: 999,
          background: C.assure,
          color: '#fff',
          fontFamily: FONT.display,
          fontWeight: 700,
          fontSize: 38,
          opacity: prog(frame, 62, 78),
          boxShadow: `0 0 ${60 + 20 * Math.sin(frame / 8)}px ${C.assure}66`,
        }}
      >
        {CTA.label} →
      </div>
      <div
        style={{
          marginTop: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontFamily: FONT.mono,
          fontSize: portrait ? 27 : 30,
          color: C.text,
          opacity: prog(frame, 72, 88),
        }}
      >
        <PulseDot size={12} appear={72} />
        {CTA.url}
      </div>
    </AbsoluteFill>
  )
}

const DemoLabel: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()
  const portrait = height > width
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

/** The track's measured drop lands on the cut from the title to the tool (3.0s). */
const Soundtrack: React.FC<{ id: Exclude<MusicId, 'none'>; total: number }> = ({ id, total }) => {
  const track = MUSIC[id]
  const trimBefore = Math.round((track.dropAt - INTRO / FPS) * FPS)
  return (
    <Audio
      src={staticFile(track.file)}
      trimBefore={trimBefore}
      volume={f =>
        track.volume *
        interpolate(f, [0, 12, total - 60, total - 1], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      }
    />
  )
}
