// The last stop for every request that fails. Express 5 sends any error thrown
// in a route (including inside async functions) here automatically.
import multer from 'multer';
import { AppError } from '../utils/errors.js';
import { removeUploadedFiles } from './upload.js';

// Error codes that mean "the database is unreachable or not set up".
const DATABASE_UNAVAILABLE_CODES = new Set([
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EHOSTUNREACH',
  'PROTOCOL_CONNECTION_LOST',
  'ER_ACCESS_DENIED_ERROR',
  'ER_BAD_DB_ERROR',
  'ER_NO_SUCH_TABLE',
  'ER_CON_COUNT_ERROR',
]);

export function isDatabaseUnavailable(error) {
  return DATABASE_UNAVAILABLE_CODES.has(error?.code);
}

const UPLOAD_MESSAGES = {
  LIMIT_FILE_SIZE: 'Each image must be 5 MB or smaller.',
  LIMIT_FILE_COUNT: 'Too many images were attached.',
  LIMIT_UNEXPECTED_FILE: 'Too many images were attached.',
};

export function notFoundHandler(req, res) {
  res.status(404).json({ message: 'That API route does not exist.' });
}

// Express recognises an error handler by its four parameters, so `next` must
// stay in the list even though it is not used.
// eslint-disable-next-line no-unused-vars
export async function errorHandler(error, req, res, next) {
  await removeUploadedFiles(req);

  if (error instanceof AppError) {
    return res.status(error.status).json({
      message: error.message,
      errors: error.errors,
      details: error.details,
    });
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: UPLOAD_MESSAGES[error.code] || 'The image could not be uploaded.' });
  }

  // express.json() could not parse the request body.
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'The request was not valid JSON.' });
  }

  if (isDatabaseUnavailable(error)) {
    // Full detail goes to the server log only; visitors get a safe message.
    console.error(`[database] ${error.code}: ${error.message}`);
    return res.status(503).json({
      message: 'Our system is temporarily unavailable. Your request was not saved. Please try again shortly.',
    });
  }

  console.error(error);
  return res.status(500).json({ message: 'Something went wrong on our side. Please try again.' });
}
