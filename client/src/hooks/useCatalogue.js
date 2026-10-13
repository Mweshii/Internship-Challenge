// Loads one shop section's categories and products from the API.
// Used by both the Accessories page and the Other Electronics page.
import { useCallback, useEffect, useState } from 'react';
import { getCategories, getProducts } from '../api/services.js';

export function useCatalogue(section) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  // Changing this number makes the effect below run again (the "Try again" button).
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    // If the visitor leaves the page before the data arrives, ignore the result.
    let isCurrent = true;
    setIsLoading(true);
    setError('');

    Promise.all([getCategories(section), getProducts({ section })])
      .then(([categoryData, productData]) => {
        if (!isCurrent) return;
        setCategories(categoryData.categories);
        setProducts(productData.products);
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
  }, [section, reloadCount]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  return { categories, products, isLoading, error, reload };
}

// Narrows a product list by category and search text. Both are optional.
export function filterProducts(products, { categorySlug = '', search = '' }) {
  const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);

  return products.filter((product) => {
    if (categorySlug && product.categorySlug !== categorySlug) return false;

    // Every typed word must appear somewhere in the product's text.
    const text = `${product.name} ${product.description || ''} ${product.compatibility || ''} ${product.categoryName}`.toLowerCase();
    return words.every((word) => text.includes(word));
  });
}
