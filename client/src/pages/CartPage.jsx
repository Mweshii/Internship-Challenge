// The shopping cart. All the cart logic lives in context/ - this page only
// displays it.
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/services.js';
import { CartItemRow } from '../components/shop/CartItemRow.jsx';
import { Alert, BackLink } from '../components/ui/Feedback.jsx';
import { useCart } from '../context/CartContext.jsx';
import { cartIsOutOfDate } from '../context/cartReducer.js';
import { formatPrice } from '../utils/format.js';

function EmptyCart() {
  return (
    <div className="card mx-auto mt-8 max-w-lg px-6 py-14 text-center">
      <ShoppingCart className="mx-auto size-12 text-slate-300" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-slate-900">Your cart is empty</h2>
      <p className="mt-1 text-sm text-slate-500">Browse the shop and add something you like.</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/accessories" className="btn btn-primary">
          Shop Accessories
        </Link>
        <Link to="/electronics" className="btn btn-secondary">
          Other Electronics
        </Link>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, itemCount, subtotal, clearCart, syncWithCatalogue } = useCart();
  const [wasUpdated, setWasUpdated] = useState(false);

  // The cart is saved in the browser, so it can be days old. Each time this
  // page opens, compare it with the shop's current prices and stock.
  // (The dependency list is empty on purpose: run once when the page opens.)
  useEffect(() => {
    if (items.length === 0) return undefined;

    let isCurrent = true;
    getProducts()
      .then(({ products }) => {
        if (!isCurrent) return;
        if (cartIsOutOfDate(items, products)) setWasUpdated(true);
        syncWithCatalogue(products);
      })
      .catch(() => {
        // Could not check right now. Checkout verifies stock again on the server anyway.
      });

    return () => {
      isCurrent = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-page py-8 lg:py-10">
      <BackLink to="/accessories">Continue shopping</BackLink>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Shopping Cart</h1>

      {wasUpdated && (
        <Alert type="info" className="mt-4">
          Your cart was updated to match our current prices and stock. Please check it before continuing.
        </Alert>
      )}

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="card px-5">
            <ul className="divide-y divide-slate-100">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </ul>
            <div className="border-t border-slate-100 py-3 text-right">
              <button type="button" onClick={clearCart} className="text-sm font-medium text-slate-500 hover:text-red-600">
                Empty cart
              </button>
            </div>
          </div>

          <aside className="card h-fit p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">
                  Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </dt>
                <dd className="font-semibold text-slate-900">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Delivery</dt>
                <dd className="text-slate-500">Calculated at checkout</dd>
              </div>
            </dl>
            <Link to="/checkout" className="btn btn-primary mt-6 w-full">
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
