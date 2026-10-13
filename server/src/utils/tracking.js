// Pure helper functions for the tracking page (no database access here, which
// makes them easy to unit test - see tests/tracking.test.js).
import { STATUS_CONFIG, findStatus } from '../config/statuses.js';

function digitsOnly(text) {
  return String(text).replace(/\D/g, '');
}

// How many digits (counted from the end) two phone numbers must share.
const PHONE_DIGITS_COMPARED = 8;

// True when `contact` is the email or phone number saved on the booking.
// Phone numbers are compared by their last 8 digits, so "+264 81 234 5678"
// and "081 234 5678" count as the same number.
export function contactMatches(contact, { email, phone }) {
  const typed = String(contact || '').trim().toLowerCase();
  if (!typed) return false;

  if (typed.includes('@')) {
    return typed === String(email).toLowerCase();
  }

  const typedDigits = digitsOnly(typed);
  const savedDigits = digitsOnly(phone);
  if (typedDigits.length < 7 || savedDigits.length < 7) return false;
  return typedDigits.slice(-PHONE_DIGITS_COMPARED) === savedDigits.slice(-PHONE_DIGITS_COMPARED);
}

// Works out what the progress bar should show for a status code.
export function describeProgress(type, statusCode) {
  const status = findStatus(type, statusCode);
  const steps = STATUS_CONFIG[type].steps;

  return {
    status: statusCode,
    statusLabel: status?.label || statusCode,
    steps,
    currentStep: status ? status.step : 0,
    isCancelled: status?.step === -1,
  };
}

// "Screen Repair, Battery Replacement + 2 more"
export function summariseList(items, visible = 2) {
  if (items.length <= visible) return items.join(', ');
  return `${items.slice(0, visible).join(', ')} + ${items.length - visible} more`;
}
