// The rules of the shopping cart, as plain functions with no React in them.
//
// A reducer takes the current cart and an "action" describing what happened,
// and returns the NEW cart. It never changes the old one in place - React
// needs a new array to notice that something changed.
//
// A cart item looks like:
//   { id, name, price, imageUrl, stockQuantity, quantity }

// Keeps a quantity between 1 and the stock available.
function clampQuantity(quantity, stockQuantity) {
  return Math.max(1, Math.min(quantity, stockQuantity));
}

export function cartReducer(items, action) {
  switch (action.type) {
    case 'add': {
      const { product } = action;
      if (product.stockQuantity < 1) return items;

      const existing = items.find((item) => item.id === product.id);
      if (existing) {
        // Already in the cart: increase the quantity (never beyond stock) and
        // refresh the price/stock in case they changed since it was added.
        return items.map((item) =>
          item.id === product.id
            ? {
                ...item,
                price: product.price,
                stockQuantity: product.stockQuantity,
                quantity: clampQuantity(item.quantity + 1, product.stockQuantity),
              }
            : item
        );
      }

      return [
        ...items,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          stockQuantity: product.stockQuantity,
          quantity: 1,
        },
      ];
    }

    case 'setQuantity':
      return items.map((item) =>
        item.id === action.id ? { ...item, quantity: clampQuantity(action.quantity, item.stockQuantity) } : item
      );

    case 'remove':
      return items.filter((item) => item.id !== action.id);

    // Brings a saved cart up to date with the shop's current catalogue: fresh
    // prices and stock, quantities reduced to what is available, and items
    // that are sold out or no longer sold removed.
    case 'sync': {
      const productsById = new Map(action.products.map((product) => [product.id, product]));
      return items.flatMap((item) => {
        const product = productsById.get(item.id);
        if (!product || product.stockQuantity < 1) return [];
        return [
          {
            ...item,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            stockQuantity: product.stockQuantity,
            quantity: clampQuantity(item.quantity, product.stockQuantity),
          },
        ];
      });
    }

    case 'clear':
      return [];

    default:
      return items;
  }
}

// True when 'sync' would change something the customer should be told about.
export function cartIsOutOfDate(items, products) {
  const productsById = new Map(products.map((product) => [product.id, product]));
  return items.some((item) => {
    const product = productsById.get(item.id);
    return !product || product.stockQuantity < item.quantity || product.price !== item.price;
  });
}

export function countItems(items) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function calculateSubtotal(items) {
  // Add up in cents (whole numbers) to avoid floating-point rounding errors.
  const cents = items.reduce((total, item) => total + Math.round(item.price * 100) * item.quantity, 0);
  return cents / 100;
}
