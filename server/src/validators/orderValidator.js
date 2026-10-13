import { readChoice, readCustomer, readText } from '../utils/validation.js';

export const FULFILMENT_METHODS = ['delivery', 'collection'];
const MAX_DIFFERENT_PRODUCTS = 50;
const MAX_QUANTITY_PER_PRODUCT = 99;

// The cart arrives as [{ productId, quantity }]. Prices are deliberately NOT
// accepted from the browser - the server looks them up itself.
function readItems(input, errors) {
  const raw = input?.items;
  if (!Array.isArray(raw) || raw.length === 0) {
    errors.items = 'Your cart is empty.';
    return [];
  }
  if (raw.length > MAX_DIFFERENT_PRODUCTS) {
    errors.items = 'There are too many different products in this order.';
    return [];
  }

  // If the same product somehow appears twice, add the quantities together.
  const quantityByProduct = new Map();
  for (const item of raw) {
    const productId = item?.productId;
    const quantity = item?.quantity;
    const isValid =
      Number.isInteger(productId) &&
      productId > 0 &&
      Number.isInteger(quantity) &&
      quantity >= 1 &&
      quantity <= MAX_QUANTITY_PER_PRODUCT;

    if (!isValid) {
      errors.items = 'One of the items in your cart is not valid. Please refresh your cart.';
      return [];
    }
    quantityByProduct.set(productId, (quantityByProduct.get(productId) || 0) + quantity);
  }

  return [...quantityByProduct].map(([productId, quantity]) => ({ productId, quantity }));
}

// `shop` is env.shop: which fulfilment options the business has switched on.
export function validateOrder(input, shop) {
  const errors = {};
  const customer = readCustomer(input, errors, { withContactMethod: false });
  const items = readItems(input, errors);

  const allowedMethods = FULFILMENT_METHODS.filter((method) =>
    method === 'delivery' ? shop.deliveryEnabled : shop.collectionEnabled
  );
  const fulfilmentMethod = readChoice(input, 'fulfilmentMethod', errors, {
    label: 'delivery or collection',
    choices: allowedMethods,
  });

  // The delivery location is mandatory for deliveries and ignored otherwise.
  const delivery = { deliveryAddress: null, deliveryArea: null, deliveryStreet: null, deliveryInstructions: null };
  if (fulfilmentMethod === 'delivery') {
    delivery.deliveryAddress = readText(input, 'deliveryAddress', errors, {
      label: 'Delivery address',
      required: true,
      max: 200,
    });
    delivery.deliveryArea = readText(input, 'deliveryArea', errors, { label: 'Area or suburb', required: true, max: 100 });
    delivery.deliveryStreet = readText(input, 'deliveryStreet', errors, {
      label: 'Street or building name',
      required: true,
      max: 200,
    });
    delivery.deliveryInstructions =
      readText(input, 'deliveryInstructions', errors, { label: 'Delivery instructions', max: 500 }) || null;
  }

  return { errors, value: { ...customer, fulfilmentMethod, ...delivery, items } };
}
