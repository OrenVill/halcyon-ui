import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../internal/cx'

export type WizardVariant = 'plain' | 'accent'
export type WizardSize = 'sm' | 'md' | 'lg'
export type WizardOrientation = 'horizontal' | 'vertical'

export interface WizardStep {
  id: string
  label: ReactNode
  description?: ReactNode
  content: ReactNode
}

export interface WizardHandle {
  next: () => Promise<void>
  back: () => void
  goTo: (stepIndex: number) => Promise<void>
}

export interface WizardRenderProps {
  activeStep: number
  canGoNext: boolean
  canGoBack: boolean
  isValidating: boolean
  next: () => Promise<void>
  back: () => void
  goTo: (stepIndex: number) => Promise<void>
}

export interface WizardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  steps: WizardStep[]
  activeStep?: number
  defaultActiveStep?: number
  onStepChange?: (stepIndex: number) => void
  validateStep?: (stepIndex: number) => boolean | Promise<boolean>
  orientation?: WizardOrientation
  variant?: WizardVariant
  size?: WizardSize
  children?: (api: WizardRenderProps) => ReactNode
}

function clampStep(index: number, count: number): number {
  if (count <= 0) return 0
  return Math.min(Math.max(index, 0), count - 1)
}

export const Wizard = /* @__PURE__ */ forwardRef<WizardHandle, WizardProps>(function Wizard(
  {
    steps,
    activeStep,
    defaultActiveStep = 0,
    onStepChange,
    validateStep,
    orientation = 'horizontal',
    variant = 'plain',
    size = 'md',
    className,
    children,
    ...rest
  },
  ref,
) {
  const isControlled = activeStep !== undefined
  const [internalStep, setInternalStep] = useState(defaultActiveStep)
  const [isValidating, setIsValidating] = useState(false)

  const current = clampStep(isControlled ? activeStep : internalStep, steps.length)

  const setStep = useCallback(
    (index: number) => {
      const next = clampStep(index, steps.length)
      if (!isControlled) setInternalStep(next)
      onStepChange?.(next)
    },
    [isControlled, onStepChange, steps.length],
  )

  const runValidation = useCallback(
    async (stepIndex: number) => {
      if (!validateStep) return true
      setIsValidating(true)
      try {
        return await validateStep(stepIndex)
      } finally {
        setIsValidating(false)
      }
    },
    [validateStep],
  )

  const goTo = useCallback(
    async (stepIndex: number) => {
      const target = clampStep(stepIndex, steps.length)
      if (target === current) return
      if (target > current) {
        for (let i = current; i < target; i += 1) {
          const ok = await runValidation(i)
          if (!ok) return
        }
      }
      setStep(target)
    },
    [current, runValidation, setStep, steps.length],
  )

  const next = useCallback(async () => {
    if (current >= steps.length - 1) return
    const ok = await runValidation(current)
    if (!ok) return
    setStep(current + 1)
  }, [current, runValidation, setStep, steps.length])

  const back = useCallback(() => {
    if (current <= 0) return
    setStep(current - 1)
  }, [current, setStep])

  useImperativeHandle(
    ref,
    () => ({
      next,
      back,
      goTo,
    }),
    [back, goTo, next],
  )

  const canGoBack = current > 0
  const canGoNext = current < steps.length - 1 && !isValidating

  const api: WizardRenderProps = {
    activeStep: current,
    canGoNext,
    canGoBack,
    isValidating,
    next,
    back,
    goTo,
  }

  const active = steps[current]

  return (
    <div
      {...rest}
      className={cx(
        'hal-wizard',
        `hal-wizard--${variant}`,
        `hal-wizard--${size}`,
        `hal-wizard--${orientation}`,
        className,
      )}
    >
      <div
        className={cx(
          'hal-wizard__steps',
          `hal-wizard__steps--${orientation}`,
        )}
        aria-hidden="true"
      >
        <ol className="hal-wizard__list">
          {steps.map((step, index) => {
            const complete = index < current
            const isCurrent = index === current
            const state = complete ? 'complete' : isCurrent ? 'current' : 'upcoming'
            return (
              <li
                key={step.id}
                className={cx('hal-wizard__item', `hal-wizard__item--${state}`)}
              >
                <span className="hal-wizard__indicator">
                  <span className="hal-wizard__marker">{complete ? '✓' : index + 1}</span>
                </span>
                <span className="hal-wizard__text">
                  <span className="hal-wizard__label">{step.label}</span>
                  {step.description === undefined || step.description === null ? null : (
                    <span className="hal-wizard__description">{step.description}</span>
                  )}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="hal-wizard__content" aria-live="polite">
        {active ? active.content : null}
      </div>

      {children ? <div className="hal-wizard__footer">{children(api)}</div> : null}
    </div>
  )
})
