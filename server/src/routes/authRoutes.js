// Sign in / sign out. Mounted at /api/auth in app.js.
import { Router } from 'express';
import { currentUser, login, logout } from '../controllers/authController.js';
import { requireAdmin } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimits.js';

const router = Router();

router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', requireAdmin, currentUser);

export default router;
