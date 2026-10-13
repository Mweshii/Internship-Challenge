import { readChoice, readCustomer, readText, readTextList } from '../utils/validation.js';

export const DEVICE_TYPES = ['smartphone', 'tablet', 'other'];
export const OPERATING_SYSTEMS = ['ios', 'android', 'other'];
export const SERVICE_METHODS = ['dropoff', 'pickup'];
export const PICKUP_TIMES = ['Morning (08:00 - 12:00)', 'Afternoon (12:00 - 17:00)', 'Any time'];

// 'YYYY-MM-DD' for today, in the server's local time.
function todayAsText() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function readPickupDate(input, errors) {
  const value = readText(input, 'pickupDate', errors, { label: 'Pickup date', max: 10 });
  if (!value) return null;

  const isRealDate = /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
  if (!isRealDate) {
    errors.pickupDate = 'Please choose a valid pickup date.';
    return null;
  }
  // Both are YYYY-MM-DD, so comparing the text compares the dates.
  if (value < todayAsText()) {
    errors.pickupDate = 'The pickup date cannot be in the past.';
    return null;
  }
  return value;
}

export function validateRepairRequest(input) {
  const errors = {};

  const value = {
    deviceBrand: readText(input, 'deviceBrand', errors, { label: 'Device brand', required: true, max: 40 }),
    deviceType: readChoice(input, 'deviceType', errors, { label: 'a device type', choices: DEVICE_TYPES }),
    deviceModel: readText(input, 'deviceModel', errors, { label: 'Device model', required: true, max: 80 }),
    operatingSystem: readChoice(input, 'operatingSystem', errors, {
      label: 'an operating system',
      choices: OPERATING_SYSTEMS,
    }),
    hardwareIssues: readTextList(input, 'hardwareIssues', errors, { label: 'Hardware issues' }),
    softwareIssues: readTextList(input, 'softwareIssues', errors, { label: 'Software issues' }),
    description: readText(input, 'description', errors, { label: 'The description', max: 2000 }),
    serviceMethod: readChoice(input, 'serviceMethod', errors, { label: 'drop-off or pickup', choices: SERVICE_METHODS }),
  };

  // The business needs to know what is wrong: at least one ticked issue or a
  // written description.
  const describedSomething = value.hardwareIssues.length + value.softwareIssues.length > 0 || value.description;
  if (!describedSomething && !errors.hardwareIssues && !errors.softwareIssues) {
    errors.issues = 'Select at least one issue, or describe the problem below.';
  }

  // Pickup details are only required - and only saved - when pickup is chosen.
  const pickup = {
    pickupAddress: null,
    pickupArea: null,
    pickupStreet: null,
    pickupInstructions: null,
    pickupDate: null,
    pickupTime: null,
  };
  if (value.serviceMethod === 'pickup') {
    pickup.pickupAddress = readText(input, 'pickupAddress', errors, { label: 'Pickup address', required: true, max: 200 });
    pickup.pickupArea = readText(input, 'pickupArea', errors, { label: 'Area or suburb', required: true, max: 100 });
    pickup.pickupStreet = readText(input, 'pickupStreet', errors, {
      label: 'Street, building or landmark',
      required: true,
      max: 200,
    });
    pickup.pickupInstructions = readText(input, 'pickupInstructions', errors, { label: 'Instructions', max: 500 }) || null;
    pickup.pickupDate = readPickupDate(input, errors);
    pickup.pickupTime =
      readChoice(input, 'pickupTime', errors, { label: 'a pickup time', choices: PICKUP_TIMES, required: false }) || null;
  }

  const customer = readCustomer(input, errors);

  return { errors, value: { ...value, ...pickup, ...customer } };
}
