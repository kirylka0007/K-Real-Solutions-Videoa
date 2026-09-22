import { AbsoluteFill, Sequence } from 'remotion'
import { Sampling } from './scenes/Sampling'
import { ProcessMining } from './scenes/ProcessMining'
import { SCENES } from './theme'
import { C } from './theme'

/**
 * The film, assembled.
 *
 * Scenes are placed from `SCENES` rather than by counting frames here, so
 * lengthening the opening moves everything after it without a second edit.
 *
 * Board papers, continuous monitoring and the close are not built yet; the
 * composition is deliberately only as long as what exists, so a render never
 * ends on an accidental black hold that looks like a bug.
 */
const BUILT = SCENES.mining.from + SCENES.mining.duration

export const Film: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink }}>
    <Sequence from={SCENES.sampling.from} durationInFrames={SCENES.sampling.duration}>
      <Sampling />
    </Sequence>
    <Sequence from={SCENES.mining.from} durationInFrames={SCENES.mining.duration}>
      <ProcessMining />
    </Sequence>
  </AbsoluteFill>
)

export const BUILT_DURATION = BUILT
