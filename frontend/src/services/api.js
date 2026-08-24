import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== EXISTING SERVICES =====
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getCurrentUser: () => api.get('/auth/me'),
};

export const eventService = {
  getEvents: (params) => api.get('/events', { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  getEventSeats: (id) => api.get(`/events/${id}/seats`),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  getOrganizerEvents: () => api.get('/events/organizer'),
  getEventSummary: (id) => api.get(`/events/${id}/summary`),
  getManagerEvents: () => api.get('/events/manager'),
};

export const seatService = {
  holdSeat: (data) => api.post('/seats/hold', data),
  releaseSeat: (data) => api.post('/seats/release', data),
  getEventSeats: (eventId) => api.get(`/seats/event/${eventId}`),
};

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getBookings: () => api.get('/bookings'),
  getBooking: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id) => api.delete(`/bookings/${id}`),
};

export const adminService = {
  createVenue: (data) => api.post('/admin/venues', data),
  getVenues: () => api.get('/admin/venues'),
  updateVenue: (id, data) => api.put(`/admin/venues/${id}`, data),
  deleteVenue: (id) => api.delete(`/admin/venues/${id}`),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle`),
  getStats: () => api.get('/admin/stats'),
};

export const waitlistService = {
  joinWaitlist: (data) => api.post('/waitlist/join', data),
  getWaitlistStatus: (eventId) => api.get(`/waitlist/event/${eventId}`),
  getPosition: (eventId) => api.get(`/waitlist/${eventId}/position`),
};

// ===== NEW SERVICES =====
export const hallService = {
  getManagerHalls: () => api.get('/halls/manager'),
  bookHall: (data) => api.post('/halls/book', data),
  releaseHall: (hallId) => api.put(`/halls/release/${hallId}`),
  getHallGroups: () => api.get('/halls/groups'),
  getHallDetails: (id) => api.get(`/halls/${id}`),
};

export const authorService = {
  getMalls: () => api.get('/author/malls'),
  getManagers: () => api.get('/author/managers'),
  getStats: () => api.get('/author/stats'),
  createMall: (data) => api.post('/author/malls', data),
  updateMallPrice: (mallId, data) => api.put(`/author/malls/${mallId}/price`, data),
  getRevenue: () => api.get('/author/revenue'),
  approveManager: (data) => api.post('/author/approve-manager', data),
};

export default api;