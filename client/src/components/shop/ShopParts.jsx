// Pieces shared by the Accessories, Other Electronics and Search pages.
import { PackageSearch, Search } from 'lucide-react';
import { site } from '../../config/site.js';
import { Alert } from '../ui/Feedback.jsx';
import { ProductCard } from './ProductCard.jsx';

export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="input pl-10"
      />
    </div>
  );
}

// Reminds visitors (and whoever is marking the project) that the catalogue is
// demo data. Switch it off in config/site.js.
export function SampleNotice() {
  if (!site.showSampleDataNotice) return null;
  return (
    <Alert type="info" className="mb-6">
      <strong>Sample catalogue.</strong> These products, prices and stock levels are placeholders for demonstration and do
      not reflect real stock.
    </Alert>
  );
}

// Grey boxes shown while products are loading, so the page does not jump.
function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3" aria-label="Loading products" role="status">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="card animate-pulse p-3">
          <div className="aspect-square rounded-xl bg-slate-100" />
          <div className="mt-3 h-4 w-3/4 rounded bg-slate-100" />
          <div className="mt-2 h-4 w-1/3 rounded bg-slate-100" />
          <div className="mt-3 h-11 rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

// Shows the right thing for each situation: loading, failed, nothing found, or
// the products themselves.
export function ProductGrid({ products, isLoading, error, onRetry, emptyMessage = 'No products match your search.' }) {
  if (isLoading) return <LoadingGrid />;

  if (error) {
    return (
      <Alert type="error">
        <p>{error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="mt-2 font-semibold underline">
            Try again
          </button>
        )}
      </Alert>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
        <PackageSearch className="mx-auto size-10 text-slate-300" aria-hidden="true" />
        <p className="mt-3 text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
