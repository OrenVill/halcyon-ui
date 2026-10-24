import { Button } from '../../components/Button'
import { Checkbox } from '../../components/Checkbox'
import { Field } from '../../components/Field'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Separator } from '../../components/Separator'

const COUNTRY_OPTIONS = [
  { value: 'ch', label: 'Switzerland' },
  { value: 'de', label: 'Germany' },
  { value: 'us', label: 'United States' },
]

export function CommerceOrderSummary() {
  return (
    <div className="hal-commerce-summary">
      <ul className="hal-commerce-summary__lines">
        <li>
          <span>Desk lamp</span>
          <span>$32.00</span>
        </li>
        <li>
          <span>Notebook set</span>
          <span>$16.00</span>
        </li>
      </ul>
      <Separator />
      <div className="hal-commerce-summary__row">
        <span>Subtotal</span>
        <span>$48.00</span>
      </div>
      <div className="hal-commerce-summary__row">
        <span>Shipping</span>
        <span>$0.00</span>
      </div>
      <div className="hal-commerce-summary__row hal-commerce-summary__row--total">
        <strong>Total</strong>
        <strong>$48.00</strong>
      </div>
    </div>
  )
}

export function CommerceCheckoutForm() {
  return (
    <>
      <section className="hal-checkout-layout__section" aria-labelledby="checkout-contact">
        <h2 className="hal-checkout-layout__section-title" id="checkout-contact">Contact</h2>
        <Field>
          <Field.Label>Email</Field.Label>
          <Field.Description>Receipt and order updates.</Field.Description>
          <Input type="email" aria-label="Email" autoComplete="email" placeholder="you@example.com" />
        </Field>
      </section>

      <section className="hal-checkout-layout__section" aria-labelledby="checkout-shipping">
        <h2 className="hal-checkout-layout__section-title" id="checkout-shipping">Shipping</h2>
        <Field>
          <Field.Label>Full name</Field.Label>
          <Input aria-label="Full name" autoComplete="name" />
        </Field>
        <Field>
          <Field.Label>Address</Field.Label>
          <Input aria-label="Address line 1" autoComplete="address-line1" />
        </Field>
        <div className="hal-checkout-layout__row">
          <Field>
            <Field.Label>City</Field.Label>
            <Input aria-label="City" autoComplete="address-level2" />
          </Field>
          <Field>
            <Field.Label>Postal code</Field.Label>
            <Input aria-label="Postal code" autoComplete="postal-code" />
          </Field>
        </div>
        <Field>
          <Field.Label>Country</Field.Label>
          <Select aria-label="Country" options={COUNTRY_OPTIONS} defaultValue="ch" />
        </Field>
      </section>

      <section className="hal-checkout-layout__section" aria-labelledby="checkout-payment">
        <h2 className="hal-checkout-layout__section-title" id="checkout-payment">Payment</h2>
        <Field>
          <Field.Label>Name on card</Field.Label>
          <Input aria-label="Name on card" autoComplete="cc-name" />
        </Field>
        <Field>
          <Field.Label>Card number</Field.Label>
          <Input
            aria-label="Card number"
            autoComplete="cc-number"
            inputMode="numeric"
            placeholder="4242 4242 4242 4242"
          />
        </Field>
        <div className="hal-checkout-layout__row">
          <Field>
            <Field.Label>Expiry</Field.Label>
            <Input aria-label="Expiry" autoComplete="cc-exp" placeholder="MM / YY" />
          </Field>
          <Field>
            <Field.Label>Security code</Field.Label>
            <Input
              aria-label="Security code"
              autoComplete="cc-csc"
              inputMode="numeric"
              placeholder="CVC"
            />
          </Field>
        </div>
        <Checkbox defaultChecked>Billing address same as shipping</Checkbox>
      </section>

      <Button fullWidth>Pay $48.00</Button>
    </>
  )
}
