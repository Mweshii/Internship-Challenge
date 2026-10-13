// Shop catalogue: public browsing plus the admin product editor.
import { env } from '../config/env.js';
import * as productModel from '../models/productModel.js';
import { AppError, ValidationError } from '../utils/errors.js';
import { hasErrors } from '../utils/validation.js';
import { validateProduct } from '../validators/miscValidators.js';
import { readId } from './helpers.js';

const SECTIONS = ['accessories', 'electronics'];

function readSection(req) {
  const { section } = req.query;
  if (section === undefined) return undefined;
  if (!SECTIONS.includes(section)) throw new AppError(400, 'Unknown shop section.');
  return section;
}

function readSearch(req) {
  return typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 80) : '';
}

// GET /api/categories?section=accessories
export async function listCategories(req, res) {
  res.json({ categories: await productModel.listCategories(readSection(req)) });
}

// GET /api/products?section=accessories&search=case
export async function listProducts(req, res) {
  const products = await productModel.listProducts({ section: readSection(req), search: readSearch(req) });
  res.json({ products });
}

// GET /api/settings - shop settings the checkout page needs.
export function getSettings(req, res) {
  res.json(env.shop);
}

// GET /api/admin/products - includes deactivated products.
export async function listAllProducts(req, res) {
  const products = await productModel.listProducts({ search: readSearch(req), includeInactive: true });
  res.json({ products });
}

// POST /api/admin/products
export async function createProduct(req, res) {
  const { errors, value } = validateProduct(req.body);
  if (hasErrors(errors)) throw new ValidationError(errors);

  res.status(201).json({ product: await productModel.createProduct(value) });
}

// PUT /api/admin/products/:id - also used to deactivate (isActive: false).
export async function updateProduct(req, res) {
  const { errors, value } = validateProduct(req.body);
  if (hasErrors(errors)) throw new ValidationError(errors);

  res.json({ product: await productModel.updateProduct(readId(req), value) });
}
