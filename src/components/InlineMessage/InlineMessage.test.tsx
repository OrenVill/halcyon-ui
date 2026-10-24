import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { InlineMessage } from './InlineMessage'

describe('InlineMessage', () => {
  it('renders its children', () => {
    render(<InlineMessage>Hint text</InlineMessage>)
    expect(screen.getByText('Hint text')).toBeInTheDocument()
  })

  it('defaults to the info variant', () => {
    render(<InlineMessage data-testid="msg">Hint</InlineMessage>)
    expect(screen.getByTestId('msg')).toHaveClass('hal-inline-message', 'hal-inline-message--info')
  })

  it.each([['info'], ['success'], ['warning'], ['danger']])(
    'applies the %s variant class',
    (variant) => {
      render(
        <InlineMessage variant={variant as 'info'} data-testid="msg">
          Hint
        </InlineMessage>,
      )
      expect(screen.getByTestId('msg')).toHaveClass(`hal-inline-message--${variant}`)
    },
  )

  it('gives danger role="alert"', () => {
    render(<InlineMessage variant="danger">Required</InlineMessage>)
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })

  it('does not alert for non-danger variants', () => {
    render(<InlineMessage variant="info">Hint</InlineMessage>)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('forwards the ref', () => {
    const ref = createRef<HTMLParagraphElement>()
    render(<InlineMessage ref={ref}>Hint</InlineMessage>)
    expect(ref.current).toHaveClass('hal-inline-message')
  })

  it('has no axe violations', async () => {
    const { container } = render(<InlineMessage>Hint text</InlineMessage>)
    expect(await axe(container)).toHaveNoViolations()
  })
})
