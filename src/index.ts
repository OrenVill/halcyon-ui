// The only barrel in the package. Components are added here as they land.

export { ColorModeScript } from './components/ColorModeScript'
export type { ColorModeScriptProps } from './components/ColorModeScript'

export { useColorMode, COLOR_MODE_STORAGE_KEY } from './hooks/useColorMode'
export type {
  ColorMode,
  ResolvedColorMode,
  UseColorModeResult,
} from './hooks/useColorMode'
