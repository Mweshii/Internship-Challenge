// Product management: list every product (including hidden ones), add new
// ones, edit details/price/stock, and deactivate or reactivate.
//
// Products are never deleted, because old orders still refer to them.
// "Deactivate" hides a product from the shop instead.
import { Pencil, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { createProduct, getAdminProducts, getCategories, updateProduct } from '../../api/services.js';
import { formatPrice } from '../../utils/format.js';
import { Alert, Spinner } from '../ui/Feedback.jsx';
import { SelectField, TextAreaField, TextField } from '../ui/Field.jsx';
import { Modal } from './Modal.jsx';

const EMPTY_PRODUCT = {
  name: '',
  categoryId: '',
  description: '',
  compatibility: '',
  price: '',
  stockQuantity: '',
  imageUrl: '',
  isActive: true,
};

// Converts the form's text values into the numbers the API expects.
function toApiProduct(values) {
  return {
    name: values.name.trim(),
    categoryId: values.categoryId === '' ? null : Number(values.categoryId),
    description: (values.description || '').trim(),
    compatibility: (values.compatibility || '').trim(),
    price: values.price === '' ? null : Number(values.price),
    stockQuantity: values.stockQuantity === '' ? null : Number(values.stockQuantity),
    imageUrl: (values.imageUrl || '').trim(),
    isActive: values.isActive,
  };
}

// `product` is the one being edited, or null when adding a new product.
function ProductForm({ product, categories, onClose, onSaved }) {
  const [values, setValues] = useState(product ? { ...EMPTY_PRODUCT, ...product } : EMPTY_PRODUCT);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');
    setErrors({});
    setIsSaving(true);
    try {
      // The server validates; any field messages come back in fieldErrors.
      if (product) await updateProduct(product.id, toApiProduct(values));
      else await createProduct(toApiProduct(values));
      onSaved();
    } catch (requestError) {
      setErrors(requestError.fieldErrors || {});
      setSubmitError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  const categoryOptions = categories.map((category) => ({
    value: String(category.id),
    label: `${category.section === 'accessories' ? 'Accessories' : 'Electronics'} - ${category.name}`,
  }));

  return (
    <Modal title={product ? `Edit ${product.name}` : 'Add product'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        {submitError && (
          <Alert type="error" className="sm:col-span-2">
            {submitError}
          </Alert>
        )}
        <TextField label="Product name" name="name" value={values.name} onChange={handleChange} error={errors.name} maxLength={120} required className="sm:col-span-2" />
        <SelectField
          label="Category"
          name="categoryId"
          value={String(values.categoryId)}
          onChange={handleChange}
          error={errors.categoryId}
          options={categoryOptions}
          placeholder="Select category"
          required
          className="sm:col-span-2"
        />
        <TextField label="Price (N$)" name="price" type="number" min="0" step="0.01" value={values.price} onChange={handleChange} error={errors.price} required />
        <TextField
          label="Stock quantity"
          name="stockQuantity"
          type="number"
          min="0"
          step="1"
          value={values.stockQuantity}
          onChange={handleChange}
          error={errors.stockQuantity}
          required
        />
        <TextField
          label="Compatible with"
          name="compatibility"
          value={values.compatibility || ''}
          onChange={handleChange}
          error={errors.compatibility}
          placeholder="e.g. iPhone 15 / 15 Pro"
          maxLength={160}
          optional
          className="sm:col-span-2"
        />
        <TextAreaField
          label="Description"
          name="description"
          value={values.description || ''}
          onChange={handleChange}
          error={errors.description}
          rows={2}
          maxLength={500}
          optional
          className="sm:col-span-2"
        />
        <TextField
          label="Image path"
          name="imageUrl"
          value={values.imageUrl || ''}
          onChange={handleChange}
          error={errors.imageUrl}
          placeholder="/images/products/case-black.svg"
          hint="A file inside client/public (path starts with /) or an https:// link."
          optional
          className="sm:col-span-2"
        />
        <label className="flex items-center gap-2.5 text-sm text-slate-700 sm:col-span-2">
          <input type="checkbox" name="isActive" checked={values.isActive} onChange={handleChange} className="size-4 accent-brand-500" />
          Active (visible in the shop)
        </label>

        <div className="flex gap-3 sm:col-span-2">
          <button type="submit" disabled={isSaving} className="btn btn-primary">
            {isSaving ? 'Saving...' : 'Save product'}
          </button>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);
  // undefined = form closed, null = adding a product, object = editing that product
  const [editing, setEditing] = useState(undefined);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError('');

    Promise.all([getAdminProducts(search), getCategories()])
      .then(([productData, categoryData]) => {
        if (!isCurrent) return;
        setProducts(productData.products);
        setCategories(categoryData.categories);
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
  }, [search, reloadCount]);

  const closeForm = useCallback(() => setEditing(undefined), []);

  function handleSaved() {
    setEditing(undefined);
    setReloadCount((count) => count + 1);
  }

  // The API replaces the whole product, so send everything with isActive flipped.
  async function toggleActive(product) {
    setError('');
    try {
      await updateProduct(product.id, { ...toApiProduct(product), isActive: !product.isActive });
      setReloadCount((count) => count + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    setSearch(searchText.trim());
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">Products</h2>
        <button type="button" onClick={() => setEditing(null)} className="btn btn-primary">
          <Plus className="size-4" aria-hidden="true" />
          Add product
        </button>
      </div>

      <form onSubmit={handleSearch} className="mt-4 flex gap-3" role="search">
        <input
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search products..."
          aria-label="Search products"
          className="input"
        />
        <button type="submit" className="btn btn-primary shrink-0">
          Search
        </button>
      </form>

      <div className="mt-4">
        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}
        {isLoading && <Spinner />}

        {!isLoading && products.length === 0 && !error && (
          <p className="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">No products found.</p>
        )}

        {!isLoading && products.length > 0 && (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-surface text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Shop status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className={product.isActive ? 'hover:bg-slate-50' : 'bg-slate-50 text-slate-400'}>
                    <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                    <td className="px-4 py-3">{product.categoryName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatPrice(product.price)}</td>
                    <td className={`px-4 py-3 ${product.stockQuantity === 0 ? 'font-semibold text-red-600' : ''}`}>{product.stockQuantity}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(product)}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          product.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title={product.isActive ? 'Click to hide from the shop' : 'Click to show in the shop'}
                      >
                        {product.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => setEditing(product)} className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline">
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing !== undefined && <ProductForm product={editing} categories={categories} onClose={closeForm} onSaved={handleSaved} />}
    </section>
  );
}
