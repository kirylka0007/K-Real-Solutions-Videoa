import { Config } from '@remotion/cli/config'

/**
 * This container already carries a Chromium (Playwright's), and Remotion would
 * otherwise download a second copy of a browser that is already on disk — on a
 * box with 12GB free that is worth avoiding.
 */
/*
 * Remotion still launches Chromium in old-headless mode, which the full
 * Chrome binary removed. Playwright's standalone `headless_shell` is exactly
 * the implementation Chrome's own migration note points at, and it is already
 * on disk here — so this uses it rather than downloading a third browser.
 * Override with REMOTION_BROWSER_EXECUTABLE on a machine without it; unset it
 * entirely and Remotion fetches its own.
 */
const HEADLESS_SHELL =
  process.env.REMOTION_BROWSER_EXECUTABLE ??
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
Config.setBrowserExecutable(HEADLESS_SHELL)

Config.setChromiumOpenGlRenderer('swangle')
Config.setVideoImageFormat('jpeg')
Config.setConcurrency(4)
