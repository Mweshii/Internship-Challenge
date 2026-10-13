// Database access for shop orders.
import { query, withTransaction } from '../db/pool.js';
import { statusLabel } from '../config/statuses.js';
import { withUniqueReference } from '../utils/reference.js';
import { AppError } from '../utils/errors.js';
import { addStatusHistory, buildListFilter } from './statusHistoryModel.js';

const INITIAL_STATUS = 'order_received';

function mapOrder(row) {
  return {
    id: row.id,
    reference: row.reference,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    fulfilmentMethod: row.fulfilment_method,
    deliveryAddress: row.delivery_address,
    deliveryArea: row.delivery_area,
    deliveryStreet: row.delivery_street,
    deliveryInstructions: row.delivery_instructions,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    total: row.total,
    paymentStatus: row.payment_status,
    status: row.status,
    statusLabel: statusLabel('order', row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Works in cents (whole numbers) so adding prices never produces results like
// 0.1 + 0.2 = 0.30000000000000004.
function toCents(amount) {
  return Math.round(amount * 100);
}

// Loads the ordered products and LOCKS their rows (FOR UPDATE) until the
// transaction ends. If two customers try to buy the last item at the same
// moment, the second one waits here and then sees the reduced stock.
async function loadProductsForOrder(connection, items) {
  const placeholders = items.map(() => '?').join(', ');
  const [rows] = await connection.execute(
    `SELECT p.id, p.name, p.price, p.is_active, i.quantity
       FROM products p
       JOIN inventory i ON i.product_id = p.id
      WHERE p.id IN (${placeholders})
        FOR UPDATE`,
    items.map((item) => item.productId)
  );
  return new Map(rows.map((row) => [row.id, row]));
}

// Returns a list of human-readable problems (empty = everything is available).
function findStockProblems(items, productsById) {
  const problems = [];
  for (const item of items) {
    const product = productsById.get(item.productId);
    if (!product || product.is_active !== 1) {
      problems.push({ productId: item.productId, message: 'An item in your cart is no longer available.' });
    } else if (product.quantity === 0) {
      problems.push({ productId: item.productId, message: `${product.name} is out of stock.` });
    } else if (product.quantity < item.quantity) {
      problems.push({ productId: item.productId, message: `Only ${product.quantity} of ${product.name} left in stock.` });
    }
  }
  return problems;
}

// `deliveryFee` is the shop's configured fee; it is only charged on deliveries.
export async function createOrder(order, deliveryFee) {
  return withUniqueReference('order', (reference) =>
    withTransaction(async (connection) => {
      const productsById = await loadProductsForOrder(connection, order.items);

      const problems = findStockProblems(order.items, productsById);
      if (problems.length > 0) {
        throw new AppError(409, problems.map((problem) => problem.message).join(' '), { items: problems });
      }

      // Prices come from the database, never from what the browser sent.
      const lines = order.items.map((item) => {
        const product = productsById.get(item.productId);
        return { productId: product.id, name: product.name, unitPrice: product.price, quantity: item.quantity };
      });
      const subtotalCents = lines.reduce((sum, line) => sum + toCents(line.unitPrice) * line.quantity, 0);
      const feeCents = order.fulfilmentMethod === 'delivery' ? toCents(deliveryFee) : 0;
      const totals = {
        subtotal: subtotalCents / 100,
        deliveryFee: feeCents / 100,
        total: (subtotalCents + feeCents) / 100,
      };

      const [result] = await connection.execute(
        `INSERT INTO orders
           (reference, customer_name, customer_phone, customer_email, fulfilment_method,
            delivery_address, delivery_area, delivery_street, delivery_instructions,
            subtotal, delivery_fee, total, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reference,
          order.fullName,
          order.phone,
          order.email,
          order.fulfilmentMethod,
          order.deliveryAddress,
          order.deliveryArea,
          order.deliveryStreet,
          order.deliveryInstructions,
          totals.subtotal,
          totals.deliveryFee,
          totals.total,
          INITIAL_STATUS,
        ]
      );

      for (const line of lines) {
        await connection.execute(
          'INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES (?, ?, ?, ?, ?)',
          [result.insertId, line.productId, line.name, line.unitPrice, line.quantity]
        );
        await connection.execute('UPDATE inventory SET quantity = quantity - ? WHERE product_id = ?', [
          line.quantity,
          line.productId,
        ]);
      }

      await addStatusHistory(connection, { type: 'order', recordId: result.insertId, status: INITIAL_STATUS });
      return { id: result.insertId, reference, status: INITIAL_STATUS, items: lines, ...totals };
    })
  );
}

async function listOrderItems(orderId) {
  const rows = await query(
    'SELECT product_id, product_name, unit_price, quantity FROM order_items WHERE order_id = ? ORDER BY id',
    [orderId]
  );
  return rows.map((row) => ({
    productId: row.product_id,
    name: row.product_name,
    unitPrice: row.unit_price,
    quantity: row.quantity,
  }));
}

export async function listOrders(filters) {
  const { where, params } = buildListFilter(filters, ['reference', 'customer_name', 'customer_phone', 'customer_email']);
  const rows = await query(`SELECT * FROM orders ${where} ORDER BY created_at DESC, id DESC LIMIT 200`, params);
  return rows.map(mapOrder);
}

export async function getOrderById(id) {
  const rows = await query('SELECT * FROM orders WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  return { ...mapOrder(rows[0]), items: await listOrderItems(id) };
}

export async function getOrderByReference(reference) {
  const rows = await query('SELECT * FROM orders WHERE reference = ?', [reference]);
  if (rows.length === 0) return null;
  return { ...mapOrder(rows[0]), items: await listOrderItems(rows[0].id) };
}
