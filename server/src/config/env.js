// Reads server/.env once and exposes the settings as one tidy object, so the
// rest of the code never touches process.env directly.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(serverRoot, '.env'), quiet: true });

const nodeEnv = process.env.NODE_ENV || 'development';

function readNumber(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

// Anything except the literal text "false" counts as enabled.
function readFlag(name) {
  return (process.env[name] || 'true').trim().toLowerCase() !== 'false';
}

function readJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  // Automated tests run without a .env file, so they get a throwaway secret.
  if (nodeEnv === 'test') return 'test-only-secret';
  throw new Error(
    'JWT_SECRET is not set. Copy server/.env.example to server/.env and fill it in (see README).'
  );
}

export const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port: readNumber('PORT', 4000),
  serverRoot,
  uploadDir: path.join(serverRoot, 'uploads'),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: readNumber('DB_PORT', 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'techfix',
  },
  jwtSecret: readJwtSecret(),
  admin: {
    name: process.env.ADMIN_NAME || 'Shop Owner',
    email: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || '',
  },
  shop: {
    deliveryFee: Math.max(0, readNumber('DELIVERY_FEE', 0)),
    deliveryEnabled: readFlag('DELIVERY_ENABLED'),
    collectionEnabled: readFlag('COLLECTION_ENABLED'),
  },
};
