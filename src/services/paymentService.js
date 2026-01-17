import api from './api';

export const paymentService = {
  getAll: (userId, status, month, year) => {
    const params = {};
    if (userId) params.user_id = userId;
    if (status) params.status = status;
    if (month) params.month = month;
    if (year) params.year = year;
    return api.get('/payments', { params });
  },
  getById: (id) => api.get(`/payments/${id}`),
  create: (payment) => api.post('/payments', payment),
  update: (id, payment) => api.put(`/payments/${id}`, payment),
  delete: (id) => api.delete(`/payments/${id}`),
  checkAndRemind: () => api.post('/payments/check-and-remind'),
};


