// Results for the search box in the navbar. The search text lives in the URL
// (/search?q=charger), so a results page can be bookmarked or shared.
// Unlike the shop pages, this search runs on the server (a SQL LIKE query),
// because it covers both shop sections at once.
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/services.js';
import { ProductGrid, SampleNotice } from '../components/shop/ShopParts.jsx';
import { BackLink } from '../components/ui/Feedback.jsx';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      return undefined;
    }

    let isCurrent = true;
    setIsLoading(true);
    setError('');

    getProducts({ search: query })
      .then((data) => {
        if (isCurrent) setProducts(data.products);
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.message);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [query, reloadCount]);

  return (
    <div className="container-page py-8 lg:py-10">
      <BackLink />
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Search</h1>
      <p className="mt-2 mb-6 text-slate-600">
        {query ? (
          <>
            Results for <strong>&ldquo;{query}&rdquo;</strong>
          </>
        ) : (
          'Use the search icon at the top of the page to look for a product.'
        )}
      </p>

      {query && (
        <>
          <SampleNotice />
          <ProductGrid
            products={products}
            isLoading={isLoading}
            error={error}
            onRetry={() => setReloadCount((count) => count + 1)}
            emptyMessage={`Nothing found for "${query}". Try a different word.`}
          />
        </>
      )}
    </div>
  );
}
