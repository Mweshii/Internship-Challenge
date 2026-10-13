// Database access for categories, products and their stock.
import { query, withTransaction } from '../db/pool.js';
import { AppError } from '../utils/errors.js';

const PRODUCT_SELECT = `
  SELECT p.id, p.name, p.description, p.compatibility, p.price, p.image_url, p.is_active,
         i.quantity AS stock_quantity,
         c.id AS category_id, c.slug AS category_slug, c.name AS category_name, c.section
    FROM products p
    JOIN categories c ON c.id = p.category_id
    JOIN inventory i ON i.product_id = p.id`;

// Database columns are snake_case; the JSON we send to the browser is camelCase.
function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    compatibility: row.compatibility,
    price: row.price,
    imageUrl: row.image_url,
    isActive: row.is_active === 1,
    stockQuantity: row.stock_quantity,
    categoryId: row.category_id,
    categorySlug: row.category_slug,
    categoryName: row.category_name,
    section: row.section,
  };
}

export async function listCategories(section) {
  const rows = section
    ? await query('SELECT id, slug, name, section FROM categories WHERE section = ? ORDER BY sort_order', [section])
    : await query('SELECT id, slug, name, section FROM categories ORDER BY section, sort_order');
  return rows;
}

// Filters are all optional. `includeInactive` is only used by the admin screens.
export async function listProducts({ section, search, includeInactive = false } = {}) {
  const conditions = [];
  const params = [];

  if (!includeInactive) conditions.push('p.is_active = 1');
  if (section) {
    conditions.push('c.section = ?');
    params.push(section);
  }
  if (search) {
    conditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.compatibility LIKE ? OR c.name LIKE ?)');
    const pattern = `%${search}%`;
    params.push(pattern, pattern, pattern, pattern);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await query(`${PRODUCT_SELECT} ${where} ORDER BY c.section, c.sort_order, p.id`, params);
  return rows.map(mapProduct);
}

export async function getProductById(id) {
  const rows = await query(`${PRODUCT_SELECT} WHERE p.id = ?`, [id]);
  return rows.length > 0 ? mapProduct(rows[0]) : null;
}

async function assertCategoryExists(connection, categoryId) {
  const [rows] = await connection.execute('SELECT id FROM categories WHERE id = ?', [categoryId]);
  if (rows.length === 0) throw new AppError(400, 'That category does not exist.');
}

// A product is two rows (products + inventory), so both writes share a
// transaction: either both happen or neither does.
export async function createProduct(product) {
  const id = await withTransaction(async (connection) => {
    await assertCategoryExists(connection, product.categoryId);
    const [result] = await connection.execute(
      `INSERT INTO products (category_id, name, description, compatibility, price, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        product.categoryId,
        product.name,
        product.description,
        product.compatibility,
        product.price,
        product.imageUrl,
        product.isActive ? 1 : 0,
      ]
    );
    await connection.execute('INSERT INTO inventory (product_id, quantity) VALUES (?, ?)', [
      result.insertId,
      product.stockQuantity,
    ]);
    return result.insertId;
  });
  return getProductById(id);
}

export async function updateProduct(id, product) {
  await withTransaction(async (connection) => {
    await assertCategoryExists(connection, product.categoryId);
    const [result] = await connection.execute(
      `UPDATE products
          SET category_id = ?, name = ?, description = ?, compatibility = ?, price = ?, image_url = ?, is_active = ?
        WHERE id = ?`,
      [
        product.categoryId,
        product.name,
        product.description,
        product.compatibility,
        product.price,
        product.imageUrl,
        product.isActive ? 1 : 0,
        id,
      ]
    );
    if (result.affectedRows === 0) throw new AppError(404, 'That product no longer exists.');
    await connection.execute('UPDATE inventory SET quantity = ? WHERE product_id = ?', [product.stockQuantity, id]);
  });
  return getProductById(id);
}
