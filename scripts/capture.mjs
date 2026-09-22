/**
 * Captures the product screens the film is built from.
 *
 * Deliberately a script in the repository rather than a folder of screenshots
 * somebody once took. The products change — this session alone moved their
 * palette and fixed two charts — and a film assembled from stale captures
 * advertises software that no longer exists. Re-run this and the footage is
 * current.
 *
 * Captured at deviceScaleFactor 2 so a 1440px-wide screen lands at 2880px and
 * can be pushed into at 1080p without softening.
 *
 * Usage: node scripts/capture.mjs <product>
 *   process-mining   expects the hub on PM_URL (default http://localhost:3301)
 */
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'

const SHOTS = path.join(import.meta.dirname, '..', 'public', 'shots')

/** Playwright's Chromium, already on disk here; override for another machine. */
const EXECUTABLE =
  process.env.PLAYWRIGHT_CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

/**
 * Clears what this sandbox adds and the deployed product does not have.
 *
 * Two banners appear only because the capture runs against a local server with
 * no Redis and no model key: "no shared store is configured" and
 * "ANTHROPIC_API_KEY is not set". Production has both, so neither banner is
 * ever shown to a visitor, and leaving them in the film would advertise a
 * degraded deployment.
 *
 * This removes environment noise. It does NOT manufacture a capability — the
 * AI findings screen is not captured at all here, precisely because without a
 * key there is nothing real to show, and a staged one would be a lie.
 */
async function clearEnvironmentNotices(page) {
  // The product's own one-time guidance is dismissed the way a visitor would,
  // and only inside the guidance strip — a blanket sweep for anything named
  // "close" reaches the navigation and takes the tab bar with it.
  const hidden = await page.evaluate(() => {
    const NOISE = [/No shared store is configured/i, /ANTHROPIC_API_KEY is not set/i]
    let count = 0

    // Hide, never remove, and never walk up the tree. An earlier version used
    // `closest()` and then a bounded parent walk; both reached past the banner
    // and took the tab bar with them, which only showed up as a click timing
    // out two steps later. Setting display:none on the one element that owns
    // the text cannot damage anything else on the page.
    for (const re of NOISE) {
      for (const el of Array.from(document.querySelectorAll('p, span, div'))) {
        const own = el.textContent ?? ''
        if (!re.test(own)) continue
        // The smallest element carrying it: no child also matches.
        if (Array.from(el.children).some(c => re.test(c.textContent ?? ''))) continue
        el.style.display = 'none'
        // Hiding the sentence leaves the banner's shell behind — its border,
        // its warning icon and its dismiss button, an empty amber box that
        // looks worse than the message did. So walk up while each ancestor has
        // no visible text of its own left, and hide that too. The condition is
        // what makes it safe: a container that still shows something to the
        // viewer never matches, so this can never climb into the interface.
        let up = el.parentElement
        for (let level = 0; level < 4 && up; level++) {
          const stillVisible = (up.innerText ?? '').trim()
          if (stillVisible.length > 0) break
          up.style.display = 'none'
          up = up.parentElement
        }
        count++
        break
      }
    }
    return count
  })
  if (hidden) console.log(`  (hid ${hidden} sandbox-only notice${hidden === 1 ? '' : 's'})`)
  await page.waitForTimeout(400)
}

async function shot(target, name) {
  fs.mkdirSync(SHOTS, { recursive: true })
  const file = path.join(SHOTS, `${name}.png`)
  await target.screenshot({ path: file })
  const { size } = fs.statSync(file)
  console.log(`  ${name}.png  ${(size / 1024).toFixed(0)} KB`)
}

async function processMining() {
  const base = process.env.PM_URL ?? 'http://localhost:3301'
  const code = process.env.AUDIT_PASSCODE
  if (!code) throw new Error('AUDIT_PASSCODE is required to reach the hub')

  const browser = await chromium.launch({ executablePath: EXECUTABLE, args: ['--no-sandbox'] })
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    // The film should show the product at rest, not mid-animation.
    reducedMotion: 'reduce',
  })
  await ctx.request.post(`${base}/api/auth/login`, { data: { code } })
  const page = await ctx.newPage()

  await page.goto(base, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1200)
  await shot(page, 'pm-01-start')

  await page.getByRole('button', { name: /demo/i }).first().click()
  await page.waitForSelector('text=What this run gave you', { timeout: 120_000 })
  await page.waitForTimeout(2500)
  await clearEnvironmentNotices(page)
  await shot(page, 'pm-02-overview')

  const benefits = page.locator('section').filter({ hasText: 'What this run gave you' }).first()
  await shot(benefits, 'pm-03-benefits')

  // Findings is deliberately absent: it is the AI write-up, and without a key
  // there is nothing genuine to capture. Add it here once the capture runs
  // against a deployment that has one.
  for (const [tab, name] of [
    ['Process map', 'pm-04-map'],
    ['Control tests', 'pm-05-controls'],
  ]) {
    await page.getByRole('button', { name: new RegExp(`^${tab}`) }).first().click()
    await page.waitForTimeout(1800)
    await clearEnvironmentNotices(page)
    await shot(page, name)
  }

  await browser.close()
}

const which = process.argv[2] ?? 'process-mining'
const runners = { 'process-mining': processMining }
const run = runners[which]
if (!run) {
  console.error(`unknown product "${which}" — one of: ${Object.keys(runners).join(', ')}`)
  process.exit(2)
}
console.log(`capturing ${which}…`)
await run()
console.log('done')
