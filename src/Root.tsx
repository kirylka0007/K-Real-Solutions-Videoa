import { Composition } from 'remotion'
import { Sampling } from './scenes/Sampling'
import { FPS, SCENES } from './theme'

/**
 * One film, two shapes.
 *
 * YouTube wants 16:9; LinkedIn's feed gives a 4:5 portrait far more vertical
 * space and so more of the viewport. Both render from the same components —
 * every scene sizes itself from `useVideoConfig`, so there is no second edit to
 * keep in step with the first.
 */
export const Root: React.FC = () => (
  <>
    <Composition
      id="Sampling-16x9"
      component={Sampling}
      durationInFrames={SCENES.sampling.duration}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="Sampling-4x5"
      component={Sampling}
      durationInFrames={SCENES.sampling.duration}
      fps={FPS}
      width={1080}
      height={1350}
    />
  </>
)
