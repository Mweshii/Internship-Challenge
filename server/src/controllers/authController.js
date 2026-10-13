import bcrypt from 'bcryptjs';
import { clearAuthCookie, setAuthCookie } from '../middleware/auth.js';
import { findUserByEmail } from '../models/userModel.js';
import { AppError } from '../utils/errors.js';

// A hash of a random string. When the email is unknown we still compare against
// this, so the response takes the same time whether or not the account exists.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

// POST /api/auth/login
export async function login(req, res) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password) throw new AppError(400, 'Please enter your email and password.');

  const user = await findUserByEmail(email);
  const passwordIsCorrect = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);

  // One message for both cases, so attackers cannot tell which emails exist.
  if (!user || !passwordIsCorrect) throw new AppError(401, 'Incorrect email or password.');

  setAuthCookie(res, user);
  res.json({ user: { name: user.fullName, email: user.email, role: user.role } });
}

// POST /api/auth/logout
export function logout(req, res) {
  clearAuthCookie(res);
  res.json({ message: 'Signed out.' });
}

// GET /api/auth/me - lets the dashboard check "am I still signed in?"
export function currentUser(req, res) {
  res.json({ user: { name: req.user.name, email: req.user.email, role: req.user.role } });
}
