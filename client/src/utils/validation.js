// Browser-side form checks.
//
// These give instant feedback, but they are only a convenience: anyone can
// skip the browser and call the API directly, so the server repeats every
// check (server/src/validators/). The rules here mirror those.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(value.trim());
}

// 7 to 15 digits, with optional +, spaces, brackets and dashes.
export function isValidPhone(value) {
  const text = value.trim();
  const digits = text.replace(/\D/g, '');
  return /^\+?[\d\s()-]+$/.test(text) && digits.length >= 7 && digits.length <= 15;
}

// Adds an error for each listed field that is empty.
// `labels` looks like { deviceModel: 'Device model' }.
export function requireFields(values, labels, errors) {
  for (const [field, label] of Object.entries(labels)) {
    if (!String(values[field] ?? '').trim()) {
      errors[field] = `${label} is required.`;
    }
  }
}

// The name / phone / email block shared by several forms.
export function validateCustomer(values, errors, { withContactMethod = true } = {}) {
  requireFields(values, { fullName: 'Full name', phone: 'Phone number', email: 'Email address' }, errors);

  if (!errors.fullName && values.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.';
  }
  if (!errors.phone && !isValidPhone(values.phone)) {
    errors.phone = 'Please enter a valid phone number, e.g. +264 81 234 5678.';
  }
  if (!errors.email && !isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (withContactMethod && !values.contactMethod) {
    errors.contactMethod = 'Please choose how we should contact you.';
  }
}

// After a failed submit, move the page to the first field with an error.
// Each field wrapper carries data-field="<name>" (see components/ui/Field.jsx).
export function scrollToFirstError(errors) {
  const firstField = Object.keys(errors)[0];
  if (!firstField) return;

  // Wait one frame so React has drawn the error messages first.
  requestAnimationFrame(() => {
    const wrapper = document.querySelector(`[data-field="${firstField}"]`);
    if (!wrapper) return;
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    wrapper.querySelector('input, select, textarea, button')?.focus({ preventScroll: true });
  });
}
