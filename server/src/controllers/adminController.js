// Admin-only odds and ends, plus the public contact form.
import { STATUS_CONFIG } from '../config/statuses.js';
import { resolveUploadPath } from '../middleware/upload.js';
import * as userModel from '../models/userModel.js';
import { AppError, ValidationError } from '../utils/errors.js';
import { hasErrors } from '../utils/validation.js';
import { validateContactMessage } from '../validators/miscValidators.js';

// POST /api/contact (public)
export async function createContactMessage(req, res) {
  const { errors, value } = validateContactMessage(req.body);
  if (hasErrors(errors)) throw new ValidationError(errors);

  await userModel.createContactMessage(value);
  res.status(201).json({ message: 'Thank you. Your message has been received.' });
}

// GET /api/admin/overview - counts for the dashboard cards and the status
// lists used by the dropdowns (so the frontend never hardcodes them).
export async function getOverview(req, res) {
  res.json({
    counts: await userModel.getDashboardCounts(),
    statuses: {
      repair: STATUS_CONFIG.repair.statuses,
      order: STATUS_CONFIG.order.statuses,
      sell: STATUS_CONFIG.sell.statuses,
    },
  });
}

// GET /api/admin/messages
export async function listMessages(req, res) {
  res.json({ messages: await userModel.listContactMessages() });
}

// GET /api/admin/uploads/:fileName - customer photos are private, so they are
// only served through this admin-only route, never as public static files.
export function sendUpload(req, res) {
  const filePath = resolveUploadPath(req.params.fileName);
  if (!filePath) throw new AppError(404, 'File not found.');

  res.sendFile(filePath, (error) => {
    if (error && !res.headersSent) res.status(404).json({ message: 'File not found.' });
  });
}
