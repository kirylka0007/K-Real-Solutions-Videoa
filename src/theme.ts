/**
 * The products' own palette, so the film and the software cannot drift apart.
 *
 * Taken from `globals.css` in the hub apps. `critical` is the text-safe
 * variant rather than the mark hue — on screen at this size it is large text,
 * but it is also the colour a viewer reads a number in, and the lifted tone is
 * what the products themselves now use for exactly that.
 */
export const C = {
  ink: '#0a2a26',
  panel: '#0d3531',
  line: 'rgba(157, 189, 182, 0.13)',
  accent: '#19c8a6',
  accentText: '#1bd8b4',
  critical: '#ee8588',
  text: '#e8f4f1',
  soft: '#9dbdb6',
  muted: '#7f9c96',
} as const

export const FPS = 30

/**
 * The film, in frames, at 30fps. Sixty seconds is the hard ceiling the owner
 * set; the voiceover runs about 107 words, roughly 43 seconds of speech, and
 * the remainder is deliberate silence so each visual lands before the next
 * sentence starts.
 */
export const SCENES = {
  sampling: { from: 0, duration: 540 },     // 0–18s  the argument
  mining: { from: 540, duration: 360 },     // 18–30s
  papers: { from: 900, duration: 360 },     // 30–42s
  monitoring: { from: 1260, duration: 360 },// 42–54s
  close: { from: 1620, duration: 180 },     // 54–60s
} as const

export const TOTAL = 1800
