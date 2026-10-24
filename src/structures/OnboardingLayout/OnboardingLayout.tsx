import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { Progress } from '../../components/Progress'
import { cx } from '../../internal/cx'

export interface OnboardingStep {
  id: string
  label: ReactNode
}

export interface OnboardingLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  brand: ReactNode
  steps: OnboardingStep[]
  currentStepId: string
  title?: ReactNode
  description?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

export const OnboardingLayout = /* @__PURE__ */ forwardRef<HTMLDivElement, OnboardingLayoutProps>(
  function OnboardingLayout(
    {
      brand,
      steps,
      currentStepId,
      title,
      description,
      footer,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const currentIndex = Math.max(
      0,
      steps.findIndex((step) => step.id === currentStepId),
    )
    const progress =
      steps.length <= 1 ? 100 : Math.round(((currentIndex + 1) / steps.length) * 100)

    return (
      <div {...rest} ref={ref} className={cx('hal-onboarding-layout', className)}>
        <header className="hal-onboarding-layout__header">
          <div className="hal-onboarding-layout__brand">{brand}</div>
          <Progress
            value={progress}
            aria-label={`Step ${currentIndex + 1} of ${steps.length}`}
          />
          <ol className="hal-onboarding-layout__steps" aria-label="Onboarding progress">
            {steps.map((step, index) => {
              const state =
                index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming'
              return (
                <li
                  key={step.id}
                  className={cx(
                    'hal-onboarding-layout__step',
                    `hal-onboarding-layout__step--${state}`,
                  )}
                  aria-current={state === 'current' ? 'step' : undefined}
                >
                  {step.label}
                </li>
              )
            })}
          </ol>
        </header>
        <main className="hal-onboarding-layout__main">
          <div className="hal-onboarding-layout__panel">
            {title ? <h1 className="hal-onboarding-layout__title">{title}</h1> : null}
            {description ? <p className="hal-onboarding-layout__description">{description}</p> : null}
            <div className="hal-onboarding-layout__body">{children}</div>
            {footer ? <div className="hal-onboarding-layout__footer">{footer}</div> : null}
          </div>
        </main>
      </div>
    )
  },
)
