import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { AppShell } from './AppShell'
import { Navbar } from '../Navbar'
import { Sidebar } from '../Sidebar'

describe('AppShell', () => {
  it('composes navbar, sidebar, and main', () => {
    render(
      <AppShell>
        <AppShell.Header>
          <Navbar>
            <Navbar.Brand>App</Navbar.Brand>
          </Navbar>
        </AppShell.Header>
        <AppShell.Body>
          <AppShell.Sidebar>
            <Sidebar>
              <Sidebar.Nav>
                <Sidebar.Links>
                  <Sidebar.Link href="/" label="Home" active />
                </Sidebar.Links>
              </Sidebar.Nav>
            </Sidebar>
          </AppShell.Sidebar>
          <AppShell.Main>Dashboard</AppShell.Main>
        </AppShell.Body>
      </AppShell>,
    )
    expect(screen.getByRole('main')).toHaveTextContent('Dashboard')
    expect(screen.getByText('App')).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <AppShell>
        <AppShell.Main>Content</AppShell.Main>
      </AppShell>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
