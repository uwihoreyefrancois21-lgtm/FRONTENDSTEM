import api from './api';

// Accounts
export const eifRegister = (data) => api.post('/eif/accounts/register', data);
export const eifLogin = (data) => api.post('/eif/accounts/login', data);
export const eifGetAccount = () => api.get('/eif/accounts/me');
export const eifUpdateAccount = (data) => api.put('/eif/accounts/me', data);
export const eifUpdatePassword = (data) => api.put('/eif/accounts/me/password', data);

// Products
export const eifGetProducts = (params) => api.get('/eif/products', { params });
export const eifGetProduct = (id) => api.get(`/eif/products/${id}`);
export const eifCreateProduct = (data) => api.post('/eif/products', data);
export const eifUpdateProduct = (id, data) => api.put(`/eif/products/${id}`, data);
export const eifDeleteProduct = (id) => api.delete(`/eif/products/${id}`);

// Categories
export const eifGetCategories = () => api.get('/eif/products/categories/all');
export const eifCreateCategory = (data) => api.post('/eif/products/categories', data);
export const eifUpdateCategory = (id, data) => api.put(`/eif/products/categories/${id}`, data);
export const eifDeleteCategory = (id) => api.delete(`/eif/products/categories/${id}`);

// Partners
export const eifGetPartners = (params) => api.get('/eif/partners', { params });
export const eifGetPartner = (id) => api.get(`/eif/partners/${id}`);
export const eifCreatePartner = (data) => api.post('/eif/partners', data);
export const eifUpdatePartner = (id, data) => api.put(`/eif/partners/${id}`, data);
export const eifDeletePartner = (id) => api.delete(`/eif/partners/${id}`);

// Operations
export const eifGetOperations = (params) => api.get('/eif/operations', { params });
export const eifGetOperation = (id) => api.get(`/eif/operations/${id}`);
export const eifCreateOperation = (data) => api.post('/eif/operations', data);
export const eifUpdateOperation = (id, data) => api.put(`/eif/operations/${id}`, data);
export const eifDeleteOperation = (id) => api.delete(`/eif/operations/${id}`);
export const eifGetOperationSummary = (params) => api.get('/eif/operations/summary', { params });

// Stock
export const eifGetStock = (params) => api.get('/eif/stock', { params });
export const eifGetStockByProduct = (productId) => api.get(`/eif/stock/${productId}`);
export const eifUpdateStock = (productId, data) => api.put(`/eif/stock/${productId}`, data);
export const eifDeleteStock = (productId) => api.delete(`/eif/stock/${productId}`);

// Payments
export const eifGetPayments = (params) => api.get('/eif/payments', { params });
export const eifCreatePayment = (data) => api.post('/eif/payments', data);
export const eifUpdatePayment = (id, data) => api.put(`/eif/payments/${id}`, data);
export const eifDeletePayment = (id) => api.delete(`/eif/payments/${id}`);

// Expenses
export const eifGetExpenses = (params) => api.get('/eif/expenses', { params });
export const eifGetExpense = (id) => api.get(`/eif/expenses/${id}`);
export const eifCreateExpense = (data) => api.post('/eif/expenses', data);
export const eifUpdateExpense = (id, data) => api.put(`/eif/expenses/${id}`, data);
export const eifDeleteExpense = (id) => api.delete(`/eif/expenses/${id}`);

// Reports
export const eifGetReports = (params) => api.get('/eif/reports', { params });
export const eifDownloadReport = async (params) => {
  const queryString = new URLSearchParams(params).toString();
  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
  const response = await fetch(`${API_URL}/eif/reports/download?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to download report');
  }
  return response.blob();
};

// Product Losses
export const eifGetProductLosses = (params) => api.get('/eif/product-losses', { params });
export const eifCreateProductLoss = (data) => api.post('/eif/product-losses', data);
export const eifUpdateProductLoss = (id, data) => api.put(`/eif/product-losses/${id}`, data);
export const eifDeleteProductLoss = (id) => api.delete(`/eif/product-losses/${id}`);

// Admin functions (SPEMS Admin only)
export const eifAdminGetAccounts = (params) => api.get('/eif/admin/accounts', { params });
export const eifAdminGetAccount = (id) => api.get(`/eif/admin/accounts/${id}`);
export const eifAdminUpdateAccount = (id, data) => api.put(`/eif/admin/accounts/${id}`, data);
export const eifAdminDeleteAccount = (id) => api.delete(`/eif/admin/accounts/${id}`);
export const eifAdminActivateAccount = (id) => api.post(`/eif/admin/accounts/${id}/activate`);
export const eifAdminDeactivateAccount = (id) => api.post(`/eif/admin/accounts/${id}/deactivate`);
export const eifAdminGetAccountOperations = (id, params) => api.get(`/eif/admin/accounts/${id}/operations`, { params });
export const eifAdminGetAccountStock = (id) => api.get(`/eif/admin/accounts/${id}/stock`);
export const eifAdminDeleteAccountStock = (accountId, productId) => api.delete(`/eif/admin/accounts/${accountId}/stock/${productId}`);
export const eifAdminGetAccountPayments = (id, params) => api.get(`/eif/admin/accounts/${id}/payments`, { params });
export const eifAdminGetDashboard = () => api.get('/eif/admin/dashboard');

