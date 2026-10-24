import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import type { HTMLAttributes, LabelHTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

interface FieldContextValue {
  controlId: string
  descriptionId: string
  errorId: string
  invalid: boolean
  descriptionMounted: boolean
  errorMounted: boolean
  registerDescription: (mounted: boolean) => void
  registerError: (mounted: boolean) => void
}

const FieldContext = createContext<FieldContextValue | null>(null)

function useFieldContext(): FieldContextValue {
  const ctx = useContext(FieldContext)
  if (!ctx) {
    throw new Error('Field subcomponents must be rendered inside <Field>.')
  }
  return ctx
}

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Id wired to the control and the label's htmlFor. Generated when omitted. */
  id?: string
  /** Marks the field as failing validation for aria-invalid wiring. */
  invalid?: boolean
}

const FieldRoot = /* @__PURE__ */ forwardRef<HTMLDivElement, FieldProps>(function Field(
  { id, invalid = false, className, children, ...rest },
  ref,
) {
  const generated = useId()
  const controlId = id ?? generated
  const descriptionId = `${controlId}-description`
  const errorId = `${controlId}-error`

  const [descriptionMounted, setDescriptionMounted] = useState(false)
  const [errorMounted, setErrorMounted] = useState(false)

  const registerDescription = useCallback((mounted: boolean) => {
    setDescriptionMounted(mounted)
  }, [])

  const registerError = useCallback((mounted: boolean) => {
    setErrorMounted(mounted)
  }, [])

  const value = useMemo<FieldContextValue>(
    () => ({
      controlId,
      descriptionId,
      errorId,
      invalid,
      descriptionMounted,
      errorMounted,
      registerDescription,
      registerError,
    }),
    [
      controlId,
      descriptionId,
      errorId,
      invalid,
      descriptionMounted,
      errorMounted,
      registerDescription,
      registerError,
    ],
  )

  return (
    <FieldContext.Provider value={value}>
      <div {...rest} ref={ref} className={cx('hal-field', className)}>
        {children}
      </div>
    </FieldContext.Provider>
  )
})

export type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement>

export const FieldLabel = /* @__PURE__ */ forwardRef<HTMLLabelElement, FieldLabelProps>(
  function FieldLabel({ className, htmlFor, ...rest }, ref) {
    const { controlId } = useFieldContext()
    return (
      <label
        {...rest}
        ref={ref}
        htmlFor={htmlFor ?? controlId}
        className={cx('hal-field__label', className)}
      />
    )
  },
)

export type FieldDescriptionProps = HTMLAttributes<HTMLParagraphElement>

export const FieldDescription = /* @__PURE__ */ forwardRef<
  HTMLParagraphElement,
  FieldDescriptionProps
>(function FieldDescription({ className, id, ...rest }, ref) {
  const { descriptionId, registerDescription } = useFieldContext()

  useLayoutEffect(() => {
    registerDescription(true)
    return () => registerDescription(false)
  }, [registerDescription])

  return (
    <p
      {...rest}
      ref={ref}
      id={id ?? descriptionId}
      className={cx('hal-field__description', className)}
    />
  )
})

export type FieldErrorProps = HTMLAttributes<HTMLParagraphElement>

export const FieldError = /* @__PURE__ */ forwardRef<HTMLParagraphElement, FieldErrorProps>(
  function FieldError({ className, id, role = 'alert', ...rest }, ref) {
    const { errorId, registerError } = useFieldContext()

    useLayoutEffect(() => {
      registerError(true)
      return () => registerError(false)
    }, [registerError])

    return (
      <p
        {...rest}
        ref={ref}
        id={id ?? errorId}
        role={role}
        className={cx('hal-field__error', className)}
      />
    )
  },
)

/** Props to spread onto the field control (input, select trigger, etc.). */
export function useFieldControlProps(): {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  /** For controls that take an `invalid` prop instead of aria-invalid alone. */
  invalid?: boolean
} {
  const {
    controlId,
    descriptionId,
    errorId,
    invalid,
    descriptionMounted,
    errorMounted,
  } = useFieldContext()

  const describedBy = [
    descriptionMounted ? descriptionId : null,
    errorMounted ? errorId : null,
  ]
    .filter(Boolean)
    .join(' ')

  return {
    id: controlId,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': invalid || undefined,
    invalid: invalid || undefined,
  }
}

export interface FieldComponent
  extends ReturnType<typeof forwardRef<HTMLDivElement, FieldProps>> {
  Label: typeof FieldLabel
  Description: typeof FieldDescription
  Error: typeof FieldError
}

export const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Description: FieldDescription,
  Error: FieldError,
}) as FieldComponent
