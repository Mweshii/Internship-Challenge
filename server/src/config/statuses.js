// Every status a repair, order or sell enquiry can have.
//
//   code  - what is stored in the database (never change a code that is in use)
//   label - what people see (safe to reword)
//   step  - which bubble of the tracking progress bar this status lights up
//           (an index into the matching *_STEPS list; -1 = cancelled)
//
// To add a status: add a line here. The admin dropdowns and the tracking page
// pick it up automatically.

export const REPAIR_STEPS = ['Received', 'Assessment', 'In Progress', 'Ready', 'Completed'];
export const REPAIR_STATUSES = [
  { code: 'request_received', label: 'Request Received', step: 0 },
  { code: 'awaiting_assessment', label: 'Awaiting Assessment', step: 1 },
  { code: 'awaiting_customer_approval', label: 'Awaiting Customer Approval', step: 1 },
  { code: 'awaiting_parts', label: 'Awaiting Parts', step: 2 },
  { code: 'repair_in_progress', label: 'Repair In Progress', step: 2 },
  { code: 'ready_for_collection', label: 'Ready for Collection', step: 3 },
  { code: 'out_for_delivery', label: 'Out for Delivery', step: 3 },
  { code: 'completed', label: 'Completed', step: 4 },
  { code: 'cancelled', label: 'Cancelled', step: -1 },
];

export const ORDER_STEPS = ['Received', 'Confirmed', 'Preparing', 'Ready', 'Delivered'];
export const ORDER_STATUSES = [
  { code: 'order_received', label: 'Order Received', step: 0 },
  { code: 'awaiting_confirmation', label: 'Awaiting Confirmation', step: 0 },
  { code: 'confirmed', label: 'Confirmed', step: 1 },
  { code: 'preparing_order', label: 'Preparing Order', step: 2 },
  { code: 'ready_for_collection', label: 'Ready for Collection', step: 3 },
  { code: 'out_for_delivery', label: 'Out for Delivery', step: 3 },
  { code: 'delivered', label: 'Delivered', step: 4 },
  { code: 'cancelled', label: 'Cancelled', step: -1 },
];

export const SELL_STEPS = ['Received', 'Under Review', 'Offer Made', 'Closed'];
export const SELL_STATUSES = [
  { code: 'enquiry_received', label: 'Enquiry Received', step: 0 },
  { code: 'under_review', label: 'Under Review', step: 1 },
  { code: 'offer_made', label: 'Offer Made', step: 2 },
  { code: 'accepted', label: 'Offer Accepted', step: 3 },
  { code: 'declined', label: 'Declined', step: 3 },
  { code: 'cancelled', label: 'Cancelled', step: -1 },
];

// Lets other files look things up by record type: STATUS_CONFIG.repair.statuses
export const STATUS_CONFIG = {
  repair: { statuses: REPAIR_STATUSES, steps: REPAIR_STEPS },
  order: { statuses: ORDER_STATUSES, steps: ORDER_STEPS },
  sell: { statuses: SELL_STATUSES, steps: SELL_STEPS },
};

export function findStatus(type, code) {
  return STATUS_CONFIG[type].statuses.find((status) => status.code === code) || null;
}

export function isValidStatus(type, code) {
  return findStatus(type, code) !== null;
}

// Falls back to the raw code so an unknown status still shows something.
export function statusLabel(type, code) {
  return findStatus(type, code)?.label || code;
}
