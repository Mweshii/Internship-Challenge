// One line of the shopping cart, with - / + quantity buttons and a remove button.
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../utils/format.js';

const quantityButtonClass =
  'flex size-10 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent';

export function CartItemRow({ item }) {
  const { setQuantity, removeItem } = useCart();
  const isAtStockLimit = item.quantity >= item.stockQuantity;

  return (
    <li className="flex gap-4 py-4">
      <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-slate-100 p-2">
        {item.imageUrl && <img src={item.imageUrl} alt="" className="size-full object-contain" />}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{item.name}</p>
          <p className="text-sm text-slate-500">{formatPrice(item.price)} each</p>
          {isAtStockLimit && <p className="mt-0.5 text-xs font-medium text-amber-700">Maximum available: {item.stockQuantity}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center overflow-hidden rounded-lg border border-slate-300">
            <button
              type="button"
              onClick={() => setQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className={quantityButtonClass}
              aria-label={`Decrease quantity of ${item.name}`}
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            {/* aria-live makes screen readers announce the new quantity */}
            <span className="w-10 text-center text-sm font-semibold" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(item.id, item.quantity + 1)}
              disabled={isAtStockLimit}
              className={quantityButtonClass}
              aria-label={`Increase quantity of ${item.name}`}
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>

          <p className="w-24 text-right font-bold text-slate-900">{formatPrice(item.price * item.quantity)}</p>

          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="flex size-10 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </li>
  );
}
