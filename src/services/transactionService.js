import api from './api';

export const transactionService = {
  getAll: (projectId) => api.get('/transactions', { params: { project_id: projectId } }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (transaction) => api.post('/transactions', transaction),
  update: (id, transaction) => api.put(`/transactions/${id}`, transaction),
  delete: (id) => api.delete(`/transactions/${id}`),
};

