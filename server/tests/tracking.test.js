import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ORDER_STATUSES, ORDER_STEPS, REPAIR_STATUSES, REPAIR_STEPS, SELL_STATUSES, SELL_STEPS } from '../src/config/statuses.js';
import { contactMatches, describeProgress, summariseList } from '../src/utils/tracking.js';

const booking = { email: 'customer@example.com', phone: '+264 81 234 5678' };

test('the booking email matches regardless of capitals and spaces', () => {
  assert.equal(contactMatches('  Customer@Example.com ', booking), true);
  assert.equal(contactMatches('someone-else@example.com', booking), false);
});

test('the booking phone number matches in local or international format', () => {
  assert.equal(contactMatches('+264 81 234 5678', booking), true);
  assert.equal(contactMatches('081 234 5678', booking), true);
  assert.equal(contactMatches('0812345678', { ...booking, phone: '081 234 5678' }), true);
  assert.equal(contactMatches('+264812345678', { ...booking, phone: '081 234 5678' }), true);
});

test('wrong, partial or empty contact details do not match', () => {
  for (const contact of ['081 234 5679', '5678', '', '   ', null, undefined]) {
    assert.equal(contactMatches(contact, booking), false, `expected "${contact}" not to match`);
  }
});

test('describeProgress maps a status to its progress step', () => {
  const progress = describeProgress('repair', 'awaiting_parts');
  assert.equal(progress.statusLabel, 'Awaiting Parts');
  assert.equal(progress.steps[progress.currentStep], 'In Progress');
  assert.equal(progress.isCancelled, false);
});

test('describeProgress flags cancelled records', () => {
  assert.equal(describeProgress('order', 'cancelled').isCancelled, true);
});

test('every status points at a real progress step', () => {
  const groups = [
    [REPAIR_STATUSES, REPAIR_STEPS],
    [ORDER_STATUSES, ORDER_STEPS],
    [SELL_STATUSES, SELL_STEPS],
  ];
  for (const [statuses, steps] of groups) {
    for (const status of statuses) {
      assert.ok(status.step >= -1 && status.step < steps.length, `${status.code} has an invalid step`);
    }
    // Codes must be unique or the admin dropdown would be ambiguous.
    assert.equal(new Set(statuses.map((status) => status.code)).size, statuses.length);
  }
});

test('summariseList shortens long lists', () => {
  assert.equal(summariseList(['A', 'B']), 'A, B');
  assert.equal(summariseList(['A', 'B', 'C', 'D']), 'A, B + 2 more');
  assert.equal(summariseList([]), '');
});
