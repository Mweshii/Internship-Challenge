// Small helpers shared by the controllers.
import { AppError } from '../utils/errors.js';

// The repair and sell forms can include photos, so the browser sends them as
// "multipart/form-data": the files, plus ONE text field called `data` holding
// all the other answers as JSON. Plain JSON requests (no files) work too.
export function readFormData(req) {
  if (typeof req.body?.data !== 'string') return req.body || {};

  try {
    return JSON.parse(req.body.data);
  } catch {
    throw new AppError(400, 'The form data could not be read. Please try again.');
  }
}

// Reads the :id part of a URL such as /admin/repairs/12.
export function readId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(404, 'Record not found.');
  return id;
}

// Reads ?search= and ?status= for the admin list screens.
export function readListFilters(req) {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 80) : '';
  const status = typeof req.query.status === 'string' ? req.query.status.trim().slice(0, 40) : '';
  return { search, status };
}
