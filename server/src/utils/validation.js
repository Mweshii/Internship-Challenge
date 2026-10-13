// Small building blocks shared by the files in src/validators/.
//
// Each read* helper takes the raw request data, returns a cleaned value and, if
// something is wrong, writes a message into `errors` under the field's name.
// A validator is finished when it returns { errors, value }.

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const CONTACT_METHODS = ['phone', 'whatsapp', 'email'];

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

export function isValidEmail(value) {
  return value.length <= 190 && EMAIL_PATTERN.test(value);
}

// Accepts formats like "+264 81 234 5678" or "081-234-5678": 7 to 15 digits.
export function isValidPhone(value) {
  const digits = value.replace(/\D/g, '');
  return /^\+?[\d\s()-]+$/.test(value) && digits.length >= 7 && digits.length <= 15;
}

export function readText(input, field, errors, { label, required = false, max = 255 }) {
  const raw = input?.[field];
  const value = typeof raw === 'string' ? raw.trim() : '';

  if (!value) {
    if (required) errors[field] = `${label} is required.`;
    return '';
  }
  if (value.length > max) {
    errors[field] = `${label} must be ${max} characters or fewer.`;
  }
  return value;
}

export function readChoice(input, field, errors, { label, choices, required = true }) {
  const value = input?.[field];
  if (value === undefined || value === null || value === '') {
    if (required) errors[field] = `Please choose ${label}.`;
    return '';
  }
  if (!choices.includes(value)) {
    errors[field] = `Please choose a valid option for ${label}.`;
    return '';
  }
  return value;
}

// For checkbox groups: an array of short text labels.
export function readTextList(input, field, errors, { label, maxItems = 30, maxLength = 120 }) {
  const raw = input?.[field];
  if (raw === undefined || raw === null) return [];

  const isValid =
    Array.isArray(raw) &&
    raw.length <= maxItems &&
    raw.every((item) => typeof item === 'string' && item.trim() !== '' && item.length <= maxLength);

  if (!isValid) {
    errors[field] = `${label} contains an invalid selection.`;
    return [];
  }
  // Set removes duplicates.
  return [...new Set(raw.map((item) => item.trim()))];
}

export function readNumber(input, field, errors, { label, min, max, integer = false }) {
  const raw = input?.[field];
  const value = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : raw;

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    errors[field] = `${label} is required and must be a number.`;
    return null;
  }
  if (integer && !Number.isInteger(value)) {
    errors[field] = `${label} must be a whole number.`;
    return null;
  }
  if (value < min || value > max) {
    errors[field] = `${label} must be between ${min} and ${max}.`;
    return null;
  }
  return value;
}

// Name, phone, email and (optionally) preferred contact method - the same
// block appears on the repair, sell and checkout forms.
export function readCustomer(input, errors, { withContactMethod = true } = {}) {
  const customer = {
    fullName: readText(input, 'fullName', errors, { label: 'Full name', required: true, max: 120 }),
    phone: readText(input, 'phone', errors, { label: 'Phone number', required: true, max: 25 }),
    email: readText(input, 'email', errors, { label: 'Email address', required: true, max: 190 }).toLowerCase(),
  };

  if (customer.fullName && customer.fullName.length < 2) {
    errors.fullName = 'Please enter your full name.';
  }
  if (customer.phone && !errors.phone && !isValidPhone(customer.phone)) {
    errors.phone = 'Please enter a valid phone number, e.g. +264 81 234 5678.';
  }
  if (customer.email && !errors.email && !isValidEmail(customer.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (withContactMethod) {
    customer.contactMethod = readChoice(input, 'contactMethod', errors, {
      label: 'a preferred contact method',
      choices: CONTACT_METHODS,
    });
  }
  return customer;
}
