import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateContactMessage, validateProduct, validateStatusUpdate } from '../src/validators/miscValidators.js';
import { validateOrder } from '../src/validators/orderValidator.js';
import { validateRepairRequest } from '../src/validators/repairValidator.js';
import { validateSellEnquiry, validateSellReview } from '../src/validators/sellValidator.js';

const customer = { fullName: 'Test Customer', phone: '+264 81 234 5678', email: 'Test@Example.com', contactMethod: 'whatsapp' };

const dropOffRepair = {
  ...customer,
  deviceBrand: 'Apple',
  deviceType: 'smartphone',
  deviceModel: 'iPhone 13',
  operatingSystem: 'ios',
  hardwareIssues: ['Screen Repair'],
  softwareIssues: [],
  description: 'Cracked after a drop.',
  serviceMethod: 'dropoff',
};

const pickupDetails = { pickupAddress: '12 Sample Street', pickupArea: 'Sample Suburb', pickupStreet: 'Blue gate' };

const allShopOptions = { deliveryEnabled: true, collectionEnabled: true };

// ---- Repair requests --------------------------------------------------------

test('a complete drop-off repair request is valid', () => {
  const { errors, value } = validateRepairRequest(dropOffRepair);
  assert.deepEqual(errors, {});
  assert.equal(value.email, 'test@example.com'); // emails are stored lower-case
  assert.equal(value.pickupAddress, null);
});

test('drop-off does not require (or keep) pickup details', () => {
  const { errors, value } = validateRepairRequest({ ...dropOffRepair, pickupAddress: 'should be ignored' });
  assert.deepEqual(errors, {});
  assert.equal(value.pickupAddress, null);
});

test('pickup requires the address, area and street', () => {
  const { errors } = validateRepairRequest({ ...dropOffRepair, serviceMethod: 'pickup' });
  assert.ok(errors.pickupAddress);
  assert.ok(errors.pickupArea);
  assert.ok(errors.pickupStreet);
  assert.equal(errors.pickupInstructions, undefined); // optional
  assert.equal(errors.pickupDate, undefined); // optional
});

test('a complete pickup request is valid', () => {
  const { errors, value } = validateRepairRequest({
    ...dropOffRepair,
    ...pickupDetails,
    serviceMethod: 'pickup',
    pickupDate: '2999-01-15',
    pickupTime: 'Morning (08:00 - 12:00)',
  });
  assert.deepEqual(errors, {});
  assert.equal(value.pickupDate, '2999-01-15');
});

test('a pickup date in the past is rejected', () => {
  const { errors } = validateRepairRequest({ ...dropOffRepair, ...pickupDetails, serviceMethod: 'pickup', pickupDate: '2020-01-01' });
  assert.ok(errors.pickupDate);
});

test('repair request reports every missing or invalid field', () => {
  const { errors } = validateRepairRequest({ email: 'not-an-email', phone: '12', serviceMethod: 'teleport' });
  for (const field of ['deviceBrand', 'deviceType', 'deviceModel', 'operatingSystem', 'issues', 'serviceMethod', 'fullName', 'phone', 'email', 'contactMethod']) {
    assert.ok(errors[field], `expected an error for ${field}`);
  }
});

test('a description alone is enough to explain the problem', () => {
  const { errors } = validateRepairRequest({ ...dropOffRepair, hardwareIssues: [], softwareIssues: [] });
  assert.equal(errors.issues, undefined);
});

test('issue lists must be arrays of text', () => {
  assert.ok(validateRepairRequest({ ...dropOffRepair, hardwareIssues: 'Screen Repair' }).errors.hardwareIssues);
  assert.ok(validateRepairRequest({ ...dropOffRepair, softwareIssues: [{ $ne: 1 }] }).errors.softwareIssues);
});

test('over-long text is rejected rather than silently cut', () => {
  const { errors } = validateRepairRequest({ ...dropOffRepair, description: 'x'.repeat(2001) });
  assert.ok(errors.description);
});

// ---- Orders -----------------------------------------------------------------

const collectionOrder = { ...customer, fulfilmentMethod: 'collection', items: [{ productId: 1, quantity: 2 }] };

test('a collection order is valid without an address', () => {
  const { errors, value } = validateOrder(collectionOrder, allShopOptions);
  assert.deepEqual(errors, {});
  assert.equal(value.deliveryAddress, null);
});

test('a delivery order requires the delivery location', () => {
  const { errors } = validateOrder({ ...collectionOrder, fulfilmentMethod: 'delivery' }, allShopOptions);
  assert.ok(errors.deliveryAddress);
  assert.ok(errors.deliveryArea);
  assert.ok(errors.deliveryStreet);
});

test('an empty cart is rejected', () => {
  assert.ok(validateOrder({ ...collectionOrder, items: [] }, allShopOptions).errors.items);
  assert.ok(validateOrder({ ...collectionOrder, items: undefined }, allShopOptions).errors.items);
});

test('invalid quantities and product ids are rejected', () => {
  for (const item of [{ productId: 1, quantity: 0 }, { productId: 1, quantity: 1.5 }, { productId: 1, quantity: 100 }, { productId: '1', quantity: 1 }, { productId: -4, quantity: 1 }]) {
    assert.ok(validateOrder({ ...collectionOrder, items: [item] }, allShopOptions).errors.items, JSON.stringify(item));
  }
});

test('duplicate cart lines are merged', () => {
  const { value } = validateOrder({ ...collectionOrder, items: [{ productId: 1, quantity: 2 }, { productId: 1, quantity: 3 }] }, allShopOptions);
  assert.deepEqual(value.items, [{ productId: 1, quantity: 5 }]);
});

test('a fulfilment option the shop has switched off is rejected', () => {
  const { errors } = validateOrder({ ...collectionOrder, fulfilmentMethod: 'delivery' }, { deliveryEnabled: false, collectionEnabled: true });
  assert.ok(errors.fulfilmentMethod);
});

// ---- Sell enquiries ---------------------------------------------------------

const sellEnquiry = {
  ...customer,
  deviceType: 'phone',
  brand: 'Samsung',
  model: 'Galaxy S22',
  deviceCondition: 'good',
  powersOn: 'yes',
  screenDamaged: 'no',
  repairedBefore: 'unsure',
  accessoriesIncluded: ['Charger'],
  askingPrice: '4500.505',
};

test('a complete sell enquiry is valid', () => {
  const { errors, value } = validateSellEnquiry(sellEnquiry);
  assert.deepEqual(errors, {});
  assert.equal(value.askingPrice, 4500.51); // rounded to cents
  assert.equal(value.screenDamaged, false);
  assert.equal(value.storageCapacity, null);
});

test('the asking price must be a positive number', () => {
  for (const askingPrice of [0, -50, 'lots', '', undefined, 99999999]) {
    assert.ok(validateSellEnquiry({ ...sellEnquiry, askingPrice }).errors.askingPrice, String(askingPrice));
  }
});

test('sell enquiry requires the device basics', () => {
  const { errors } = validateSellEnquiry({ ...customer });
  for (const field of ['deviceType', 'brand', 'model', 'deviceCondition', 'powersOn', 'screenDamaged', 'repairedBefore', 'askingPrice']) {
    assert.ok(errors[field], `expected an error for ${field}`);
  }
});

test('an admin review may clear or set the proposed offer', () => {
  assert.equal(validateSellReview({ proposedOffer: '' }).value.proposedOffer, null);
  assert.equal(validateSellReview({ proposedOffer: 3800 }).value.proposedOffer, 3800);
  assert.ok(validateSellReview({ proposedOffer: -1 }).errors.proposedOffer);
});

// ---- Other ------------------------------------------------------------------

test('contact messages need a name, valid email and a real message', () => {
  assert.deepEqual(validateContactMessage({ fullName: 'A Person', email: 'a@b.co', message: 'Do you fix tablets?' }).errors, {});
  const { errors } = validateContactMessage({ fullName: '', email: 'nope', message: 'hi' });
  assert.ok(errors.fullName && errors.email && errors.message);
});

test('products need a name, category, price and whole-number stock', () => {
  const product = { name: 'Case', categoryId: 1, price: 199.99, stockQuantity: 5, imageUrl: '/images/products/case-black.svg' };
  assert.deepEqual(validateProduct(product).errors, {});
  assert.ok(validateProduct({ ...product, price: -1 }).errors.price);
  assert.ok(validateProduct({ ...product, stockQuantity: 2.5 }).errors.stockQuantity);
  assert.ok(validateProduct({ ...product, imageUrl: 'javascript:alert(1)' }).errors.imageUrl);
});

test('status updates only accept statuses of the right record type', () => {
  assert.deepEqual(validateStatusUpdate({ status: 'awaiting_parts' }, 'repair').errors, {});
  assert.ok(validateStatusUpdate({ status: 'awaiting_parts' }, 'order').errors.status);
  assert.ok(validateStatusUpdate({ status: 'hacked' }, 'repair').errors.status);
});
