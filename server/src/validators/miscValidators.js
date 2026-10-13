// Smaller validators: contact form, product editor and status updates.
import { isValidStatus } from '../config/statuses.js';
import { isValidEmail, isValidPhone, readNumber, readText } from '../utils/validation.js';

export function validateContactMessage(input) {
  const errors = {};
  const value = {
    fullName: readText(input, 'fullName', errors, { label: 'Full name', required: true, max: 120 }),
    email: readText(input, 'email', errors, { label: 'Email address', required: true, max: 190 }).toLowerCase(),
    phone: readText(input, 'phone', errors, { label: 'Phone number', max: 25 }) || null,
    message: readText(input, 'message', errors, { label: 'Message', required: true, max: 2000 }),
  };

  if (value.email && !errors.email && !isValidEmail(value.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (value.phone && !errors.phone && !isValidPhone(value.phone)) {
    errors.phone = 'Please enter a valid phone number, e.g. +264 81 234 5678.';
  }
  if (value.message && !errors.message && value.message.length < 10) {
    errors.message = 'Please write at least 10 characters.';
  }
  return { errors, value };
}

export function validateProduct(input) {
  const errors = {};
  const value = {
    name: readText(input, 'name', errors, { label: 'Product name', required: true, max: 120 }),
    categoryId: readNumber(input, 'categoryId', errors, { label: 'Category', min: 1, max: 100000, integer: true }),
    description: readText(input, 'description', errors, { label: 'Description', max: 500 }) || null,
    compatibility: readText(input, 'compatibility', errors, { label: 'Compatibility', max: 160 }) || null,
    price: readNumber(input, 'price', errors, { label: 'Price', min: 0, max: 1000000 }),
    stockQuantity: readNumber(input, 'stockQuantity', errors, { label: 'Stock quantity', min: 0, max: 100000, integer: true }),
    imageUrl: readText(input, 'imageUrl', errors, { label: 'Image path', max: 255 }) || null,
    isActive: input?.isActive !== false, // active unless explicitly switched off
  };

  // Either a file in client/public (starts with "/") or a full https:// link.
  if (value.imageUrl && !errors.imageUrl && !/^(\/|https:\/\/)/.test(value.imageUrl)) {
    errors.imageUrl = 'Use a path that starts with "/" (a file in client/public) or an https:// link.';
  }
  return { errors, value };
}

export function validateStatusUpdate(input, type) {
  const errors = {};
  const status = typeof input?.status === 'string' ? input.status : '';
  if (!isValidStatus(type, status)) {
    errors.status = 'Please choose a valid status.';
  }
  const note = readText(input, 'note', errors, { label: 'Note', max: 500 }) || null;
  return { errors, value: { status, note } };
}
