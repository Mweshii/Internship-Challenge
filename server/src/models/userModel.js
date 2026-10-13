// Database access for admin accounts and contact-form messages.
import { query } from '../db/pool.js';

export async function findUserByEmail(email) {
  const rows = await query('SELECT id, full_name, email, password_hash, role FROM users WHERE email = ?', [email]);
  if (rows.length === 0) return null;

  const row = rows[0];
  return { id: row.id, fullName: row.full_name, email: row.email, passwordHash: row.password_hash, role: row.role };
}

export async function createContactMessage(message) {
  await query('INSERT INTO contact_messages (full_name, email, phone, message) VALUES (?, ?, ?, ?)', [
    message.fullName,
    message.email,
    message.phone,
    message.message,
  ]);
}

export async function listContactMessages() {
  const rows = await query(
    'SELECT id, full_name, email, phone, message, created_at FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT 200'
  );
  return rows.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    createdAt: row.created_at,
  }));
}

// Totals for the cards at the top of the admin dashboard.
export async function getDashboardCounts() {
  const [row] = await query(
    `SELECT
       (SELECT COUNT(*) FROM repair_requests WHERE status NOT IN ('completed', 'cancelled')) AS open_repairs,
       (SELECT COUNT(*) FROM orders WHERE status NOT IN ('delivered', 'cancelled')) AS open_orders,
       (SELECT COUNT(*) FROM sell_enquiries WHERE status NOT IN ('accepted', 'declined', 'cancelled')) AS open_enquiries,
       (SELECT COUNT(*) FROM contact_messages) AS messages`
  );
  return {
    openRepairs: row.open_repairs,
    openOrders: row.open_orders,
    openEnquiries: row.open_enquiries,
    messages: row.messages,
  };
}
