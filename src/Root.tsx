import { Composition } from 'remotion'
import { Film } from './Film'
import { Cover } from './Cover'
import { SCENES } from './theme'
import { CTOTAL, ContractsCover, ContractsFilm } from './contracts/ContractsFilm'
import { PageIntro } from './PageIntro'
import { ToolShort, shortLength } from './ToolShort'

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
    <Composition id="Contracts-16x9" component={ContractsFilm} durationInFrames={CTOTAL} fps={FPS} width={1920} height={1080} defaultProps={{ music: 'corporate' as MusicId }} />
    <Composition id="Contracts-4x5" component={ContractsFilm} durationInFrames={CTOTAL} fps={FPS} width={1080} height={1350} defaultProps={{ music: 'corporate' as MusicId }} />
    <Composition id="Contracts-4x5-phone" component={ContractsFilm} durationInFrames={CTOTAL + COVER_LEAD} fps={FPS} width={1080} height={1350} defaultProps={{ music: 'corporate' as MusicId, coverLead: COVER_LEAD }} />
    {/* One Lab tool per film, for the company page's media slots. */}
    <Composition id="Papers-4x5" component={ToolShort} durationInFrames={shortLength('papers')} fps={FPS} width={1080} height={1350} defaultProps={{ tool: 'papers' as const, music: 'corporate' as MusicId }} />
    <Composition id="Monitoring-4x5" component={ToolShort} durationInFrames={shortLength('monitoring')} fps={FPS} width={1080} height={1350} defaultProps={{ tool: 'monitoring' as const, music: 'corporate' as MusicId }} />
    {/* Company page photo post: who we are, what we do, for whom. */}
    <Composition id="PageIntro-4x5" component={PageIntro} durationInFrames={1} fps={FPS} width={1080} height={1350} />
    <Composition id="Contracts-Cover-4x5" component={ContractsCover} durationInFrames={150} fps={FPS} width={1080} height={1350} />
  </>
)
