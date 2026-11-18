import { Composition } from 'remotion'
import { Film } from './Film'
import { Cover } from './Cover'
import { SCENES } from './theme'
import { CTOTAL, ContractsCover, ContractsFilm } from './contracts/ContractsFilm'

/** Frames the phone cut holds the cover before the film: 0.8s. */
const COVER_LEAD = 24
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
    {/* The 4:5 cut for posting from a phone: opens on the cover, which LinkedIn's app takes as the thumbnail. */}
    <Composition
      id="Film-4x5-phone"
      component={Film}
      durationInFrames={TOTAL + COVER_LEAD}
      fps={FPS}
      width={1080}
      height={1350}
      defaultProps={{ music: 'professional' as MusicId, coverLead: COVER_LEAD }}
    />
    {/* The LinkedIn cover: render with `remotion still Cover-4x5 --frame=520`. */}
    <Composition id="Cover-4x5" component={Cover} durationInFrames={SCENES.mining.duration} fps={FPS} width={1080} height={1350} />
    {/* Contract assurance film: documents read in order into one living view of the terms in force. */}
    <Composition id="Contracts-16x9" component={ContractsFilm} durationInFrames={CTOTAL} fps={FPS} width={1920} height={1080} defaultProps={{}} />
    <Composition id="Contracts-4x5" component={ContractsFilm} durationInFrames={CTOTAL} fps={FPS} width={1080} height={1350} defaultProps={{}} />
    <Composition id="Contracts-4x5-phone" component={ContractsFilm} durationInFrames={CTOTAL + COVER_LEAD} fps={FPS} width={1080} height={1350} defaultProps={{ coverLead: COVER_LEAD }} />
    <Composition id="Contracts-Cover-4x5" component={ContractsCover} durationInFrames={150} fps={FPS} width={1080} height={1350} />
  </>
)
