import { COLOR_MODE_STORAGE_KEY } from '../../hooks/useColorMode'

export interface ColorModeScriptProps {
  /** Passed through for apps with a strict Content-Security-Policy. */
  nonce?: string
}

// Minified by hand: this string ships in the HTML of every page that uses it.
const SOURCE =
  `(function(){try{var m=localStorage.getItem(${JSON.stringify(COLOR_MODE_STORAGE_KEY)});` +
  `if(m==="dark"||m==="light"){document.documentElement.setAttribute("data-mode",m)}}catch(e){}})()`

/**
 * Emits a blocking inline script that applies the stored color mode before
 * first paint. Render it in <head>, above any stylesheet link.
 */
export function ColorModeScript({ nonce }: ColorModeScriptProps) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: SOURCE }} />
}
