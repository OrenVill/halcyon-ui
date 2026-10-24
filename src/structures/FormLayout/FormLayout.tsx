import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { Separator } from '../../components/Separator'
import { cx } from '../../internal/cx'

export type FormLayoutWidth = 'sm' | 'md' | 'lg' | 'full'

export interface FormLayoutProps extends HTMLAttributes<HTMLDivElement> {
  width?: FormLayoutWidth
}

const FormLayoutRoot = /* @__PURE__ */ forwardRef<HTMLDivElement, FormLayoutProps>(
  function FormLayout({ width = 'md', className, children, ...rest }, ref) {
    return (
      <div
        {...rest}
        ref={ref}
        className={cx('hal-form-layout', `hal-form-layout--${width}`, className)}
      >
        {children}
      </div>
    )
  },
)

export interface FormLayoutHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  description?: ReactNode
}

export const FormLayoutHeader = /* @__PURE__ */ forwardRef<HTMLDivElement, FormLayoutHeaderProps>(
  function FormLayoutHeader({ title, description, className, children, ...rest }, ref) {
    return (
      <div {...rest} ref={ref} className={cx('hal-form-layout__header', className)}>
        {title ? <h2 className="hal-form-layout__title">{title}</h2> : null}
        {description ? (
          <p className="hal-form-layout__description">{description}</p>
        ) : null}
        {children}
      </div>
    )
  },
)

export type FormLayoutBodyProps = HTMLAttributes<HTMLDivElement>

export const FormLayoutBody = /* @__PURE__ */ forwardRef<HTMLDivElement, FormLayoutBodyProps>(
  function FormLayoutBody({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('hal-form-layout__body', className)} />
  },
)

export interface FormLayoutSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode
  description?: ReactNode
  /** Renders a separator above the section when true. */
  divided?: boolean
}

export const FormLayoutSection = /* @__PURE__ */ forwardRef<HTMLElement, FormLayoutSectionProps>(
  function FormLayoutSection(
  { title, description, divided = false, className, children, ...rest },
  ref,
) {
  return (
    <section {...rest} ref={ref} className={cx('hal-form-layout__section', className)}>
      {divided ? <Separator className="hal-form-layout__section-divider" /> : null}
      {title ? <h3 className="hal-form-layout__section-title">{title}</h3> : null}
      {description ? (
        <p className="hal-form-layout__section-description">{description}</p>
      ) : null}
      {children}
    </section>
  )
})

export type FormLayoutActionsProps = HTMLAttributes<HTMLDivElement>

export const FormLayoutActions = /* @__PURE__ */ forwardRef<HTMLDivElement, FormLayoutActionsProps>(
  function FormLayoutActions({ className, ...rest }, ref) {
    return <div {...rest} ref={ref} className={cx('hal-form-layout__actions', className)} />
  },
)

export interface FormLayoutComponent
  extends ReturnType<typeof forwardRef<HTMLDivElement, FormLayoutProps>> {
  Header: typeof FormLayoutHeader
  Body: typeof FormLayoutBody
  Section: typeof FormLayoutSection
  Actions: typeof FormLayoutActions
}

export const FormLayout = Object.assign(FormLayoutRoot, {
  Header: FormLayoutHeader,
  Body: FormLayoutBody,
  Section: FormLayoutSection,
  Actions: FormLayoutActions,
}) as FormLayoutComponent
