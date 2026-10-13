// Photo upload rules. Keep in sync with server/src/middleware/upload.js -
// the server enforces the same limits, because browser checks can be bypassed.
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_SELL_PHOTOS = 4;
