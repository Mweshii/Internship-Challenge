// Builds the Express application. Kept separate from index.js (which starts
// listening on a port) so the automated tests can load the app without
// starting a real server.
import fs from 'node:fs';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { pool } from './db/pool.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

export function createApp() {
  const app = express();

  // Security headers. The image rule also allows photo previews (blob:) when
  // Express serves the built frontend.
  app.use(
    helmet({
      contentSecurityPolicy: { directives: { 'img-src': ["'self'", 'data:', 'blob:'] } },
    })
  );
  app.use(express.json({ limit: '100kb' })); // parses JSON request bodies into req.body
  app.use(cookieParser()); // parses the Cookie header into req.cookies

  // GET /api/health - quick check that the server AND the database are up.
  app.get('/api/health', async (req, res) => {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', publicRoutes);
  app.use('/api', notFoundHandler);

  // Production only: after `npm run build`, Express also serves the React app,
  // so the whole site runs from this one server. In development Vite does this.
  const clientBuild = path.resolve(env.serverRoot, '../client/dist');
  if (fs.existsSync(clientBuild)) {
    app.use(express.static(clientBuild));
    // Any other URL (e.g. /repairs) gets index.html and React Router takes over.
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next();
      res.sendFile(path.join(clientBuild, 'index.html'));
    });
  }

  app.use(errorHandler);
  return app;
}
