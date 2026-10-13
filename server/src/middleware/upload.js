// Photo uploads for the repair and sell forms (handled by the multer library).
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

// Keep these in sync with client/src/config/uploads.js.
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_SELL_PHOTOS = 4;
const EXTENSION_BY_TYPE = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const storage = multer.diskStorage({
  destination: env.uploadDir,
  // Never reuse the customer's file name: a random one cannot clash with or
  // overwrite another file, and cannot contain anything dangerous.
  filename: (req, file, callback) => {
    callback(null, `${randomUUID()}${EXTENSION_BY_TYPE[file.mimetype]}`);
  },
});

function fileFilter(req, file, callback) {
  if (EXTENSION_BY_TYPE[file.mimetype]) {
    callback(null, true);
  } else {
    callback(new AppError(400, 'Only JPG, PNG or WebP images can be uploaded.'));
  }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_IMAGE_BYTES, files: MAX_SELL_PHOTOS } });

export const uploadRepairImage = upload.single('image');
export const uploadSellPhotos = upload.array('photos', MAX_SELL_PHOTOS);

function uploadedFiles(req) {
  if (req.file) return [req.file];
  return Array.isArray(req.files) ? req.files : [];
}

// Deletes whatever this request uploaded. Called when the request fails, so
// rejected submissions do not leave files behind.
export async function removeUploadedFiles(req) {
  await Promise.all(uploadedFiles(req).map((file) => fs.unlink(file.path).catch(() => {})));
}

// The browser decides a file's "type" label, so it can lie. Real image files
// always begin with the same few bytes, which is what we check here.
function looksLikeImage(bytes) {
  const startsWith = (signature, offset = 0) => signature.every((byte, i) => bytes[offset + i] === byte);
  const isJpeg = startsWith([0xff, 0xd8, 0xff]);
  const isPng = startsWith([0x89, 0x50, 0x4e, 0x47]);
  const isWebp = startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8); // RIFF....WEBP
  return isJpeg || isPng || isWebp;
}

export async function verifyUploadedImages(req, res, next) {
  for (const file of uploadedFiles(req)) {
    const handle = await fs.open(file.path, 'r');
    const { buffer } = await handle.read(Buffer.alloc(12), 0, 12, 0);
    await handle.close();

    if (!looksLikeImage(buffer)) {
      throw new AppError(400, 'One of the uploaded files is not a valid image.');
    }
  }
  next();
}

// Uploaded file names always look like <uuid>.<ext>. Checking that shape stops
// anyone asking the server for files outside the uploads folder.
export function resolveUploadPath(fileName) {
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(fileName)) return null;
  return path.join(env.uploadDir, fileName);
}
