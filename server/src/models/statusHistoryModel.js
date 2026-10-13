// Shared helpers for the three kinds of record that have a status:
// repairs, orders and sell enquiries.
import { pool, withTransaction } from '../db/pool.js';
import { statusLabel } from '../config/statuses.js';
import { AppError } from '../utils/errors.js';

const TABLE_BY_TYPE = { repair: 'repair_requests', order: 'orders', sell: 'sell_enquiries' };

// `db` is either the shared pool or a transaction's connection, so a history
// row can be written inside the same transaction as the change it describes.
export async function addStatusHistory(db, { type, recordId, status, note = null, changedBy = null }) {
  await db.execute(
    'INSERT INTO status_history (record_type, record_id, status, note, changed_by) VALUES (?, ?, ?, ?, ?)',
    [type, recordId, status, note, changedBy]
  );
}

export async function listStatusHistory(type, recordId) {
  const [rows] = await pool.execute(
    `SELECT h.status, h.note, h.created_at, u.full_name AS changed_by_name
       FROM status_history h
       LEFT JOIN users u ON u.id = h.changed_by
      WHERE h.record_type = ? AND h.record_id = ?
      ORDER BY h.created_at, h.id`,
    [type, recordId]
  );

  return rows.map((row) => ({
    status: row.status,
    statusLabel: statusLabel(type, row.status),
    note: row.note,
    changedBy: row.changed_by_name,
    createdAt: row.created_at,
  }));
}

// Changes a record's status and logs the change, as one transaction.
export async function changeStatus({ type, recordId, status, note, changedBy }) {
  // The table name comes from the fixed list above, never from user input.
  const table = TABLE_BY_TYPE[type];

  await withTransaction(async (connection) => {
    const [rows] = await connection.execute(`SELECT id FROM ${table} WHERE id = ? FOR UPDATE`, [recordId]);
    if (rows.length === 0) {
      throw new AppError(404, 'That record no longer exists.');
    }
    await connection.execute(`UPDATE ${table} SET status = ? WHERE id = ?`, [status, recordId]);
    await addStatusHistory(connection, { type, recordId, status, note, changedBy });
  });
}

// Builds the WHERE part shared by the three admin list screens.
// `searchColumns` come from our own code, so joining them into SQL is safe;
// the search text itself still goes through ? placeholders.
export function buildListFilter({ status, search }, searchColumns) {
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (search) {
    conditions.push(`(${searchColumns.map((column) => `${column} LIKE ?`).join(' OR ')})`);
    searchColumns.forEach(() => params.push(`%${search}%`));
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}
