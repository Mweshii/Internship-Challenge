// Describes the three kinds of customer record the dashboard shows. The
// RecordsTab and RecordDetail components are generic: they read this config to
// know which columns and details to display for each kind.
//
//   key      - the API resource name: /api/admin/<key>
//   type     - the record type used for statuses ('repair' | 'order' | 'sell')
//   columns  - extra table columns: { header, value(record) }
//   details  - builds the [label, value] rows for the detail window
import { formatPrice } from '../../utils/format.js';

const CONTACT_LABELS = { phone: 'Phone call', whatsapp: 'WhatsApp', email: 'Email' };
const CONDITION_LABELS = { like_new: 'Like new', good: 'Good', fair: 'Fair', poor: 'Poor', faulty: 'Faulty' };
const YES_NO_LABELS = { yes: 'Yes', no: 'No', sometimes: 'Sometimes', unsure: 'Not sure' };

function customerRows(record) {
  const rows = [
    ['Customer', record.customerName],
    ['Phone', record.customerPhone],
    ['Email', record.customerEmail],
  ];
  if (record.contactMethod) rows.push(['Prefers', CONTACT_LABELS[record.contactMethod]]);
  return rows;
}

function repairDetails(repair) {
  const rows = [
    ['Device', `${repair.deviceBrand} ${repair.deviceModel} (${repair.deviceType}, ${repair.operatingSystem})`],
    ['Hardware issues', repair.hardwareIssues.join(', ')],
    ['Software issues', repair.softwareIssues.join(', ')],
    ['Description', repair.description],
    ['Service option', repair.serviceMethod === 'pickup' ? 'Pickup' : 'Drop-off'],
  ];
  if (repair.serviceMethod === 'pickup') {
    rows.push(
      ['Pickup address', [repair.pickupAddress, repair.pickupStreet, repair.pickupArea].join(', ')],
      ['Pickup instructions', repair.pickupInstructions],
      ['Preferred pickup', [repair.pickupDate, repair.pickupTime].filter(Boolean).join(' - ')]
    );
  }
  return [...rows, ...customerRows(repair)];
}

function orderDetails(order) {
  const rows = [
    ['Items', (order.items || []).map((item) => `${item.quantity} x ${item.name} @ ${formatPrice(item.unitPrice)}`).join('; ')],
    ['Subtotal', formatPrice(order.subtotal)],
    ['Delivery fee', formatPrice(order.deliveryFee)],
    ['Total', formatPrice(order.total)],
    ['Payment', order.paymentStatus === 'paid' ? 'Paid' : 'Not paid (no online payment)'],
    ['Fulfilment', order.fulfilmentMethod === 'delivery' ? 'Delivery' : 'Collection'],
  ];
  if (order.fulfilmentMethod === 'delivery') {
    rows.push(
      ['Delivery address', [order.deliveryAddress, order.deliveryStreet, order.deliveryArea].join(', ')],
      ['Delivery instructions', order.deliveryInstructions]
    );
  }
  return [...rows, ...customerRows(order)];
}

function sellDetails(enquiry) {
  return [
    ['Device', `${enquiry.brand} ${enquiry.model} (${enquiry.deviceType})`],
    ['Storage', enquiry.storageCapacity],
    ['Age', enquiry.deviceAge],
    ['Condition', CONDITION_LABELS[enquiry.deviceCondition]],
    ['Switches on', YES_NO_LABELS[enquiry.powersOn]],
    ['Battery', enquiry.batteryCondition],
    ['Screen damaged', enquiry.screenDamaged ? 'Yes' : 'No'],
    ['Repaired before', YES_NO_LABELS[enquiry.repairedBefore]],
    ['Hardware problems', enquiry.hardwareProblems],
    ['Software problems', enquiry.softwareProblems],
    ['Accessories', (enquiry.accessoriesIncluded || []).join(', ')],
    ['Description', enquiry.description],
    ['Customer asking price', formatPrice(enquiry.askingPrice)],
    ...customerRows(enquiry),
  ];
}

export const RECORD_CONFIG = {
  repairs: {
    type: 'repair',
    title: 'Repair Requests',
    searchPlaceholder: 'Search by reference, customer or model...',
    columns: [
      { header: 'Device', value: (repair) => `${repair.deviceBrand} ${repair.deviceModel}` },
      { header: 'Customer', value: (repair) => repair.customerName },
      { header: 'Service', value: (repair) => (repair.serviceMethod === 'pickup' ? 'Pickup' : 'Drop-off') },
    ],
    details: repairDetails,
    photos: (repair) => (repair.imagePath ? [repair.imagePath] : []),
  },
  orders: {
    type: 'order',
    title: 'Shop Orders',
    searchPlaceholder: 'Search by reference or customer...',
    columns: [
      { header: 'Customer', value: (order) => order.customerName },
      { header: 'Total', value: (order) => formatPrice(order.total) },
      { header: 'Fulfilment', value: (order) => (order.fulfilmentMethod === 'delivery' ? 'Delivery' : 'Collection') },
    ],
    details: orderDetails,
    photos: () => [],
  },
  'sell-enquiries': {
    type: 'sell',
    title: 'Device Sale Enquiries',
    searchPlaceholder: 'Search by reference, customer, brand or model...',
    columns: [
      { header: 'Device', value: (enquiry) => `${enquiry.brand} ${enquiry.model}` },
      { header: 'Customer', value: (enquiry) => enquiry.customerName },
      { header: 'Asking', value: (enquiry) => formatPrice(enquiry.askingPrice) },
      { header: 'Our offer', value: (enquiry) => (enquiry.proposedOffer === null ? '-' : formatPrice(enquiry.proposedOffer)) },
    ],
    details: sellDetails,
    photos: (enquiry) => enquiry.photos || [],
  },
};
