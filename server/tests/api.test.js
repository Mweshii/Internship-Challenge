// HTTP-level tests. They run with NO database available (see helpers/testEnv.js),
// which lets us check three things without touching real data:
//   - invalid requests are rejected before the database is ever used
//   - admin routes refuse visitors who are not signed in
//   - a database outage produces a clean 503 response, not a crash
import './helpers/testEnv.js';
import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';
import { pool } from '../src/db/pool.js';
import { AUTH_COOKIE } from '../src/middleware/auth.js';

const app = createApp();
after(() => pool.end());

const validRepair = {
  fullName: 'Test Customer',
  phone: '+264 81 234 5678',
  email: 'test@example.com',
  contactMethod: 'phone',
  deviceBrand: 'Apple',
  deviceType: 'smartphone',
  deviceModel: 'iPhone 13',
  operatingSystem: 'ios',
  hardwareIssues: ['Screen Repair'],
  softwareIssues: [],
  serviceMethod: 'dropoff',
};

function cookieFor(payload) {
  return `${AUTH_COOKIE}=${jwt.sign(payload, env.jwtSecret, { expiresIn: '5m' })}`;
}

// ---- Validation -------------------------------------------------------------

test('POST /api/repairs rejects an empty form with field errors', async () => {
  const response = await request(app).post('/api/repairs').send({});
  assert.equal(response.status, 400);
  assert.ok(response.body.errors.deviceModel);
  assert.ok(response.body.errors.fullName);
});

test('POST /api/repairs requires pickup details only for pickup', async () => {
  const response = await request(app).post('/api/repairs').send({ ...validRepair, serviceMethod: 'pickup' });
  assert.equal(response.status, 400);
  assert.ok(response.body.errors.pickupAddress);
  assert.equal(response.body.errors.deviceModel, undefined);
});

test('POST /api/repairs rejects a file that is not an image', async () => {
  const response = await request(app)
    .post('/api/repairs')
    .field('data', JSON.stringify(validRepair))
    .attach('image', Buffer.from('#!/bin/sh\necho hi'), { filename: 'script.sh', contentType: 'text/x-sh' });
  assert.equal(response.status, 400);
  assert.match(response.body.message, /JPG, PNG or WebP/);
});

test('POST /api/repairs rejects a fake image (wrong contents, image label)', async () => {
  const response = await request(app)
    .post('/api/repairs')
    .field('data', JSON.stringify(validRepair))
    .attach('image', Buffer.from('this is definitely not a png'), { filename: 'photo.png', contentType: 'image/png' });
  assert.equal(response.status, 400);
  assert.match(response.body.message, /not a valid image/);
});

test('POST /api/orders rejects an empty cart', async () => {
  const response = await request(app).post('/api/orders').send({ fulfilmentMethod: 'collection', items: [] });
  assert.equal(response.status, 400);
  assert.ok(response.body.errors.items);
});

test('POST /api/sell-enquiries rejects a missing asking price', async () => {
  const response = await request(app).post('/api/sell-enquiries').send({ brand: 'Samsung' });
  assert.equal(response.status, 400);
  assert.ok(response.body.errors.askingPrice);
});

test('POST /api/contact validates the message', async () => {
  const response = await request(app).post('/api/contact').send({ fullName: 'A', email: 'bad', message: '' });
  assert.equal(response.status, 400);
  assert.ok(response.body.errors.email);
});

test('POST /api/track rejects malformed references', async () => {
  const response = await request(app).post('/api/track').send({ reference: 'TF12345', contact: 'a@b.co' });
  assert.equal(response.status, 400);
});

test('POST /api/track requires a contact detail', async () => {
  const response = await request(app).post('/api/track').send({ reference: 'REP-7KQ2M9XA' });
  assert.equal(response.status, 400);
});

test('malformed JSON gets a 400, not a crash', async () => {
  const response = await request(app).post('/api/orders').set('Content-Type', 'application/json').send('{"items": [');
  assert.equal(response.status, 400);
});

// ---- Authorisation ----------------------------------------------------------

test('admin routes refuse visitors who are not signed in', async () => {
  for (const path of ['/api/admin/repairs', '/api/admin/orders', '/api/admin/sell-enquiries', '/api/admin/products', '/api/admin/messages', '/api/admin/overview', '/api/auth/me']) {
    const response = await request(app).get(path);
    assert.equal(response.status, 401, path);
  }
});

test('admin routes refuse a forged login cookie', async () => {
  const forged = `${AUTH_COOKIE}=${jwt.sign({ id: 1, role: 'admin' }, 'the-wrong-secret')}`;
  const response = await request(app).get('/api/admin/repairs').set('Cookie', forged);
  assert.equal(response.status, 401);
});

test('admin routes refuse signed-in users who are not admins', async () => {
  const response = await request(app).get('/api/admin/repairs').set('Cookie', cookieFor({ id: 2, role: 'staff' }));
  assert.equal(response.status, 403);
});

test('a valid admin cookie is accepted', async () => {
  const response = await request(app)
    .get('/api/auth/me')
    .set('Cookie', cookieFor({ id: 1, name: 'Owner', email: 'owner@example.com', role: 'admin' }));
  assert.equal(response.status, 200);
  assert.equal(response.body.user.email, 'owner@example.com');
});

test('admin status updates are validated', async () => {
  const response = await request(app)
    .patch('/api/admin/repairs/1/status')
    .set('Cookie', cookieFor({ id: 1, role: 'admin' }))
    .send({ status: 'not-a-status' });
  assert.equal(response.status, 400);
});

test('login requires both fields', async () => {
  const response = await request(app).post('/api/auth/login').send({ email: 'owner@example.com' });
  assert.equal(response.status, 400);
});

// ---- Database unavailable ---------------------------------------------------

test('when the database is down, reads return 503 with a friendly message', async () => {
  const response = await request(app).get('/api/products');
  assert.equal(response.status, 503);
  assert.match(response.body.message, /temporarily unavailable/);
});

test('when the database is down, a valid submission is NOT reported as saved', async () => {
  const response = await request(app).post('/api/repairs').send(validRepair);
  assert.equal(response.status, 503);
  assert.equal(response.body.reference, undefined);
});

test('unknown API routes return 404 JSON', async () => {
  const response = await request(app).get('/api/does-not-exist');
  assert.equal(response.status, 404);
  assert.ok(response.body.message);
});
