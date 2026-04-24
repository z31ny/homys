const API_BASE = import.meta.env.VITE_API_URL || '/api';

let onUnauthorizedCallback = null;
export function setOnUnauthorized(callback) {
  onUnauthorizedCallback = callback;
}

/**
 * Formats a validation error response from the backend into a human-readable message.
 * The backend returns:  { status:'error', message:'Validation failed', errors:[{field, message}] }
 * We surface each field error clearly instead of just showing "Validation failed".
 */
function formatValidationError(data) {
  const errors = data?.errors;
  if (!errors?.length) return data?.message || 'Validation failed';

  return errors
    .map(({ field, message }) => {
      // Convert field name to readable label: "guestFirstName" → "First Name"
      const label = field
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (c) => c.toUpperCase())
        .trim();
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
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

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
      // Surface field-level validation errors instead of "Validation failed"
      const message =
        response.status === 400 && data?.errors?.length
          ? formatValidationError(data)
          : data?.message || 'Something went wrong';

      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      // Attach raw field errors so callers can use them individually if needed
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
  register: (body) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, password) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  getMe: () => request('/auth/me'),
  updateProfile: (body) =>
    request('/auth/profile', { method: 'PATCH', body: JSON.stringify(body) }),
};

export const propertiesAPI = {
  list: (params = {}) => {
    // Trim location so "sahel " and "Sahel" both work (backend uses ilike)
    if (params.location) params.location = params.location.trim();
    const query = new URLSearchParams(params).toString();
    return request(`/properties${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/properties/${id}`),
  getAvailability: (id) => request(`/properties/${id}/availability`),
  getMine: () => request('/properties/mine'),
  create: (body) =>
    request('/properties', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) =>
    request(`/properties/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => request(`/properties/${id}`, { method: 'DELETE' }),
};

export const bookingsAPI = {
  create: (body) =>
    request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/bookings${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/bookings/${id}`),
  cancel: (id) => request(`/bookings/${id}/cancel`, { method: 'PATCH' }),
};

export const reviewsAPI = {
  getByProperty: (propertyId) => request(`/reviews/property/${propertyId}`),
  create: (body) =>
    request('/reviews', { method: 'POST', body: JSON.stringify(body) }),
  delete: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),
  getPending: () => request('/reviews/pending'),
  approve: (id) => request(`/reviews/${id}/approve`, { method: 'PATCH' }),
  reject: (id) => request(`/reviews/${id}/reject`, { method: 'PATCH' }),
};

export const contactAPI = {
  submit: (body) =>
    request('/contact', { method: 'POST', body: JSON.stringify(body) }),
};

export const questionnaireAPI = {
  submit: (body) =>
    request('/questionnaire', { method: 'POST', body: JSON.stringify(body) }),
};

export const adminAPI = {
  getStats: () => request('/admin/stats'),

  getBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/bookings${query ? `?${query}` : ''}`);
  },
  updateBookingStatus: (id, status) =>
    request(`/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

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

  getAllReviews: () => request('/reviews/all'),
  getPendingReviews: () => request('/reviews/pending'),
  approveReview: (id) => request(`/reviews/${id}/approve`, { method: 'PATCH' }),
  rejectReview: (id) => request(`/reviews/${id}/reject`, { method: 'PATCH' }),
  deleteReview: (id) => request(`/reviews/${id}/admin`, { method: 'DELETE' }),
};
