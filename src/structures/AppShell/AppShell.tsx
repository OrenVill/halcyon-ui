import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export type AppShellProps = HTMLAttributes<HTMLDivElement>

const AppShellRoot = /* @__PURE__ */ forwardRef<HTMLDivElement, AppShellProps>(
  function AppShell({ className, children, ...rest }, ref) {
    return (
      <div {...rest} ref={ref} className={cx('hal-app-shell', className)}>
        {children}
      </div>
    )
  },
)

export type AppShellHeaderProps = HTMLAttributes<HTMLDivElement>

export const AppShellHeader = /* @__PURE__ */ forwardRef<HTMLDivElement, AppShellHeaderProps>(
  function AppShellHeader({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('hal-app-shell__header', className)} />
  },
)

export type AppShellBodyProps = HTMLAttributes<HTMLDivElement>

export const AppShellBody = /* @__PURE__ */ forwardRef<HTMLDivElement, AppShellBodyProps>(
  function AppShellBody({ className, children, ...rest }, ref) {
    return (
      <div {...rest} ref={ref} className={cx('hal-app-shell__body', className)}>
        {children}
      </div>
    )
  },
)

export type AppShellSidebarProps = HTMLAttributes<HTMLDivElement>

export const AppShellSidebar = /* @__PURE__ */ forwardRef<HTMLDivElement, AppShellSidebarProps>(
  function AppShellSidebar({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('hal-app-shell__sidebar', className)} />
  },
)

export type AppShellMainProps = HTMLAttributes<HTMLElement>

export const AppShellMain = /* @__PURE__ */ forwardRef<HTMLElement, AppShellMainProps>(
  function AppShellMain({ className, ...rest }, ref) {
    return <main {...rest} ref={ref} className={cx('hal-app-shell__main', className)} />
  },
)

export interface AppShellComponent
  extends ReturnType<typeof forwardRef<HTMLDivElement, AppShellProps>> {
  Header: typeof AppShellHeader
  Body: typeof AppShellBody
  Sidebar: typeof AppShellSidebar
  Main: typeof AppShellMain
}

export const AppShell = Object.assign(AppShellRoot, {
  Header: AppShellHeader,
  Body: AppShellBody,
  Sidebar: AppShellSidebar,
  Main: AppShellMain,
}) as AppShellComponent
