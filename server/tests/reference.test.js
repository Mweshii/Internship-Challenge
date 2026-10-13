import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateReference, parseReference, withUniqueReference } from '../src/utils/reference.js';

test('generateReference uses the right prefix and format', () => {
  assert.match(generateReference('repair'), /^REP-[A-HJ-NP-Z2-9]{8}$/);
  assert.match(generateReference('order'), /^ORD-[A-HJ-NP-Z2-9]{8}$/);
  assert.match(generateReference('sell'), /^SEL-[A-HJ-NP-Z2-9]{8}$/);
});

test('generateReference rejects unknown types', () => {
  assert.throws(() => generateReference('invoice'));
});

test('generated references do not repeat', () => {
  const references = new Set();
  for (let i = 0; i < 2000; i += 1) references.add(generateReference('order'));
  assert.equal(references.size, 2000);
});

test('parseReference tidies input and detects the record type', () => {
  assert.deepEqual(parseReference('  rep-7kq2m9xa '), { type: 'repair', reference: 'REP-7KQ2M9XA' });
  assert.deepEqual(parseReference('ORD-ABCDEFGH'), { type: 'order', reference: 'ORD-ABCDEFGH' });
  assert.equal(parseReference(generateReference('sell')).type, 'sell');
});

test('parseReference rejects anything that is not a reference', () => {
  for (const bad of ['', 'TF12345', 'REP-123', 'XYZ-7KQ2M9XA', 'REP-7KQ2M9X0', "REP-' OR 1=1", null, 42]) {
    assert.equal(parseReference(bad), null, `expected ${bad} to be rejected`);
  }
});

test('withUniqueReference retries when the reference already exists', async () => {
  let attempts = 0;
  const result = await withUniqueReference('repair', async (reference) => {
    attempts += 1;
    if (attempts < 3) throw Object.assign(new Error('duplicate'), { code: 'ER_DUP_ENTRY' });
    return reference;
  });
  assert.equal(attempts, 3);
  assert.match(result, /^REP-/);
});

test('withUniqueReference does not hide other errors', async () => {
  await assert.rejects(
    withUniqueReference('repair', async () => {
      throw new Error('database exploded');
    }),
    /database exploded/
  );
});
