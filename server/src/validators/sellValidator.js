import { readChoice, readCustomer, readNumber, readText, readTextList } from '../utils/validation.js';

export const SELL_DEVICE_TYPES = ['phone', 'tablet', 'laptop', 'other'];
export const DEVICE_CONDITIONS = ['like_new', 'good', 'fair', 'poor', 'faulty'];
export const POWERS_ON_OPTIONS = ['yes', 'no', 'sometimes'];
export const YES_NO = ['yes', 'no'];
export const REPAIRED_BEFORE_OPTIONS = ['yes', 'no', 'unsure'];
export const MAX_ASKING_PRICE = 500000;

export function validateSellEnquiry(input) {
  const errors = {};

  const value = {
    deviceType: readChoice(input, 'deviceType', errors, { label: 'a device type', choices: SELL_DEVICE_TYPES }),
    brand: readText(input, 'brand', errors, { label: 'Brand', required: true, max: 60 }),
    model: readText(input, 'model', errors, { label: 'Model', required: true, max: 80 }),
    storageCapacity: readText(input, 'storageCapacity', errors, { label: 'Storage capacity', max: 40 }) || null,
    deviceAge: readText(input, 'deviceAge', errors, { label: 'Device age', max: 40 }) || null,
    deviceCondition: readChoice(input, 'deviceCondition', errors, {
      label: 'the overall condition',
      choices: DEVICE_CONDITIONS,
    }),
    powersOn: readChoice(input, 'powersOn', errors, {
      label: 'whether the device switches on',
      choices: POWERS_ON_OPTIONS,
    }),
    batteryCondition: readText(input, 'batteryCondition', errors, { label: 'Battery condition', max: 40 }) || null,
    hardwareProblems: readText(input, 'hardwareProblems', errors, { label: 'Hardware problems', max: 1000 }) || null,
    softwareProblems: readText(input, 'softwareProblems', errors, { label: 'Software problems', max: 1000 }) || null,
    // The form sends 'yes' / 'no'; the database stores true / false.
    screenDamaged:
      readChoice(input, 'screenDamaged', errors, { label: 'whether the screen is damaged', choices: YES_NO }) === 'yes',
    repairedBefore: readChoice(input, 'repairedBefore', errors, {
      label: 'whether the device has been repaired before',
      choices: REPAIRED_BEFORE_OPTIONS,
    }),
    accessoriesIncluded: readTextList(input, 'accessoriesIncluded', errors, { label: 'Accessories', maxItems: 15 }),
    description: readText(input, 'description', errors, { label: 'The description', max: 2000 }) || null,
    askingPrice: readNumber(input, 'askingPrice', errors, { label: 'Asking price', min: 1, max: MAX_ASKING_PRICE }),
  };

  if (value.askingPrice !== null) {
    value.askingPrice = Math.round(value.askingPrice * 100) / 100; // keep 2 decimals
  }

  const customer = readCustomer(input, errors);

  return { errors, value: { ...value, ...customer } };
}

// What an admin may change on an enquiry. Every field is optional.
export function validateSellReview(input) {
  const errors = {};
  const value = {
    adminNotes: readText(input, 'adminNotes', errors, { label: 'Notes', max: 1000 }) || null,
    proposedOffer: null,
  };

  const hasOffer = input?.proposedOffer !== undefined && input.proposedOffer !== null && input.proposedOffer !== '';
  if (hasOffer) {
    const offer = readNumber(input, 'proposedOffer', errors, { label: 'Proposed offer', min: 0, max: MAX_ASKING_PRICE });
    value.proposedOffer = offer === null ? null : Math.round(offer * 100) / 100;
  }

  return { errors, value };
}
