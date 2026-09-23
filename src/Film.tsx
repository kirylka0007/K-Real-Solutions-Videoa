import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion'
import { Fonts } from './fonts'
import { Atmosphere, prog } from './components/kit'
import { Open } from './scenes/Open'
import { Mining } from './scenes/Mining'
import { Papers } from './scenes/Papers'
import { Monitoring } from './scenes/Monitoring'
import { Close } from './scenes/Close'
import { C, FONT, FPS, MUSIC, SCENES, TOTAL, type MusicId } from './theme'

/**
 * The film, assembled.
 *
 * Scenes are placed from `SCENES` rather than by counting frames here, so
 * lengthening one moves everything after it without a second edit. Each scene
 * fades itself in and out, so every cut passes through black.
 */
export const Film: React.FC<{ music: MusicId }> = ({ music }) => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Fonts />
    {music !== 'none' && <Soundtrack id={music} />}
    <Sequence from={SCENES.open.from} durationInFrames={SCENES.open.duration}>
      <Open />
    </Sequence>
    <Sequence from={SCENES.mining.from} durationInFrames={SCENES.mining.duration}>
      <Mining />
    </Sequence>
    <Sequence from={SCENES.papers.from} durationInFrames={SCENES.papers.duration}>
      <Papers />
    </Sequence>
    <Sequence from={SCENES.monitoring.from} durationInFrames={SCENES.monitoring.duration}>
      <Monitoring />
    </Sequence>
    <Sequence from={SCENES.close.from} durationInFrames={SCENES.close.duration}>
      <Close />
    </Sequence>
    <Atmosphere />
    <DemoLabel />
  </AbsoluteFill>
)

/**
 * Every figure on screen is the products' own arithmetic over invented demo
 * firms. That is said on screen for as long as a product is, so no frame of the
 * film can be clipped and passed off as a client's numbers.
 */
const DemoLabel: React.FC = () => {
  const frame = useCurrentFrame()
  const from = SCENES.mining.from
  const to = SCENES.close.from
  const o = prog(frame, from + 10, from + 30) * (1 - prog(frame, to - 20, to))
  return (
    <div
      style={{
        position: 'absolute',
        right: 36,
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

/**
 * The music: trimmed so the drop meets the cut to process mining, a short fade
 * in, and a fade out that finishes with the film as "Request access" holds.
 */
const Soundtrack: React.FC<{ id: Exclude<MusicId, 'none'> }> = ({ id }) => {
  const track = MUSIC[id]
  const trimBefore = Math.round((track.dropAt - SCENES.mining.from / FPS) * FPS)
  return (
    <Audio
      src={staticFile(track.file)}
      trimBefore={trimBefore}
      volume={f =>
        track.volume *
        interpolate(f, [0, 12, TOTAL - 75, TOTAL - 1], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      }
    />
  )
}
