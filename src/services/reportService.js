import axios from 'axios';
import api from './api';

export const reportService = {
  getProjectReport: (id) => api.get(`/reports/project/${id}`),
  getDashboard: () => api.get('/reports/dashboard'),
  getFinancialSummary: () => api.get('/reports/financial-summary'),
  getProjectFinancialReport: (id, params = {}) =>
    api.get(`/reports/project/${id}/financial`, { params }),
  downloadProjectReport: async (id, params = {}) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/reports/project/${id}/export`,
      {
        params,
        responseType: 'arraybuffer',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'application/pdf',
        },
      }
    );
    return response;
  },
};

