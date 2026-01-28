import api from './api';

export const transactionService = {
  getAll: (projectId, month, year, startDate, endDate) => {
    const params = {};
    if (projectId) params.project_id = projectId;
    // Date range takes priority over month/year
    if (startDate && endDate) {
      params.start_date = startDate;
      params.end_date = endDate;
    } else if (startDate) {
      params.start_date = startDate;
    } else if (endDate) {
      params.end_date = endDate;
    } else {
      // Use month/year if date range not provided
      if (month) params.month = month;
      if (year) params.year = year;
    }
    return api.get('/transactions', { params });
  },
  getById: (id) => api.get(`/transactions/${id}`),
  create: (transaction) => api.post('/transactions', transaction),
  update: (id, transaction) => api.put(`/transactions/${id}`, transaction),
  delete: (id) => api.delete(`/transactions/${id}`),
};

