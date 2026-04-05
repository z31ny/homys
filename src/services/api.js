const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Core fetch wrapper with auth header injection.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('homys_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ─── Auth ────────────────────────────────────────────────
export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  getMe: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PATCH', body: JSON.stringify(body) }),
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
  update: (id, body) => request(`/properties/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => request(`/properties/${id}`, { method: 'DELETE' }),
};

// ─── Bookings ────────────────────────────────────────────
export const bookingsAPI = {
  create: (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  list: () => request('/bookings'),
  getById: (id) => request(`/bookings/${id}`),
  cancel: (id) => request(`/bookings/${id}/cancel`, { method: 'PATCH' }),
};

// ─── Contact ─────────────────────────────────────────────
export const contactAPI = {
  submit: (body) => request('/contact', { method: 'POST', body: JSON.stringify(body) }),
};

// ─── Questionnaire ───────────────────────────────────────
export const questionnaireAPI = {
  submit: (body) => request('/questionnaire', { method: 'POST', body: JSON.stringify(body) }),
};
