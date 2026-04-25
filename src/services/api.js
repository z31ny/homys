const API_BASE = import.meta.env.VITE_API_URL || '/api';

let onUnauthorizedCallback = null;
export function setOnUnauthorized(callback) { onUnauthorizedCallback = callback; }

function formatValidationError(data) {
  const errors = data?.errors;
  if (!errors?.length) return data?.message || 'Validation failed';
  return errors
    .map(({ field, message }) => {
      const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
      return `${label}: ${message}`;
    })
    .join('\n');
}

async function request(endpoint, options = {}, retries = 1) {
  const token = localStorage.getItem('homys_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);

    const isAuthEndpoint = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register');
    if (response.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('homys_token');
      if (onUnauthorizedCallback) onUnauthorizedCallback();
      const error = new Error('Session expired. Please log in again.');
      error.status = 401;
      throw error;
    }

    const data = await response.json();
    if (!response.ok) {
      const message = response.status === 400 && data?.errors?.length
        ? formatValidationError(data)
        : data?.message || 'Something went wrong';
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      error.fieldErrors = data?.errors || [];
      throw error;
    }
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      if (retries > 0) return request(endpoint, options, retries - 1);
      const error = new Error('Request timed out. Please check your connection and try again.');
      error.status = 0;
      throw error;
    }
    if (!err.status && err.name === 'TypeError' && retries > 0) {
      await new Promise((r) => setTimeout(r, 1000));
      return request(endpoint, options, retries - 1);
    }
    throw err;
  }
}

export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, password) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  getMe: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PATCH', body: JSON.stringify(body) }),
};

export const propertiesAPI = {
  list: (params = {}) => {
    if (params.location) params.location = params.location.trim();
    const query = new URLSearchParams(params).toString();
    return request(`/properties${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/properties/${id}`),
  getAvailability: (id) => request(`/properties/${id}/availability`),
  getMine: () => request('/properties/mine'),
  create: (body) => request('/properties', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/properties/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => request(`/properties/${id}`, { method: 'DELETE' }),
};

export const bookingsAPI = {
  create: (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  list: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/bookings${q ? `?${q}` : ''}`); },
  getById: (id) => request(`/bookings/${id}`),
  cancel: (id) => request(`/bookings/${id}/cancel`, { method: 'PATCH' }),
};

export const reviewsAPI = {
  getByProperty: (propertyId) => request(`/reviews/property/${propertyId}`),
  create: (body) => request('/reviews', { method: 'POST', body: JSON.stringify(body) }),
  delete: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),
  getPending: () => request('/reviews/pending'),
  approve: (id) => request(`/reviews/${id}/approve`, { method: 'PATCH' }),
  reject: (id) => request(`/reviews/${id}/reject`, { method: 'PATCH' }),
};

export const contactAPI = {
  submit: (body) => request('/contact', { method: 'POST', body: JSON.stringify(body) }),
};

export const questionnaireAPI = {
  submit: (body) => request('/questionnaire', { method: 'POST', body: JSON.stringify(body) }),
};

export const adminAPI = {
  getStats: () => request('/admin/stats'),
  getBookings: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/admin/bookings${q ? `?${q}` : ''}`); },
  updateBookingStatus: (id, status) => request(`/admin/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getProperties: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/admin/properties${q ? `?${q}` : ''}`); },
  updatePropertyStatus: (id, status) => request(`/admin/properties/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getUsers: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/admin/users${q ? `?${q}` : ''}`); },
  getContacts: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/admin/contacts${q ? `?${q}` : ''}`); },
  getAllReviews: () => request('/reviews/all'),
  getPendingReviews: () => request('/reviews/pending'),
  approveReview: (id) => request(`/reviews/${id}/approve`, { method: 'PATCH' }),
  rejectReview: (id) => request(`/reviews/${id}/reject`, { method: 'PATCH' }),
  deleteReview: (id) => request(`/reviews/${id}/admin`, { method: 'DELETE' }),
  // Discounts
  getDiscounts: () => request('/admin/discounts'),
  createDiscount: (body) => request('/admin/discounts', { method: 'POST', body: JSON.stringify(body) }),
  updateDiscount: (id, body) => request(`/admin/discounts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteDiscount: (id) => request(`/admin/discounts/${id}`, { method: 'DELETE' }),
};
