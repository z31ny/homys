import { tokenStorage } from './tokenStorage';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

let onUnauthorizedCallback = null;
export function setOnUnauthorized(callback) { onUnauthorizedCallback = callback; }

const FIELD_LABELS = {
  title: 'Property Title',
  propertyType: 'Property Type',
  propertyTypeOther: 'Property Type (Other)',
  viewType: 'View Type',
  viewTypeOther: 'View Type (Other)',
  sqft: 'Square Footage',
  pricePerNight: 'Price per Night',
  bedrooms: 'Bedrooms',
  bathrooms: 'Bathrooms',
  maxGuests: 'Max Guests',
  isFurnished: 'Furnished',
  description: 'Description',
  houseRules: 'House Rules',
  amenities: 'Amenities',
  locationName: 'Location',
  imageUrls: 'Images',
  heroImageIndex: 'Cover Image',
  fullName: 'Full Name',
  email: 'Email Address',
  password: 'Password',
  phone: 'Phone Number',
  country: 'Country',
  minimumStay: 'Minimum Stay',
};

function formatValidationError(data) {
  const errors = data?.errors;
  if (!errors?.length) return data?.message || 'Validation failed';
  return errors.map(({ field, label, message }) => {
    const friendlyLabel = label || FIELD_LABELS[field] || field.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
    return `${friendlyLabel}: ${message}`;
  }).join('\n');
}

async function request(endpoint, options = {}, retries = 1) {
  const token = tokenStorage.get();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);
    const isAuthEndpoint = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register');
    if (response.status === 401 && !isAuthEndpoint) {
      tokenStorage.remove();
      if (onUnauthorizedCallback) onUnauthorizedCallback();
      const error = new Error('Session expired. Please log in again.');
      error.status = 401;
      throw error;
    }
    // Guard against non-JSON responses (e.g. proxy errors, HTML 502 pages)
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      const error = new Error(
        response.ok
          ? 'Unexpected response from server.'
          : `Server error (${response.status}). Please check your connection or try again later.`
      );
      error.status = response.status;
      error.rawText = text;
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
      const error = new Error('Request timed out.');
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
  getFeatured: () => request('/properties/featured'),
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
  submitDocs: (id, body) => request(`/bookings/${id}/docs`, { method: 'POST', body: JSON.stringify(body) }),
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

export const contentAPI = {
  getAll: () => request('/content'),
  getSection: (section) => request(`/content/${section}`),
};

export const adminAPI = {
  getStats: () => request('/admin/stats'),
  getBookings: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/admin/bookings${q ? `?${q}` : ''}`); },
  createBooking: (body) => request('/admin/bookings', { method: 'POST', body: JSON.stringify(body) }),
  updateBookingStatus: (id, status) => request(`/admin/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  approveBookingDocs: (id, action) => request(`/admin/bookings/${id}/docs-status`, { method: 'PATCH', body: JSON.stringify({ action }) }),
  getProperties: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/admin/properties${q ? `?${q}` : ''}`); },
  updatePropertyStatus: (id, status) => request(`/admin/properties/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  // Admin full property edit — any field, any status
  updateProperty: (id, body) => request(`/admin/properties/${id}/edit`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteProperty: (id) => request(`/admin/properties/${id}`, { method: 'DELETE' }),
  toggleFeatured: (id, isFeatured) => request(`/admin/properties/${id}/featured`, { method: 'PATCH', body: JSON.stringify({ isFeatured }) }),
  getUsers: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/admin/users${q ? `?${q}` : ''}`); },
  getContacts: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/admin/contacts${q ? `?${q}` : ''}`); },
  getAllReviews: () => request('/admin/reviews'),
  getPendingReviews: () => request('/reviews/pending'),
  approveReview: (id) => request(`/reviews/${id}/approve`, { method: 'PATCH' }),
  rejectReview: (id) => request(`/reviews/${id}/reject`, { method: 'PATCH' }),
  deleteReview: (id) => request(`/reviews/${id}/admin`, { method: 'DELETE' }),
  getDiscounts: () => request('/admin/discounts'),
  createDiscount: (body) => request('/admin/discounts', { method: 'POST', body: JSON.stringify(body) }),
  updateDiscount: (id, body) => request(`/admin/discounts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteDiscount: (id) => request(`/admin/discounts/${id}`, { method: 'DELETE' }),
  updateContent: (section, content) => request(`/admin/content/${section}`, { method: 'PATCH', body: JSON.stringify({ content }) }),
  setHeroImage: (propertyId, imageId) => request(`/admin/properties/${propertyId}/hero-image`, { method: 'PATCH', body: JSON.stringify({ imageId }) }),
  deletePropertyImage: (propertyId, imageId) => request(`/admin/properties/${propertyId}/images/${imageId}`, { method: 'DELETE' }),
};

export const uploadsAPI = {
  getPresignedUrl: (body) => request('/uploads/presign', { method: 'POST', body: JSON.stringify(body) }),
  deleteFile: (key) => request(`/uploads/${encodeURIComponent(key)}`, { method: 'DELETE' }),
};

/**
 * Upload a file to R2 via presigned URL.
 * 1. Gets a presigned PUT URL from the backend
 * 2. PUTs the file directly to R2
 * 3. Returns the public URL
 */
export const uploadImageToR2 = async (file, folder = 'general') => {
  const { data } = await uploadsAPI.getPresignedUrl({
    filename: file.name,
    contentType: file.type,
    folder,
  });
  const putRes = await fetch(data.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  if (!putRes.ok) throw new Error('Failed to upload file to storage.');
  return data.publicUrl;
};

export const paymentAPI = {
  initiate: (bookingId) => request('/payments/initiate', { method: 'POST', body: JSON.stringify({ bookingId }) }),
  initiateRemaining: (bookingId) => request('/payments/initiate-remaining', { method: 'POST', body: JSON.stringify({ bookingId }) }),
};
