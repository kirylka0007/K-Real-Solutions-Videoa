import { AbsoluteFill, Sequence } from 'remotion'
import { Shot } from '../components/Shot'
import { Caption } from '../components/Caption'
import { region, widen, leftPortion } from '../lib/regions'
import { C } from '../theme'

/**
 * The answer to the opening.
 *
 * The film has just spent eighteen seconds showing that a sample leaves most
 * of a population unexamined, so this does not introduce a product — it
 * replies. The map first, because a Head of Internal Audit has never actually
 * seen their own process drawn from its own event log; then the panel that
 * says 398 of 398, which is the literal answer to the 373 that went dark.
 */

const CAPTURE = { width: 2880, height: 1800 }
const graph = region('pm-04-map', 'graph')
const benefits = region('pm-02-overview', 'benefits')

export const ProcessMining: React.FC = () => (
  <AbsoluteFill style={{ background: C.ink }}>
    <Sequence durationInFrames={210}>
      <Shot
        src="shots/pm-04-map.png"
        natural={CAPTURE}
        from={widen(graph, 1.04)}
        to={leftPortion(graph, 0.55)}
        move={[10, 200]}
      />
      <Caption
        lines={[
          { at: [8, 105], text: 'the process, as it actually ran' },
          { at: [112, 208], text: 'every variant, every rework loop' },
        ]}
      />
    </Sequence>

    <Sequence from={210} durationInFrames={150}>
      <Shot
        src="shots/pm-02-overview.png"
        natural={CAPTURE}
        from={widen(benefits, 1.02)}
        to={widen(benefits, 0.72)}
        move={[0, 140]}
      />
      <Caption
        lines={[{ at: [6, 148], text: 'reconstructed from your event data', tone: C.accentText }]}
      />
    </Sequence>
  </AbsoluteFill>
)
