import * as sellModel from '../models/sellModel.js';
import { changeStatus, listStatusHistory } from '../models/statusHistoryModel.js';
import { statusLabel } from '../config/statuses.js';
import { AppError, ValidationError } from '../utils/errors.js';
import { hasErrors } from '../utils/validation.js';
import { validateSellEnquiry, validateSellReview } from '../validators/sellValidator.js';
import { validateStatusUpdate } from '../validators/miscValidators.js';
import { readFormData, readId, readListFilters } from './helpers.js';

// POST /api/sell-enquiries (public) - the "Sell Your Device" form.
export async function createSellEnquiry(req, res) {
  const { errors, value } = validateSellEnquiry(readFormData(req));
  if (hasErrors(errors)) throw new ValidationError(errors);

  // req.files is set by multer: one entry per attached photo.
  const photoFileNames = (req.files || []).map((file) => file.filename);
  const enquiry = await sellModel.createSellEnquiry(value, photoFileNames);

  res.status(201).json({ reference: enquiry.reference, statusLabel: statusLabel('sell', enquiry.status) });
}

// GET /api/admin/sell-enquiries?search=&status=
export async function listSellEnquiries(req, res) {
  res.json({ records: await sellModel.listSellEnquiries(readListFilters(req)) });
}

// GET /api/admin/sell-enquiries/:id
export async function getSellEnquiry(req, res) {
  const id = readId(req);
  const record = await sellModel.getSellEnquiryById(id);
  if (!record) throw new AppError(404, 'Enquiry not found.');

  res.json({ record, history: await listStatusHistory('sell', id) });
}

// PATCH /api/admin/sell-enquiries/:id/status
export async function updateSellStatus(req, res) {
  const id = readId(req);
  const { errors, value } = validateStatusUpdate(req.body, 'sell');
  if (hasErrors(errors)) throw new ValidationError(errors);

  await changeStatus({ type: 'sell', recordId: id, ...value, changedBy: req.user.id });
  res.json({ record: await sellModel.getSellEnquiryById(id), history: await listStatusHistory('sell', id) });
}

// PATCH /api/admin/sell-enquiries/:id/review - record the proposed offer and notes.
export async function reviewSellEnquiry(req, res) {
  const id = readId(req);
  const { errors, value } = validateSellReview(req.body);
  if (hasErrors(errors)) throw new ValidationError(errors);

  await sellModel.saveSellReview(id, value);
  res.json({ record: await sellModel.getSellEnquiryById(id), history: await listStatusHistory('sell', id) });
}
