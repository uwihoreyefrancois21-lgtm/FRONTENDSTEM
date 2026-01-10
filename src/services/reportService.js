import api from './api';

export const reportService = {
  getProjectReport: (id) => api.get(`/reports/project/${id}`),
  getDashboard: () => api.get('/reports/dashboard'),
  getFinancialSummary: () => api.get('/reports/financial-summary'),
};

