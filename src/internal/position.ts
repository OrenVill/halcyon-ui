/*
 * Anchored positioning, in about a kilobyte instead of ten.
 *
 * The exported function is pure: rectangles in, coordinates out, no DOM. That
 * is deliberate. jsdom implements no layout and reports every rectangle as
 * zero, so a helper that measured the DOM itself could not be tested at all,
 * while this one can be tested exhaustively. Callers do the measuring.
 *
 * Known limits, repeated in the README: the panel is never resized to fit, and
 * nothing here is aware of scroll containers other than the viewport.
 */

export type Side = 'top' | 'bottom' | 'left' | 'right'
export type Align = 'start' | 'center' | 'end'

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface Size {
  width: number
  height: number
}

export interface PositionOptions {
  /** Preferred side. Defaults to 'bottom'. */
  side?: Side
  /** Alignment along the anchor's cross axis. Defaults to 'center'. */
  align?: Align
  /** Gap between anchor and panel. Defaults to 8. */
  offset?: number
  /** Minimum gap from the viewport edge. Defaults to 8. */
  padding?: number
}

export interface Placement {
  x: number
  y: number
  /** The side actually used, which is not the requested one after a flip. */
  side: Side
}

const OPPOSITE: Record<Side, Side> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

function isVertical(side: Side): boolean {
  return side === 'top' || side === 'bottom'
}

/** Room between the anchor and the viewport edge on the given side. */
function roomOn(side: Side, anchor: Rect, viewport: Size): number {
  switch (side) {
    case 'top':
      return anchor.y
    case 'bottom':
      return viewport.height - (anchor.y + anchor.height)
    case 'left':
      return anchor.x
    case 'right':
      return viewport.width - (anchor.x + anchor.width)
  }
}

/** Position along the axis the panel is stacked on. */
function mainAxis(side: Side, anchor: Rect, panel: Size, offset: number): number {
  switch (side) {
    case 'top':
      return anchor.y - panel.height - offset
    case 'bottom':
      return anchor.y + anchor.height + offset
    case 'left':
      return anchor.x - panel.width - offset
    case 'right':
      return anchor.x + anchor.width + offset
  }
}

/** Position along the axis the panel is aligned on. */
function crossAxis(align: Align, anchorStart: number, anchorSize: number, panelSize: number): number {
  if (align === 'start') return anchorStart
  if (align === 'end') return anchorStart + anchorSize - panelSize
  return anchorStart + anchorSize / 2 - panelSize / 2
}

/**
 * Keeps a value inside the viewport, less padding. A panel larger than the
 * viewport clamps to the near edge and overflows the far one, because there is
 * nowhere else for it to go.
 */
function clamp(value: number, panelSize: number, viewportSize: number, padding: number): number {
  const max = viewportSize - panelSize - padding
  if (max <= padding) return padding
  return Math.min(Math.max(value, padding), max)
}

export function computePosition(
  anchor: Rect,
  panel: Size,
  viewport: Size,
  options: PositionOptions = {},
): Placement {
  const { side: preferred = 'bottom', align = 'center', offset = 8, padding = 8 } = options

  // Flip only when the opposite side genuinely has more room. Flipping into an
  // equally cramped side just moves the problem and looks like a glitch.
  const needed = isVertical(preferred) ? panel.height : panel.width
  const roomPreferred = roomOn(preferred, anchor, viewport)
  const opposite = OPPOSITE[preferred]
  const roomOpposite = roomOn(opposite, anchor, viewport)

  const side =
    roomPreferred < needed + offset + padding && roomOpposite > roomPreferred ? opposite : preferred

  if (isVertical(side)) {
    return {
      side,
      x: clamp(crossAxis(align, anchor.x, anchor.width, panel.width), panel.width, viewport.width, padding),
      y: clamp(mainAxis(side, anchor, panel, offset), panel.height, viewport.height, padding),
    }
  }

  return {
    side,
    x: clamp(mainAxis(side, anchor, panel, offset), panel.width, viewport.width, padding),
    y: clamp(crossAxis(align, anchor.y, anchor.height, panel.height), panel.height, viewport.height, padding),
  }
}
