import { Button } from '../../components/Button'
import { Checkbox } from '../../components/Checkbox'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { Link } from '../../components/Link'

const FORGOT_PASSWORD_PATH = '/forgot-password'

export function MarketingLoginForm() {
  return (
    <>
      <Field>
        <Field.Label>Email</Field.Label>
        <Input type="email" aria-label="Email" autoComplete="email" placeholder="you@example.com" />
      </Field>
      <Field>
        <Field.Label>Password</Field.Label>
        <Input type="password" aria-label="Password" autoComplete="current-password" />
      </Field>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--hal-text-sm)' }}>
          <Checkbox id="marketing-remember" defaultChecked />
          Remember me
        </label>
        <Link href={FORGOT_PASSWORD_PATH} variant="muted">Forgot password?</Link>
      </div>
      <Button fullWidth type="submit">Sign in</Button>
    </>
  )
}

export function MarketingSignupForm() {
  return (
    <>
      <Field>
        <Field.Label>Full name</Field.Label>
        <Input aria-label="Full name" autoComplete="name" />
      </Field>
      <Field>
        <Field.Label>Work email</Field.Label>
        <Input type="email" aria-label="Work email" autoComplete="email" />
      </Field>
      <Field>
        <Field.Label>Password</Field.Label>
        <Field.Description>At least 12 characters.</Field.Description>
        <Input type="password" aria-label="Password" autoComplete="new-password" />
      </Field>
      <Field>
        <Field.Label>Confirm password</Field.Label>
        <Input type="password" aria-label="Confirm password" autoComplete="new-password" />
      </Field>
      <label style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: 'var(--hal-text-sm)' }}>
        <Checkbox id="marketing-terms" />
        <span>I agree to the terms and privacy policy</span>
      </label>
      <Button fullWidth type="submit">Create account</Button>
    </>
  )
}

export function MarketingForgotPasswordForm() {
  return (
    <>
      <Field>
        <Field.Label>Email</Field.Label>
        <Field.Description>We will send a reset link if an account exists.</Field.Description>
        <Input type="email" aria-label="Email" autoComplete="email" />
      </Field>
      <Button fullWidth type="submit">Send reset link</Button>
    </>
  )
}
