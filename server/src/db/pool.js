// One shared pool of MySQL connections for the whole server.
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 8000,
  decimalNumbers: true, // DECIMAL columns (prices) arrive as numbers, not strings
  dateStrings: ['DATE'], // DATE columns stay as 'YYYY-MM-DD' (no timezone shifting)
});

// Runs one parameterised query and returns the rows.
// Values always travel separately from the SQL text (the ? placeholders), which
// is what prevents SQL injection - never build SQL by joining user input.
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Runs several queries as one all-or-nothing unit. `work` receives a dedicated
// connection; if it throws, everything it did is rolled back.
export async function withTransaction(work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
