// =============================================================================
// SELL YOUR DEVICE FORM OPTIONS
//
// Labels (the text people read) can be changed freely. The `value`s of
// DEVICE_TYPES, CONDITIONS, POWERS_ON and REPAIRED_BEFORE are also checked by
// the server (server/src/validators/sellValidator.js) and stored in MySQL ENUM
// columns, so to add or rename a VALUE you must update those two places too.
// =============================================================================
import { Laptop, ShoppingCart, Smartphone, Tablet } from 'lucide-react';

export const SELL_DEVICE_TYPES = [
  { value: 'phone', label: 'Phone', icon: Smartphone },
  { value: 'tablet', label: 'Tablet', icon: Tablet },
  { value: 'laptop', label: 'Laptop', icon: Laptop },
  { value: 'other', label: 'Other', icon: ShoppingCart },
];

export const SELL_BRANDS = ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'Google', 'Lenovo', 'HP', 'Dell', 'Other'];

export const STORAGE_OPTIONS = ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', 'Not sure'];

export const DEVICE_AGES = ['Less than 6 months', '6 - 12 months', '1 - 2 years', '2 - 3 years', 'More than 3 years', 'Not sure'];

export const CONDITIONS = [
  { value: 'like_new', label: 'Like new - no visible marks' },
  { value: 'good', label: 'Good - light signs of use' },
  { value: 'fair', label: 'Fair - visible scratches or dents' },
  { value: 'poor', label: 'Poor - heavy wear or cracks' },
  { value: 'faulty', label: 'Faulty - not working properly' },
];

export const POWERS_ON = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'sometimes', label: 'Sometimes' },
];

export const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

export const REPAIRED_BEFORE = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
];

export const BATTERY_CONDITIONS = ['Lasts all day', 'Needs charging during the day', 'Drains very quickly', 'Not sure'];

export const ACCESSORIES = ['Original box', 'Charger', 'Charging cable', 'Earphones', 'Case / cover', 'Proof of purchase'];

// Shown in the sidebar card.
export const SELL_BENEFITS = [
  { title: 'Fast and easy process', text: 'Send your details in a few minutes.' },
  { title: 'Fair, honest assessment', text: 'We look at the real condition of your device.' },
  { title: 'Safe and secure', text: 'You decide whether to accept any offer.' },
];
