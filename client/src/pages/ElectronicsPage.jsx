// Other Electronics shop: light banner, round category buttons, search and grid.
// It uses the same catalogue hook, product cards and cart as the Accessories page.
import { useState } from 'react';
import { ProductGrid, SampleNotice, SearchInput } from '../components/shop/ShopParts.jsx';
import { BackLink } from '../components/ui/Feedback.jsx';
import { ALL_CATEGORIES_ICON, categoryIcon } from '../config/categoryIcons.js';
import { filterProducts, useCatalogue } from '../hooks/useCatalogue.js';

function CategoryCircle({ icon: Icon, label, isActive, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={isActive} className="group flex w-20 shrink-0 flex-col items-center gap-2 sm:w-24">
      <span
        className={`flex size-14 items-center justify-center rounded-full border transition-colors ${
          isActive
            ? 'border-brand-500 bg-brand-500 text-white'
            : 'border-brand-100 bg-brand-50 text-brand-500 group-hover:border-brand-400'
        }`}
      >
        <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className={`text-center text-xs ${isActive ? 'font-semibold text-brand-600' : 'text-slate-600'}`}>{label}</span>
    </button>
  );
}

export default function ElectronicsPage() {
  const { categories, products, isLoading, error, reload } = useCatalogue('electronics');
  const [categorySlug, setCategorySlug] = useState('');
  const [search, setSearch] = useState('');

  const visibleProducts = filterProducts(products, { categorySlug, search });

  return (
    <>
      <section className="overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-100">
        <div className="container-page flex items-center justify-between gap-6 py-8 lg:py-10">
          <div>
            <BackLink />
            <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Other Electronics</h1>
            <p className="mt-2 text-slate-600">Tablets, smartwatches, gadgets and more.</p>
          </div>
          <div className="hidden items-end gap-1 sm:flex" aria-hidden="true">
            <img src="/images/products/tablet-colour.svg" alt="" className="size-32 drop-shadow-xl lg:size-40" />
            <img src="/images/products/smartwatch.svg" alt="" className="size-20 drop-shadow-xl lg:size-24" />
          </div>
        </div>
      </section>

      <div className="container-page py-8 lg:py-10">
        <SampleNotice />

        <div className="flex gap-2 overflow-x-auto pb-3 sm:gap-4">
          <CategoryCircle icon={ALL_CATEGORIES_ICON} label="All" isActive={categorySlug === ''} onClick={() => setCategorySlug('')} />
          {categories.map((category) => (
            <CategoryCircle
              key={category.slug}
              icon={categoryIcon(category.slug)}
              label={category.name}
              isActive={categorySlug === category.slug}
              onClick={() => setCategorySlug(category.slug)}
            />
          ))}
        </div>

        <div className="my-5">
          <SearchInput value={search} onChange={setSearch} placeholder="Search for electronics..." />
        </div>

        <ProductGrid
          products={visibleProducts}
          isLoading={isLoading}
          error={error}
          onRetry={reload}
          emptyMessage="No electronics match your search. Try another category or search term."
        />
      </div>
    </>
  );
}
