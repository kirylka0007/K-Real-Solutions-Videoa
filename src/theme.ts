/**
 * The brand, taken from krealsolutions.co.uk's own globals.css so the film and
 * the website cannot drift apart.
 *
 * `bg` is darker than the site's `--ink` on purpose: the brief is a film that is
 * mostly black, and the site's ink (#0C232B) is a deep teal that reads as
 * colour at full-screen. The ink tones are kept for panels, so a product screen
 * still sits on its own ground.
 */
export const C = {
  bg: '#04080A',
  ink: '#0C232B',
  ink2: '#123039',
  ink3: '#15373F',
  assure: '#12A594',
  assureBright: '#19C9B4',
  assureDeep: '#0E7E72',
  exception: '#E8A317',
  exceptionRed: '#D8552E',
  text: '#DDE6E5',
  soft: '#93A6A9',
  hair: 'rgba(221,230,229,0.16)',
  // The board-paper portal is a cream document; on a black stage it reads as
  // exactly that — the paper the committee is handed.
  paper: '#F6F3EC',
  paperText: '#1B1A17',
  paperSoft: '#6B665C',
  paperRule: '#CFC8B8',
  paperRed: '#9C2B1C',
  paperAmber: '#B8690E',
  paperGreen: '#2E8B62',
  paperBlue: '#5B7AA6',
} as const

export const FONT = {
  display: 'Archivo, sans-serif',
  sans: '"IBM Plex Sans", sans-serif',
  mono: '"IBM Plex Mono", monospace',
} as const

export const FPS = 30

/**
 * Sixty seconds is the ceiling. Each scene owns a fade in and a fade out of its
 * own, so scenes butt against one another and the cut is always through black.
 */
export const SCENES = {
  open: { from: 0, duration: 150 }, //        0–5s    the brand
  mining: { from: 150, duration: 540 }, //    5–23s   process mining + AI
  papers: { from: 690, duration: 450 }, //    23–38s  board paper, transformed
  monitoring: { from: 1140, duration: 480 }, // 38–54s continuous monitoring
  close: { from: 1620, duration: 180 }, //    54–60s  request access
} as const

export const TOTAL = 1800

/** The call to action, exactly as the site words it. */
export const CTA = {
  label: 'Request access',
  url: 'krealsolutions.co.uk/innovation-lab',
} as const
