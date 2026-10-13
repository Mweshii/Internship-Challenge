// Admin login tokens.
//
// After a successful login the server signs a small token (a JWT) and stores it
// in a cookie. The browser sends that cookie back on every request and
// requireAdmin checks the signature before letting the request continue.
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

export const AUTH_COOKIE = 'techfix_admin';
const SESSION_HOURS = 8;

export function setAuthCookie(res, user) {
  const token = jwt.sign({ id: user.id, name: user.fullName, email: user.email, role: user.role }, env.jwtSecret, {
    expiresIn: `${SESSION_HOURS}h`,
  });

  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true, // page JavaScript cannot read it, so injected scripts cannot steal it
    sameSite: 'strict', // never sent from other websites, which blocks CSRF attacks
    secure: env.isProduction, // HTTPS only once deployed
    maxAge: SESSION_HOURS * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE, { httpOnly: true, sameSite: 'strict', secure: env.isProduction });
}

// Put this in front of any route that only an administrator may use.
export function requireAdmin(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) throw new AppError(401, 'Please sign in to continue.');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new AppError(401, 'Your session has expired. Please sign in again.');
  }

  if (payload.role !== 'admin') {
    throw new AppError(403, 'You do not have permission to do that.');
  }

  req.user = payload;
  next();
}
