// =============================================================================
// REPAIR FORM OPTIONS - add, remove or rename anything here and the
// "Request a Repair" form updates by itself. No other file needs to change:
// the server stores the labels exactly as written below.
// =============================================================================

// `os` pre-selects the operating system when the brand is chosen (the customer
// can still change it). `models` are grouped by device type; a brand or type
// with no list simply shows a free-text box instead of a dropdown.
export const DEVICE_BRANDS = [
  {
    name: 'Apple',
    os: 'ios',
    models: {
      smartphone: [
        'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16', 'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15',
        'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 12',
        'iPhone 11', 'iPhone XR', 'iPhone SE',
      ],
      tablet: ['iPad Pro', 'iPad Air', 'iPad (10th Gen)', 'iPad (9th Gen)', 'iPad mini'],
    },
  },
  {
    name: 'Samsung',
    os: 'android',
    models: {
      smartphone: [
        'Galaxy S24 Ultra', 'Galaxy S24', 'Galaxy S23', 'Galaxy S22', 'Galaxy A55', 'Galaxy A35', 'Galaxy A15',
        'Galaxy A05', 'Galaxy Z Flip', 'Galaxy Z Fold',
      ],
      tablet: ['Galaxy Tab S9', 'Galaxy Tab A9', 'Galaxy Tab A8'],
    },
  },
  {
    name: 'Huawei',
    os: 'android',
    models: {
      smartphone: ['P60 Pro', 'P40', 'P30 Pro', 'P30 Lite', 'Nova 12', 'Nova Y61', 'Y9'],
      tablet: ['MatePad 11', 'MatePad SE'],
    },
  },
  {
    name: 'Xiaomi',
    os: 'android',
    models: {
      smartphone: ['Xiaomi 14', 'Xiaomi 13T', 'Redmi Note 13', 'Redmi Note 12', 'Redmi 13C', 'POCO X6'],
      tablet: ['Xiaomi Pad 6', 'Redmi Pad SE'],
    },
  },
  {
    name: 'Google',
    os: 'android',
    models: {
      smartphone: ['Pixel 9 Pro', 'Pixel 9', 'Pixel 8 Pro', 'Pixel 8', 'Pixel 7a', 'Pixel 7', 'Pixel 6a'],
      tablet: ['Pixel Tablet'],
    },
  },
  { name: 'Other', os: 'other', models: {} },
];

// Shown at the end of every model dropdown. Choosing it reveals a text box.
export const OTHER_MODEL = 'Other / not listed';

export const DEVICE_TYPES = [
  { value: 'smartphone', label: 'Smartphone' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'other', label: 'Other device' },
];

export const OPERATING_SYSTEMS = [
  { value: 'ios', label: 'iOS (iPhone / iPad)' },
  { value: 'android', label: 'Android' },
  { value: 'other', label: 'Other / not sure' },
];

export const HARDWARE_ISSUES = [
  'Screen Repair',
  'Battery Replacement',
  'Charging Port',
  'Housing / Back Cover',
  'Camera Repair',
  'Front Camera',
  'Rear Camera',
  'Speaker',
  'Microphone',
  'Earpiece',
  'Power Button',
  'Volume Button',
  'Side Button / Switch',
  'Face ID / Fingerprint Sensor',
  'Water / Liquid Damage',
  'Motherboard / Logic Board',
  'Network / Wi-Fi / Bluetooth',
  'Vibration Motor',
  'SIM Tray / SIM Reader',
  'Rear Glass Replacement',
  'Other Hardware Issue',
];

// Which list appears depends on the operating system chosen above.
// Note: this business does not bypass passcodes, activation locks or any other
// ownership protection, so no such option belongs in these lists.
export const SOFTWARE_ISSUES = {
  ios: [
    'Stuck on the Apple logo',
    'Boot loop / will not start',
    'Frozen or unresponsive',
    'iOS update failed',
    'Software install or restore problem',
    'Apps crashing or not opening',
    'Phone running slowly',
    'Storage full',
    'Wi-Fi, Bluetooth or network settings',
    'Backup or data transfer help',
    'iCloud setup or sync',
    'Email or account setup',
    'Notifications not working',
    'Battery draining quickly',
    'Overheating',
    'Settings or configuration problem',
    'Other iOS software issue',
  ],
  android: [
    'Stuck on the manufacturer logo',
    'Boot loop / will not start',
    'Android update failed',
    'Apps crashing',
    'Device running slowly',
    'Storage problems',
    'Google account or sync',
    'Wi-Fi, Bluetooth or mobile network settings',
    'Backup or data transfer help',
    'Malware or suspicious app',
    'Software restore or factory reset help',
    'Notifications not working',
    'Battery draining quickly',
    'Other Android software issue',
  ],
  other: [
    'Will not start',
    'Frozen or unresponsive',
    'Update failed',
    'Running slowly',
    'Backup or data transfer help',
    'Other software issue',
  ],
};

// Must match PICKUP_TIMES in server/src/validators/repairValidator.js.
export const PICKUP_TIMES = ['Morning (08:00 - 12:00)', 'Afternoon (12:00 - 17:00)', 'Any time'];

export const CONTACT_METHODS = [
  { value: 'phone', label: 'Phone call' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
];
