import { Composition } from 'remotion'
import { Film } from './Film'
import { FPS, TOTAL } from './theme'

/**
 * The film at 16:9, sixty seconds. Scenes are laid out for 1920×1080; a 4:5
 * cut for the LinkedIn feed would need its own layout, not a crop of this one.
 */
export const Root: React.FC = () => (
  <Composition id="Film-16x9" component={Film} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
)
