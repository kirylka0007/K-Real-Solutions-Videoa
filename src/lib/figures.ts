/**
 * The demonstration population, and the sampling arithmetic the film opens on.
 *
 * These are the figures the process mining hub computes from its own demo
 * extract — 398 transactions, 98 of which fail at least one control test. They
 * are real arithmetic over an invented firm, never a client's data, and the
 * film says so on screen.
 *
 * Kept here as data so the opening animation is driven by the numbers rather
 * than by hand-placed dots: change the population and the visual follows.
 */
export const POPULATION = 398
export const WITH_FAILURE = 98
export const SAMPLE_SIZE = 25

/** Expected exception cases in a sample of n drawn from N with K failures. */
export const expectedFound = (n = SAMPLE_SIZE, K = WITH_FAILURE, N = POPULATION) => (n * K) / N

export const NEVER_EXAMINED = POPULATION - SAMPLE_SIZE

/**
 * A deterministic layout for the opening: which transactions failed, and which
 * a sample would have drawn.
 *
 * Seeded, so every render of the film is identical — a promotional video that
 * reshuffles its own evidence between takes is not evidence.
 *
 * The sample is constructed to contain exactly `round(expectedFound())` failing
 * transactions. That is the honest realisation of the arithmetic rather than a
 * flattering draw: 25 x 98 / 398 is 6.2, so the sample shown finds six. Picking
 * a sample that happened to find one would be rhetoric, and picking one that
 * found twelve would be a lie in our own favour.
 */
function lcg(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

export interface Layout {
  /** Index -> true when that transaction failed at least one control test. */
  failed: boolean[]
  /** Index -> true when a 25-item sample would have drawn it. */
  sampled: boolean[]
  /** Failing transactions the sample actually finds. */
  foundBySample: number
}

export function buildLayout(seed = 20260922): Layout {
  const rand = lcg(seed)
  const order = Array.from({ length: POPULATION }, (_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }

  const failed = new Array<boolean>(POPULATION).fill(false)
  const failingIdx = order.slice(0, WITH_FAILURE)
  for (const i of failingIdx) failed[i] = true

  const target = Math.round(expectedFound())
  const cleanIdx = order.slice(WITH_FAILURE)

  const sampled = new Array<boolean>(POPULATION).fill(false)
  for (const i of failingIdx.slice(0, target)) sampled[i] = true
  for (const i of cleanIdx.slice(0, SAMPLE_SIZE - target)) sampled[i] = true

  return { failed, sampled, foundBySample: target }
}
