// Entry point: `npm run dev` / `npm start` run this file.
import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/pool.js';

const app = createApp();

app.listen(env.port, async () => {
  console.log(`TechFix API listening on http://localhost:${env.port}`);

  // Report database problems at startup instead of on the first customer request.
  try {
    await pool.query('SELECT 1');
    console.log(`Connected to MySQL database "${env.db.database}".`);
  } catch (error) {
    console.error(`\nWARNING: could not connect to MySQL (${error.code || error.message}).`);
    console.error('The site will load, but nothing can be saved until this is fixed.');
    console.error('Check the DB_* values in server/.env, then run: npm run db:setup\n');
  }
});
