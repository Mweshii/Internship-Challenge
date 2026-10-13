// POST /api/track (public) - look up a repair, order or sell enquiry.
//
// Privacy rules:
//   1. A reference number alone is not enough. The visitor must also give the
//      phone number or email used on the booking.
//   2. "No such reference" and "wrong phone/email" return the SAME message, so
//      nobody can use this page to discover which references exist.
//   3. The response contains progress information only - no name, address,
//      phone number or email.
import { getRepairByReference } from '../models/repairModel.js';
import { getOrderByReference } from '../models/orderModel.js';
import { getSellEnquiryByReference } from '../models/sellModel.js';
import { listStatusHistory } from '../models/statusHistoryModel.js';
import { AppError } from '../utils/errors.js';
import { parseReference } from '../utils/reference.js';
import { contactMatches, describeProgress, summariseList } from '../utils/tracking.js';

const NOT_FOUND_MESSAGE =
  'We could not find a booking matching that reference and contact detail. Please check both and try again.';

const SERVICE_METHOD_LABELS = { dropoff: 'Drop-off at the shop', pickup: 'Pickup from your location' };
const FULFILMENT_LABELS = { delivery: 'Delivery', collection: 'Collection from the shop' };

// Each kind of record knows how to find itself and what is safe to show.
const TRACKERS = {
  repair: {
    typeLabel: 'Repair request',
    find: getRepairByReference,
    describe: (repair) => [
      { label: 'Service', value: summariseList([...repair.hardwareIssues, ...repair.softwareIssues]) || 'Repair assessment' },
      { label: 'Device', value: `${repair.deviceBrand} ${repair.deviceModel}` },
      { label: 'Service option', value: SERVICE_METHOD_LABELS[repair.serviceMethod] },
    ],
  },
  order: {
    typeLabel: 'Shop order',
    find: getOrderByReference,
    describe: (order) => [
      { label: 'Items', value: summariseList(order.items.map((item) => `${item.quantity} x ${item.name}`), 3) },
      { label: 'Fulfilment', value: FULFILMENT_LABELS[order.fulfilmentMethod] },
      { label: 'Order total', value: `N$ ${order.total.toFixed(2)}` },
    ],
  },
  sell: {
    typeLabel: 'Device sale enquiry',
    find: getSellEnquiryByReference,
    describe: (enquiry) => [
      { label: 'Device', value: `${enquiry.brand} ${enquiry.model}` },
      { label: 'Your asking price', value: `N$ ${enquiry.askingPrice.toFixed(2)}` },
    ],
  },
};

export async function trackRecord(req, res) {
  const parsed = parseReference(req.body?.reference);
  if (!parsed) {
    throw new AppError(400, 'Please enter a valid reference number, for example REP-7KQ2M9XA.');
  }
  if (typeof req.body?.contact !== 'string' || req.body.contact.trim() === '') {
    throw new AppError(400, 'Please enter the phone number or email address used for the booking.');
  }

  const tracker = TRACKERS[parsed.type];
  const record = await tracker.find(parsed.reference);

  const isOwner = record && contactMatches(req.body.contact, { email: record.customerEmail, phone: record.customerPhone });
  if (!isOwner) throw new AppError(404, NOT_FOUND_MESSAGE);

  const history = await listStatusHistory(parsed.type, record.id);

  res.json({
    reference: record.reference,
    type: parsed.type,
    typeLabel: tracker.typeLabel,
    ...describeProgress(parsed.type, record.status),
    details: tracker.describe(record),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    // Internal notes and staff names are left out on purpose.
    history: history.map((entry) => ({ statusLabel: entry.statusLabel, createdAt: entry.createdAt })),
  });
}
