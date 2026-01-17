import api from './api';

export const transactionService = {
  getAll: (projectId, month, year) => {
    const params = {};
    if (projectId) params.project_id = projectId;
    if (month) params.month = month;
    if (year) params.year = year;
    return api.get('/transactions', { params });
  },
  getById: (id) => api.get(`/transactions/${id}`),
  create: (transaction) => api.post('/transactions', transaction),
  update: (id, transaction) => api.put(`/transactions/${id}`, transaction),
  delete: (id) => api.delete(`/transactions/${id}`),
};

