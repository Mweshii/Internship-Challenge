import * as repairModel from '../models/repairModel.js';
import { changeStatus, listStatusHistory } from '../models/statusHistoryModel.js';
import { statusLabel } from '../config/statuses.js';
import { AppError, ValidationError } from '../utils/errors.js';
import { hasErrors } from '../utils/validation.js';
import { validateRepairRequest } from '../validators/repairValidator.js';
import { validateStatusUpdate } from '../validators/miscValidators.js';
import { readFormData, readId, readListFilters } from './helpers.js';

// POST /api/repairs (public) - the "Request a Repair" form.
export async function createRepair(req, res) {
  const { errors, value } = validateRepairRequest(readFormData(req));
  if (hasErrors(errors)) throw new ValidationError(errors);

  // req.file is set by multer when a photo was attached.
  const repair = await repairModel.createRepair({ ...value, imagePath: req.file ? req.file.filename : null });

  res.status(201).json({ reference: repair.reference, statusLabel: statusLabel('repair', repair.status) });
}

// GET /api/admin/repairs?search=&status=
export async function listRepairs(req, res) {
  res.json({ records: await repairModel.listRepairs(readListFilters(req)) });
}

// GET /api/admin/repairs/:id
export async function getRepair(req, res) {
  const id = readId(req);
  const record = await repairModel.getRepairById(id);
  if (!record) throw new AppError(404, 'Repair request not found.');

  res.json({ record, history: await listStatusHistory('repair', id) });
}

// PATCH /api/admin/repairs/:id/status
export async function updateRepairStatus(req, res) {
  const id = readId(req);
  const { errors, value } = validateStatusUpdate(req.body, 'repair');
  if (hasErrors(errors)) throw new ValidationError(errors);

  await changeStatus({ type: 'repair', recordId: id, ...value, changedBy: req.user.id });
  res.json({ record: await repairModel.getRepairById(id), history: await listStatusHistory('repair', id) });
}
