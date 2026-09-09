/*
 * Builds the proof sheet: one self-contained HTML file that renders the real
 * components, with the real component CSS, painted by the real theme tokens.
 *
 * Nothing here is mocked. The gallery imports src/index.ts, so a component
 * that is broken in the package is broken on the sheet.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import type { Plugin } from 'esbuild'

const root = fileURLToPath(new URL('..', import.meta.url))
const outPath = join(root, 'gallery/gallery.html')

type Tokens = Record<string, string>

/** Reads the declarations of the first block matching `selector`. */
function extractBlock(css: string, selector: RegExp): Tokens {
  const match = selector.exec(css)
  if (!match) throw new Error(`no block matching ${selector}`)

  let index = css.indexOf('{', match.index)
  const start = index + 1
  let depth = 0
  for (; index < css.length; index++) {
    if (css[index] === '{') depth++
    else if (css[index] === '}') {
      depth--
      if (depth === 0) break
    }
  }

  const tokens: Tokens = {}
  for (const found of css.slice(start, index).matchAll(/(--hal-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    tokens[found[1]!] = found[2]!.trim().replace(/\s+/g, ' ')
  }
  return tokens
}

function readThemes(): Record<string, { light: Tokens; dark: Tokens }> {
  const dir = join(root, 'src/styles/themes')
  const themes: Record<string, { light: Tokens; dark: Tokens }> = {}

  for (const file of readdirSync(dir).filter((f) => f.endsWith('.css')).sort()) {
    const css = readFileSync(join(dir, file), 'utf8')
    const light = extractBlock(css, /:root\s*\{/)
    const dark = { ...light, ...extractBlock(css, /:root\[data-mode=['"]dark['"]\]\s*\{/) }
    themes[basename(file, '.css')] = { light, dark }
  }
  return themes
}

/**
 * Structure and component rules, with the theme's own :root token blocks
 * removed. The sheet applies tokens itself on a scoped element, so a global
 * :root block would fight the gallery chrome.
 */
function readComponentCss(): string {
  const structure = readFileSync(join(root, 'src/styles/base.css'), 'utf8')
  const componentsDir = join(root, 'src/components')
  const files = readdirSync(componentsDir, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.css'))
    .sort()

  return [structure, ...files.map((f) => readFileSync(join(componentsDir, f), 'utf8'))].join('\n')
}

/**
 * React and ReactDOM arrive as UMD globals from the CDN, so the bundle must
 * resolve bare "react" imports to those globals rather than bundling a copy.
 */
const reactGlobals: Plugin = {
  name: 'react-globals',
  setup(builder) {
    // Route only bare react specifiers into a private namespace. The load hook
    // below is scoped to that namespace: an unscoped filter would match every
    // file in the default namespace and replace the whole app with this shim.
    builder.onResolve({ filter: /^react(-dom)?(\/.*)?$/ }, (args) => ({
      path: args.path,
      namespace: 'react-global',
    }))

    builder.onLoad({ filter: /.*/, namespace: 'react-global' }, (args) => {
      if (args.path === 'react') {
        return { contents: 'module.exports = window.React', loader: 'js' }
      }
      if (args.path === 'react-dom' || args.path === 'react-dom/client') {
        return { contents: 'module.exports = window.ReactDOM', loader: 'js' }
      }
      // The automatic JSX runtime, expressed through createElement.
      return {
        contents: `
          const React = window.React
          export const Fragment = React.Fragment
          export function jsx(type, props, key) {
            return React.createElement(type, key === undefined ? props : { ...props, key })
          }
          export const jsxs = jsx
          export const jsxDEV = jsx
        `,
        loader: 'js',
      }
    })
  },
}

async function main(): Promise<void> {
  const themes = readThemes()

  const bundle = await build({
    entryPoints: [join(root, 'gallery/main.tsx')],
    bundle: true,
    minify: true,
    format: 'iife',
    target: 'es2022',
    jsx: 'automatic',
    define: { __THEMES__: JSON.stringify(themes) },
    plugins: [reactGlobals],
    write: false,
    logLevel: 'warning',
  })

  const script = bundle.outputFiles[0]
  if (!script) throw new Error('esbuild produced no output')

  const html = `<title>Halcyon Proof Sheet</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
${readFileSync(join(root, 'gallery/gallery.css'), 'utf8')}
${readComponentCss()}
</style>
<div id="root"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script>
${new TextDecoder().decode(script.contents)}
</script>
`

  writeFileSync(outPath, html)
  console.log(`built gallery/gallery.html  ${(html.length / 1024).toFixed(1)} KB`)
  console.log(`  ${Object.keys(themes).length} themes, real components, real component CSS`)
}

await main()
