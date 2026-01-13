import api from './api';

export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  approveUser: (userId) => api.post(`/auth/approve-user/${userId}`),
  rejectUser: (userId) => api.post(`/auth/reject-user/${userId}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', email),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

