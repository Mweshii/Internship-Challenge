// Makes the shopping cart available to every component.
//
// "Context" is React's way of sharing data without passing it down through
// every component by hand. <CartProvider> wraps the whole app (see main.jsx);
// any component can then call useCart() to read or change the cart.
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { calculateSubtotal, cartReducer, countItems } from './cartReducer.js';

const STORAGE_KEY = 'techfix-cart';
const CartContext = createContext(null);

// Reads the saved cart when the page first loads. localStorage can hold
// anything (or be blocked entirely), so this never trusts what it finds.
function loadSavedCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return [];
    return saved.filter(
      (item) =>
        Number.isInteger(item?.id) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        Number.isInteger(item.stockQuantity) &&
        typeof item.price === 'number' &&
        typeof item.name === 'string'
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadSavedCart);

  // Save after every change so the cart survives a page refresh.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage unavailable (e.g. private browsing): the cart still works
      // until the tab is closed.
    }
  }, [items]);

  // useMemo: only build a new object when the items actually change, so
  // components using the cart do not re-render needlessly.
  const cart = useMemo(
    () => ({
      items,
      itemCount: countItems(items),
      subtotal: calculateSubtotal(items),
      quantityOf: (productId) => items.find((item) => item.id === productId)?.quantity || 0,
      addItem: (product) => dispatch({ type: 'add', product }),
      setQuantity: (id, quantity) => dispatch({ type: 'setQuantity', id, quantity }),
      removeItem: (id) => dispatch({ type: 'remove', id }),
      clearCart: () => dispatch({ type: 'clear' }),
      syncWithCatalogue: (products) => dispatch({ type: 'sync', products }),
    }),
    [items]
  );

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error('useCart must be used inside <CartProvider>.');
  return cart;
}
