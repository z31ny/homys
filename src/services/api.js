const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Listeners for auth state changes (401 interceptor pattern).
 * The AuthContext registers a callback so api.js can trigger logout.
 */
let onUnauthorizedCallback = null;

export function setOnUnauthorized(callback) {
  onUnauthorizedCallback = callback;
}

/**
 * Core fetch wrapper with auth header injection, 401 interception,
 * timeout, and retry logic.
 */
async function request(endpoint, options = {}, retries = 1) {
  const token = localStorage.getItem('homys_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 15-second timeout (edge case 10.12)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Global 401 interceptor — edge cases 1.6, 1.7
    const isAuthEndpoint =
      endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register');
    if (response.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('homys_token');
      if (onUnauthorizedCallback) onUnauthorizedCallback();
      const error = new Error('Session expired. Please log in again.');
      error.status = 401;
      throw error;
    }

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Something went wrong');
      error.status = response.status;
      error.data = data;
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

// ─── Auth ────────────────────────────────────────────────
export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, password) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  getMe: () => request('/auth/me'),
  updateProfile: (body) =>
    request('/auth/profile', { method: 'PATCH', body: JSON.stringify(body) }),
};

// ─── Properties ──────────────────────────────────────────
export const propertiesAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/properties${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/properties/${id}`),
  getMine: () => request('/properties/mine'),
  create: (body) => request('/properties', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) =>
    request(`/properties/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => request(`/properties/${id}`, { method: 'DELETE' }),
};

// ─── Bookings ────────────────────────────────────────────
export const bookingsAPI = {
  create: (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/bookings${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/bookings/${id}`),
  cancel: (id) => request(`/bookings/${id}/cancel`, { method: 'PATCH' }),
};

// ─── Reviews ─────────────────────────────────────────────
export const reviewsAPI = {
  getByProperty: (propertyId) => request(`/reviews/property/${propertyId}`),
  create: (body) => request('/reviews', { method: 'POST', body: JSON.stringify(body) }),
  delete: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),
  getPending: () => request('/reviews/pending'),
  approve: (id) => request(`/reviews/${id}/approve`, { method: 'PATCH' }),
  reject: (id) => request(`/reviews/${id}/reject`, { method: 'PATCH' }),
};

// ─── Contact ─────────────────────────────────────────────
export const contactAPI = {
  submit: (body) => request('/contact', { method: 'POST', body: JSON.stringify(body) }),
};

// ─── Questionnaire ───────────────────────────────────────
export const questionnaireAPI = {
  submit: (body) => request('/questionnaire', { method: 'POST', body: JSON.stringify(body) }),
};

// ─── Admin ───────────────────────────────────────────────
export const adminAPI = {
  getStats: () => request('/admin/stats'),
  getBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/bookings${query ? `?${query}` : ''}`);
  },
  getProperties: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/properties${query ? `?${query}` : ''}`);
  },
  updatePropertyStatus: (id, status) =>
    request(`/admin/properties/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/users${query ? `?${query}` : ''}`);
  },
  getContacts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/contacts${query ? `?${query}` : ''}`);
  },
  getPendingReviews: () => request('/reviews/pending'),
  approveReview: (id) => request(`/reviews/${id}/approve`, { method: 'PATCH' }),
  rejectReview: (id) => request(`/reviews/${id}/reject`, { method: 'PATCH' }),
};
