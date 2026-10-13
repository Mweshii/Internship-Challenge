import { env } from '../config/env.js';
import * as orderModel from '../models/orderModel.js';
import { changeStatus, listStatusHistory } from '../models/statusHistoryModel.js';
import { statusLabel } from '../config/statuses.js';
import { AppError, ValidationError } from '../utils/errors.js';
import { hasErrors } from '../utils/validation.js';
import { validateOrder } from '../validators/orderValidator.js';
import { validateStatusUpdate } from '../validators/miscValidators.js';
import { readId, readListFilters } from './helpers.js';

// POST /api/orders (public) - checkout.
// This saves an order REQUEST. No payment is taken; the business confirms the
// order and arranges payment with the customer afterwards.
export async function createOrder(req, res) {
  const { errors, value } = validateOrder(req.body, env.shop);
  if (hasErrors(errors)) throw new ValidationError(errors);

  const order = await orderModel.createOrder(value, env.shop.deliveryFee);

  res.status(201).json({
    reference: order.reference,
    statusLabel: statusLabel('order', order.status),
    items: order.items,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
  });
}

// GET /api/admin/orders?search=&status=
export async function listOrders(req, res) {
  res.json({ records: await orderModel.listOrders(readListFilters(req)) });
}

// GET /api/admin/orders/:id
export async function getOrder(req, res) {
  const id = readId(req);
  const record = await orderModel.getOrderById(id);
  if (!record) throw new AppError(404, 'Order not found.');

  res.json({ record, history: await listStatusHistory('order', id) });
}

// PATCH /api/admin/orders/:id/status
export async function updateOrderStatus(req, res) {
  const id = readId(req);
  const { errors, value } = validateStatusUpdate(req.body, 'order');
  if (hasErrors(errors)) throw new ValidationError(errors);

  await changeStatus({ type: 'order', recordId: id, ...value, changedBy: req.user.id });
  res.json({ record: await orderModel.getOrderById(id), history: await listStatusHistory('order', id) });
}
