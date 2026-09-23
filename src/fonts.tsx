import { useEffect, useState } from 'react'
import { continueRender, delayRender, staticFile } from 'remotion'

/**
 * The brand's three families, loaded from files in `public/fonts`.
 *
 * Not from Google: the renderer's Chromium has no route to the internet in the
 * environment this film is built in, so a web font request would fail silently
 * and every frame would render in a fallback face. Local files, and a
 * `delayRender` that holds the frame until they are actually in, means a
 * missing font fails the render loudly instead.
 */
const FACES: Array<[family: string, file: string, weight: number]> = [
  ['Archivo', 'archivo-latin-600-normal.woff2', 600],
  ['Archivo', 'archivo-latin-700-normal.woff2', 700],
  ['Archivo', 'archivo-latin-800-normal.woff2', 800],
  ['IBM Plex Sans', 'ibm-plex-sans-latin-400-normal.woff2', 400],
  ['IBM Plex Sans', 'ibm-plex-sans-latin-500-normal.woff2', 500],
  ['IBM Plex Sans', 'ibm-plex-sans-latin-600-normal.woff2', 600],
  ['IBM Plex Mono', 'ibm-plex-mono-latin-400-normal.woff2', 400],
  ['IBM Plex Mono', 'ibm-plex-mono-latin-500-normal.woff2', 500],
  ['IBM Plex Mono', 'ibm-plex-mono-latin-600-normal.woff2', 600],
]

export const Fonts: React.FC = () => {
  const [handle] = useState(() => delayRender('Loading brand fonts'))
  useEffect(() => {
    Promise.all(
      FACES.map(([family, file, weight]) => {
        const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {
          weight: String(weight),
        })
        return face.load().then(loaded => document.fonts.add(loaded))
      }),
    )
      .then(() => continueRender(handle))
      .catch(error => {
        throw new Error(`A brand font failed to load: ${String(error)}`)
      })
  }, [handle])
  return null
}
