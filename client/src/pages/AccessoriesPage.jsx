// Accessories shop: dark banner, category sidebar, search box and product grid.
import { useState } from 'react';
import { ProductGrid, SampleNotice, SearchInput } from '../components/shop/ShopParts.jsx';
import { ALL_CATEGORIES_ICON, categoryIcon } from '../config/categoryIcons.js';
import { filterProducts, useCatalogue } from '../hooks/useCatalogue.js';

// Pictures shown on the right of the banner (files in client/public/images/products).
const BANNER_IMAGES = ['case-black', 'charger', 'earbuds'];

function CategoryButton({ icon: Icon, label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`flex min-h-11 w-full shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap transition-colors ${
        isActive ? 'bg-brand-50 font-semibold text-brand-600' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {label}
    </button>
  );
}

export default function AccessoriesPage() {
  const { categories, products, isLoading, error, reload } = useCatalogue('accessories');
  const [categorySlug, setCategorySlug] = useState(''); // '' means "All Accessories"
  const [search, setSearch] = useState('');

  // The full list is already loaded, so filtering happens instantly in the
  // browser as the visitor types - no extra request per keystroke.
  const visibleProducts = filterProducts(products, { categorySlug, search });

  return (
    <>
      <section className="hero-glow overflow-hidden text-white">
        <div className="container-page flex items-center justify-between gap-6 py-10 lg:py-14">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Accessories</h1>
            <p className="mt-2 text-slate-200">Give your device the protection and power it deserves.</p>
          </div>
          <div className="hidden items-end gap-2 sm:flex" aria-hidden="true">
            {BANNER_IMAGES.map((name) => (
              <img key={name} src={`/images/products/${name}.svg`} alt="" className="size-24 drop-shadow-2xl lg:size-32" />
            ))}
          </div>
        </div>
      </section>

      <div className="container-page py-8 lg:py-10">
        <SampleNotice />

        <div className="grid gap-6 lg:grid-cols-[230px_1fr] lg:gap-8">
          <aside>
            <h2 className="mb-3 text-base font-semibold text-slate-900">Categories</h2>
            {/* A sideways-scrolling row on phones, a vertical list on large screens */}
            <div className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              <CategoryButton
                icon={ALL_CATEGORIES_ICON}
                label="All Accessories"
                isActive={categorySlug === ''}
                onClick={() => setCategorySlug('')}
              />
              {categories.map((category) => (
                <CategoryButton
                  key={category.slug}
                  icon={categoryIcon(category.slug)}
                  label={category.name}
                  isActive={categorySlug === category.slug}
                  onClick={() => setCategorySlug(category.slug)}
                />
              ))}
            </div>
          </aside>

          <div>
            <div className="mb-5">
              <SearchInput value={search} onChange={setSearch} placeholder="Search for accessories..." />
            </div>
            <ProductGrid
              products={visibleProducts}
              isLoading={isLoading}
              error={error}
              onRetry={reload}
              emptyMessage="No accessories match your search. Try another category or search term."
            />
          </div>
        </div>
      </div>
    </>
  );
}
