// Name, phone, email and preferred contact method. The same block is used on
// the repair form, the sell form and (without the contact method) checkout.
import { CONTACT_METHODS } from '../../config/repairOptions.js';
import { RadioPills } from '../ui/Choices.jsx';
import { Field, TextField } from '../ui/Field.jsx';

export function CustomerFields({ values, errors, onChange, withContactMethod = true }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        label="Full Name"
        name="fullName"
        value={values.fullName}
        onChange={onChange}
        error={errors.fullName}
        placeholder="John Doe"
        autoComplete="name"
        required
      />
      <TextField
        label="Phone Number"
        name="phone"
        type="tel"
        value={values.phone}
        onChange={onChange}
        error={errors.phone}
        placeholder="+264 81 234 5678"
        autoComplete="tel"
        required
      />
      <TextField
        label="Email Address"
        name="email"
        type="email"
        value={values.email}
        onChange={onChange}
        error={errors.email}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
      {withContactMethod && (
        <Field label="Preferred contact method" name="contactMethod" error={errors.contactMethod} required className="sm:col-span-2">
          <RadioPills name="contactMethod" options={CONTACT_METHODS} value={values.contactMethod} onChange={onChange} />
        </Field>
      )}
    </div>
  );
}
