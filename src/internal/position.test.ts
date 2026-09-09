import { describe, expect, it } from 'vitest'
import { computePosition } from './position'

const VIEWPORT = { width: 1000, height: 800 }
/** A 100x40 anchor sitting comfortably in the middle. */
const ANCHOR = { x: 450, y: 380, width: 100, height: 40 }
const PANEL = { width: 200, height: 100 }

describe('computePosition', () => {
  it('places below and centred by default', () => {
    const placement = computePosition(ANCHOR, PANEL, VIEWPORT)
    expect(placement.side).toBe('bottom')
    expect(placement.y).toBe(428) // 380 + 40 + 8 offset
    expect(placement.x).toBe(400) // centred: 450 + 50 - 100
  })

  it('honours each requested side', () => {
    expect(computePosition(ANCHOR, PANEL, VIEWPORT, { side: 'top' }).y).toBe(272)
    expect(computePosition(ANCHOR, PANEL, VIEWPORT, { side: 'bottom' }).y).toBe(428)
    expect(computePosition(ANCHOR, PANEL, VIEWPORT, { side: 'left' }).x).toBe(242)
    expect(computePosition(ANCHOR, PANEL, VIEWPORT, { side: 'right' }).x).toBe(558)
  })

  it('aligns to the start and end of the anchor', () => {
    expect(computePosition(ANCHOR, PANEL, VIEWPORT, { align: 'start' }).x).toBe(450)
    expect(computePosition(ANCHOR, PANEL, VIEWPORT, { align: 'end' }).x).toBe(350)
  })

  it('flips up when there is no room below', () => {
    const low = { x: 450, y: 740, width: 100, height: 40 }
    const placement = computePosition(low, PANEL, VIEWPORT, { side: 'bottom' })
    expect(placement.side).toBe('top')
    expect(placement.y).toBe(632) // 740 - 100 - 8
  })

  it('flips down when there is no room above', () => {
    const high = { x: 450, y: 10, width: 100, height: 40 }
    const placement = computePosition(high, PANEL, VIEWPORT, { side: 'top' })
    expect(placement.side).toBe('bottom')
    expect(placement.y).toBe(58)
  })

  it('flips horizontally too', () => {
    const nearRight = { x: 940, y: 380, width: 50, height: 40 }
    expect(computePosition(nearRight, PANEL, VIEWPORT, { side: 'right' }).side).toBe('left')

    const nearLeft = { x: 10, y: 380, width: 50, height: 40 }
    expect(computePosition(nearLeft, PANEL, VIEWPORT, { side: 'left' }).side).toBe('right')
  })

  it('keeps the requested side when neither side has room', () => {
    const tall = { width: 200, height: 700 }
    const anchor = { x: 450, y: 380, width: 100, height: 40 }
    expect(computePosition(anchor, tall, VIEWPORT, { side: 'bottom' }).side).toBe('bottom')
  })

  it('shifts along the cross axis to stay in view', () => {
    const nearRightEdge = { x: 960, y: 380, width: 40, height: 40 }
    const placement = computePosition(nearRightEdge, PANEL, VIEWPORT, { side: 'bottom' })
    expect(placement.side).toBe('bottom')
    expect(placement.x).toBe(792) // 1000 - 200 - 8 padding

    const nearLeftEdge = { x: 0, y: 380, width: 40, height: 40 }
    expect(computePosition(nearLeftEdge, PANEL, VIEWPORT, { side: 'bottom' }).x).toBe(8)
  })

  it('clamps a panel wider than the viewport to the padding', () => {
    const huge = { width: 1200, height: 100 }
    expect(computePosition(ANCHOR, huge, VIEWPORT, { side: 'bottom' }).x).toBe(8)
  })

  it('clamps a panel taller than the viewport rather than flipping forever', () => {
    const huge = { width: 200, height: 900 }
    const placement = computePosition(ANCHOR, huge, VIEWPORT, { side: 'left' })
    expect(placement.y).toBe(8)
  })

  it('respects a custom offset and padding', () => {
    expect(computePosition(ANCHOR, PANEL, VIEWPORT, { offset: 20 }).y).toBe(440)

    const nearLeftEdge = { x: 0, y: 380, width: 40, height: 40 }
    expect(computePosition(nearLeftEdge, PANEL, VIEWPORT, { padding: 24 }).x).toBe(24)
  })
})
