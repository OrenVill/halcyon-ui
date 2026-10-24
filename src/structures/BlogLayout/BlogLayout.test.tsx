import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { BlogLayout } from './BlogLayout'

describe('BlogLayout', () => {
  it('renders post feed', () => {
    render(
      <BlogLayout
        brand="Halcyon"
        posts={[{ href: '/post', title: 'Hello', excerpt: 'Intro' }]}
      />,
    )
    expect(screen.getByRole('link', { name: 'Hello' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <BlogLayout brand="Co" pageTitle="Article" pageMeta="Jan 1">
        <p>Body</p>
      </BlogLayout>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
