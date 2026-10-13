// Limits how often one visitor (IP address) may call sensitive routes.
import { rateLimit } from 'express-rate-limit';

function limiter({ minutes, max, message }) {
  return rateLimit({
    windowMs: minutes * 60 * 1000,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });
}

// Slows down password guessing.
export const loginLimiter = limiter({
  minutes: 15,
  max: 10,
  message: 'Too many sign-in attempts. Please wait 15 minutes and try again.',
});

// Slows down guessing of reference numbers.
export const trackingLimiter = limiter({
  minutes: 15,
  max: 30,
  message: 'Too many tracking attempts. Please wait a few minutes and try again.',
});

// Stops the public forms being used to flood the database.
export const submissionLimiter = limiter({
  minutes: 15,
  max: 30,
  message: 'Too many submissions from this device. Please wait a few minutes and try again.',
});
