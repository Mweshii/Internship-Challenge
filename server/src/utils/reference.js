// Booking reference numbers such as REP-7KQ2M9XA.
import { randomInt } from 'node:crypto';

// No 0/O or 1/I, so a reference is easy to read out over the phone.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

export const REFERENCE_PREFIXES = { repair: 'REP', order: 'ORD', sell: 'SEL' };

export function generateReference(type) {
  const prefix = REFERENCE_PREFIXES[type];
  if (!prefix) throw new Error(`Unknown reference type: ${type}`);

  let code = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    // randomInt is cryptographically random, so references cannot be predicted
    // from earlier ones (Math.random would not guarantee that).
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `${prefix}-${code}`;
}

// Tidies what a customer typed and works out which kind of record it is.
// Returns { type, reference } or null when the text is not a valid reference.
export function parseReference(input) {
  if (typeof input !== 'string') return null;
  const reference = input.trim().toUpperCase().replace(/\s+/g, '');
  const match = /^(REP|ORD|SEL)-[A-HJ-NP-Z2-9]{8}$/.exec(reference);
  if (!match) return null;

  const type = Object.keys(REFERENCE_PREFIXES).find((key) => REFERENCE_PREFIXES[key] === match[1]);
  return { type, reference };
}

// Runs `work(reference)` with a fresh reference. In the (astronomically
// unlikely) case that the reference already exists, the UNIQUE index rejects
// the insert with ER_DUP_ENTRY and we simply try again with a new one.
export async function withUniqueReference(type, work) {
  const maxAttempts = 5;
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await work(generateReference(type));
    } catch (error) {
      if (error.code !== 'ER_DUP_ENTRY' || attempt === maxAttempts) throw error;
    }
  }
}
