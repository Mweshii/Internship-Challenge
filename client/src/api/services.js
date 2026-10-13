// One small function per API endpoint. Pages import these instead of writing
// URLs themselves, so every endpoint is listed in a single place.
import { api } from './client.js';

// encodeURIComponent makes typed text safe to put in a URL.
function toQuery(params) {
  const parts = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`);
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

// ---- Public -----------------------------------------------------------------
export const getSettings = () => api.get('/settings');
export const getCategories = (section) => api.get(`/categories${toQuery({ section })}`);
export const getProducts = ({ section, search } = {}) => api.get(`/products${toQuery({ section, search })}`);

export const submitRepair = (answers, image) => api.postForm('/repairs', answers, 'image', image ? [image] : []);
export const submitSellEnquiry = (answers, photos) => api.postForm('/sell-enquiries', answers, 'photos', photos);
export const submitOrder = (order) => api.post('/orders', order);
export const submitContactMessage = (message) => api.post('/contact', message);
export const trackBooking = (reference, contact) => api.post('/track', { reference, contact });

// ---- Admin (need a signed-in admin; the cookie is sent automatically) ---------
export const login = (email, password) => api.post('/auth/login', { email, password });
export const logout = () => api.post('/auth/logout');
export const getCurrentUser = () => api.get('/auth/me');

export const getAdminOverview = () => api.get('/admin/overview');
export const getAdminMessages = () => api.get('/admin/messages');

// `resource` is 'repairs', 'orders' or 'sell-enquiries'.
export const getAdminRecords = (resource, filters) => api.get(`/admin/${resource}${toQuery(filters)}`);
export const getAdminRecord = (resource, id) => api.get(`/admin/${resource}/${id}`);
export const updateAdminStatus = (resource, id, status, note) =>
  api.patch(`/admin/${resource}/${id}/status`, { status, note });
export const saveSellReview = (id, review) => api.patch(`/admin/sell-enquiries/${id}/review`, review);

export const getAdminProducts = (search) => api.get(`/admin/products${toQuery({ search })}`);
export const createProduct = (product) => api.post('/admin/products', product);
export const updateProduct = (id, product) => api.put(`/admin/products/${id}`, product);

// Customer photos are only visible to a signed-in admin.
export const uploadUrl = (fileName) => `/api/admin/uploads/${fileName}`;
