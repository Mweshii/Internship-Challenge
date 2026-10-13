// One product in a shop grid: picture, name, compatibility, price, stock
// status and an Add to Cart button.
import { Check, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../utils/format.js';

const LOW_STOCK_THRESHOLD = 3;

function StockBadge({ quantity }) {
  if (quantity === 0) {
    return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Out of stock</span>;
  }
  if (quantity <= LOW_STOCK_THRESHOLD) {
    return <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Only {quantity} left</span>;
  }
  return <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">In stock</span>;
}

export function ProductCard({ product }) {
  const { addItem, quantityOf } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const inCart = quantityOf(product.id);
  const isOutOfStock = product.stockQuantity === 0;
  // The cart may not hold more of a product than the shop has.
  const hasReachedLimit = !isOutOfStock && inCart >= product.stockQuantity;

  function handleAdd() {
    addItem(product);
    // Briefly show "Added" so the click visibly did something.
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  let buttonLabel = 'Add to Cart';
  if (isOutOfStock) buttonLabel = 'Out of Stock';
  else if (hasReachedLimit) buttonLabel = 'Maximum in Cart';
  else if (justAdded) buttonLabel = 'Added';

  return (
    <article className="card flex flex-col p-3">
      <div className="flex aspect-square items-center justify-center rounded-xl bg-slate-100 p-4">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt="" loading="lazy" className={`size-full object-contain ${isOutOfStock ? 'opacity-50' : ''}`} />
        ) : (
          <ShoppingCart className="size-10 text-slate-300" aria-hidden="true" />
        )}
      </div>

      <div className="flex flex-1 flex-col px-1 pt-3">
        <h3 className="text-sm font-semibold text-slate-900">{product.name}</h3>
        {product.compatibility && <p className="mt-0.5 text-xs text-slate-500">For: {product.compatibility}</p>}

        {/* mt-auto pushes the price and button to the bottom, so cards in a row line up */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <p className="text-base font-bold text-slate-900">{formatPrice(product.price)}</p>
          <StockBadge quantity={product.stockQuantity} />
        </div>

        <button type="button" onClick={handleAdd} disabled={isOutOfStock || hasReachedLimit} className="btn btn-primary mt-3 w-full">
          {justAdded && !hasReachedLimit && <Check className="size-4" aria-hidden="true" />}
          {buttonLabel}
        </button>
        {inCart > 0 && <p className="mt-1.5 text-center text-xs text-slate-500">{inCart} in your cart</p>}
      </div>
    </article>
  );
}
