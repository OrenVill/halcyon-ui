import { Button } from '../../components/Button'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Textarea } from '../../components/Textarea'

const TIMEZONE_OPTIONS = [
  { value: 'europe/zurich', label: 'Europe / Zurich' },
  { value: 'america/new_york', label: 'America / New York' },
  { value: 'asia/tokyo', label: 'Asia / Tokyo' },
]

export function SaasLoginForm() {
  return (
    <>
      <Field>
        <Field.Label>Work email</Field.Label>
        <Input type="email" aria-label="Work email" autoComplete="email" />
      </Field>
      <Field>
        <Field.Label>Password</Field.Label>
        <Input type="password" aria-label="Password" autoComplete="current-password" />
      </Field>
      <Button fullWidth type="submit">Sign in to workspace</Button>
    </>
  )
}

export function SaasSignupForm() {
  return (
    <>
      <Field>
        <Field.Label>Company</Field.Label>
        <Input aria-label="Company" />
      </Field>
      <Field>
        <Field.Label>Work email</Field.Label>
        <Input type="email" aria-label="Work email" autoComplete="email" />
      </Field>
      <Field>
        <Field.Label>Password</Field.Label>
        <Input type="password" aria-label="Password" autoComplete="new-password" />
      </Field>
      <Button fullWidth type="submit">Create workspace</Button>
    </>
  )
}

export function SaasSettingsProfileForm() {
  return (
    <>
      <Field>
        <Field.Label>Display name</Field.Label>
        <Input aria-label="Display name" defaultValue="Ada Lovelace" />
      </Field>
      <Field>
        <Field.Label>Email</Field.Label>
        <Input type="email" aria-label="Email" defaultValue="ada@acme.example" />
      </Field>
      <Field>
        <Field.Label>Timezone</Field.Label>
        <Select aria-label="Timezone" options={TIMEZONE_OPTIONS} defaultValue="europe/zurich" />
      </Field>
      <Field>
        <Field.Label>Bio</Field.Label>
        <Textarea aria-label="Bio" rows={3} placeholder="A short note for your team profile." />
      </Field>
      <Button size="sm">Save changes</Button>
    </>
  )
}

export function SaasOnboardingProjectForm() {
  return (
    <>
      <Field>
        <Field.Label>Project name</Field.Label>
        <Input aria-label="Project name" placeholder="halcyon-ui" />
      </Field>
      <Field>
        <Field.Label>Invite teammates</Field.Label>
        <Field.Description>Comma-separated emails — optional.</Field.Description>
        <Textarea aria-label="Invite teammates" rows={2} placeholder="ada@acme.example, grace@acme.example" />
      </Field>
    </>
  )
}
