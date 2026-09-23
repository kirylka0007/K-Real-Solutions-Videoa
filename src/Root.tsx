import { Composition } from 'remotion'
import { Film } from './Film'
import { FPS, TOTAL, type MusicId } from './theme'

/**
 * One film, two shapes: 16:9 for YouTube and the website, 4:5 for the LinkedIn
 * feed, where a portrait frame takes more of the screen. Each scene reads its
 * orientation from `useVideoConfig` and lays itself out for it — the portrait
 * cut is re-composed, not cropped.
 */
export const Root: React.FC = () => (
  <>
    <Composition id="Film-16x9" component={Film} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} defaultProps={{ music: 'professional' as MusicId }} />
    <Composition id="Film-4x5" component={Film} durationInFrames={TOTAL} fps={FPS} width={1080} height={1350} defaultProps={{ music: 'professional' as MusicId }} />
  </>
)
