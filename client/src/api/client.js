// The one place where the frontend talks to the backend.
// Every request goes to /api/... (Vite forwards those to the Express server in
// development - see vite.config.js).

// Thrown for any failed request, so pages can do:
//   try { await api.post(...) } catch (error) { show(error.message) }
export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message);
    this.status = status; // HTTP status code; 0 means the server was unreachable
    this.fieldErrors = fieldErrors; // { fieldName: 'message' } from server-side validation
  }
}

async function request(path, { method = 'GET', body, formData } = {}) {
  const options = { method, headers: {} };

  if (formData) {
    // The browser sets the multipart Content-Type (with its boundary) itself.
    options.body = formData;
  } else if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`/api${path}`, options);
  } catch {
    throw new ApiError('Could not reach the server. Please check your connection and try again.', 0);
  }

  // Error pages from a proxy are not JSON, so a failed parse becomes null.
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const fallback =
      response.status >= 500
        ? 'The server is not responding properly. Please try again shortly.'
        : 'Something went wrong. Please try again.';
    throw new ApiError(data?.message || fallback, response.status, data?.errors);
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),

  // For forms with photos: all the answers go in one JSON field called `data`
  // and each photo is attached under `fileField` (see controllers/helpers.js).
  postForm(path, answers, fileField, files = []) {
    const formData = new FormData();
    formData.append('data', JSON.stringify(answers));
    files.forEach((file) => formData.append(fileField, file));
    return request(path, { method: 'POST', formData });
  },
};
