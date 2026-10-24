import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../internal/cx'

export type StepperVariant = 'plain' | 'accent'
export type StepperSize = 'sm' | 'md' | 'lg'
export type StepperOrientation = 'horizontal' | 'vertical'

export interface StepperStep {
  id: string
  label: ReactNode
  description?: ReactNode
}

export interface StepperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  steps: StepperStep[]
  /** Zero-based index of the active step. */
  activeStep: number
  orientation?: StepperOrientation
  variant?: StepperVariant
  size?: StepperSize
}

export const Stepper = /* @__PURE__ */ forwardRef<HTMLDivElement, StepperProps>(function Stepper(
  {
    steps,
    activeStep,
    orientation = 'horizontal',
    variant = 'plain',
    size = 'md',
    className,
    ...rest
  },
  ref,
) {
  const safeActive = Math.min(Math.max(activeStep, 0), Math.max(steps.length - 1, 0))

  return (
    <div
      {...rest}
      ref={ref}
      className={cx(
        'hal-stepper',
        `hal-stepper--${variant}`,
        `hal-stepper--${size}`,
        `hal-stepper--${orientation}`,
        className,
      )}
      aria-hidden="true"
    >
      <ol className="hal-stepper__list">
        {steps.map((step, index) => {
          const complete = index < safeActive
          const current = index === safeActive
          const state = complete ? 'complete' : current ? 'current' : 'upcoming'
          return (
            <li
              key={step.id}
              className={cx('hal-stepper__item', `hal-stepper__item--${state}`)}
            >
              <span className="hal-stepper__indicator">
                <span className="hal-stepper__marker">{complete ? '✓' : index + 1}</span>
              </span>
              <span className="hal-stepper__text">
                <span className="hal-stepper__label">{step.label}</span>
                {step.description === undefined || step.description === null ? null : (
                  <span className="hal-stepper__description">{step.description}</span>
                )}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
})
