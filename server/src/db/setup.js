// Creates the database, tables, sample products and the admin account.
//
//   npm run db:setup   safe to run again: keeps existing data
//   npm run db:reset   DELETES every table first, then rebuilds from scratch
import fs from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const databaseDir = path.resolve(env.serverRoot, '../database');
const shouldReset = process.argv.includes('--reset');

// Children before parents, so foreign keys never block a drop.
const TABLES_IN_DROP_ORDER = [
  'status_history',
  'order_items',
  'orders',
  'sell_enquiry_photos',
  'sell_enquiries',
  'repair_requests',
  'contact_messages',
  'inventory',
  'products',
  'categories',
  'users',
];

async function runSqlFile(connection, fileName) {
  const sql = await fs.readFile(path.join(databaseDir, fileName), 'utf8');
  await connection.query(sql);
}

async function createAdmin(connection) {
  const { name, email, password } = env.admin;
  if (!email || !password) {
    console.log('! Skipped admin account: set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env, then run this again.');
    return;
  }
  if (password.length < 10) {
    console.log('! Skipped admin account: ADMIN_PASSWORD must be at least 10 characters.');
    return;
  }

  const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    console.log(`- Admin account ${email} already exists (password left unchanged).`);
    return;
  }

  // bcrypt turns the password into a one-way hash; 12 is the work factor.
  const passwordHash = await bcrypt.hash(password, 12);
  await connection.query(
    'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, 'admin']
  );
  console.log(`- Created admin account ${email}.`);
}

async function main() {
  const { host, port, user, password, database } = env.db;

  // The name is placed directly into SQL below (placeholders cannot be used
  // for identifiers), so only allow plain characters.
  if (!/^[A-Za-z0-9_]+$/.test(database)) {
    throw new Error('DB_NAME may only contain letters, numbers and underscores.');
  }

  // multipleStatements lets one call run a whole .sql file. It is enabled only
  // here, never on the pool the website uses.
  const connection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await connection.query(`USE \`${database}\``);
    console.log(`- Using database "${database}" on ${host}:${port}.`);

    if (shouldReset) {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      for (const table of TABLES_IN_DROP_ORDER) {
        await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
      }
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('- Dropped existing tables (--reset).');
    }

    await runSqlFile(connection, 'schema.sql');
    console.log('- Tables are ready.');

    const [[{ total }]] = await connection.query('SELECT COUNT(*) AS total FROM categories');
    if (total === 0) {
      await runSqlFile(connection, 'seed.sql');
      console.log('- Loaded sample categories and products.');
    } else {
      console.log('- Products already exist, sample data not loaded again.');
    }

    await createAdmin(connection);
    console.log('\nDatabase setup complete.');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  const hints = {
    ECONNREFUSED: 'MySQL is not reachable. Is the MySQL service running, and are DB_HOST / DB_PORT correct?',
    ER_ACCESS_DENIED_ERROR: 'MySQL rejected the login. Check DB_USER and DB_PASSWORD in server/.env.',
  };
  console.error(`\nDatabase setup failed: ${hints[error.code] || error.message}`);
  process.exit(1);
});
